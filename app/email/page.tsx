'use client'

import React, { useState, useEffect } from "react";
import { EmailTemplate, EmailCampaign, EmailSequence } from "../../lib/email-system";
import { SupabaseEmailManager } from "../../lib/supabase-email";
import TemplateModal from "../../components/TemplateModal";
import SequenceModal from "../../components/SequenceModal";

export default function EmailManagementPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns' | 'sequences' | 'analytics'>('templates');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showSequenceModal, setShowSequenceModal] = useState(false);
  const [editingSequence, setEditingSequence] = useState<EmailSequence | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templatesData, campaignsData, sequencesData] = await Promise.all([
        SupabaseEmailManager.getTemplates(),
        SupabaseEmailManager.getCampaigns(),
        SupabaseEmailManager.getSequences()
      ]);

      setTemplates(templatesData);
      setCampaigns(campaignsData);
      setSequences(sequencesData);
    } catch (error) {
      console.error('Error loading email data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'welcome': return 'bg-blue-100 text-blue-800';
      case 'follow-up': return 'bg-orange-100 text-orange-800';
      case 'nurture': return 'bg-green-100 text-green-800';
      case 'proposal': return 'bg-purple-100 text-purple-800';
      case 'closing': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateOpenRate = (opened: number, sent: number) => {
    return sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0.0';
  };

  const calculateClickRate = (clicked: number, sent: number) => {
    return sent > 0 ? ((clicked / sent) * 100).toFixed(1) : '0.0';
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowTemplateModal(true);
  };

  const handleCreateCampaign = () => {
    setShowCampaignModal(true);
  };

  const handleCreateSequence = () => {
    setEditingSequence(null);
    setShowSequenceModal(true);
  };

  const handleEditSequence = (sequence: EmailSequence) => {
    setEditingSequence(sequence);
    setShowSequenceModal(true);
  };

  const handleSaveSequence = async (sequenceData: any) => {
    try {
      if (editingSequence) {
        // Update existing sequence
        const updatedSequence = await SupabaseEmailManager.updateSequence(editingSequence.id, sequenceData);
        if (updatedSequence) {
          await loadData();
        } else {
          alert('Failed to update sequence');
        }
      } else {
        // Create new sequence
        const newSequence = await SupabaseEmailManager.createSequence(sequenceData);
        if (newSequence) {
          await loadData();
        } else {
          alert('Failed to create sequence');
        }
      }
      setShowSequenceModal(false);
      setEditingSequence(null);
    } catch (error) {
      console.error('Error saving sequence:', error);
      alert('Error saving sequence');
    }
  };

  const handleDeleteSequence = async (sequenceId: string) => {
    if (!confirm('Are you sure you want to delete this sequence? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await SupabaseEmailManager.deleteSequence(sequenceId);
      if (success) {
        await loadData();
      } else {
        alert('Failed to delete sequence');
      }
    } catch (error) {
      console.error('Error deleting sequence:', error);
      alert('Error deleting sequence');
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setShowDeleteConfirm(templateId);
  };

  const confirmDeleteTemplate = async (templateId: string) => {
    try {
      const success = await SupabaseEmailManager.deleteTemplate(templateId);
      if (success) {
        await loadData(); // Reload data from database
      } else {
        alert('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template');
    }
    setShowDeleteConfirm(null);
  };

  const handleSaveTemplate = async (templateData: any) => {
    try {
      if (editingTemplate) {
        // Update existing template
        const updatedTemplate = await SupabaseEmailManager.updateTemplate(editingTemplate.id, templateData);
        if (updatedTemplate) {
          await loadData(); // Reload data from database
        } else {
          alert('Failed to update template');
        }
      } else {
        // Create new template
        const newTemplate = await SupabaseEmailManager.createTemplate(templateData);
        if (newTemplate) {
          await loadData(); // Reload data from database
        } else {
          alert('Failed to create template');
        }
      }
      setShowTemplateModal(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    }
  };

  const handleImportMCPSequences = async () => {
    if (!confirm('This will import 3 follow-up sequences (HVAC, Plumbing, General) from the MCP server. Each sequence has 4 steps. Continue?')) {
      return;
    }

    try {
      // First, get all templates to find the IDs we need
      const allTemplates = await SupabaseEmailManager.getTemplates();

      // Define the MCP follow-up sequences
      const mcpSequences = [
        {
          name: "HVAC Follow-up Sequence (Interested/More Info)",
          description: "Automated 4-email sequence for HVAC leads who are interested or requested more info. Sends emails on Day 2, 6, 10, and 17.",
          trigger: 'manual' as const,
          triggerConditions: { industry: 'hvac', outcomes: ['interested', 'more_info'] },
          isActive: true,
          steps: [
            {
              id: `step-${Date.now()}-1`,
              order: 1,
              templateId: 'hvac-day2',
              delay: { value: 2, unit: 'days' as const },
              stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
            },
            {
              id: `step-${Date.now()}-2`,
              order: 2,
              templateId: 'hvac-day6',
              delay: { value: 4, unit: 'days' as const },
              stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
            },
            {
              id: `step-${Date.now()}-3`,
              order: 3,
              templateId: 'hvac-day10',
              delay: { value: 4, unit: 'days' as const },
              stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
            },
            {
              id: `step-${Date.now()}-4`,
              order: 4,
              templateId: 'hvac-day17',
              delay: { value: 7, unit: 'days' as const },
              stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
            }
          ]
        },
        {
          name: "Plumbing Follow-up Sequence (Interested/More Info)",
          description: "Automated 4-email sequence for Plumbing leads who are interested or requested more info. Sends emails on Day 2, 6, 10, and 17.",
          trigger: 'manual' as const,
          triggerConditions: { industry: 'plumbing', outcomes: ['interested', 'more_info'] },
          isActive: true,
          steps: [
            {
              id: `step-${Date.now()}-5`,
              order: 1,
              templateId: 'plumbing-day2',
              delay: { value: 2, unit: 'days' as const },
              stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
            },
            {
              id: `step-${Date.now()}-6`,
              order: 2,
              templateId: 'plumbing-day6',
              delay: { value: 4, unit: 'days' as const },
              stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
            },
            {
              id: `step-${Date.now()}-7`,
              order: 3,
              templateId: 'plumbing-day10',
              delay: { value: 4, unit: 'days' as const },
              stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
            },
            {
              id: `step-${Date.now()}-8`,
              order: 4,
              templateId: 'plumbing-day17',
              delay: { value: 7, unit: 'days' as const },
              stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
            }
          ]
        },
        {
          name: "General Home Service Follow-up Sequence (Interested/More Info)",
          description: "Automated 4-email sequence for general home service leads who are interested or requested more info. Sends emails on Day 2, 6, 10, and 17.",
          trigger: 'manual' as const,
          triggerConditions: { industry: 'general', outcomes: ['interested', 'more_info'] },
          isActive: true,
          steps: [
            {
              id: `step-${Date.now()}-9`,
              order: 1,
              templateId: 'general-day2',
              delay: { value: 2, unit: 'days' as const },
              stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
            },
            {
              id: `step-${Date.now()}-10`,
              order: 2,
              templateId: 'general-day6',
              delay: { value: 4, unit: 'days' as const },
              stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
            },
            {
              id: `step-${Date.now()}-11`,
              order: 3,
              templateId: 'general-day10',
              delay: { value: 4, unit: 'days' as const },
              stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
            },
            {
              id: `step-${Date.now()}-12`,
              order: 4,
              templateId: 'general-day17',
              delay: { value: 7, unit: 'days' as const },
              stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
            }
          ]
        }
      ];

      let imported = 0;
      let skipped = 0;

      for (const mcpSequence of mcpSequences) {
        // Check if sequence already exists
        const exists = sequences.some(s => s.name === mcpSequence.name);
        if (exists) {
          skipped++;
          continue;
        }

        const newSequence = await SupabaseEmailManager.createSequence(mcpSequence);
        if (newSequence) {
          imported++;
        }
      }

      await loadData();
      alert(`Import complete!\nImported: ${imported} sequences\nSkipped (already exist): ${skipped} sequences\n\nNote: These sequences reference template IDs that need to match your email templates.`);
    } catch (error) {
      console.error('Error importing MCP sequences:', error);
      alert('Error importing sequences');
    }
  };

  const handleImportMCPTemplates = async () => {
    if (!confirm('This will import ALL 11 email templates from the MCP server. Continue?')) {
      return;
    }

    try {
      // ALL MCP templates from cold-solutions-mcp-server/email-templates.json
      const mcpTemplates: Array<Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'stats'>> = [
        {
          name: "Follow-up: Lead Interested",
          subject: "Great speaking with you!",
          content: "Hi {{name}},\n\nGreat speaking with you! Here's some more information on our key services:\n\nAI Voice Agent – Handles calls 24/7, including after hours, books consultations, answers FAQs, and instantly follows up with new leads. It can even handle up to 20 calls at once, so you never miss an opportunity.\n\nAI Chatbot – Engages website visitors in real time, books appointments, provides quotes, and captures leads directly from your site or social media.\n\nAI Lead Gen – Contacts leads the moment they come in from ads or web forms, reducing response time and improving conversion rates.\n\nFree AI Audit – We'll review your current process, highlight missed opportunities, and show exactly where AI can help increase revenue and client retention.\n\nTo see it in action, you can call our AI Receptionist at this number: [+1(778)401-8733] to hear how it answers questions and explains our services. You can also request a brief AI Audit on that call — our AI Virtual Assistant will then call you back at the time you choose.\n\nWould you like me to send over more info on how we could tailor these solutions for your business, or set you up with a quick demo?\n\nBest,\nPaul-Elvis Roberts\ncontact@coldsolutions.ca\nWebsite: coldsolutions.ca",
          type: "follow-up" as const,
          leadStage: "interested",
          industry: "",
          isActive: true,
          variables: ["name", "company"],
          createdBy: "system"
        },
        {
          name: "Follow-up: Lead Interested (Alternative)",
          subject: "Quick next step for {{company_name||your business}}",
          content: "Hi {{contact_first_name||there}},\n\nGreat speaking with you — glad {{company_name||your business}} is interested.\n\nHere's a quick overview of what we can set up for you:\n\nAI Receptionist: Handles up to 20 calls at the same time, available 24/7. It answers calls, books appointments, routes inquiries, and ensures no missed opportunities.\n\nSmart Website Chatbot: Qualifies leads, answers FAQs in real-time, and automatically pushes data to your CRM.\n\nIntegrations: Works seamlessly with Notion, Make, Google Workspace, and virtually any CRM — plus other custom integrations as needed.\n\nMarketing Add-On: We can launch a lightweight offer page and starter ads to feed the pipeline while the agent/chatbot converts.\n\nIf you're free, grab a time that works best here: {{booking_link||https://calendly.com/contact-coldsolutions/30min}}\n\nPrefer to reply with a couple times instead? Just hit reply and I'll lock it in with the next best availability. If you'd like to try our Voice Agent now, just call {{phone_number||+1(778)401-8733}}.\n\n—\nPaul-Elvis\nCo-Founder, Cold Solutions\ncontact@coldsolutions.ca\n · +1 647-522-0280 | +1 707-805-1915\n{{website_url||coldsolutions.ca}}",
          type: "follow-up" as const,
          leadStage: "interested",
          industry: "",
          isActive: true,
          variables: ["contact_first_name", "company_name", "booking_link", "phone_number", "website_url"],
          createdBy: "system"
        },
        {
          name: "Follow-up: Lead Interested (V3 - Simple & Direct)",
          subject: "Great talking with you!",
          content: "Hi {{contact_first_name||there}},\n\nGreat talking with you! Here's what we do:\n\nAI Voice Agent – Like having a receptionist who never sleeps. Answers calls 24/7 (even at 2 AM), books appointments, and handles 20 calls at once. You'll never miss another job.\n\nAI Chatbot – Lives on your website and chats with visitors while you're on a job. Books appointments and catches leads before they go to your competitors.\n\nAI Lead Gen – Contacts new leads the second they come in. Fast response = more jobs booked.\n\nFree AI Audit – We'll show you exactly where you're losing money or missing opportunities. No charge.\n\nWant to hear it yourself?\n📞 Call our AI Receptionist: {{phone_number||+1(778)401-8733}}\nAsk it anything about our services or request a free audit. It'll schedule a callback whenever works for you.\n\nShould I send more details or set up a quick demo?\n\nTalk soon,\nPaul-Elvis Roberts\n📧 contact@coldsolutions.ca\n🌐 coldsolutions.ca",
          type: "follow-up" as const,
          leadStage: "interested",
          industry: "",
          isActive: true,
          variables: ["contact_first_name", "phone_number"],
          createdBy: "system"
        },
        {
          name: "Follow-up: Demo Booked (Alternative)",
          subject: "You're Demo - What to expect in our demo for {{company_name||your business}}",
          content: "Hi {{contact_first_name||there}},\n\nGreat—your demo is booked. A confirmation email from Calendly will arrive shortly with your meeting link and reschedule options.\n\nWhat to expect (15–30 mins):\nBrief goals check for {{company_name||your business}} (2–3 mins)\nLive walk-through of the AI Voice Agent and Website Chatbot\nHow routing, booking, and CRM sync work ({{crm_name||your CRM}})\nOptional marketing starter plan (landing page + ads)\nQ&A and next steps\n\nTry it before we meet: call our live demo voice agent (answers on behalf of Cold Solutions) at {{ai_voice_demo_number||+1(778)401-8733}}.\n\nYou can even book a free AI audit on that call—just ask the agent.\n\nIf you need to adjust your time, use Calendly's link in the confirmation or reply here.\n\nBest regards,\nPaul-Elvis\nCo-Founder, Cold Solutions\ncontact@coldsolutions.ca • +1 647-522-0280 | +1 707-805-1915\n{{website_url||coldsolutions.ca}}",
          type: "follow-up" as const,
          leadStage: "demo_booked",
          industry: "",
          isActive: true,
          variables: ["contact_first_name", "company_name", "crm_name", "ai_voice_demo_number", "website_url"],
          createdBy: "system"
        },
        {
          name: "Follow-up: Requested More Info (Alternative)",
          subject: "More info on how we can help {{company_name||your business}} grow",
          content: "Hi {{contact_first_name||there}},\n\nThanks for requesting more information — here's a breakdown of our key services and how they can support {{company_name||your business}}:\n\nAI Receptionist\n\nHandles up to 20 calls at the same time, available 24/7\n\nBooks appointments, routes calls, captures missed calls, and ensures no opportunity is lost\n\nCan provide instant responses so your team can focus on higher-value work\n\nSmart Website Chatbot\n\nEngages visitors in real time, answers FAQs, and qualifies leads\n\nPushes data automatically into your CRM for smooth follow-up\n\nIncreases lead capture rates and reduces drop-offs\n\nIntegrations\n\nCan be integrated with any CRM\n\nCustom integrations available to fit your existing tools and workflows\n\nMarketing Add-On\n\nLaunch a lightweight offer page and starter ad campaigns\n\nCreates a steady stream of inbound leads while the AI Receptionist and Chatbot handle conversion\n\nIf you'd like to see these in action, you can:\n\nBook a time here: {{booking_link||https://calendly.com/contact-coldsolutions/30min}}\n\nTry our AI Receptionist live: just call {{phone_number||+1(778)401-8733}}\n\nLooking forward to showing you how these solutions can support {{company_name||your business}}'s growth.\n\n—\nPaul-Elvis\nCo-Founder, Cold Solutions\ncontact@coldsolutions.ca\n · +1 647-522-0280 | +1 707-805-1915\n{{website_url||coldsolutions.ca}}",
          type: "follow-up" as const,
          leadStage: "more_info",
          industry: "",
          isActive: true,
          variables: ["contact_first_name", "company_name", "booking_link", "phone_number", "website_url"],
          createdBy: "system"
        },
        {
          name: "Follow-up: Demo Booked (Custom Industry-Specific)",
          subject: "Your demo is confirmed for {{demo_date||soon}} at {{demo_time||the scheduled time}}",
          content: "Hi {{contact_first_name||there}},\n\nGreat speaking with you today! We appreciate you scheduling a demo with us on {{demo_date||soon}}, at {{demo_time||the scheduled time}}. You'll receive a Zoom link from Calendly shortly.\n\nWe'll build a custom demo for {{company_name||your business}} so you can see exactly how our AI can:\n\n✅ Answer & book {{industry_service_type||service}} inquiries 24/7 without hiring extra staff.\n✅ Streamline scheduling for {{scheduling_types||appointments and consultations}}\n✅ Capture every lead from calls, website visits, and social media without extra staff\n✅ Use chatbots on your website to provide instant answers on services, pricing ranges, and common {{industry_type||business}} questions\n\nThis way, you'll see firsthand how AI can help you win more {{industry_type||business}} jobs, save valuable time, and keep operations running smoothly.\n\nIn the meantime, feel free to call our AI Receptionist at {{ai_demo_phone||+1(778)401-8733}} to hear how it answers questions and provides more information about our services.\n\nSee you then!\n—\nPaul-Elvis Roberts\nCold Solutions\n📧 contact@coldsolutions.ca\n🌐 coldsolutions.ca",
          type: "follow-up" as const,
          leadStage: "demo_booked",
          industry: "custom",
          isActive: true,
          variables: ["contact_first_name", "company_name", "demo_date", "demo_time", "industry_service_type", "scheduling_types", "industry_type", "ai_demo_phone"],
          createdBy: "system"
        },
        {
          name: "Team Notification",
          subject: "🚨 {{notification_type}} - {{lead_name}}",
          content: "**{{notification_type}}**\n\n**Lead Details:**\n• Name: {{lead_name}}\n• Email: {{lead_email}}\n• Company: {{lead_company}}\n• Status: {{lead_status}}\n• Source: {{lead_source}}\n\n**Action Required:**\n{{action_required}}\n\n**Lead Notes:**\n{{lead_notes}}\n\n---\nView in CRM: {{crm_link}}\nCreated: {{created_date}}",
          type: "custom" as const,
          leadStage: "",
          industry: "",
          isActive: true,
          variables: ["notification_type", "lead_name", "lead_email", "lead_company", "lead_status", "lead_source", "action_required", "lead_notes", "crm_link", "created_date"],
          createdBy: "system"
        },
        {
          name: "Follow-up: Construction Lead Interested",
          subject: "Great speaking with you - Construction AI Solutions",
          content: "Hi {{contact_first_name||there}},\n\nGreat speaking with you today - I could tell you understand how costly missed calls and slow follow-up are in construction.\n\n**The Missed Calls That Add Up:**\n• **Missed Calls = Lost Jobs**: 79% of construction leads call a competitor within 5 minutes if you don't answer\n• **Speed to Lead Crisis**: The first contractor to respond wins 87% of projects\n• **After-Hours Losses**: Weekend/evening calls often go straight to voicemail while competitors capture them\n\n**Our Complete AI Solution:**\n🤖 **AI Voice Agent** - Answers every call instantly, even when you're on job sites. Qualifies leads, schedules estimates, handles emergencies 24/7.\n\n💬 **AI Website Chatbot** - Captures leads browsing your website after-hours. Provides instant quotes for common projects, books estimates automatically.\n\n🔧 **Full AI Infrastructure** - Connects everything: your CRM, scheduling system, and marketing. Creates one seamless operation that works while you focus on building.\n\n**Real Result**: One Construction company we worked with in Sacramento California went from missing 23 calls weekly to capturing 97% of all inquiries. Added $270K in booked projects their first year with our system.\n\nReady to stop losing jobs to missed calls? Let's schedule a 15-minute demo: {{booking_link||https://calendly.com/contact-coldsolutions/30min}}\n\nOr call our AI system right now to experience it: {{phone_number||(778) 401-8733}}\n\n— Paul-Elvis Roberts\nCold Solutions\n📧 contact@coldsolutions.ca\n🌐 coldsolutions.ca\n📞 +1(778)401-8733\n\nP.S. Want to see exactly how much revenue you're losing to missed calls? I can run a free analysis - just reply with your monthly call volume.",
          type: "follow-up" as const,
          leadStage: "interested",
          industry: "construction",
          isActive: true,
          variables: ["contact_first_name", "company_name", "booking_link", "phone_number"],
          createdBy: "system"
        },
        {
          name: "Follow-up: Construction Lead Requested More Info",
          subject: "Construction AI Solutions - More Information",
          content: "Hi {{contact_first_name||there}},\n\nGreat speaking with you today - I could tell you understand how costly missed calls and slow follow-up are in construction.\n\n**The Pain Points You're Facing:**\n• **Missed Calls = Lost Jobs**: 79% of construction leads call a competitor within 5 minutes if you don't answer\n• **Speed to Lead Crisis**: The first contractor to respond wins 87% of projects\n• **After-Hours Losses**: Weekend/evening calls often go straight to voicemail while competitors capture them\n\n**Our Complete AI Solution:**\n🤖 **AI Voice Agent** - Answers every call instantly, even when you're on job sites. Qualifies leads, schedules estimates, handles emergencies 24/7.\n\n💬 **AI Website Chatbot** - Captures leads browsing your website after-hours. Provides instant quotes for common projects, books estimates automatically.\n\n🔧 **Full AI Infrastructure** - Connects everything: your CRM, scheduling system, and marketing. Creates one seamless operation that works while you focus on building.\n\n**Real Result**: One Construction company we worked with in Sacramento California went from missing 23 calls weekly to capturing 97% of all inquiries. Added $270K in booked projects their first year with our system.\n\nReady to stop losing jobs to missed calls? Let's schedule a 15-minute demo: {{booking_link||https://calendly.com/contact-coldsolutions/30min}}\n\nOr call our AI system right now to experience it: {{phone_number||(778) 401-8733}}\n\n— Paul-Elvis Roberts\nCold Solutions\n📧 contact@coldsolutions.ca\n🌐 coldsolutions.ca\n📞 +1(778)401-8733\n\nP.S. Want to see exactly how much revenue you're losing to missed calls? I can run a free analysis - just reply with your monthly call volume.",
          type: "follow-up" as const,
          leadStage: "more_info",
          industry: "construction",
          isActive: true,
          variables: ["contact_first_name", "company_name", "booking_link", "phone_number"],
          createdBy: "system"
        },
        {
          name: "Follow-up: Home Service/HVAC Lead Interested",
          subject: "Great talking with you!",
          content: "Hi {{contact_first_name}},\n\nThanks for your interest earlier - I know how costly it can be when emergency service calls go unanswered.\n\nHome service businesses lose 67% of after-hours calls to competitors who answer first. That's $8,000+ in monthly revenue walking away.\n\n**Our Solution**:\n✅ **24/7 Emergency Dispatch** - Our AI Receptionist captures urgent HVAC, plumbing & electrical calls instantly\n✅ **Automatic Scheduling** - books routine maintenance directly into your calendar\n✅ **Lead Qualification** - knows the difference between emergencies and estimates\n✅ **Multi-Trade Handling** - routes calls to the right technician automatically\n\n**Real Example**: Alpha Heating & Air Conditioning was missing 13 emergency calls weekly. Our AI system helped them capture those calls, adding $47K in additional revenue over 6 months - all from calls they were previously losing.\n\nReady to stop losing service calls? Book a quick demo here: https://calendly.com/contact-coldsolutions/30min\n\nOr test our AI system right now - call (778) 401-8733 to hear how it handles service inquiries.\n\n— Paul-Elvis Roberts\nCold Solutions\n📧 contact@coldsolutions.ca\n🌐 coldsolutions.ca\n📞 +1(778)401-8733",
          type: "follow-up" as const,
          leadStage: "interested",
          industry: "hvac",
          isActive: true,
          variables: ["contact_first_name", "company_name", "booking_link", "phone_number"],
          createdBy: "system"
        },
        {
          name: "Follow-up: Home Service/HVAC Lead Requested More Info",
          subject: "quick question about your calls",
          content: "Hi {{contact_first_name||there}},\n\nGreat speaking with you — glad your home service business is interested in capturing more calls and revenue.\n\nWe've helped home service businesses all over North America set up automation that makes sure no lead gets missed, while also saving time and boosting revenue..\n\n**Here's what we can set up for you:**\n\n**AI Receptionist**: Handles emergency calls 24/7, dispatches techs automatically, books service appointments even when you're on jobs. Never miss another $500+ emergency call.\n\n**Smart Website Chatbot**: Captures leads browsing after-hours, provides instant quotes for HVAC/plumbing repairs, automatically pushes qualified leads to your CRM.\n\n**Complete Integration**: Works seamlessly with ServiceTitan, Jobber, Housecall Pro, or any system you're using — plus custom integrations as needed.\n\n**Marketing Add-On**: We can launch targeted ads for emergency services while your AI handles the influx of calls and converts them to booked jobs.\n\n**Guarantee**: If our system doesn't help you capture significantly more calls and revenue within 60 days, you don't pay.\n\nIf you're free, grab a time here: {{booking_link||https://calendly.com/contact-coldsolutions/30min}}\n\nPrefer to reply with a couple times instead? Just hit reply and I'll lock it in. Want to try our AI Receptionist right now? Call {{phone_number||(778) 401-8733}}.\n\n— Paul-Elvis Roberts\nCold Solutions\n📧 contact@coldsolutions.ca\n🌐 coldsolutions.ca",
          type: "follow-up" as const,
          leadStage: "more_info",
          industry: "hvac",
          isActive: true,
          variables: ["contact_first_name", "company_name", "booking_link", "phone_number"],
          createdBy: "system"
        }
      ];

      let imported = 0;
      let skipped = 0;

      for (const mcpTemplate of mcpTemplates) {
        // Check if template already exists
        const exists = templates.some(t => t.name === mcpTemplate.name);
        if (exists) {
          skipped++;
          continue;
        }

        const newTemplate = await SupabaseEmailManager.createTemplate(mcpTemplate);
        if (newTemplate) {
          imported++;
        }
      }

      await loadData();
      alert(`Import complete!\nImported: ${imported} templates\nSkipped (already exist): ${skipped} templates`);
    } catch (error) {
      console.error('Error importing MCP templates:', error);
      alert('Error importing templates');
    }
  };

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Sidebar */}
      <aside className="min-h-screen w-72 flex flex-col justify-between text-white p-4" style={{backgroundColor: '#0a2240'}}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col p-4">
            <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
            <p className="text-sm font-normal leading-normal" style={{color: '#a0a0a0'}}>Email Management</p>
          </div>
          <nav className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-white" style={{backgroundColor: '#3dbff2'}} href="/email">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>email</span>
              <p className="text-sm font-medium leading-normal">Email Management</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email/inbox">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>inbox</span>
              <p className="text-sm font-medium leading-normal">Inbox</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email/composer">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>edit</span>
              <p className="text-sm font-medium leading-normal">Email Composer</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email/settings">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>settings</span>
              <p className="text-sm font-medium leading-normal">Email Settings</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email/logs">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>history</span>
              <p className="text-sm font-medium leading-normal">Email Logs</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>arrow_back</span>
              <p className="text-sm font-medium leading-normal">Back to Dashboard</p>
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
        {/* Header */}
        <header className="p-6 bg-white border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Email Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage templates, campaigns, and automated sequences</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#0a2240'}}>
                    {templates.reduce((acc, t) => acc + t.stats.sent, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Total Sent</div>
                </div>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#3dbff2'}}>
                    {campaigns.filter(c => c.status === 'active').length}
                  </div>
                  <div className="text-xs text-gray-500">Active Campaigns</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white border-b">
          <div className="px-6">
            <nav className="flex space-x-8">
              {[
                { key: 'templates', label: 'Templates', icon: 'description' },
                { key: 'campaigns', label: 'Campaigns', icon: 'campaign' },
                { key: 'sequences', label: 'Sequences', icon: 'auto_awesome' },
                { key: 'analytics', label: 'Analytics', icon: 'analytics' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-[#3dbff2] text-[#3dbff2]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-symbols-outlined text-gray-400">search</span>
              </div>
              <input 
                className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm" 
                placeholder="Search..." 
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              {activeTab === 'templates' && (
                <>
                  <button
                    onClick={handleImportMCPTemplates}
                    className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                    style={{backgroundColor: '#0a2240'}}
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    Import MCP Templates
                  </button>
                  <button
                    onClick={handleCreateTemplate}
                    className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                    style={{backgroundColor: '#3dbff2'}}
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    New Template
                  </button>
                </>
              )}
              {activeTab === 'campaigns' && (
                <button
                  onClick={handleCreateCampaign}
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                  style={{backgroundColor: '#3dbff2'}}
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  New Campaign
                </button>
              )}
              {activeTab === 'sequences' && (
                <>
                  <button
                    onClick={handleImportMCPSequences}
                    className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                    style={{backgroundColor: '#0a2240'}}
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    Import MCP Sequences
                  </button>
                  <button
                    onClick={handleCreateSequence}
                    className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                    style={{backgroundColor: '#3dbff2'}}
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    New Sequence
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
                  Email Templates ({filteredTemplates.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Template</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTemplates.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium" style={{color: '#0a2240'}}>{template.name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">{template.subject}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {template.isActive ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                            {template.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{template.leadStage || 'Any'}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div>Sent: <span className="font-medium">{template.stats.sent.toLocaleString()}</span></div>
                            <div>Opened: <span className="font-medium">{template.stats.opened.toLocaleString()}</span></div>
                            <div>Clicked: <span className="font-medium">{template.stats.clicked.toLocaleString()}</span></div>
                            <div>Replied: <span className="font-medium">{template.stats.replied.toLocaleString()}</span></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div>Open Rate: <span className="font-medium">{calculateOpenRate(template.stats.opened, template.stats.sent)}%</span></div>
                            <div>Click Rate: <span className="font-medium">{calculateClickRate(template.stats.clicked, template.stats.sent)}%</span></div>
                            <div>Reply Rate: <span className="font-medium">{calculateClickRate(template.stats.replied, template.stats.sent)}%</span></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              className="text-[#3dbff2] hover:underline text-xs"
                              onClick={() => setSelectedTemplate(template)}
                            >
                              Preview
                            </button>
                            <button
                              className="text-gray-400 hover:text-gray-600"
                              onClick={() => handleEditTemplate(template)}
                              title="Edit template"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              className="text-gray-400 hover:text-red-600"
                              onClick={() => handleDeleteTemplate(template.id)}
                              title="Delete template"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
                  Email Campaigns ({filteredCampaigns.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium" style={{color: '#0a2240'}}>{campaign.name}</div>
                            <div className="text-xs text-gray-500">{campaign.description}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              Created: {new Date(campaign.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {campaign.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div>Sent: <span className="font-medium">{campaign.stats.sent.toLocaleString()}</span></div>
                            <div>Open Rate: <span className="font-medium">{calculateOpenRate(campaign.stats.opened, campaign.stats.sent)}%</span></div>
                            <div>Click Rate: <span className="font-medium">{calculateClickRate(campaign.stats.clicked, campaign.stats.sent)}%</span></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            <div>{campaign.schedule.frequency}</div>
                            <div>{campaign.schedule.time}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="text-[#3dbff2] hover:underline text-xs">
                              View
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <span className="material-symbols-outlined text-base">more_horiz</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sequences Tab */}
          {activeTab === 'sequences' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
                  Email Sequences ({sequences.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {sequences.map((sequence) => (
                  <div key={sequence.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold mb-2" style={{color: '#0a2240'}}>{sequence.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{sequence.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {sequence.trigger}
                          </span>
                          {sequence.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Sequence Steps ({sequence.steps.length})</h5>
                      <div className="space-y-2">
                        {sequence.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center gap-3 text-sm">
                            <div className="w-6 h-6 rounded-full bg-[#3dbff2] text-white flex items-center justify-center text-xs">
                              {step.order}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Step {step.order}</div>
                              <div className="text-gray-500">
                                Delay: {step.delay.value} {step.delay.unit}
                              </div>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              {step.stats.sent} sent
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{sequence.stats.enrolled}</div>
                          <div className="text-gray-500">Enrolled</div>
                        </div>
                        <div>
                          <div className="font-medium">{sequence.stats.completed}</div>
                          <div className="text-gray-500">Completed</div>
                        </div>
                        <div>
                          <div className="font-medium">{sequence.stats.dropOffRate}%</div>
                          <div className="text-gray-500">Drop-off</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditSequence(sequence)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Edit sequence"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteSequence(sequence.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Delete sequence"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Total Emails Sent</p>
                      <p className="text-2xl font-bold" style={{color: '#0a2240'}}>
                        {templates.reduce((acc, t) => acc + t.stats.sent, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                      <span className="material-symbols-outlined text-blue-600">send</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Average Open Rate</p>
                      <p className="text-2xl font-bold" style={{color: '#3dbff2'}}>
                        {(() => {
                          const totalSent = templates.reduce((acc, t) => acc + t.stats.sent, 0);
                          const totalOpened = templates.reduce((acc, t) => acc + t.stats.opened, 0);
                          return totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0.0';
                        })()}%
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-cyan-100">
                      <span className="material-symbols-outlined text-cyan-600">visibility</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Average Click Rate</p>
                      <p className="text-2xl font-bold" style={{color: '#10b981'}}>
                        {(() => {
                          const totalSent = templates.reduce((acc, t) => acc + t.stats.sent, 0);
                          const totalClicked = templates.reduce((acc, t) => acc + t.stats.clicked, 0);
                          return totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0.0';
                        })()}%
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                      <span className="material-symbols-outlined text-green-600">mouse</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Total Replies</p>
                      <p className="text-2xl font-bold" style={{color: '#f59e0b'}}>
                        {templates.reduce((acc, t) => acc + t.stats.replied, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-100">
                      <span className="material-symbols-outlined text-yellow-600">reply</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance by Template Type */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
                    Performance by Template Type
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {Array.from(new Set(templates.map(t => t.type))).map(type => {
                      const typeTemplates = templates.filter(t => t.type === type);
                      const totalSent = typeTemplates.reduce((acc, t) => acc + t.stats.sent, 0);
                      const totalOpened = typeTemplates.reduce((acc, t) => acc + t.stats.opened, 0);
                      const totalClicked = typeTemplates.reduce((acc, t) => acc + t.stats.clicked, 0);
                      const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0.0';
                      const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0.0';
                      
                      return (
                        <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(type)}`}>
                              {type}
                            </span>
                            <div className="text-sm text-gray-600">
                              {typeTemplates.length} template{typeTemplates.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div>
                              <div className="font-medium">{totalSent.toLocaleString()}</div>
                              <div className="text-gray-500">Sent</div>
                            </div>
                            <div>
                              <div className="font-medium">{openRate}%</div>
                              <div className="text-gray-500">Open Rate</div>
                            </div>
                            <div>
                              <div className="font-medium">{clickRate}%</div>
                              <div className="text-gray-500">Click Rate</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Template Preview</h3>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Template Name</label>
                  <div className="mt-1 text-sm">{selectedTemplate.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject Line</label>
                  <div className="mt-1 text-sm font-mono bg-gray-100 p-2 rounded">{selectedTemplate.subject}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Content</label>
                  <div className="mt-1 text-sm bg-gray-100 p-4 rounded whitespace-pre-wrap font-mono">
                    {selectedTemplate.content}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Available Variables</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedTemplate.variables.map(variable => (
                      <span key={variable} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {'{{'}{variable}{'}}'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Create/Edit Modal */}
      {showTemplateModal && (
        <TemplateModal
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onClose={() => {
            setShowTemplateModal(false);
            setEditingTemplate(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Delete Template</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this template? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDeleteTemplate(showDeleteConfirm)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Modal (Placeholder) */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Create New Campaign</h3>
              <p className="text-gray-600 mb-6">
                Campaign creation feature is coming soon! This will allow you to create automated email campaigns.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sequence Modal */}
      {showSequenceModal && (
        <SequenceModal
          sequence={editingSequence}
          templates={templates.filter(t => t.isActive)}
          onSave={handleSaveSequence}
          onClose={() => {
            setShowSequenceModal(false);
            setEditingSequence(null);
          }}
        />
      )}
    </div>
  );
}