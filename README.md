# Onset — Launching Soon

Pre-launch page for **Onset**, the film production marketplace: wordmark,
"Launching soon", tagline, and a waitlist ("Join the waitlist") backed by MySQL
(or MariaDB). Built on the same stack and layout as the grar launching-soon app
(Next.js 16, Drizzle ORM, Tailwind 4, shadcn/Base UI, motion).

## Local development

```bash
cp .env.example .env            # then set WAITLIST_ADMIN_PASSWORD
docker compose -p onset-launching-soon up -d mysql     # MySQL 8.4 on 127.0.0.1:23307
npm install
npm run db:migrate
npm run dev
```

Open <http://localhost:3000>.

## Routes

| Route             | Purpose                                                          |
| ----------------- | ---------------------------------------------------------------- |
| `/`               | Public launching-soon page                                       |
| `POST /api/submit`| Adds `{ name, email, phone, country, language }` (5/min per IP)  |
| `/waitlist-lists` | Password-protected list of signups (`WAITLIST_ADMIN_PASSWORD`)   |

## Structure

| Path                              | What lives there                                              |
| --------------------------------- | ------------------------------------------------------------- |
| `components/Hero.tsx`             | The page: wordmark, headline, call to action, footer          |
| `components/ui/expandable-screen.tsx` | The button that expands into the full-screen waitlist popup |
| `components/waitlist-form.tsx`    | Waitlist form, validation and success state                   |
| `components/country-code-picker.tsx` | Searchable country picker inside the phone field           |
| `components/film-grain.tsx`       | Popup background: moving waves, film grain, glass Onset mark  |
| `components/menu-sidebar.tsx`     | Language menu (top right)                                     |
| `lib/i18n.tsx`, `lib/languages.ts`| Copy for each language and the language list                  |
| `lib/waitlist-email.ts`           | Confirmation email sent after signup                          |

## Languages

English and Amharic, picked from the menu (top right). Copy lives in
`lib/i18n.tsx`; the list in `lib/languages.ts`. The choice is kept in
`localStorage` and saved with each signup, so the admin table shows it. Amharic
renders in Noto Sans Ethiopic. To add a language, add it to `LANGUAGES` (with
its `script` and `dir`), give it a block in `TRANSLATIONS`, and add its copy to
`COPY` in `lib/waitlist-email.ts`.

The Amharic copy has not yet been reviewed by a native speaker.

## Phone numbers

The phone field is one connected input: a searchable country picker (all 245
regions known to `libphonenumber-js`, with SVG flags from `country-flag-icons`)
followed by the number. Country names follow the selected language. Numbers are
validated per country and stored in E.164 (`+251911234567`) alongside the ISO
country code.

`scripts/copy-flags.mjs` copies the flag SVGs into `public/flags/` before
`dev` and `build`; that folder is generated and git-ignored.

## Environment

See [`.env.example`](.env.example). `NEXT_PUBLIC_SITE_URL` is read when the page
is prerendered, so set it at **build** time as well as runtime.

## Deploying

The `Dockerfile` builds a standalone Next.js image and runs
`drizzle-kit migrate` on container start, so `DATABASE_URL` must be available
at runtime.

For a cPanel "Setup Node.js App" host, set the environment variables on the app
in cPanel, then redeploy over SSH:

```bash
DEPLOY_SSH_HOST=onset DEPLOY_APP_ROOT=onset-app ./scripts/deploy-cpanel.sh
```

The script builds with `NEXT_PUBLIC_SITE_URL` (default `https://onset.et`),
copies the standalone output (refusing to upload if it contains `.env` or
symlinks), uploads it, and restarts the app.

## Database (Drizzle)

The schema lives in `lib/schema.ts`; migrations are SQL files in `drizzle/`.
The table is created as `utf8mb4` so Amharic names are stored correctly.

```bash
npm run db:generate -- --name describe_change   # after editing lib/schema.ts
npm run db:migrate                              # apply pending migrations
npm run db:studio                               # browse the data
```

## Launch day

```bash
npm run send-launch-email
```

Sends the launch email to every waitlist entry. Requires the `SMTP_*`
settings, `NEXT_PUBLIC_SITE_URL` and `DATABASE_URL`. In development it only
logs unless `FORCE_EMAIL_SEND=1`.

## Email

Everyone who joins gets a confirmation email in the language they picked
(`lib/waitlist-email.ts`), sent right after the signup is saved. Mail goes out
over SMTP using the `SMTP_*` settings. If SMTP is not configured, emails are
logged instead of sent.

## Assets

The Onset wordmark is `public/onset-wordmark.png`. `public/onset-mark.svg` and
the app icons are a vector trace of the Onset "O" mark. The hero images in
`public/bg/` were generated for this page.

Fonts: [Satoshi](https://www.fontshare.com/fonts/satoshi) (headlines, bundled in
`app/fonts/`) under the [ITF Free Font License](https://www.fontshare.com/licenses/itf-ffl),
and Inter and Noto Sans Ethiopic from Google Fonts under the SIL Open Font License.

## CI/CD

Every push to `main` runs `.github/workflows/deploy.yml` (it can also be started
by hand from the Actions tab):

1. `npm ci`, `npm run typecheck`, `npm run lint` — nothing deploys if these fail.
2. Pending Drizzle migrations are applied through an SSH tunnel to the server's
   MariaDB.
3. `scripts/deploy-cpanel.sh` builds the standalone bundle, uploads it and
   restarts the Node.js app.
4. The live site is checked to respond.

Deploys never overlap. The workflow needs these repository secrets:

| Secret | Purpose |
| --- | --- |
| `DEPLOY_SSH_KEY` | Private key authorised in cPanel → SSH Access (one key per repo) |
| `DEPLOY_KNOWN_HOSTS` | The server's SSH host key line |
| `DEPLOY_HOST` / `DEPLOY_USER` | SSH host name and cPanel user |
| `MIGRATE_DATABASE_URL` | `mysql://USER:PASSWORD@127.0.0.1:33306/DB` (reached through the tunnel) |

Runtime settings (database, SMTP, admin password) stay in cPanel → Setup Node.js
App; CI never changes them.
