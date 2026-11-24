import { getLanguage, type LanguageCode } from "@/lib/languages";
import { sendEmail } from "@/lib/email";

interface ConfirmationCopy {
  subject: string;
  headline1: string;
  headline2: string;
  cta: string;
  tagline: string;
  greeting: string;
  body: string;
  notify: string;
  signoff: string;
  team: string;
  footer: string;
}

const COPY: Record<LanguageCode, ConfirmationCopy> = {
  en: {
    subject: "You're on the Onset waitlist",
    headline1: "You're on",
    headline2: "the list.",
    cta: "Visit onset.et",
    tagline: "Gear, crew & locations for your next shoot",
    greeting: "Hi {name},",
    body: "Thanks for joining the Onset waitlist. Onset is the film production marketplace where you can rent, buy, or sell gear, hire verified crew, and find locations for your next shoot.",
    notify: "We'll email you the moment we open.",
    signoff: "See you on set,",
    team: "The Onset team",
    footer: "You're receiving this because you signed up at onset.et.",
  },
  am: {
    subject: "የOnset መጠባበቂያ ዝርዝር ውስጥ ገብተዋል",
    headline1: "በዝርዝሩ",
    headline2: "ውስጥ ነዎት።",
    cta: "onset.etን ይጎብኙ",
    tagline: "ለቀጣዩ ቀረጻዎ መሣሪያ፣ ባለሙያና ቦታ",
    greeting: "ሰላም {name}፣",
    body: "የOnset መጠባበቂያ ዝርዝርን ስለተቀላቀሉ እናመሰግናለን። Onset የፊልም ፕሮዳክሽን የገበያ ቦታ ነው፤ መሣሪያዎችን መከራየት፣ መግዛትና መሸጥ፣ የተረጋገጡ ባለሙያዎችን መቅጠር እና የቀረጻ ቦታዎችን ማግኘት ይችላሉ።",
    notify: "እንደተከፈትን ወዲያውኑ በኢሜይል እናሳውቅዎታለን።",
    signoff: "በቀረጻ ቦታ እንገናኝ፣",
    team: "የOnset ቡድን",
    footer: "ይህ ኢሜይል የደረሰዎት onset.et ላይ ስለተመዘገቡ ነው።",
  },
};

const LATIN_DISPLAY = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const LATIN_TEXT = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const ETHIOPIC = "'Noto Sans Ethiopic', 'Nyala', 'Abyssinica SIL', 'Helvetica Neue', Arial, sans-serif";

function fontsFor(script: string) {
  const families = ["Inter:wght@300;400;600;700;900"];
  if (script === "ethiopic") families.push("Noto+Sans+Ethiopic:wght@400;600;700;900");
  const href = `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;
  if (script === "ethiopic") return { href, display: ETHIOPIC, text: ETHIOPIC };
  return { href, display: LATIN_DISPLAY, text: LATIN_TEXT };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://onset.et").replace(/\/$/, "");
}

export function buildWaitlistConfirmation(name: string, language: LanguageCode) {
  const copy = COPY[language];
  const { dir, script } = getLanguage(language);
  const align = dir === "rtl" ? "right" : "left";
  const latin = script === "latin";
  const fonts = fontsFor(script);
  const D = fonts.display;
  const T = fonts.text;
    const tracking = (value: string) => (latin ? `letter-spacing:${value};` : "");
  const url = siteUrl();
  const greeting = copy.greeting.replace("{name}", name);
  const greetingHtml = escapeHtml(copy.greeting).replace("{name}", escapeHtml(name));
  const e = escapeHtml;

  const html = `<!DOCTYPE html>
<html lang="${language}" dir="${dir}" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${e(copy.subject)}</title>
<link href="${fonts.href}" rel="stylesheet">
<style>
  body { margin:0 !important; padding:0 !important; background:#08271e; }
  a { text-decoration:none; }
  @media only screen and (max-width: 620px) {
    .px { padding-left:28px !important; padding-right:28px !important; }
    .display { font-size:48px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background:#08271e; -webkit-text-size-adjust:100%;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">${e(copy.notify)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#08271e" style="background:#08271e;">
  <tr>
    <td align="center" style="padding:0;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" dir="${dir}" style="width:100%; max-width:600px; background:#08271e;">
        <tr>
          <td style="padding:0; font-size:0; line-height:0;">
            <a href="${url}"><img src="${url}/email/onset-header.jpg" width="600" alt="Onset" style="display:block; width:100%; max-width:600px; height:auto; border:0;"></a>
          </td>
        </tr>
        <tr>
          <td class="px" style="padding:52px 48px 0; text-align:${align};">
            <h1 class="display" style="margin:0; font-family:${D}; font-size:60px; line-height:0.92; font-weight:900; ${tracking("-2px")} color:#f9f2e0;">${e(copy.headline1)}<br><span style="color:#b9d39a;">${e(copy.headline2)}</span></h1>
          </td>
        </tr>
        <tr>
          <td class="px" style="padding:36px 48px 0; font-family:${T}; text-align:${align};">
            <p style="margin:0 0 16px; font-size:17px; line-height:1.6; font-weight:600; color:#f9f2e0;">${greetingHtml}</p>
            <p style="margin:0; font-size:16px; line-height:1.8; font-weight:300; color:#ced6c7;">${e(copy.body)}</p>
          </td>
        </tr>
        <tr>
          <td class="px" style="padding:28px 48px 0; font-family:${T}; text-align:${align};">
            <p style="margin:0 0 32px; font-size:17px; line-height:1.6; font-weight:600; color:#f9f2e0;">${e(copy.notify)}</p>
            <p style="margin:0; font-size:15px; line-height:1.7; font-weight:300; color:#ced6c7;">${e(copy.signoff)}<br><span style="font-weight:600; color:#f9f2e0;">${e(copy.team)}</span></p>
          </td>
        </tr>
        <tr>
          <td class="px" style="padding:40px 48px 56px; text-align:${align};">
            <a href="${url}" style="display:inline-block; font-family:${T}; font-size:14px; line-height:1; font-weight:700; ${tracking("0.5px")} color:#f9f2e0; border-bottom:2px solid #b9d39a; padding:0 0 8px;">${e(copy.cta)} &nbsp;&rarr;</a>
          </td>
        </tr>
        <tr>
          <td class="px" style="padding:28px 48px 44px; border-top:1px solid #f9f2e02e; font-family:${T}; text-align:${align};">
            <p style="margin:0 0 6px; font-size:13px; line-height:1.6; color:#ced6c7;">${e(copy.tagline)}</p>
            <p style="margin:0; font-size:12px; line-height:1.6; color:#8fa192;">${e(copy.footer)}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    `${copy.headline1} ${copy.headline2}`,
    "",
    greeting,
    "",
    copy.body,
    "",
    copy.notify,
    "",
    copy.signoff,
    copy.team,
    "",
    `${copy.cta}: ${url}`,
    "",
    "—",
    copy.tagline,
    copy.footer,
  ].join("\n");

  return { subject: copy.subject, html, text };
}

export async function sendWaitlistConfirmation(params: {
  name: string;
  email: string;
  language: LanguageCode;
}): Promise<void> {
  const { subject, html, text } = buildWaitlistConfirmation(params.name, params.language);
  await sendEmail({ to: params.email, subject, html, text });
}
