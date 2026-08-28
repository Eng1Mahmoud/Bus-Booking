import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "./logger.js";
let transporter = null;
const getTransporter = () => {
    if (!env.mailEnabled)
        return null;
    /**
     * Explicit host and port rather than `service: "Gmail"`, which resolves to
     * implicit TLS on 465. Outbound 465 is commonly blocked — by corporate
     * firewalls, by some ISPs, and by consumer antivirus mail shields — while
     * 587 with STARTTLS is the standard submission port and is usually allowed.
     *
     * This is not hypothetical: on 465 this host reached Gmail's AAAA record and
     * got ECONNREFUSED before TLS was attempted. On 587 it connects over IPv4
     * without needing an explicit address family.
     */
    transporter ??= nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user: env.MAIL_SENDER, pass: env.MAIL_PASSWORD },
    });
    return transporter;
};
/** Minimal HTML escape — verification codes are numeric, but names are not. */
const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
})[char] ?? char);
const verificationTemplate = (code) => `
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
export const sendVerificationCode = async (to, code) => {
    const client = getTransporter();
    if (!client) {
        logger.warn({ to }, "Mail is not configured (MAIL_SENDER / MAIL_PASSWORD missing); skipping send");
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
    }
    catch (error) {
        logger.error({ err: error, to }, "Failed to send verification email");
        return false;
    }
};
const ticketTemplate = (ticket) => `
  <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:480px">
    <h1 style="font-size:20px">Tazkarty — your ticket</h1>
    <p style="font-size:13px;color:#666">Reference</p>
    <p style="font-size:22px;font-weight:700;letter-spacing:2px;color:#1a66b9">
      ${escapeHtml(ticket.reference)}
    </p>
    <table style="border-collapse:collapse;font-size:14px">
      <tr><td style="padding:4px 16px 4px 0;color:#666">From</td><td><strong>${escapeHtml(ticket.from)}</strong></td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#666">To</td><td><strong>${escapeHtml(ticket.to)}</strong></td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#666">Date</td><td><strong>${escapeHtml(ticket.date)}</strong></td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#666">Bus</td><td><strong>${escapeHtml(ticket.busNumber)}</strong></td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#666">Seat</td><td><strong>${ticket.seatNumber}</strong></td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#666">Paid</td><td><strong>${ticket.priceEGP} EGP</strong></td></tr>
    </table>
    <p style="color:#666;font-size:13px">Show this reference when boarding.</p>
  </div>
`;
/**
 * Sent after a payment is captured. Like `sendVerificationCode` it reports
 * failure rather than throwing: a mail outage must never roll back a sale that
 * has already taken the customer's money.
 */
export const sendTicket = async (to, ticket) => {
    const client = getTransporter();
    if (!client) {
        logger.warn({ to }, "Mail is not configured; ticket email skipped");
        return false;
    }
    try {
        await client.sendMail({
            from: env.MAIL_SENDER,
            to,
            subject: `Tazkarty ticket ${ticket.reference}`,
            html: ticketTemplate(ticket),
        });
        logger.info({ to, reference: ticket.reference }, "Ticket email sent");
        return true;
    }
    catch (error) {
        logger.error({ err: error, to, reference: ticket.reference }, "Failed to send ticket email");
        return false;
    }
};
//# sourceMappingURL=mailer.js.map