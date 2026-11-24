"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LANGUAGES, useLanguage } from "@/lib/i18n";

export default function MenuSidebar() {
  const [open, setOpen] = useState(false);
  const { code: language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? t.closeMenu : t.openMenu}
        aria-expanded={open}
        aria-controls="language-menu"
        className="fixed top-8 right-6 z-50 flex h-12 w-12 cursor-pointer flex-col items-end justify-center gap-1.5 rounded-full px-2.5 transition-colors hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        <span
          className={`h-0.5 rounded-full bg-foreground transition-all duration-300 ${
            open ? "w-7 translate-y-2 rotate-45" : "w-7"
          }`}
        />
        <span
          className={`h-0.5 rounded-full bg-foreground transition-all duration-300 ${
            open ? "w-7 opacity-0" : "w-5"
          }`}
        />
        <span
          className={`h-0.5 rounded-full bg-foreground transition-all duration-300 ${
            open ? "w-7 -translate-y-2 -rotate-45" : "w-3.5"
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-30 bg-black/25"
            />

            <motion.aside
              key="sidebar"
              id="language-menu"
              initial={{ opacity: 0, x: 24, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "top right" }}
              className="fixed top-4 right-4 bottom-4 z-40 flex w-[calc(100%-2rem)] flex-col overflow-hidden rounded-[2rem] border border-foreground/15 bg-[#0c2118]/60 p-6 pt-24 shadow-[0_24px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl backdrop-saturate-150 sm:w-80"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-foreground/10 to-transparent"
              />
              <div className="relative flex min-h-0 flex-1 flex-col">
                <p className="mb-4 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                  {t.language}
                </p>
                <ul className="-me-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto pe-2 [scrollbar-width:thin]">
                  {LANGUAGES.map((lang) => (
                    <li key={lang.code}>
                      <button
                        type="button"
                        lang={lang.code}
                        aria-pressed={language === lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setOpen(false);
                        }}
                        className={`w-full cursor-pointer rounded-full px-5 py-2.5 text-start text-lg transition-colors ${
                          lang.script === "latin" ? "" : `lang-${lang.script}`
                        } ${
                          language === lang.code
                            ? "bg-primary font-semibold text-primary-foreground"
                            : "text-foreground/85 hover:bg-foreground/10"
                        }`}
                      >
                        {lang.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
