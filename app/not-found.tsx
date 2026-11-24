import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background font-inter text-foreground">
      <Image
        src="/onset-mark.svg"
        alt=""
        aria-hidden="true"
        width={200}
        height={200}
        className="pointer-events-none absolute top-1/2 -right-[18vh] h-[110vh] w-auto -translate-y-1/2 opacity-[0.06]"
      />

      <div className="absolute top-8 left-6 z-20 sm:left-8">
        <Link href="/" aria-label="Onset home">
          <Image
            src="/onset-wordmark.png"
            alt="Onset"
            width={600}
            height={166}
            priority
            className="h-auto w-24 sm:w-28"
          />
        </Link>
      </div>

      <div className="absolute bottom-8 left-6 z-20 sm:left-8">
        <span className="text-sm text-muted-foreground">© 2026 Onset</span>
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="reveal reveal-1 mb-8 font-satoshi text-[160px] leading-[0.8] tracking-[-0.05em] text-accent md:text-[260px] lg:text-[320px]">
            404
          </h1>

          <div className="reveal reveal-2 mb-8 inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-foreground/5 px-6 py-2">
            <span className="text-sm font-bold tracking-widest text-foreground/80 uppercase">Page not found</span>
          </div>

          <h2 className="reveal reveal-2 mb-6 font-satoshi text-4xl tracking-[-0.035em] md:text-5xl lg:text-6xl">
            That&apos;s a wrap on this page
          </h2>

          <p className="reveal reveal-3 mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            <span className="font-semibold text-foreground">Onset</span> is launching soon, but this
            page isn&apos;t part of the shoot. The launch page is still waiting for you.
          </p>

          <div className="reveal reveal-3 flex items-center justify-center">
            <Link
              href="/"
              className="group relative overflow-hidden rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:bg-accent hover:shadow-2xl hover:shadow-accent/40"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <ArrowLeftIcon size={20} strokeWidth={2} />
                Back to launch page
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
