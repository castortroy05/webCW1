import nodemailer from 'nodemailer';
import type { Config } from './config.js';

export interface ShareMessage {
  to: string;
  replyTo?: string | undefined;
  subject: string;
  text: string;
}

export interface Mailer {
  send(message: ShareMessage): Promise<void>;
}

/** SMTP when SMTP_URL is set; otherwise messages are only logged (local dev). */
export function createMailer(config: Pick<Config, 'SMTP_URL' | 'MAIL_FROM'>): Mailer {
  const transport = config.SMTP_URL
    ? nodemailer.createTransport(config.SMTP_URL)
    : nodemailer.createTransport({ jsonTransport: true });
  return {
    async send(message) {
      const info = await transport.sendMail({ from: config.MAIL_FROM, ...message });
      if (!config.SMTP_URL) console.log('[mail:dev]', info.message);
    },
  };
}
