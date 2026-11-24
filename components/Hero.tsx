"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  ExpandableScreen,
  ExpandableScreenContent,
  ExpandableScreenTrigger,
} from "@/components/ui/expandable-screen";
import MenuSidebar from "@/components/menu-sidebar";
import { ArrowRightIcon } from "@/components/icons";
import { useLanguage } from "@/lib/i18n";

const loadWaitlistForm = () => import("@/components/waitlist-form");

const WaitlistForm = dynamic(loadWaitlistForm, {
  ssr: false,
  loading: () => (
    <div className="flex min-h-full w-full items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/80 border-t-transparent" />
    </div>
  ),
});

function preloadWaitlistForm() {
  void loadWaitlistForm();
}

export default function Hero() {
  const { t, fontClass } = useLanguage();

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(preloadWaitlistForm, { timeout: 4000 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = setTimeout(preloadWaitlistForm, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`relative isolate min-h-dvh w-full overflow-hidden bg-background font-inter text-foreground ${fontClass}`}
    >
      <div aria-hidden="true" className="hero-scene" />

      <MenuSidebar />

      <ExpandableScreen layoutId="cta-card" triggerRadius="100px" contentRadius="24px">
        <div className="relative z-10 grid min-h-dvh grid-rows-[1fr_auto] px-(--gutter)">
          <main className="hero-copy flex flex-col items-center justify-center pt-20 pb-10 text-center sm:pt-[clamp(4rem,9vh,6rem)] sm:pb-[clamp(1.5rem,4vh,3rem)]">
            <Image
              src="/onset-wordmark.png"
              alt="Onset"
              width={600}
              height={166}
              priority
              className="reveal reveal-1 h-auto w-[clamp(8.5rem,16vw,13rem)]"
            />

            <p className="reveal reveal-1 mt-[clamp(2.25rem,6vh,3.75rem)] max-w-[22rem] text-[0.75rem] leading-relaxed font-medium tracking-[0.2em] text-balance text-foreground/85 uppercase sm:max-w-none sm:text-[0.875rem] sm:tracking-[0.3em]">
              {t.kicker}
            </p>

            <h1 className="hero-headline reveal reveal-2 mt-4 font-satoshi text-[clamp(3.25rem,13vw,4.25rem)] leading-[1.08] tracking-[-0.035em] sm:mt-5 md:text-[clamp(3.5rem,6.2vw,5.25rem)]">
              <span className="block md:inline">{t.headlineStart}</span>{" "}
              <span className="block md:inline">{t.headlineMiddle}</span>
              <span className="block text-accent">{t.headlineAccent}</span>
            </h1>

            <p className="reveal reveal-2 mt-6 max-w-[34rem] text-[clamp(1.0625rem,1.5vw,1.3125rem)] leading-[1.5] text-pretty text-foreground/90 sm:mt-7">
              {t.intro}
            </p>

            <div className="reveal reveal-3 mt-8 sm:mt-9">
              <ExpandableScreenTrigger>
                <button
                  type="button"
                  onPointerEnter={preloadWaitlistForm}
                  onTouchStart={preloadWaitlistForm}
                  onFocus={preloadWaitlistForm}
                  className="group relative cursor-pointer overflow-hidden rounded-full bg-primary px-12 py-[1.125rem] text-lg font-bold text-primary-foreground transition-all duration-300 hover:shadow-2xl hover:shadow-accent/40 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                >
                  <span className="relative z-10 flex items-center gap-2.5">
                    {t.joinCta}
                    <ArrowRightIcon
                      size={20}
                      strokeWidth={2.2}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </button>
              </ExpandableScreenTrigger>
            </div>

            <p className="reveal reveal-3 mt-6 me-[-0.35em] text-[0.8125rem] font-semibold tracking-[0.35em] text-foreground/90 uppercase sm:mt-8 sm:text-[0.9375rem]">
              {t.comingSoon}
            </p>
          </main>

          <footer className="reveal reveal-3 flex items-center justify-center gap-5 pb-8 text-sm text-foreground/85 sm:pb-12 sm:text-[0.9375rem]">
            <span>© 2026 Onset</span>
            <span aria-hidden="true" className="h-4 w-px bg-foreground/50" />
            <span>onset.et</span>
          </footer>
        </div>

        <ExpandableScreenContent
          className="film-screen overflow-y-clip text-foreground"
          closeButtonClassName="text-foreground bg-[#04140f]/55 ring-1 ring-foreground/20 backdrop-blur-md hover:bg-[#04140f]/75"
        >
          <WaitlistForm />
        </ExpandableScreenContent>
      </ExpandableScreen>
    </div>
  );
}
