import imaps from 'imap-simple';
import { simpleParser, ParsedMail } from 'mailparser';

export interface IMAPEmail {
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
  unread: boolean;
  attachments?: {
    filename: string;
    contentType: string;
    size: number;
  }[];
}

export interface IMAPConfig {
  host: string;
  port: number;
  tls: boolean;
  user: string;
  password: string;
}

export class IMAPService {
  private config: IMAPConfig;

  constructor() {
    this.config = {
      host: process.env.IMAP_HOST || 'mail.privateemail.com',
      port: parseInt(process.env.IMAP_PORT || '993'),
      tls: process.env.IMAP_SECURE !== 'false',
      user: process.env.IMAP_USER || process.env.SMTP_USER || '',
      password: process.env.IMAP_PASS || process.env.SMTP_PASS || '',
    };
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    let connection;
    try {
      connection = await imaps.connect({
        imap: this.config,
      });

      await connection.openBox('INBOX');

      return { success: true };
    } catch (error) {
      console.error('IMAP connection test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    } finally {
      if (connection) {
        try {
          connection.end();
        } catch (e) {
          console.error('Error closing IMAP connection:', e);
        }
      }
    }
  }

  async fetchEmails(options: {
    folder?: string;
    limit?: number;
    since?: Date;
    markAsRead?: boolean;
  } = {}): Promise<{ success: boolean; emails?: IMAPEmail[]; error?: string }> {
    const { folder = 'INBOX', limit = 50, since, markAsRead = false } = options;
    let connection;

    try {
      // Connect to IMAP server
      connection = await imaps.connect({
        imap: this.config,
      });

      // Open the specified folder
      await connection.openBox(folder);

      // Build search criteria
      let searchCriteria: string[] = ['ALL'];
      if (since) {
        searchCriteria = ['SINCE', since.toISOString().split('T')[0]];
      }

      // Search for messages
      const messages = await connection.search(searchCriteria, {
        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID IN-REPLY-TO REFERENCES)', 'TEXT'],
        markSeen: markAsRead,
        struct: true,
      });

      if (!messages || messages.length === 0) {
        return { success: true, emails: [] };
      }

      // Limit the number of messages to process
      const limitedMessages = messages.slice(-limit); // Get the most recent emails

      const emails: IMAPEmail[] = [];

      for (const message of limitedMessages) {
        try {
          // Extract header info
          const headerPart = message.parts?.find((part: any) =>
            part.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID IN-REPLY-TO REFERENCES)'
          );
          const textPart = message.parts?.find((part: any) => part.which === 'TEXT');

          // Parse header using simple parser if available
          let parsed: ParsedMail | null = null;
          if (headerPart?.body) {
            try {
              parsed = await simpleParser(headerPart.body);
            } catch (e) {
              console.log('Header parsing failed, extracting manually');
            }
          }

          // Fallback to manual header extraction
          const headerBodyString = headerPart?.body ?
            (Buffer.isBuffer(headerPart.body) ? headerPart.body.toString() :
             typeof headerPart.body === 'string' ? headerPart.body : String(headerPart.body)) : '';
          const textBodyString = textPart?.body ?
            (Buffer.isBuffer(textPart.body) ? textPart.body.toString() :
             typeof textPart.body === 'string' ? textPart.body : String(textPart.body)) : '';

          const fromMatch = typeof headerBodyString === 'string' ? headerBodyString.match(/From:\s*(.+)/i) : null;
          const toMatch = typeof headerBodyString === 'string' ? headerBodyString.match(/To:\s*(.+)/i) : null;
          const subjectMatch = typeof headerBodyString === 'string' ? headerBodyString.match(/Subject:\s*(.+)/i) : null;
          const dateMatch = typeof headerBodyString === 'string' ? headerBodyString.match(/Date:\s*(.+)/i) : null;
          const messageIdMatch = typeof headerBodyString === 'string' ? headerBodyString.match(/Message-ID:\s*(.+)/i) : null;

          const email: IMAPEmail = {
            id: message.attributes.uid.toString(),
            from: this.extractEmailAddress(parsed?.from ? this.getAddressString(parsed.from) : (fromMatch?.[1]?.trim() || 'Unknown')),
            to: this.extractEmailAddress(parsed?.to ? this.getAddressString(parsed.to) : (toMatch?.[1]?.trim() || 'Unknown')),
            subject: parsed?.subject || subjectMatch?.[1]?.trim() || 'No Subject',
            text: textBodyString || 'No content',
            html: '',
            date: parsed?.date || (dateMatch?.[1] ? new Date(dateMatch[1]) : new Date()),
            messageId: parsed?.messageId || messageIdMatch?.[1]?.trim() || '',
            inReplyTo: parsed?.inReplyTo || undefined,
            references: parsed?.references ? (Array.isArray(parsed.references) ? parsed.references : [parsed.references]) : [],
            unread: !message.attributes.flags.includes('\\Seen'),
            attachments: [],
          };

          emails.push(email);
        } catch (parseError) {
          console.error('Error parsing email:', parseError);
          // Continue with next email instead of failing completely
        }
      }

      return { success: true, emails: emails.reverse() }; // Most recent first
    } catch (error) {
      console.error('IMAP fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch emails',
      };
    } finally {
      if (connection) {
        try {
          connection.end();
        } catch (e) {
          console.error('Error closing IMAP connection:', e);
        }
      }
    }
  }

  async markAsRead(messageIds: string[], folder: string = 'INBOX'): Promise<{ success: boolean; error?: string }> {
    let connection;
    try {
      connection = await imaps.connect({
        imap: this.config,
      });

      await connection.openBox(folder);

      for (const messageId of messageIds) {
        await connection.addFlags(parseInt(messageId), '\\Seen');
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark as read',
      };
    } finally {
      if (connection) {
        try {
          connection.end();
        } catch (e) {
          console.error('Error closing IMAP connection:', e);
        }
      }
    }
  }

  async getFolders(): Promise<{ success: boolean; folders?: string[]; error?: string }> {
    let connection;
    try {
      connection = await imaps.connect({
        imap: this.config,
      });

      const boxes = await connection.getBoxes();
      const folders = this.extractFolderNames(boxes);

      return { success: true, folders };
    } catch (error) {
      console.error('Error fetching folders:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch folders',
      };
    } finally {
      if (connection) {
        try {
          connection.end();
        } catch (e) {
          console.error('Error closing IMAP connection:', e);
        }
      }
    }
  }

  private getAddressString(address: any): string {
    if (!address) return '';
    if (Array.isArray(address)) {
      return address.length > 0 ? address[0].text || `${address[0].name} <${address[0].address}>` : '';
    }
    return address.text || `${address.name} <${address.address}>`;
  }

  private extractEmailAddress(emailString: string): string {
    // Extract email from "Name <email@domain.com>" format
    const match = emailString.match(/<([^>]+)>/);
    return match ? match[1] : emailString.trim();
  }

  private extractFolderNames(boxes: any, prefix: string = ''): string[] {
    const folders: string[] = [];

    for (const [name, box] of Object.entries(boxes)) {
      const fullName = prefix ? `${prefix}/${name}` : name;
      folders.push(fullName);

      if (box && typeof box === 'object' && 'children' in box) {
        folders.push(...this.extractFolderNames((box as any).children, fullName));
      }
    }

    return folders;
  }

  getConfig() {
    return {
      host: this.config.host,
      port: this.config.port,
      tls: this.config.tls,
      user: this.config.user,
    };
  }
}

export const imapService = new IMAPService();