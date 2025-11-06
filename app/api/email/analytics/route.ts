import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Fetch all email sends for analytics
    const { data: emailSends, error: sendsError } = await supabase
      .from('email_sends')
      .select('*');

    if (sendsError) {
      console.error('Error fetching email sends:', sendsError);
      return NextResponse.json(
        { error: 'Failed to fetch email analytics', details: sendsError.message },
        { status: 500 }
      );
    }

    // Fetch all email logs for engagement tracking
    const { data: emailLogs, error: logsError } = await supabase
      .from('email_logs')
      .select('*');

    if (logsError) {
      console.error('Error fetching email logs:', logsError);
      return NextResponse.json(
        { error: 'Failed to fetch email logs', details: logsError.message },
        { status: 500 }
      );
    }

    // Calculate overall statistics
    const totalSent = emailSends?.length || 0;
    const totalOpened = emailLogs?.filter(log => log.opened_at).length || 0;
    const totalClicked = emailLogs?.filter(log => log.clicked_at).length || 0;
    const totalReplied = emailLogs?.filter(log => log.replied_at).length || 0;

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
    const replyRate = totalSent > 0 ? (totalReplied / totalSent) * 100 : 0;

    // Calculate stats by template
    const templateStats: Record<string, any> = {};

    emailSends?.forEach((send) => {
      const templateName = send.template_name || 'Unknown';
      if (!templateStats[templateName]) {
        templateStats[templateName] = {
          template_name: templateName,
          sent: 0,
          opened: 0,
          clicked: 0,
          replied: 0,
        };
      }
      templateStats[templateName].sent++;
    });

    // Add engagement stats from email_logs
    emailLogs?.forEach((log) => {
      const templateId = log.metadata?.template_id || log.template_id || 'Unknown';
      if (templateStats[templateId]) {
        if (log.opened_at) templateStats[templateId].opened++;
        if (log.clicked_at) templateStats[templateId].clicked++;
        if (log.replied_at) templateStats[templateId].replied++;
      }
    });

    // Calculate rates for each template
    const templateAnalytics = Object.values(templateStats).map((stats: any) => ({
      ...stats,
      open_rate: stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0,
      click_rate: stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0,
      reply_rate: stats.sent > 0 ? (stats.replied / stats.sent) * 100 : 0,
    }));

    // Calculate stats by template type (industry or category)
    const typeStats: Record<string, any> = {};

    emailSends?.forEach((send) => {
      const type = send.industry || 'general';
      if (!typeStats[type]) {
        typeStats[type] = {
          type,
          sent: 0,
          opened: 0,
          clicked: 0,
          replied: 0,
        };
      }
      typeStats[type].sent++;
    });

    // Add engagement stats by type
    emailLogs?.forEach((log) => {
      // Try to match with email_sends to get industry/type
      const matchingSend = emailSends?.find(send =>
        send.recipient_email === log.metadata?.toEmail
      );
      const type = matchingSend?.industry || 'general';

      if (typeStats[type]) {
        if (log.opened_at) typeStats[type].opened++;
        if (log.clicked_at) typeStats[type].clicked++;
        if (log.replied_at) typeStats[type].replied++;
      }
    });

    // Calculate rates for each type
    const typeAnalytics = Object.values(typeStats).map((stats: any) => ({
      ...stats,
      open_rate: stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0,
      click_rate: stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0,
      reply_rate: stats.sent > 0 ? (stats.replied / stats.sent) * 100 : 0,
    }));

    return NextResponse.json({
      success: true,
      overall: {
        total_sent: totalSent,
        total_opened: totalOpened,
        total_clicked: totalClicked,
        total_replied: totalReplied,
        open_rate: openRate,
        click_rate: clickRate,
        reply_rate: replyRate,
      },
      by_template: templateAnalytics,
      by_type: typeAnalytics,
      source: totalSent > 0 ? 'database' : 'empty',
    });
  } catch (error) {
    console.error('Error in email analytics endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
