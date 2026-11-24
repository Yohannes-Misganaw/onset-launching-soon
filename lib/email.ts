import nodemailer, { type Transporter } from "nodemailer";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
}

let transporter: Transporter | null = null;

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter(): Transporter {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true,
      maxConnections: 2,
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 30_000,
    });
  }
  return transporter;
}

export function defaultSender(): string {
  return process.env.MAIL_FROM ?? `Onset <${process.env.SMTP_USER ?? "hello@onset.et"}>`;
}

export async function sendEmail({ to, subject, html, text, from, replyTo }: EmailOptions): Promise<void> {
  if (!smtpConfigured() || (process.env.NODE_ENV === "development" && !process.env.FORCE_EMAIL_SEND)) {
    console.log(`[email not sent: SMTP disabled] to=${to} subject=${JSON.stringify(subject)}`);
    return;
  }

  await getTransporter().sendMail({
    from: from ?? defaultSender(),
    replyTo: replyTo ?? process.env.MAIL_REPLY_TO,
    to,
    subject,
    html,
    text,
  });
}

export function closeEmailTransport(): void {
  transporter?.close();
  transporter = null;
}
