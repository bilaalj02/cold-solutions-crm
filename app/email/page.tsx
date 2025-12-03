'use client'

import React, { useState, useEffect } from "react";
import { EmailTemplate, EmailCampaign, EmailSequence } from "../../lib/email-system";
import { SupabaseEmailManager } from "../../lib/supabase-email";
import TemplateModal from "../../components/TemplateModal";
import SequenceModal from "../../components/SequenceModal";
import StandardSidebar from "../../components/StandardSidebar";
import ProtectedRoute from "../../components/ProtectedRoute";

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
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab]);

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

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await fetch('/api/email/analytics');
      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data);
      } else {
        console.error('Failed to load analytics:', data.error);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setAnalyticsLoading(false);
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
    if (!confirm('This will import 4 follow-up sequences (HVAC, Plumbing, General, Construction) from the MCP server. Each sequence has 4 steps. Continue?')) {
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
        },
        {
          name: "Construction Follow-up Sequence (Interested/More Info)",
          description: "Automated 4-email sequence for Construction leads who are interested or requested more info. Sends emails on Day 2, 6, 10, and 17.",
          trigger: 'manual' as const,
          triggerConditions: { industry: 'construction', outcomes: ['interested', 'more_info'] },
          isActive: true,
          steps: [
            {
              id: `step-${Date.now()}-13`,
              order: 1,
              templateId: 'construction-day2',
              delay: { value: 2, unit: 'days' as const },
              stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
            },
            {
              id: `step-${Date.now()}-14`,
              order: 2,
              templateId: 'construction-day6',
              delay: { value: 4, unit: 'days' as const },
              stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
            },
            {
              id: `step-${Date.now()}-15`,
              order: 3,
              templateId: 'construction-day10',
              delay: { value: 4, unit: 'days' as const },
              stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
            },
            {
              id: `step-${Date.now()}-16`,
              order: 4,
              templateId: 'construction-day17',
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
    if (!confirm('This will import actively used intro email templates from the MCP server (HVAC, Plumbing, Roofing, Construction, General). Continue?')) {
      return;
    }

    try {
      // Only actively used intro email templates from MCP server
      const mcpTemplates: Array<Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'stats'>> = [
        // HVAC Intro Emails
        {
          name: "HVAC: Interested",
          subject: "More Info-Cold Solutions",
          content: "Hi {{contact_first_name||there}},\n\nGreat speaking with you! Here's a quick breakdown of how we help home service businesses like yours capture more jobs and save time:\n\nAI Receptionist – Answers calls 24/7 (even at 2 AM when emergencies come in), books appointments, and handles up to 20 calls simultaneously. You'll never miss another lead whether you're on a job site or with a customer.\n\nAI Chatbot – Lives on your website and engages visitors. Qualifies leads, answers common questions about services, and books consultations before they call your competitors.\n\nLead Qualification & Follow-Up – Contacts new leads within minutes of inquiry. Fast response = more jobs booked. Our system ensures every call, form submission, and social media inquiry gets an immediate, professional response.\n\nAutomation – Streamlines your workflow from estimate to invoice. Automatically sends follow-ups, appointment reminders, and post-job review requests without you lifting a finger.\n\nFree AI Audit – We'll analyze your current operations and show you exactly where you're losing leads or wasting time. No charge, no obligation.\n\nWant to hear it in action?\n\nCall our AI Receptionist to learn more about our services: +1(778)401-8733\n\nReply with a few dates and times that work for a 15-minute discovery call, and we'll walk you through exactly how this would work for {{company_name||your company}}.\n\nTalk soon,\nPaul-Elvis Roberts\nCo-Founder, Cold Solutions\n📧 contact@coldsolutions.ca\n📞 +1(778)401-8733\n🌐 coldsolutions.ca\n\nP.S. Peak season means call volume spikes - our AI ensures no customer call goes unanswered, which means no more lost revenue from missed opportunities.",
          type: "follow-up" as const,
          leadStage: "interested",
          industry: "hvac",
          isActive: true,
          variables: ["contact_first_name", "company_name"],
          createdBy: "system"
        },
        {
          name: "HVAC: More Info",
          subject: "More Info-Cold Solutions",
          content: "Hi {{contact_first_name||there}},\n\nGreat speaking with you! Here's a quick breakdown of how we help home service businesses like yours capture more jobs and save time:\n\nAI Receptionist – Answers calls 24/7 (even at 2 AM when emergencies come in), books appointments, and handles up to 20 calls simultaneously. You'll never miss another lead whether you're on a job site or with a customer.\n\nAI Chatbot – Lives on your website and engages visitors. Qualifies leads, answers common questions about services, and books consultations before they call your competitors.\n\nLead Qualification & Follow-Up – Contacts new leads within minutes of inquiry. Fast response = more jobs booked. Our system ensures every call, form submission, and social media inquiry gets an immediate, professional response.\n\nAutomation – Streamlines your workflow from estimate to invoice. Automatically sends follow-ups, appointment reminders, and post-job review requests without you lifting a finger.\n\nFree AI Audit – We'll analyze your current operations and show you exactly where you're losing leads or wasting time. No charge, no obligation.\n\nWant to hear it in action?\n\nCall our AI Receptionist to learn more about our services: +1(778)401-8733\n\nReply with a few dates and times that work for a 15-minute discovery call, and we'll walk you through exactly how this would work for {{company_name||your company}}.\n\nTalk soon,\nPaul-Elvis Roberts\nCo-Founder, Cold Solutions\n📧 contact@coldsolutions.ca\n📞 +1(778)401-8733\n🌐 coldsolutions.ca\n\nP.S. Peak season means call volume spikes - our AI ensures no customer call goes unanswered, which means no more lost revenue from missed opportunities.",
          type: "follow-up" as const,
          leadStage: "more_info",
          industry: "hvac",
          isActive: true,
          variables: ["contact_first_name", "company_name"],
          createdBy: "system"
        },
        // Plumbing Intro Emails
        {
          name: "Plumbing: Interested",
          subject: "More Info-Cold Solutions",
          content: "Hi {{contact_first_name||there}},\n\nGreat speaking with you! Here's a quick breakdown of how we help home service businesses like yours capture more jobs and save time:\n\nAI Receptionist – Answers calls 24/7 (even at 2 AM when emergencies come in), books appointments, and handles up to 20 calls simultaneously. You'll never miss another lead whether you're on a job site or with a customer.\n\nAI Chatbot – Lives on your website and engages visitors. Qualifies leads, answers common questions about services, and books consultations before they call your competitors.\n\nLead Qualification & Follow-Up – Contacts new leads within minutes of inquiry. Fast response = more jobs booked. Our system ensures every call, form submission, and social media inquiry gets an immediate, professional response.\n\nAutomation – Streamlines your workflow from estimate to invoice. Automatically sends follow-ups, appointment reminders, and post-job review requests without you lifting a finger.\n\nFree AI Audit – We'll analyze your current operations and show you exactly where you're losing leads or wasting time. No charge, no obligation.\n\nWant to hear it in action?\n\nCall our AI Receptionist to learn more about our services: +1(778)401-8733\n\nReply with a few dates and times that work for a 15-minute discovery call, and we'll walk you through exactly how this would work for {{company_name||your company}}.\n\nTalk soon,\nPaul-Elvis Roberts\nCo-Founder, Cold Solutions\n📧 contact@coldsolutions.ca\n📞 +1(778)401-8733\n🌐 coldsolutions.ca\n\nP.S. Peak season means call volume spikes - our AI ensures no customer call goes unanswered, which means no more lost revenue from missed opportunities.",
          type: "follow-up" as const,
          leadStage: "interested",
          industry: "plumbing",
          isActive: true,
          variables: ["contact_first_name", "company_name"],
          createdBy: "system"
        },
        {
          name: "Plumbing: More Info",
          subject: "More Info-Cold Solutions",
          content: "Hi {{contact_first_name||there}},\n\nGreat speaking with you! Here's a quick breakdown of how we help home service businesses like yours capture more jobs and save time:\n\nAI Receptionist – Answers calls 24/7 (even at 2 AM when emergencies come in), books appointments, and handles up to 20 calls simultaneously. You'll never miss another lead whether you're on a job site or with a customer.\n\nAI Chatbot – Lives on your website and engages visitors. Qualifies leads, answers common questions about services, and books consultations before they call your competitors.\n\nLead Qualification & Follow-Up – Contacts new leads within minutes of inquiry. Fast response = more jobs booked. Our system ensures every call, form submission, and social media inquiry gets an immediate, professional response.\n\nAutomation – Streamlines your workflow from estimate to invoice. Automatically sends follow-ups, appointment reminders, and post-job review requests without you lifting a finger.\n\nFree AI Audit – We'll analyze your current operations and show you exactly where you're losing leads or wasting time. No charge, no obligation.\n\nWant to hear it in action?\n\nCall our AI Receptionist to learn more about our services: +1(778)401-8733\n\nReply with a few dates and times that work for a 15-minute discovery call, and we'll walk you through exactly how this would work for {{company_name||your company}}.\n\nTalk soon,\nPaul-Elvis Roberts\nCo-Founder, Cold Solutions\n📧 contact@coldsolutions.ca\n📞 +1(778)401-8733\n🌐 coldsolutions.ca\n\nP.S. Peak season means call volume spikes - our AI ensures no customer call goes unanswered, which means no more lost revenue from missed opportunities.",
          type: "follow-up" as const,
          leadStage: "more_info",
          industry: "plumbing",
          isActive: true,
          variables: ["contact_first_name", "company_name"],
          createdBy: "system"
        },
        // Roofing Intro Emails
        {
          name: "Roofing: Interested",
          subject: "More Info-Cold Solutions",
          content: "Hi {{contact_first_name||there}},\n\nGreat speaking with you! Here's a quick breakdown of how we help home service businesses like yours capture more jobs and save time:\n\nAI Receptionist – Answers calls 24/7 (even at 2 AM when emergencies come in), books appointments, and handles up to 20 calls simultaneously. You'll never miss another lead whether you're on a job site or with a customer.\n\nAI Chatbot – Lives on your website and engages visitors. Qualifies leads, answers common questions about services, and books consultations before they call your competitors.\n\nLead Qualification & Follow-Up – Contacts new leads within minutes of inquiry. Fast response = more jobs booked. Our system ensures every call, form submission, and social media inquiry gets an immediate, professional response.\n\nAutomation – Streamlines your workflow from estimate to invoice. Automatically sends follow-ups, appointment reminders, and post-job review requests without you lifting a finger.\n\nFree AI Audit – We'll analyze your current operations and show you exactly where you're losing leads or wasting time. No charge, no obligation.\n\nWant to hear it in action?\n\nCall our AI Receptionist to learn more about our services: +1(778)401-8733\n\nReply with a few dates and times that work for a 15-minute discovery call, and we'll walk you through exactly how this would work for {{company_name||your company}}.\n\nTalk soon,\nPaul-Elvis Roberts\nCo-Founder, Cold Solutions\n📧 contact@coldsolutions.ca\n📞 +1(778)401-8733\n🌐 coldsolutions.ca\n\nP.S. Peak season means call volume spikes - our AI ensures no customer call goes unanswered, which means no more lost revenue from missed opportunities.",
          type: "follow-up" as const,
          leadStage: "interested",
          industry: "roofing",
          isActive: true,
          variables: ["contact_first_name", "company_name"],
          createdBy: "system"
        },
        {
          name: "Roofing: More Info",
          subject: "More Info-Cold Solutions",
          content: "Hi {{contact_first_name||there}},\n\nGreat speaking with you! Here's a quick breakdown of how we help home service businesses like yours capture more jobs and save time:\n\nAI Receptionist – Answers calls 24/7 (even at 2 AM when emergencies come in), books appointments, and handles up to 20 calls simultaneously. You'll never miss another lead whether you're on a job site or with a customer.\n\nAI Chatbot – Lives on your website and engages visitors. Qualifies leads, answers common questions about services, and books consultations before they call your competitors.\n\nLead Qualification & Follow-Up – Contacts new leads within minutes of inquiry. Fast response = more jobs booked. Our system ensures every call, form submission, and social media inquiry gets an immediate, professional response.\n\nAutomation – Streamlines your workflow from estimate to invoice. Automatically sends follow-ups, appointment reminders, and post-job review requests without you lifting a finger.\n\nFree AI Audit – We'll analyze your current operations and show you exactly where you're losing leads or wasting time. No charge, no obligation.\n\nWant to hear it in action?\n\nCall our AI Receptionist to learn more about our services: +1(778)401-8733\n\nReply with a few dates and times that work for a 15-minute discovery call, and we'll walk you through exactly how this would work for {{company_name||your company}}.\n\nTalk soon,\nPaul-Elvis Roberts\nCo-Founder, Cold Solutions\n📧 contact@coldsolutions.ca\n📞 +1(778)401-8733\n🌐 coldsolutions.ca\n\nP.S. Peak season means call volume spikes - our AI ensures no customer call goes unanswered, which means no more lost revenue from missed opportunities.",
          type: "follow-up" as const,
          leadStage: "more_info",
          industry: "roofing",
          isActive: true,
          variables: ["contact_first_name", "company_name"],
          createdBy: "system"
        },
        // Construction Intro Emails
        {
          name: "Construction: Interested",
          subject: "More Info - Cold Solutions",
          content: "Hi {{contact_first_name||there}},\n\nGreat speaking with you! Here's a quick breakdown of how we help construction companies like yours capture more projects and save time:\n\nAI Receptionist – Answers calls 24/7 (even at 2 AM when urgent project inquiries come in), schedules estimates, and handles up to 20 calls simultaneously. You'll never miss another bid opportunity whether you're on-site, in meetings, or managing crews.\n\nAI Chatbot – Lives on your website and engages potential clients. Qualifies project leads, answers questions about services and timelines, and books estimate appointments before they contact your competitors.\n\nLead Qualification & Follow-Up – Contacts new project inquiries within minutes. Fast response = more bids submitted and jobs won. Our system ensures every call, RFP, form submission, and inquiry gets an immediate, professional response.\n\nAutomation – Streamlines your workflow from estimate to final invoice. Automatically sends bid follow-ups, project updates, appointment reminders, and post-project review requests without you lifting a finger.\n\nFree AI Audit – We'll analyze your current operations and show you exactly where you're losing project opportunities or wasting administrative time. No charge, no obligation.\n\nWant to hear it in action?\n\nCall our AI Receptionist to learn more about our services: +1(778)401-8733\n\nReply with a few dates and times that work for a 15-minute discovery call, and we'll walk you through exactly how this would work for {{company_name||your company}}.\n\nTalk soon,\nPaul-Elvis Roberts\nCold Solutions\ncontact@coldsolutions.ca\ncoldsolutions.ca\n\nP.S. Busy season means more RFPs and inquiries than your office can handle - our AI ensures every potential project gets a response, which means no more lost bids from missed calls.",
          type: "follow-up" as const,
          leadStage: "interested",
          industry: "construction",
          isActive: true,
          variables: ["contact_first_name", "company_name"],
          createdBy: "system"
        },
        {
          name: "Construction: More Info",
          subject: "More Info - Cold Solutions",
          content: "Hi {{contact_first_name||there}},\n\nGreat speaking with you! Here's a quick breakdown of how we help construction companies like yours capture more projects and save time:\n\nAI Receptionist – Answers calls 24/7 (even at 2 AM when urgent project inquiries come in), schedules estimates, and handles up to 20 calls simultaneously. You'll never miss another bid opportunity whether you're on-site, in meetings, or managing crews.\n\nAI Chatbot – Lives on your website and engages potential clients. Qualifies project leads, answers questions about services and timelines, and books estimate appointments before they contact your competitors.\n\nLead Qualification & Follow-Up – Contacts new project inquiries within minutes. Fast response = more bids submitted and jobs won. Our system ensures every call, RFP, form submission, and inquiry gets an immediate, professional response.\n\nAutomation – Streamlines your workflow from estimate to final invoice. Automatically sends bid follow-ups, project updates, appointment reminders, and post-project review requests without you lifting a finger.\n\nFree AI Audit – We'll analyze your current operations and show you exactly where you're losing project opportunities or wasting administrative time. No charge, no obligation.\n\nWant to hear it in action?\n\nCall our AI Receptionist to learn more about our services: +1(778)401-8733\n\nReply with a few dates and times that work for a 15-minute discovery call, and we'll walk you through exactly how this would work for {{company_name||your company}}.\n\nTalk soon,\nPaul-Elvis Roberts\nCold Solutions\ncontact@coldsolutions.ca\ncoldsolutions.ca\n\nP.S. Busy season means more RFPs and inquiries than your office can handle - our AI ensures every potential project gets a response, which means no more lost bids from missed calls.",
          type: "follow-up" as const,
          leadStage: "more_info",
          industry: "construction",
          isActive: true,
          variables: ["contact_first_name", "company_name"],
          createdBy: "system"
        },
        // General Home Service Intro Emails
        {
          name: "General: Interested",
          subject: "More Info-Cold Solutions",
          content: "Hi {{contact_first_name||there}},\n\nGreat speaking with you! Here's a quick breakdown of how we help home service businesses like yours capture more jobs and save time:\n\nAI Receptionist – Answers calls 24/7 (even at 2 AM when emergencies come in), books appointments, and handles up to 20 calls simultaneously. You'll never miss another lead whether you're on a job site or with a customer.\n\nAI Chatbot – Lives on your website and engages visitors. Qualifies leads, answers common questions about services, and books consultations before they call your competitors.\n\nLead Qualification & Follow-Up – Contacts new leads within minutes of inquiry. Fast response = more jobs booked. Our system ensures every call, form submission, and social media inquiry gets an immediate, professional response.\n\nAutomation – Streamlines your workflow from estimate to invoice. Automatically sends follow-ups, appointment reminders, and post-job review requests without you lifting a finger.\n\nFree AI Audit – We'll analyze your current operations and show you exactly where you're losing leads or wasting time. No charge, no obligation.\n\nWant to hear it in action?\n\nCall our AI Receptionist to learn more about our services: +1(778)401-8733\n\nReply with a few dates and times that work for a 15-minute discovery call, and we'll walk you through exactly how this would work for {{company_name||your company}}.\n\nTalk soon,\nPaul-Elvis Roberts\nCo-Founder, Cold Solutions\n📧 contact@coldsolutions.ca\n📞 +1(778)401-8733\n🌐 coldsolutions.ca\n\nP.S. Peak season means call volume spikes - our AI ensures no customer call goes unanswered, which means no more lost revenue from missed opportunities.",
          type: "follow-up" as const,
          leadStage: "interested",
          industry: "general",
          isActive: true,
          variables: ["contact_first_name", "company_name"],
          createdBy: "system"
        },
        {
          name: "General: More Info",
          subject: "More Info-Cold Solutions",
          content: "Hi {{contact_first_name||there}},\n\nGreat speaking with you! Here's a quick breakdown of how we help home service businesses like yours capture more jobs and save time:\n\nAI Receptionist – Answers calls 24/7 (even at 2 AM when emergencies come in), books appointments, and handles up to 20 calls simultaneously. You'll never miss another lead whether you're on a job site or with a customer.\n\nAI Chatbot – Lives on your website and engages visitors. Qualifies leads, answers common questions about services, and books consultations before they call your competitors.\n\nLead Qualification & Follow-Up – Contacts new leads within minutes of inquiry. Fast response = more jobs booked. Our system ensures every call, form submission, and social media inquiry gets an immediate, professional response.\n\nAutomation – Streamlines your workflow from estimate to invoice. Automatically sends follow-ups, appointment reminders, and post-job review requests without you lifting a finger.\n\nFree AI Audit – We'll analyze your current operations and show you exactly where you're losing leads or wasting time. No charge, no obligation.\n\nWant to hear it in action?\n\nCall our AI Receptionist to learn more about our services: +1(778)401-8733\n\nReply with a few dates and times that work for a 15-minute discovery call, and we'll walk you through exactly how this would work for {{company_name||your company}}.\n\nTalk soon,\nPaul-Elvis Roberts\nCo-Founder, Cold Solutions\n📧 contact@coldsolutions.ca\n📞 +1(778)401-8733\n🌐 coldsolutions.ca\n\nP.S. Peak season means call volume spikes - our AI ensures no customer call goes unanswered, which means no more lost revenue from missed opportunities.",
          type: "follow-up" as const,
          leadStage: "more_info",
          industry: "general",
          isActive: true,
          variables: ["contact_first_name", "company_name"],
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
    <ProtectedRoute>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <StandardSidebar />

        <div className="flex flex-col flex-1 min-h-screen">
          {/* Header */}
          <header className="glass-card border-0 p-6 m-4 mb-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
                <p className="text-sm text-gray-600 mt-1">Manage templates, campaigns, and automated sequences</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="glass-card p-4 border-0">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {templates.reduce((acc, t) => acc + t.stats.sent, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Total Sent</div>
                  </div>
                </div>
                <div className="glass-card p-4 border-0">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {campaigns.filter(c => c.status === 'active').length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Active Campaigns</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">

        {/* Tab Navigation */}
        <div className="glass-card border-0 mb-6">
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
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
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
        <div className="mb-6 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="material-symbols-outlined text-gray-400 text-lg">search</span>
            </div>
            <input
              className="glass-input block w-full rounded-xl pl-10 py-2.5 text-sm border-0"
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
                  className="inline-flex items-center gap-2 glass-card rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 border-0 hover:scale-105 transition-all"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  Import MCP Templates
                </button>
                <button
                  onClick={handleCreateTemplate}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:scale-105 transition-all"
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
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analytics...</p>
                  </div>
                </div>
              ) : analyticsData ? (
                <>
                  {/* Data Source Indicator */}
                  {analyticsData.source === 'empty' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-yellow-600">info</span>
                        <p className="text-sm text-yellow-800">
                          No email data found. Send emails from the MCP server to see analytics here.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Overall Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Total Emails Sent</p>
                          <p className="text-2xl font-bold" style={{color: '#0a2240'}}>
                            {analyticsData.overall.total_sent.toLocaleString()}
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
                            {analyticsData.overall.open_rate.toFixed(1)}%
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
                            {analyticsData.overall.click_rate.toFixed(1)}%
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
                            {analyticsData.overall.total_replied.toLocaleString()}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-100">
                          <span className="material-symbols-outlined text-yellow-600">reply</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">Failed to load analytics. Please try again.</p>
                </div>
              )}

              {/* Performance by Template Type */}
              {analyticsData && analyticsData.by_type && analyticsData.by_type.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
                      Performance by Template Type
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {analyticsData.by_type.map((typeData: any) => {
                        return (
                          <div key={typeData.type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(typeData.type)}`}>
                                {typeData.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                              <div>
                                <div className="font-medium">{typeData.sent.toLocaleString()}</div>
                                <div className="text-gray-500">Sent</div>
                              </div>
                              <div>
                                <div className="font-medium">{typeData.open_rate.toFixed(1)}%</div>
                                <div className="text-gray-500">Open Rate</div>
                              </div>
                              <div>
                                <div className="font-medium">{typeData.click_rate.toFixed(1)}%</div>
                                <div className="text-gray-500">Click Rate</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}