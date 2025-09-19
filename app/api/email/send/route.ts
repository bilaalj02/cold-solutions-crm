import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '../../../../lib/email-service';
import { SupabaseEmailManager } from '../../../../lib/supabase-email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, text, html, templateId, variables } = body;

    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject' },
        { status: 400 }
      );
    }

    // If templateId is provided, get template and replace variables
    let finalText = text;
    let finalHtml = html;
    let finalSubject = subject;

    if (templateId && variables) {
      const template = await SupabaseEmailManager.getTemplateById(templateId);

      if (template) {
        finalText = SupabaseEmailManager.replaceVariables(template.content, variables);
        finalHtml = SupabaseEmailManager.replaceVariables(template.content, variables)
          .replace(/\n/g, '<br>');
        finalSubject = SupabaseEmailManager.replaceVariables(template.subject, variables);
      }
    }

    const result = await emailService.sendEmail({
      to,
      subject: finalSubject,
      text: finalText,
      html: finalHtml,
    });

    // Log the email attempt
    try {
      await SupabaseEmailManager.logEmail({
        leadId: '', // This would come from lead context in real usage
        templateId: templateId || '',
        subject: finalSubject,
        status: result.success ? 'sent' : 'bounced',
        sentAt: new Date().toISOString(),
        errorMessage: result.success ? undefined : result.error,
        metadata: {
          fromEmail: process.env.SMTP_FROM_EMAIL || '',
          toEmail: to,
        }
      });

      // Update template stats if template was used
      if (templateId && result.success) {
        await SupabaseEmailManager.updateEmailStats(templateId, 'sent');
      }
    } catch (logError) {
      console.error('Failed to log email:', logError);
      // Don't fail the email send if logging fails
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}