/**
 * Email Service - Sends emails using Gmail SMTP via Nodemailer.
 * Used by Cloud Functions to deliver task-related notifications.
 */
import * as nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../config';

// Lazy singleton transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    if (!EMAIL_CONFIG.gmail.user || !EMAIL_CONFIG.gmail.appPassword) {
      throw new Error(
        'Gmail credentials not configured. Set via: firebase functions:config:set gmail.user="..." gmail.app_password="..."'
      );
    }
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_CONFIG.gmail.user,
        pass: EMAIL_CONFIG.gmail.appPassword,
      },
    });
  }
  return transporter;
}

/**
 * Send an email with HTML body.
 * Returns messageId on success.
 */
export async function sendEmail(params: {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<string> {
  const { to, subject, html, replyTo } = params;
  if (!to || to.length === 0) {
    console.warn('sendEmail: No recipients provided, skipping.');
    return '';
  }

  const transport = getTransporter();
  const info = await transport.sendMail({
    from: `"${EMAIL_CONFIG.app.name}" <${EMAIL_CONFIG.gmail.user}>`,
    to: to.join(', '),
    subject,
    html,
    replyTo: replyTo || EMAIL_CONFIG.app.supportEmail,
  });

  console.log(`Email sent: ${info.messageId} → ${to.join(', ')}`);
  return info.messageId;
}
