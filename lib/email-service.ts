import nodemailer from 'nodemailer';

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  date: Date;
  messageId: string;
  inReplyTo?: string;
  references?: string[];
  attachments?: {
    filename: string;
    contentType: string;
    size: number;
    content: Buffer;
  }[];
}

export interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  imap: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  fromName: string;
  fromEmail: string;
}

export class EmailService {
  private config: EmailConfig;
  private transporter: nodemailer.Transporter;

  constructor() {
    this.config = {
      smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      },
      imap: {
        host: process.env.IMAP_HOST || 'imap.gmail.com',
        port: parseInt(process.env.IMAP_PORT || '993'),
        secure: process.env.IMAP_SECURE === 'true',
        auth: {
          user: process.env.IMAP_USER || '',
          pass: process.env.IMAP_PASS || '',
        },
      },
      fromName: process.env.SMTP_FROM_NAME || 'Cold Solutions',
      fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || '',
    };

    this.transporter = nodemailer.createTransport({
      host: this.config.smtp.host,
      port: this.config.smtp.port,
      secure: this.config.smtp.secure,
      auth: this.config.smtp.auth,
    });
  }

  async sendEmail(options: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    replyTo?: string;
    inReplyTo?: string;
    references?: string[];
    attachments?: {
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }[];
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const mailOptions = {
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo || this.config.fromEmail,
        inReplyTo: options.inReplyTo,
        references: options.references,
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.transporter.verify();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // Note: IMAP functionality requires server-side implementation
  // This would need to be implemented as API routes due to Node.js dependencies

  getConfig() {
    return {
      smtp: {
        host: this.config.smtp.host,
        port: this.config.smtp.port,
        secure: this.config.smtp.secure,
        user: this.config.smtp.auth.user,
      },
      fromName: this.config.fromName,
      fromEmail: this.config.fromEmail,
    };
  }
}

export const emailService = new EmailService();