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
        bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID IN-REPLY-TO REFERENCES)',
        markSeen: markAsRead,
        struct: true,
      });

      if (!messages || messages.length === 0) {
        return { success: true, emails: [] };
      }

      // Limit the number of messages to process
      const limitedMessages = messages.slice(-limit); // Get the most recent emails

      const emails: IMAPEmail[] = [];

      // Use a different approach to get full messages
      for (const message of limitedMessages) {
        try {
          // Get header first
          const headerPart = message.parts?.find((part: any) =>
            part.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID IN-REPLY-TO REFERENCES)'
          );

          // Try to get the message body more carefully
          let fullMessage: any;
          try {
            // Try to fetch the full RFC822 message
            fullMessage = await connection.getPartData(message, 'RFC822');
          } catch (rfcError) {
            try {
              // Fallback to TEXT part
              fullMessage = await connection.getPartData(message, 'TEXT');
            } catch (textError) {
              // Final fallback - use header only and create basic email
              console.log('Could not fetch message body, using header only');

              const headerString = headerPart?.body ?
                (Buffer.isBuffer(headerPart.body) ? headerPart.body.toString() : String(headerPart.body)) : '';

              // Enhanced header parsing with better regex patterns that handle folded headers
              const fromMatch = headerString.match(/From:\s*(.+?)(?:\r?\n(?![ \t])|$)/i);
              const toMatch = headerString.match(/To:\s*(.+?)(?:\r?\n(?![ \t])|$)/i);
              const subjectMatch = headerString.match(/Subject:\s*(.+?)(?:\r?\n(?![ \t])|$)/i);
              const dateMatch = headerString.match(/Date:\s*(.+?)(?:\r?\n(?![ \t])|$)/i);
              const messageIdMatch = headerString.match(/Message-ID:\s*(.+?)(?:\r?\n(?![ \t])|$)/i);

              // Clean and decode the extracted values with better handling
              let cleanFrom = fromMatch?.[1]?.replace(/\r?\n\s+/g, ' ').trim() || 'Unknown Sender';
              let cleanTo = toMatch?.[1]?.replace(/\r?\n\s+/g, ' ').trim() || 'Unknown Recipient';
              let cleanSubject = subjectMatch?.[1]?.replace(/\r?\n\s+/g, ' ').trim() || 'No Subject';
              const cleanDate = dateMatch?.[1]?.replace(/\r?\n\s+/g, ' ').trim() || new Date().toISOString();
              const cleanMessageId = messageIdMatch?.[1]?.replace(/\r?\n\s+/g, ' ').trim() || '';

              // Decode MIME encoded words (RFC 2047)
              cleanFrom = this.decodeMimeWords(cleanFrom);
              cleanTo = this.decodeMimeWords(cleanTo);
              cleanSubject = this.decodeMimeWords(cleanSubject);

              console.log('Raw header string sample:', headerString.substring(0, 500));
              console.log('Parsed header info:', {
                from: cleanFrom,
                subject: cleanSubject,
                date: cleanDate,
                rawFrom: fromMatch?.[1],
                rawSubject: subjectMatch?.[1]
              });

              const email: IMAPEmail = {
                id: message.attributes.uid.toString(),
                from: this.formatSenderName(cleanFrom),
                to: this.extractEmailAddress(cleanTo),
                subject: cleanSubject,
                text: 'Message content could not be retrieved from this email server',
                html: '',
                date: new Date(cleanDate),
                messageId: cleanMessageId,
                unread: !message.attributes.flags.includes('\\Seen'),
                attachments: [],
              };

              emails.push(email);
              continue;
            }
          }

          // Parse the message
          const parsed: ParsedMail = await simpleParser(fullMessage);

          // Extract clean text content
          let cleanText = '';
          if (parsed.text) {
            cleanText = this.cleanEmailText(parsed.text);
          } else if (parsed.html) {
            cleanText = this.cleanEmailText(parsed.html.replace(/<[^>]*>/g, ''));
          }

          if (!cleanText) {
            cleanText = 'Email content could not be parsed';
          }

          const email: IMAPEmail = {
            id: message.attributes.uid.toString(),
            from: this.extractEmailAddress(this.getAddressString(parsed.from) || 'Unknown'),
            to: this.extractEmailAddress(this.getAddressString(parsed.to) || 'Unknown'),
            subject: parsed.subject || 'No Subject',
            text: cleanText,
            html: parsed.html || '',
            date: parsed.date || new Date(),
            messageId: parsed.messageId || '',
            inReplyTo: parsed.inReplyTo || undefined,
            references: Array.isArray(parsed.references) ? parsed.references : (parsed.references ? [parsed.references] : []),
            unread: !message.attributes.flags.includes('\\Seen'),
            attachments: parsed.attachments?.map(att => ({
              filename: att.filename || 'unnamed',
              contentType: att.contentType || 'application/octet-stream',
              size: att.size || 0,
            })) || [],
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

  private cleanEmailText(text: string): string {
    if (!text) return '';

    return text
      // Remove quoted-printable encoding artifacts
      .replace(/=\r?\n/g, '') // Remove soft line breaks
      .replace(/=([0-9A-F]{2})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16))) // Decode =XX sequences
      .replace(/=20/g, ' ') // Replace =20 with space
      .replace(/=3D/g, '=') // Replace =3D with =
      .replace(/=A0/g, ' ') // Replace =A0 with space
      // Remove HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Clean up whitespace and formatting
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n\n') // Clean up multiple empty lines
      .trim();
  }

  private getAddressString(address: any): string {
    if (!address) return '';
    if (Array.isArray(address)) {
      return address.length > 0 ? address[0].text || `${address[0].name} <${address[0].address}>` : '';
    }
    return address.text || `${address.name} <${address.address}>`;
  }

  private extractEmailAddress(emailString: string): string {
    if (!emailString) return '';

    // Extract email from "Name <email@domain.com>" format
    const bracketMatch = emailString.match(/<([^>]+)>/);
    if (bracketMatch) {
      return bracketMatch[1].trim();
    }

    // If no brackets, check if it's just an email address
    const emailMatch = emailString.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      return emailMatch[1];
    }

    // Return the original string if no email pattern found
    return emailString.trim();
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

  private decodeMimeWords(str: string): string {
    if (!str) return str;

    // Decode RFC 2047 MIME encoded words: =?charset?encoding?encoded_text?=
    return str.replace(/=\?([^?]+)\?([BQbq])\?([^?]*)\?=/g, (match, charset, encoding, encodedText) => {
      try {
        if (encoding.toUpperCase() === 'B') {
          // Base64 encoding
          return Buffer.from(encodedText, 'base64').toString('utf8');
        } else if (encoding.toUpperCase() === 'Q') {
          // Quoted-printable encoding
          const decoded = encodedText
            .replace(/_/g, ' ')
            .replace(/=([0-9A-F]{2})/g, (match: string, hex: string) => String.fromCharCode(parseInt(hex, 16)));
          return decoded;
        }
      } catch (error) {
        console.log('Error decoding MIME word:', error);
      }
      return match; // Return original if decoding fails
    });
  }

  private formatSenderName(fromField: string): string {
    if (!fromField) return 'Unknown Sender';

    // Check if it's in "Name <email@domain.com>" format
    const nameEmailMatch = fromField.match(/^(.+?)\s*<([^>]+)>$/);
    if (nameEmailMatch) {
      const name = nameEmailMatch[1].trim().replace(/^["']|["']$/g, ''); // Remove quotes
      const email = nameEmailMatch[2].trim();
      return name || email; // Return name if available, otherwise email
    }

    // Check if it's just an email address
    const emailMatch = fromField.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      return emailMatch[1];
    }

    // Return as-is if no pattern matches
    return fromField.trim();
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