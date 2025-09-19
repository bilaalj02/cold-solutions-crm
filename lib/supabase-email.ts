import { createClient } from '@supabase/supabase-js';
import { EmailTemplate, EmailCampaign, EmailSequence, EmailLog } from './email-system';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseEmailManager {
  // Template CRUD operations
  static async getTemplates(): Promise<EmailTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        return [];
      }

      return data?.map(this.mapSupabaseTemplate) || [];
    } catch (error) {
      console.error('Error in getTemplates:', error);
      return [];
    }
  }

  static async createTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<EmailTemplate | null> {
    try {
      const templateData = {
        name: template.name,
        subject: template.subject,
        content: template.content,
        type: template.type,
        lead_stage: template.leadStage,
        industry: template.industry,
        variables: template.variables,
        is_active: template.isActive,
        created_by: template.createdBy,
        stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
      };

      const { data, error } = await supabase
        .from('email_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) {
        console.error('Error creating template:', error);
        return null;
      }

      return this.mapSupabaseTemplate(data);
    } catch (error) {
      console.error('Error in createTemplate:', error);
      return null;
    }
  }

  static async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name) updateData.name = updates.name;
      if (updates.subject) updateData.subject = updates.subject;
      if (updates.content) updateData.content = updates.content;
      if (updates.type) updateData.type = updates.type;
      if (updates.leadStage !== undefined) updateData.lead_stage = updates.leadStage;
      if (updates.industry !== undefined) updateData.industry = updates.industry;
      if (updates.variables) updateData.variables = updates.variables;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { data, error } = await supabase
        .from('email_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating template:', error);
        return null;
      }

      return this.mapSupabaseTemplate(data);
    } catch (error) {
      console.error('Error in updateTemplate:', error);
      return null;
    }
  }

  static async deleteTemplate(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting template:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteTemplate:', error);
      return false;
    }
  }

  static async getTemplateById(id: string): Promise<EmailTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching template:', error);
        return null;
      }

      return this.mapSupabaseTemplate(data);
    } catch (error) {
      console.error('Error in getTemplateById:', error);
      return null;
    }
  }

  // Email Log operations
  static async logEmail(log: Omit<EmailLog, 'id'>): Promise<EmailLog | null> {
    try {
      const logData = {
        lead_id: log.leadId,
        campaign_id: log.campaignId,
        sequence_id: log.sequenceId,
        template_id: log.templateId,
        subject: log.subject,
        status: log.status,
        sent_at: log.sentAt,
        delivered_at: log.deliveredAt,
        opened_at: log.openedAt,
        clicked_at: log.clickedAt,
        replied_at: log.repliedAt,
        error_message: log.errorMessage,
        metadata: log.metadata
      };

      const { data, error } = await supabase
        .from('email_logs')
        .insert([logData])
        .select()
        .single();

      if (error) {
        console.error('Error logging email:', error);
        return null;
      }

      return this.mapSupabaseEmailLog(data);
    } catch (error) {
      console.error('Error in logEmail:', error);
      return null;
    }
  }

  static async updateEmailStats(templateId: string, action: 'sent' | 'opened' | 'clicked' | 'replied'): Promise<void> {
    try {
      const { data: template, error: fetchError } = await supabase
        .from('email_templates')
        .select('stats')
        .eq('id', templateId)
        .single();

      if (fetchError) {
        console.error('Error fetching template for stats update:', fetchError);
        return;
      }

      const currentStats = template.stats || { sent: 0, opened: 0, clicked: 0, replied: 0 };
      const newStats = {
        ...currentStats,
        [action]: currentStats[action] + 1
      };

      const { error: updateError } = await supabase
        .from('email_templates')
        .update({ stats: newStats })
        .eq('id', templateId);

      if (updateError) {
        console.error('Error updating template stats:', updateError);
      }
    } catch (error) {
      console.error('Error in updateEmailStats:', error);
    }
  }

  // Campaign operations
  static async getCampaigns(): Promise<EmailCampaign[]> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        return [];
      }

      return data?.map(this.mapSupabaseCampaign) || [];
    } catch (error) {
      console.error('Error in getCampaigns:', error);
      return [];
    }
  }

  // Utility functions for mapping Supabase data to our interfaces
  private static mapSupabaseTemplate(data: any): EmailTemplate {
    return {
      id: data.id,
      name: data.name,
      subject: data.subject,
      content: data.content,
      type: data.type,
      leadStage: data.lead_stage,
      industry: data.industry,
      variables: data.variables || [],
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      stats: data.stats || { sent: 0, opened: 0, clicked: 0, replied: 0 }
    };
  }

  private static mapSupabaseCampaign(data: any): EmailCampaign {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
      type: data.type,
      templateId: data.template_id,
      sequenceTemplates: data.sequence_templates,
      targetSegment: data.target_segment || {},
      schedule: data.schedule || {},
      settings: data.settings || {},
      stats: data.stats || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by
    };
  }

  private static mapSupabaseEmailLog(data: any): EmailLog {
    return {
      id: data.id,
      leadId: data.lead_id,
      campaignId: data.campaign_id,
      sequenceId: data.sequence_id,
      templateId: data.template_id,
      subject: data.subject,
      status: data.status,
      sentAt: data.sent_at,
      deliveredAt: data.delivered_at,
      openedAt: data.opened_at,
      clickedAt: data.clicked_at,
      repliedAt: data.replied_at,
      errorMessage: data.error_message,
      metadata: data.metadata || {}
    };
  }

  // Static methods for backward compatibility
  static replaceVariables(content: string, variables: Record<string, string>): string {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  }

  static getAvailableVariables(): string[] {
    return [
      'firstName', 'lastName', 'fullName', 'company', 'position', 'industry',
      'territory', 'email', 'phone', 'leadSource', 'leadStage', 'painPoint',
      'senderName', 'senderTitle', 'senderEmail', 'senderPhone',
      'caseStudyLink'
    ];
  }
}