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
import { AlertCircleIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@/components/icons";
import { DEFAULT_COUNTRY_ISO, toE164Phone } from "@/lib/countries";
import { useLanguage, type Translation } from "@/lib/i18n";
import { AUDIENCE_ROLES, INTERESTS } from "@/lib/survey";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STEP_COUNT = 3;
const AUTOFOCUS_QUERY = "(min-width: 768px) and (hover: hover) and (pointer: fine)";

type ErrorKey = Extract<
  keyof Translation,
  | "errNameRequired"
  | "errEmailRequired"
  | "errEmailInvalid"
  | "errPhoneRequired"
  | "errPhoneInvalid"
  | "errInterestsRequired"
  | "errRolesRequired"
  | "errRateLimit"
  | "errGeneric"
  | "errNetwork"
>;

function errorForResponse(status: number, field: unknown): ErrorKey {
  if (status === 400 && field === "phone") return "errPhoneInvalid";
  if (status === 400 && field === "name") return "errNameRequired";
  if (status === 400 && field === "email") return "errEmailInvalid";
  if (status === 400 && field === "interests") return "errInterestsRequired";
  if (status === 400 && field === "roles") return "errRolesRequired";
  if (status === 429) return "errRateLimit";
  return "errGeneric";
}

const ERROR_STEP: Partial<Record<ErrorKey, number>> = {
  errNameRequired: 0,
  errEmailRequired: 0,
  errEmailInvalid: 0,
  errPhoneRequired: 0,
  errPhoneInvalid: 0,
  errInterestsRequired: 1,
  errRolesRequired: 2,
};

const FIELD_LABEL =
  "mb-2 block text-sm font-semibold text-foreground/85 transition-colors group-focus-within:text-foreground";
const FIELD_SHELL =
  "rounded-2xl border border-foreground/18 bg-[linear-gradient(180deg,rgba(249,242,224,0.07),rgba(249,242,224,0.02))] bg-[#04140f]/55 shadow-[inset_0_1px_0_rgba(249,242,224,0.08),0_10px_24px_-14px_rgba(2,10,7,0.7)] backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-150 hover:border-foreground/30";
const FIELD_INPUT = `${FIELD_SHELL} h-14 px-4.5 text-base placeholder:text-muted-foreground/60 focus-visible:border-accent focus-visible:bg-[#04140f]/70 focus-visible:ring-4 focus-visible:ring-accent/20 aria-invalid:border-[#f4ae9c] aria-invalid:ring-4 aria-invalid:ring-[#f4ae9c]/15 dark:bg-[#04140f]/55 dark:aria-invalid:ring-[#f4ae9c]/15 md:text-base`;

interface ChoiceGroupProps {
  name: string;
  legend: string;
  hint: string;
  options: readonly string[];
  labels: Record<string, string>;
  invalid: boolean;
  disabled: boolean;
  errorId: string;
  onChange: () => void;
}

function ChoiceGroup({ name, legend, hint, options, labels, invalid, disabled, errorId, onChange }: ChoiceGroupProps) {
  const hintId = useId();
  return (
    <fieldset
      aria-describedby={invalid ? `${hintId} ${errorId}` : hintId}
      data-invalid={invalid ? true : undefined}
      className="group/choices"
    >
      <legend className="mb-1.5 text-xl leading-snug font-semibold text-foreground">{legend}</legend>
      <p id={hintId} className="mb-3 text-sm text-muted-foreground/80">
        {hint}
      </p>
      <div className="grid gap-1.5">
        {options.map((option) => (
          <label
            key={option}
            className="group/choice flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-2xl border border-foreground/18 bg-[#04140f]/55 py-2 ps-4 pe-4 text-[0.9375rem] leading-snug text-foreground/85 backdrop-blur-md transition-[border-color,background-color,color,box-shadow] duration-150 select-none hover:border-foreground/35 has-checked:border-accent/80 has-checked:bg-accent/15 has-checked:text-foreground has-focus-visible:ring-4 has-focus-visible:ring-accent/25 has-disabled:cursor-not-allowed has-disabled:opacity-60 group-data-invalid/choices:border-[#f4ae9c]/60"
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              disabled={disabled}
              onChange={onChange}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="flex size-[1.125rem] shrink-0 items-center justify-center rounded-[5px] border border-foreground/40 text-accent-foreground transition-colors group-has-checked/choice:border-accent group-has-checked/choice:bg-accent"
            >
              <CheckIcon size={12} strokeWidth={3} className="opacity-0 transition-opacity group-has-checked/choice:opacity-100" />
            </span>
            {labels[option]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function WaitlistForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY_ISO);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasNavigated = useRef(false);
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
  const interestsError = error === "errInterestsRequired";
  const rolesError = error === "errRolesRequired";
  const phonePlaceholder = useMemo(
    () => getExampleNumber(country, phoneExamples)?.formatNational() ?? t.phonePlaceholder,
    [country, t.phonePlaceholder],
  );

  useEffect(() => {
    if (window.matchMedia(AUTOFOCUS_QUERY).matches) {
      nameRef.current?.focus({ preventScroll: true });
    }
  }, []);

  useEffect(() => {
    if (!hasNavigated.current) return;
    const target = step === 0 ? nameRef.current : stepRefs.current[step];
    target?.focus({ preventScroll: true });
  }, [step]);

  const clearError = () => {
    if (error) setError(null);
  };

  const goToStep = (next: number) => {
    hasNavigated.current = true;
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const showError = (key: ErrorKey) => {
    setError(key);
    const errorStep = ERROR_STEP[key];
    if (errorStep !== undefined && errorStep !== step) goToStep(errorStep);
  };

  const stepClass = (index: number) =>
    step === index
      ? `space-y-5 outline-none animate-in fade-in duration-300 sm:space-y-6 ${
          direction > 0 ? "slide-in-from-right-6" : "slide-in-from-left-6"
        }`
      : "";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const interests = formData.getAll("interests").map(String);
    const roles = formData.getAll("roles").map(String);

    const stepErrors: (ErrorKey | null)[] = [
      !name
        ? "errNameRequired"
        : !email
          ? "errEmailRequired"
          : !EMAIL_PATTERN.test(email)
            ? "errEmailInvalid"
            : !phone
              ? "errPhoneRequired"
              : !toE164Phone(phone, country)
                ? "errPhoneInvalid"
                : null,
      interests.length === 0 ? "errInterestsRequired" : null,
      roles.length === 0 ? "errRolesRequired" : null,
    ];

    const currentError = stepErrors[step];
    if (currentError) return showError(currentError);

    if (step < STEP_COUNT - 1) {
      setError(null);
      goToStep(step + 1);
      return;
    }

    const firstError = stepErrors.find((item) => item !== null);
    if (firstError) return showError(firstError);

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, country, language, interests, roles }),
      });
      const result: { field?: unknown } = await response.json().catch(() => ({}));

      if (response.ok || response.status === 409) {
        setAlreadyJoined(response.status === 409);
        setIsSubmitted(true);
        return;
      }

      showError(errorForResponse(response.status, result.field));
    } catch {
      setError("errNetwork");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FilmGrain />
      <div className="relative flex min-h-full w-full items-center justify-center px-6 pt-24 pb-12 sm:px-8 sm:py-12 lg:px-24">
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
              <div className="mb-7 text-center sm:mb-8">
                <h2 className="mb-3 font-satoshi text-4xl leading-[1.04] tracking-[-0.035em] lg:text-5xl">{t.formTitle}</h2>
                <p className="text-lg text-muted-foreground">{t.formSubtitle}</p>
              </div>
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-6">
                  <p className="mb-2.5 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase" aria-live="polite">
                    {t.stepOf.replace("{current}", String(step + 1)).replace("{total}", String(STEP_COUNT))}
                  </p>
                  <div className="flex gap-1.5" aria-hidden="true">
                    {Array.from({ length: STEP_COUNT }, (_, index) => (
                      <span
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                          index <= step ? "bg-accent" : "bg-foreground/15"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div
                  ref={(node) => {
                    stepRefs.current[0] = node;
                  }}
                  hidden={step !== 0}
                  tabIndex={-1}
                  className={stepClass(0)}
                >
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
                </div>

                <div
                  ref={(node) => {
                    stepRefs.current[1] = node;
                  }}
                  hidden={step !== 1}
                  tabIndex={-1}
                  className={stepClass(1)}
                >
                  <ChoiceGroup
                    name="interests"
                    legend={t.interestsLabel}
                    hint={t.selectAll}
                    options={INTERESTS}
                    labels={t.interests}
                    invalid={interestsError}
                    disabled={isSubmitting}
                    errorId={errorId}
                    onChange={clearError}
                  />
                </div>

                <div
                  ref={(node) => {
                    stepRefs.current[2] = node;
                  }}
                  hidden={step !== 2}
                  tabIndex={-1}
                  className={stepClass(2)}
                >
                  <ChoiceGroup
                    name="roles"
                    legend={t.rolesLabel}
                    hint={t.selectAll}
                    options={AUDIENCE_ROLES}
                    labels={t.roles}
                    invalid={rolesError}
                    disabled={isSubmitting}
                    errorId={errorId}
                    onChange={clearError}
                  />
                </div>

                <div className="mt-5 space-y-5 sm:mt-6 sm:space-y-6">
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

                  <div className="flex gap-3">
                    {step > 0 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={isSubmitting}
                        onClick={() => {
                          setError(null);
                          goToStep(step - 1);
                        }}
                        className="group h-14 shrink-0 gap-2 rounded-full border border-foreground/20 bg-[#04140f]/45 px-6 text-base has-[>svg]:px-6 font-semibold text-foreground backdrop-blur-md transition-colors hover:bg-foreground/10 hover:text-foreground dark:hover:bg-foreground/10"
                      >
                        <ArrowLeftIcon
                          size={16}
                          strokeWidth={2}
                          className="transition-transform group-hover:-translate-x-0.5"
                        />
                        {t.backCta}
                      </Button>
                    ) : null}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="group h-14 min-w-0 flex-1 rounded-full bg-primary text-lg font-semibold text-primary-foreground shadow-lg shadow-black/30 transition-all hover:-translate-y-0.5 hover:bg-accent hover:shadow-xl hover:shadow-accent/25 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                          {t.submitting}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-3">
                          {step < STEP_COUNT - 1 ? t.continueCta : t.joinCta}
                          <ArrowRightIcon
                            size={16}
                            strokeWidth={2}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
