import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

let transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  if (!env.mailEnabled) return null;
  transporter ??= nodemailer.createTransport({
    service: "Gmail",
    auth: { user: env.MAIL_SENDER, pass: env.MAIL_PASSWORD },
  });
  return transporter;
};

/** Minimal HTML escape — verification codes are numeric, but names are not. */
const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char] ?? char,
  );

const verificationTemplate = (code: string): string => `
  <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:480px">
    <h1 style="font-size:20px">Tazkarty</h1>
    <p>Your verification code is:</p>
    <p style="font-size:28px;font-weight:700;letter-spacing:4px;color:#1a66b9">
      ${escapeHtml(code)}
    </p>
    <p style="color:#666;font-size:13px">
      This code expires in ${env.VERIFICATION_CODE_TTL_MINUTES} minutes.
      If you did not request it, you can ignore this email.
    </p>
  </div>
`;

/**
 * Sends a verification code.
 *
 * Returns whether the mail was accepted rather than throwing, so a mail outage
 * degrades one request instead of failing the whole flow. The previous version
 * swallowed every error in an empty `catch {}`, which meant a wrong Gmail
 * password looked exactly like a successful send.
 */
export const sendVerificationCode = async (
  to: string,
  code: string,
): Promise<boolean> => {
  const client = getTransporter();

  if (!client) {
    logger.warn(
      { to },
      "Mail is not configured (MAIL_SENDER / MAIL_PASSWORD missing); skipping send",
    );
    return false;
  }

  try {
    await client.sendMail({
      from: env.MAIL_SENDER,
      to,
      subject: "Tazkarty verification code",
      html: verificationTemplate(code),
    });
    logger.info({ to }, "Verification email sent");
    return true;
  } catch (error) {
    logger.error({ err: error, to }, "Failed to send verification email");
    return false;
  }
};
