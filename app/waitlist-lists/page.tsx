import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { waitlist } from "@/lib/schema";
import { getLanguageLabel } from "@/lib/languages";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryLabel(iso: string): string {
  if (!iso) return "—";
  try {
    return countryNames.of(iso) ?? iso;
  } catch {
    return iso;
  }
}
import {
  hasWaitlistAdminSession,
  isWaitlistAdminConfigured,
} from "@/lib/waitlist-admin-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Addis_Ababa",
});

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

function LoginScreen({ error }: { error: string | null }) {
  const configured = isWaitlistAdminConfigured();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border bg-card p-7 sm:p-9">
        <Logo className="h-auto w-24" />

        <div className="mt-9">
          <h1 className="text-2xl font-semibold tracking-tight">
            Waitlist access
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Enter the admin password to view people who asked to be notified
            at launch.
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
                className="h-11 rounded-xl bg-background"
                placeholder="Enter your password"
              />
            </div>

            {error ? (
              <p
                id="login-error"
                role="alert"
                className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}

            <Button className="h-11 w-full rounded-full" type="submit">
              View waitlist
            </Button>
          </form>
        ) : (
          <p
            role="alert"
            className="mt-8 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm leading-6 text-destructive"
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

export default async function WaitlistListsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  if (!(await hasWaitlistAdminSession())) {
    const { error } = await searchParams;
    const key = Array.isArray(error) ? error[0] : error;
    return <LoginScreen error={key ? (LOGIN_ERRORS[key] ?? null) : null} />;
  }

  const entries = await db
    .select({
      id: waitlist.id,
      name: waitlist.name,
      email: waitlist.email,
      phone: waitlist.phone,
      country: waitlist.country,
      language: waitlist.language,
      createdAt: waitlist.createdAt,
    })
    .from(waitlist)
    .orderBy(desc(waitlist.createdAt));

  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Logo className="h-auto w-20" />
            <span className="text-sm text-muted-foreground">Waitlist admin</span>
          </div>

          <form method="post" action="/waitlist-lists/logout">
            <Button type="submit" variant="outline" size="sm" className="rounded-full">
              Log out
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-primary">Launch interest</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Waitlist
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Signups collected from the launching-soon page.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="text-2xl font-semibold text-foreground">
              {entries.length}
            </span>{" "}
            {entries.length === 1 ? "person" : "people"}
          </p>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border bg-card">
          {entries.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <h2 className="text-lg font-semibold">No signups yet</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                New signups will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-240 border-collapse text-left">
                <caption className="sr-only">Onset launch waitlist entries</caption>
                <thead>
                  <tr className="border-b bg-muted/45">
                    <th
                      scope="col"
                      className="w-16 px-5 py-3.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                    >
                      Phone
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                    >
                      Country
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                    >
                      Language
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                    >
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr key={entry.id} className="border-b last:border-b-0 hover:bg-muted/35">
                      <td className="px-5 py-4 text-sm text-muted-foreground tabular-nums">
                        {entries.length - index}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold">
                        {entry.name || <span className="font-normal text-muted-foreground">—</span>}
                      </td>
                      <td className="px-5 py-4 text-sm break-all">
                        <a
                          href={`mailto:${entry.email}`}
                          className="text-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          {entry.email}
                        </a>
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap tabular-nums">
                        {entry.phone ? (
                          <a
                            href={`tel:${entry.phone}`}
                            className="underline-offset-4 hover:text-primary hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                          >
                            {entry.phone}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap">
                        {countryLabel(entry.country)}
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap" lang={entry.language}>
                        {getLanguageLabel(entry.language)}
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap text-muted-foreground">
                        {dateFormatter.format(entry.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
