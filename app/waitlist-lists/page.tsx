import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/db";
import { waitlist } from "@/lib/schema";
import { getLanguageLabel } from "@/lib/languages";
import {
  AUDIENCE_ROLES,
  AUDIENCE_ROLE_LABELS,
  INTERESTS,
  INTEREST_LABELS,
  type AudienceRole,
  type Interest,
} from "@/lib/survey";
import {
  hasWaitlistAdminSession,
  isWaitlistAdminConfigured,
} from "@/lib/waitlist-admin-auth";

const LOGIN_ERRORS: Record<string, string> = {
  password: "The password you entered is incorrect.",
  rate: "Too many attempts. Please wait one minute and try again.",
  config: "Admin access is not configured. Add WAITLIST_ADMIN_PASSWORD to the application environment.",
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Waitlist Admin",
  description: "Private Onset waitlist administration.",
  robots: {
    index: false,
    follow: false,
  },
};

const TIME_ZONE = "Africa/Addis_Ababa";
const DAY_MS = 24 * 60 * 60 * 1000;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });
const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

const SURFACE =
  "rounded-3xl border border-foreground/10 bg-[linear-gradient(180deg,rgba(249,242,224,0.045),rgba(249,242,224,0.015))] shadow-[inset_0_1px_0_rgba(249,242,224,0.06)]";

function countryLabel(iso: string): string {
  if (!iso) return "—";
  try {
    return countryNames.of(iso) ?? iso;
  } catch {
    return iso;
  }
}

function splitChoices<T extends string>(stored: string, allowed: readonly T[]): T[] {
  return stored.split(",").filter((item): item is T => (allowed as readonly string[]).includes(item));
}

function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function relativeTime(date: Date, now: number): string {
  const minutes = Math.round((date.getTime() - now) / 60000);
  if (Math.abs(minutes) < 60) return relativeFormatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relativeFormatter.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return relativeFormatter.format(days, "day");
  return dateFormatter.format(date);
}

interface Entry {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  language: string;
  interests: Interest[];
  interestsOther: string;
  roles: AudienceRole[];
  rolesOther: string;
  createdAt: Date;
}

async function loadWaitlist() {
  const rows = await db
    .select({
      id: waitlist.id,
      name: waitlist.name,
      email: waitlist.email,
      phone: waitlist.phone,
      country: waitlist.country,
      language: waitlist.language,
      interests: waitlist.interests,
      interestsOther: waitlist.interestsOther,
      roles: waitlist.roles,
      rolesOther: waitlist.rolesOther,
      createdAt: waitlist.createdAt,
    })
    .from(waitlist)
    .orderBy(desc(waitlist.createdAt));

  const now = Date.now();
  const todayKey = dayKeyFormatter.format(now);
  const entries: Entry[] = rows.map((row) => ({
    ...row,
    interests: splitChoices(row.interests, INTERESTS),
    roles: splitChoices(row.roles, AUDIENCE_ROLES),
  }));

  return {
    entries,
    now,
    stats: {
      total: entries.length,
      lastWeek: entries.filter((entry) => now - entry.createdAt.getTime() < 7 * DAY_MS).length,
      today: entries.filter((entry) => dayKeyFormatter.format(entry.createdAt) === todayKey).length,
      countries: new Set(entries.map((entry) => entry.country).filter(Boolean)).size,
    },
  };
}

function choiceLabels<T extends string>(items: T[], labels: Record<T, string>, otherText: string): string[] {
  return items.map((item) => (item === "other" && otherText ? `Other: ${otherText}` : labels[item]));
}

function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/onset-wordmark.png"
      alt="Onset"
      width={600}
      height={166}
      priority
      className={className}
    />
  );
}

function Flag({ iso }: { iso: string }) {
  if (!iso) return null;
  return (
    <Image
      src={`/flags/${iso}.svg`}
      alt=""
      aria-hidden="true"
      width={20}
      height={14}
      unoptimized
      className="h-3.5 w-5 shrink-0 rounded-[3px] object-cover ring-1 ring-foreground/15"
    />
  );
}

function Chips({ items, tone }: { items: string[]; tone: "accent" | "muted" }) {
  if (items.length === 0) {
    return <span className="text-muted-foreground/60">—</span>;
  }
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className={`rounded-full px-2.5 py-1 text-xs leading-tight font-medium ${
            tone === "accent"
              ? "bg-accent/12 text-accent ring-1 ring-accent/20"
              : "bg-foreground/[0.06] text-foreground/85 ring-1 ring-foreground/10"
          }`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function StatCard({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className={`${SURFACE} p-5`}>
      <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-3 font-satoshi text-4xl tracking-[-0.03em] tabular-nums">{value.toLocaleString("en")}</p>
      <p className="mt-1 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

function Breakdown<T extends string>({
  title,
  options,
  labels,
  counts,
  total,
  param,
  active,
}: {
  title: string;
  options: readonly T[];
  labels: Record<T, string>;
  counts: Record<T, number>;
  total: number;
  param: string;
  active: string;
}) {
  const sorted = [...options].sort((a, b) => counts[b] - counts[a]);
  const max = Math.max(1, ...options.map((option) => counts[option]));

  return (
    <section className={`${SURFACE} min-w-0 p-5 sm:p-6`}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">Share of all signups</p>
      </div>
      <ul className="mt-5 space-y-3.5">
        {sorted.map((option) => {
          const count = counts[option];
          const percent = total ? Math.round((count / total) * 100) : 0;
          const isActive = active === option;
          return (
            <li key={option}>
              <Link
                href={isActive ? "/waitlist-lists" : `/waitlist-lists?${param}=${option}`}
                aria-current={isActive ? "true" : undefined}
                className="group block rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span
                    className={`truncate transition-colors ${
                      isActive ? "font-semibold text-accent" : "text-foreground/85 group-hover:text-foreground"
                    }`}
                  >
                    {labels[option]}
                  </span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {count} <span className="text-muted-foreground/60">· {percent}%</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-foreground/[0.07]">
                  <div
                    className={`h-full rounded-full transition-colors ${
                      isActive ? "bg-accent" : "bg-accent/55 group-hover:bg-accent/80"
                    }`}
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function JoinedCell({ date, now }: { date: Date; now: number }) {
  return (
    <time dateTime={date.toISOString()} className="block">
      <span className="block text-foreground/90">{relativeTime(date, now)}</span>
      <span className="block text-xs text-muted-foreground">
        {dateFormatter.format(date)} · {timeFormatter.format(date)}
      </span>
    </time>
  );
}

function LoginScreen({ error }: { error: string | null }) {
  const configured = isWaitlistAdminConfigured();

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-5 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(185,211,154,0.12),transparent_70%)]"
      />
      <section className={`${SURFACE} relative w-full max-w-md bg-card/80 p-7 backdrop-blur-xl sm:p-9`}>
        <Logo className="h-auto w-24" />

        <div className="mt-9">
          <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">Admin</p>
          <h1 className="mt-2 font-satoshi text-3xl tracking-[-0.03em]">Waitlist access</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Enter the admin password to see who has joined the Onset waitlist.
          </p>
        </div>

        {configured ? (
          <form method="post" action="/waitlist-lists/login" className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">Admin password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "login-error" : undefined}
                className="h-12 rounded-xl bg-background/70 px-4"
                placeholder="Enter your password"
              />
            </div>

            {error ? (
              <p
                id="login-error"
                role="alert"
                className="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}

            <Button className="h-12 w-full rounded-full text-base font-semibold hover:bg-accent" type="submit">
              View waitlist
            </Button>
          </form>
        ) : (
          <p
            role="alert"
            className="mt-8 rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm leading-6 text-destructive"
          >
            Admin access is not configured. Add{" "}
            <code className="font-semibold">WAITLIST_ADMIN_PASSWORD</code> to
            the application environment, then redeploy.
          </p>
        )}
      </section>
    </main>
  );
}

const SELECT =
  "h-11 w-full min-w-0 appearance-none rounded-xl border border-foreground/15 bg-background/60 bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none' stroke='%23ced6c7' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1.5l5 5 5-5'/%3E%3C/svg%3E\")] bg-[length:12px_8px] bg-[position:right_0.9rem_center] bg-no-repeat ps-3.5 pe-9 text-sm text-foreground outline-none transition-colors hover:border-foreground/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40";

export default async function WaitlistListsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  if (!(await hasWaitlistAdminSession())) {
    const key = firstParam(params.error);
    return <LoginScreen error={key ? (LOGIN_ERRORS[key] ?? null) : null} />;
  }

  const { entries, stats, now } = await loadWaitlist();

  const query = firstParam(params.q);
  const interestParam = firstParam(params.interest);
  const roleParam = firstParam(params.role);
  const interestFilter = (INTERESTS as readonly string[]).includes(interestParam) ? (interestParam as Interest) : null;
  const roleFilter = (AUDIENCE_ROLES as readonly string[]).includes(roleParam) ? (roleParam as AudienceRole) : null;
  const needle = query.toLowerCase();
  const hasFilters = Boolean(needle || interestFilter || roleFilter);

  const filtered = entries.filter(
    (entry) =>
      (!needle ||
        entry.name.toLowerCase().includes(needle) ||
        entry.email.toLowerCase().includes(needle) ||
        entry.phone.includes(needle.replace(/\s+/g, "")) ||
        entry.interestsOther.toLowerCase().includes(needle) ||
        entry.rolesOther.toLowerCase().includes(needle)) &&
      (!interestFilter || entry.interests.includes(interestFilter)) &&
      (!roleFilter || entry.roles.includes(roleFilter)),
  );

  const interestCounts = Object.fromEntries(
    INTERESTS.map((interest) => [interest, entries.filter((entry) => entry.interests.includes(interest)).length]),
  ) as Record<Interest, number>;
  const roleCounts = Object.fromEntries(
    AUDIENCE_ROLES.map((role) => [role, entries.filter((entry) => entry.roles.includes(role)).length]),
  ) as Record<AudienceRole, number>;

  const position = new Map(entries.map((entry, index) => [entry.id, entries.length - index]));

  return (
    <div className="relative min-h-dvh bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(185,211,154,0.1),transparent_70%)]"
      />

      <header className="sticky top-0 z-20 border-b border-foreground/10 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Logo className="h-auto w-[4.5rem]" />
            <span aria-hidden="true" className="h-5 w-px bg-foreground/15" />
            <span className="text-sm text-muted-foreground">Waitlist admin</span>
          </div>

          <form method="post" action="/waitlist-lists/logout">
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="h-9 rounded-full border border-foreground/15 px-4 text-sm hover:bg-foreground/[0.07] dark:hover:bg-foreground/[0.07]"
            >
              Log out
            </Button>
          </form>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-5 pt-10 pb-16 sm:px-8 sm:pt-14">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">Launch interest</p>
          <h1 className="mt-2 font-satoshi text-4xl tracking-[-0.035em] sm:text-5xl">Waitlist</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Everyone who joined from the launching-soon page. Times are in Addis Ababa time.
          </p>
        </div>

        <section aria-label="Summary" className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard label="Total signups" value={stats.total} note="All time" />
          <StatCard label="Last 7 days" value={stats.lastWeek} note="New this week" />
          <StatCard label="Today" value={stats.today} note="Since midnight" />
          <StatCard label="Countries" value={stats.countries} note="Where they're from" />
        </section>

        {stats.total > 0 ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Breakdown
              title="What they want to do"
              options={INTERESTS}
              labels={INTEREST_LABELS}
              counts={interestCounts}
              total={stats.total}
              param="interest"
              active={interestFilter ?? ""}
            />
            <Breakdown
              title="Who they are"
              options={AUDIENCE_ROLES}
              labels={AUDIENCE_ROLE_LABELS}
              counts={roleCounts}
              total={stats.total}
              param="role"
              active={roleFilter ?? ""}
            />
          </div>
        ) : null}

        <section aria-labelledby="signups-heading" className="mt-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 id="signups-heading" className="text-xl font-semibold">
                Signups
              </h2>
              <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
                {hasFilters
                  ? `Showing ${filtered.length} of ${stats.total}`
                  : `${stats.total} ${stats.total === 1 ? "person" : "people"}, newest first`}
              </p>
            </div>

            <form
              key={`${query}|${interestFilter ?? ""}|${roleFilter ?? ""}`}
              method="get"
              action="/waitlist-lists"
              role="search"
              className="grid gap-2.5 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:w-[52rem]"
            >
              <label className="sr-only" htmlFor="waitlist-search">
                Search by name, email or phone
              </label>
              <Input
                id="waitlist-search"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search name, email or phone"
                className="h-11 rounded-xl border-foreground/15 bg-background/60 px-3.5 dark:bg-background/60"
              />
              <label className="sr-only" htmlFor="waitlist-interest">
                Filter by interest
              </label>
              <select id="waitlist-interest" name="interest" defaultValue={interestFilter ?? ""} className={SELECT}>
                <option value="">All interests</option>
                {INTERESTS.map((interest) => (
                  <option key={interest} value={interest}>
                    {INTEREST_LABELS[interest]}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="waitlist-role">
                Filter by who they are
              </label>
              <select id="waitlist-role" name="role" defaultValue={roleFilter ?? ""} className={SELECT}>
                <option value="">Everyone</option>
                {AUDIENCE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {AUDIENCE_ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button type="submit" className="h-11 flex-1 rounded-xl px-5 font-semibold hover:bg-accent">
                  Filter
                </Button>
                {hasFilters ? (
                  <Link
                    href="/waitlist-lists"
                    className="inline-flex h-11 items-center rounded-xl border border-foreground/15 px-4 text-sm font-medium text-foreground/85 transition-colors hover:bg-foreground/[0.07] focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
                  >
                    Clear
                  </Link>
                ) : null}
              </div>
            </form>
          </div>

          <div className={`${SURFACE} mt-5 overflow-hidden`}>
            {filtered.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <h3 className="text-lg font-semibold">{hasFilters ? "No matches" : "No signups yet"}</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  {hasFilters
                    ? "Nobody matches these filters. Try a different search or clear the filters."
                    : "New signups will appear here as people join from the launching-soon page."}
                </p>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-foreground/10 lg:hidden">
                  {filtered.map((entry) => (
                    <li key={entry.id} className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold">{entry.name}</p>
                          <a
                            href={`mailto:${entry.email}`}
                            className="block truncate text-sm text-muted-foreground hover:text-accent"
                          >
                            {entry.email}
                          </a>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                          #{position.get(entry.id)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-foreground/85">
                        <a href={`tel:${entry.phone}`} className="tabular-nums hover:text-accent">
                          {entry.phone}
                        </a>
                        <span className="flex items-center gap-2">
                          <Flag iso={entry.country} />
                          {countryLabel(entry.country)}
                        </span>
                        <span lang={entry.language}>{getLanguageLabel(entry.language)}</span>
                      </div>
                      <Chips items={choiceLabels(entry.interests, INTEREST_LABELS, entry.interestsOther)} tone="accent" />
                      <Chips items={choiceLabels(entry.roles, AUDIENCE_ROLE_LABELS, entry.rolesOther)} tone="muted" />
                      <div className="text-sm">
                        <JoinedCell date={entry.createdAt} now={now} />
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[68rem] border-collapse text-left">
                    <caption className="sr-only">Onset launch waitlist entries</caption>
                    <thead>
                      <tr className="border-b border-foreground/10 text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                        <th scope="col" className="w-14 py-3.5 ps-6 pe-2 font-semibold">
                          #
                        </th>
                        <th scope="col" className="px-4 py-3.5 font-semibold">
                          Person
                        </th>
                        <th scope="col" className="px-4 py-3.5 font-semibold">
                          Phone
                        </th>
                        <th scope="col" className="px-4 py-3.5 font-semibold">
                          Country
                        </th>
                        <th scope="col" className="w-[24%] px-4 py-3.5 font-semibold">
                          Interested in
                        </th>
                        <th scope="col" className="w-[20%] px-4 py-3.5 font-semibold">
                          Who they are
                        </th>
                        <th scope="col" className="py-3.5 ps-4 pe-6 font-semibold">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/[0.07]">
                      {filtered.map((entry) => (
                        <tr key={entry.id} className="align-top transition-colors hover:bg-foreground/[0.025]">
                          <td className="py-4 ps-6 pe-2 text-sm text-muted-foreground tabular-nums">
                            {position.get(entry.id)}
                          </td>
                          <td className="min-w-60 px-4 py-4 text-sm">
                            <p className="font-semibold">{entry.name}</p>
                            <a
                              href={`mailto:${entry.email}`}
                              className="mt-0.5 block text-muted-foreground [overflow-wrap:anywhere] underline-offset-4 hover:text-accent hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                              {entry.email}
                            </a>
                            <span
                              lang={entry.language}
                              className="mt-2 inline-block rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[0.6875rem] text-muted-foreground ring-1 ring-foreground/10"
                            >
                              {getLanguageLabel(entry.language)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm whitespace-nowrap tabular-nums">
                            <a
                              href={`tel:${entry.phone}`}
                              className="underline-offset-4 hover:text-accent hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                              {entry.phone}
                            </a>
                          </td>
                          <td className="px-4 py-4 text-sm whitespace-nowrap">
                            <span className="flex items-center gap-2">
                              <Flag iso={entry.country} />
                              {countryLabel(entry.country)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <Chips items={choiceLabels(entry.interests, INTEREST_LABELS, entry.interestsOther)} tone="accent" />
                          </td>
                          <td className="px-4 py-4">
                            <Chips items={choiceLabels(entry.roles, AUDIENCE_ROLE_LABELS, entry.rolesOther)} tone="muted" />
                          </td>
                          <td className="py-4 ps-4 pe-6 text-sm whitespace-nowrap">
                            <JoinedCell date={entry.createdAt} now={now} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
