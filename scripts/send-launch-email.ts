import "dotenv/config";
import { closeEmailTransport, defaultSender, sendEmail } from "@/lib/email";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { waitlist } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const EMAIL_FROM = process.env.LAUNCH_EMAIL_FROM ?? defaultSender();

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildLaunchEmailHTML(siteUrl: string): string {
  const url = escapeHtml(siteUrl);

  return `
<div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#08271e; padding:48px 0;">
    <tbody>
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background:#0c2118; border:1px solid #f9f2e02e; border-radius:24px; overflow:hidden;">
            <tbody>
              <tr>
                <td style="padding:56px 40px 24px; text-align:center;">
                  <img src="${url}/web-app-manifest-192x192.png" width="72" height="72" alt="Onset" style="display:inline-block; border-radius:16px;" />
                </td>
              </tr>
              <tr>
                <td style="padding:0 40px; text-align:center; font-family:Inter, 'Helvetica Neue', Arial, sans-serif;">
                  <p style="margin:0 0 20px; color:#b9d39a; font-size:13px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase;">Now open</p>
                  <h1 style="margin:0 0 20px; color:#f9f2e0; font-size:40px; line-height:1.05; font-weight:900; letter-spacing:-1px;">Onset is live.</h1>
                  <p style="margin:0 auto 36px; max-width:440px; color:#ced6c7; font-size:16px; line-height:1.7;">
                    Rent, buy, or sell gear, hire verified crew, and find locations for your next shoot. You asked to be the first to know, so here it is.
                  </p>
                  <table border="0" cellspacing="0" cellpadding="0" align="center">
                    <tbody>
                      <tr>
                        <td align="center" bgcolor="#f9f2e0" style="border-radius:999px;">
                          <a href="${url}" style="display:inline-block; padding:16px 40px; border-radius:999px; color:#0c2118; font-size:16px; font-weight:700; text-decoration:none; font-family:Inter, 'Helvetica Neue', Arial, sans-serif;">Explore Onset</a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:48px 40px 40px; text-align:center; font-family:Inter, 'Helvetica Neue', Arial, sans-serif;">
                  <p style="margin:0; color:#8fa192; font-size:12px; line-height:1.6;">
                    You're receiving this because you joined the Onset waitlist.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</div>
`;
}

function buildLaunchEmailText(siteUrl: string): string {
  return `ONSET IS LIVE.

Rent, buy, or sell gear, hire verified crew, and find locations for your next shoot.
You asked to be the first to know, so here it is.

Explore Onset: ${siteUrl}

You're receiving this because you joined the Onset waitlist.
`;
}

async function main() {
  if (!SITE_URL || !process.env.SMTP_HOST) {
    throw new Error("NEXT_PUBLIC_SITE_URL and the SMTP_* settings must be set before sending.");
  }

  const users = await db
    .select({ email: waitlist.email })
    .from(waitlist)
    .orderBy(asc(waitlist.createdAt));

  console.log(`Found ${users.length} waitlist entries. Starting send...`);

  let success = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await sendEmail({
        from: EMAIL_FROM,
        to: user.email,
        subject: "Onset is live. Your next shoot starts here.",
        html: buildLaunchEmailHTML(SITE_URL),
        text: buildLaunchEmailText(SITE_URL),
      });
      console.log(`Sent to ${user.email}`);
      success++;
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed for ${user.email}:`, error);
      failed++;
    }
  }

  console.log(`\nDone. ${success} sent, ${failed} failed.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    closeEmailTransport();
    return db.$client.end();
  });
