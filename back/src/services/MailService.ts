import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class MailService {
  private transporter: Transporter;
  private mailSender: string;

  constructor() {
    this.mailSender = process.env.MailSender || '';
    const password = process.env.PASS || '';

    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: this.mailSender,
        pass: password,
      },
    });
  }

  async sendVerificationCode(recipient: string, verificationCode: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.mailSender,
        to: recipient,
        subject: 'tazkarty',
        html: this.generateEmailTemplate(verificationCode),
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  private generateEmailTemplate(verificationCode: string): string {
    return `
      <html>
        <head>
          <style>
            .num {
              color: blue;
              font-size: 20px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <h1>Welcome to our website!</h1>
          <h3>Hi there,</h3>
          <p>Thank you for using <strong><a href="https://bus-booking.vercel.app/">Tazkarty</a></strong></p>
          <p>Your Verify Code Is <strong class="num">${verificationCode}</strong></p>
          <p>If you have any questions or need any assistance,<br><br> please don't hesitate to contact us on <strong><a href="tel:01201453941" style="color: blue; text-decoration: none; font-size: 20px;">01201453941</a></strong></p>
          <strong>Best regards,</strong>
        </body>
      </html>
    `;
  }
}
