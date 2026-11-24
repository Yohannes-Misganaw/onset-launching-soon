"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { getExampleNumber, type CountryCode } from "libphonenumber-js";
import phoneExamples from "libphonenumber-js/mobile/examples";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountryCodePicker } from "@/components/country-code-picker";
import { FilmGrain } from "@/components/film-grain";
import { AlertCircleIcon, ArrowRightIcon, CheckIcon } from "@/components/icons";
import { DEFAULT_COUNTRY_ISO, toE164Phone } from "@/lib/countries";
import { useLanguage, type Translation } from "@/lib/i18n";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AUTOFOCUS_QUERY = "(min-width: 768px) and (hover: hover) and (pointer: fine)";

type ErrorKey = Extract<
  keyof Translation,
  | "errNameRequired"
  | "errEmailRequired"
  | "errEmailInvalid"
  | "errPhoneRequired"
  | "errPhoneInvalid"
  | "errRateLimit"
  | "errGeneric"
  | "errNetwork"
>;

function errorForResponse(status: number, field: unknown): ErrorKey {
  if (status === 400 && field === "phone") return "errPhoneInvalid";
  if (status === 400 && field === "name") return "errNameRequired";
  if (status === 400 && field === "email") return "errEmailInvalid";
  if (status === 429) return "errRateLimit";
  return "errGeneric";
}

const FIELD_LABEL =
  "mb-2 block text-sm font-semibold text-foreground/85 transition-colors group-focus-within:text-foreground";
const FIELD_SHELL =
  "rounded-2xl border border-foreground/18 bg-[linear-gradient(180deg,rgba(249,242,224,0.07),rgba(249,242,224,0.02))] bg-[#04140f]/55 shadow-[inset_0_1px_0_rgba(249,242,224,0.08),0_10px_24px_-14px_rgba(2,10,7,0.7)] backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-150 hover:border-foreground/30";
const FIELD_INPUT = `${FIELD_SHELL} h-14 px-4.5 text-base placeholder:text-muted-foreground/60 focus-visible:border-accent focus-visible:bg-[#04140f]/70 focus-visible:ring-4 focus-visible:ring-accent/20 aria-invalid:border-[#f4ae9c] aria-invalid:ring-4 aria-invalid:ring-[#f4ae9c]/15 dark:bg-[#04140f]/55 dark:aria-invalid:ring-[#f4ae9c]/15 md:text-base`;

export default function WaitlistForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY_ISO);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneFieldRef = useRef<HTMLDivElement>(null);
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const errorId = `${emailId}-error`;
  const { code: language, t } = useLanguage();
  const nameError = error === "errNameRequired";
  const emailError = error === "errEmailRequired" || error === "errEmailInvalid";
  const phoneError = error === "errPhoneRequired" || error === "errPhoneInvalid";
  const phonePlaceholder = useMemo(
    () => getExampleNumber(country, phoneExamples)?.formatNational() ?? t.phonePlaceholder,
    [country, t.phonePlaceholder],
  );

  useEffect(() => {
    if (window.matchMedia(AUTOFOCUS_QUERY).matches) {
      nameRef.current?.focus({ preventScroll: true });
    }
  }, []);

  const clearError = () => {
    if (error) setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!name) return setError("errNameRequired");
    if (!email) return setError("errEmailRequired");
    if (!EMAIL_PATTERN.test(email)) return setError("errEmailInvalid");
    if (!phone) return setError("errPhoneRequired");
    if (!toE164Phone(phone, country)) return setError("errPhoneInvalid");

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, country, language }),
      });
      const result: { field?: unknown } = await response.json().catch(() => ({}));

      if (response.ok || response.status === 409) {
        setAlreadyJoined(response.status === 409);
        setIsSubmitted(true);
        return;
      }

      setError(errorForResponse(response.status, result.field));
    } catch {
      setError("errNetwork");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FilmGrain />
      <div className="relative flex min-h-full w-full items-center justify-center px-6 py-16 sm:p-8 lg:p-24">
        <div className="w-full max-w-md">
          {isSubmitted ? (
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="text-center"
              role="status"
            >
              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/25"
              >
                <CheckIcon size={32} strokeWidth={2} />
              </motion.div>
              <h3 className="mb-3 font-satoshi text-4xl tracking-[-0.035em]">
                {alreadyJoined ? t.alreadyTitle : t.successTitle}
              </h3>
              <p className="text-muted-foreground">
                {t.successBefore}
                <span className="font-semibold text-foreground">Onset</span>
                {t.successAfter}
              </p>
            </motion.div>
          ) : (
            <div>
              <div className="mb-8 text-center sm:mb-10">
                <h2 className="mb-3 font-satoshi text-4xl leading-[1.04] tracking-[-0.035em] lg:text-5xl">{t.formTitle}</h2>
                <p className="text-lg text-muted-foreground">{t.formSubtitle}</p>
              </div>
              <form onSubmit={handleSubmit} noValidate className="space-y-5 sm:space-y-6">
                <div className="group relative">
                  <Label htmlFor={nameId} className={FIELD_LABEL}>
                    {t.fullName}
                  </Label>
                  <Input
                    ref={nameRef}
                    id={nameId}
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={100}
                    disabled={isSubmitting}
                    aria-invalid={nameError ? true : undefined}
                    aria-describedby={nameError ? errorId : undefined}
                    onChange={clearError}
                    className={FIELD_INPUT}
                    placeholder={t.namePlaceholder}
                  />
                </div>

                <div className="group relative">
                  <Label htmlFor={emailId} className={FIELD_LABEL}>
                    {t.email}
                  </Label>
                  <Input
                    id={emailId}
                    name="email"
                    type="email"
                    dir="ltr"
                    inputMode="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    disabled={isSubmitting}
                    aria-invalid={emailError ? true : undefined}
                    aria-describedby={emailError ? errorId : undefined}
                    onChange={clearError}
                    className={FIELD_INPUT}
                    placeholder={t.emailPlaceholder}
                  />
                </div>

                <div className="group relative">
                  <Label htmlFor={phoneId} className={FIELD_LABEL}>
                    {t.phone}
                  </Label>
                  <div
                    ref={phoneFieldRef}
                    dir="ltr"
                    data-invalid={phoneError ? true : undefined}
                    className={`${FIELD_SHELL} flex h-14 items-stretch focus-within:border-accent focus-within:bg-[#04140f]/70 focus-within:ring-4 focus-within:ring-accent/20 data-invalid:border-[#f4ae9c] data-invalid:ring-4 data-invalid:ring-[#f4ae9c]/15`}
                  >
                    <CountryCodePicker
                      value={country}
                      onChange={(next) => {
                        setCountry(next);
                        if (phoneError) setError(null);
                      }}
                      locale={language}
                      disabled={isSubmitting}
                      label={t.country}
                      searchPlaceholder={t.searchCountry}
                      emptyText={t.noCountries}
                      anchor={phoneFieldRef}
                    />
                    <span aria-hidden="true" className="my-3 w-px shrink-0 bg-foreground/15" />
                    <Input
                      id={phoneId}
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      required
                      maxLength={20}
                      disabled={isSubmitting}
                      aria-invalid={phoneError ? true : undefined}
                      aria-describedby={phoneError ? errorId : undefined}
                      onChange={clearError}
                      className="h-full min-w-0 flex-1 rounded-none rounded-e-2xl border-0 bg-transparent px-4 text-base shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent dark:aria-invalid:ring-0 md:text-base"
                      placeholder={phonePlaceholder}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      id={errorId}
                      role="alert"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 rounded-2xl border border-[#f4ae9c]/25 bg-[#04140f]/70 p-3.5"
                    >
                      <AlertCircleIcon size={20} className="shrink-0 text-[#ffbcab]" />
                      <span className="text-sm text-foreground">{t[error]}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="group h-14 w-full rounded-full bg-primary text-lg font-semibold text-primary-foreground shadow-lg shadow-black/30 transition-all hover:-translate-y-0.5 hover:bg-accent hover:shadow-xl hover:shadow-accent/25 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      {t.submitting}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      {t.joinCta}
                      <ArrowRightIcon
                        size={16}
                        strokeWidth={2}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  )}
                </Button>

              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
