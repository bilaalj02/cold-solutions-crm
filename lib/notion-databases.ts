export interface NotionDatabase {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

export const notionDatabases: NotionDatabase[] = [
  {
    id: '269c6af7fe2a809db106f5e0fd83d540',
    name: 'Cold Solutions Inbound',
    slug: 'inbound',
    description: 'Inbound leads from website and marketing campaigns',
    icon: 'call_received',
    color: 'blue'
  },
  {
    id: '265c6af7fe2a80febfa8cd94864f68f7',
    name: 'AI Audit Agent Pre Call',
    slug: 'ai-audit-pre-call',
    description: 'Leads scheduled for AI audit agent calls',
    icon: 'smart_toy',
    color: 'purple'
  },
  {
    id: '267c6af7fe2a8018b541f86689336ead',
    name: 'Leads AI Audit Post Call',
    slug: 'ai-audit-post-call',
    description: 'Leads that have completed AI audit calls',
    icon: 'task_alt',
    color: 'green'
  },
  {
    id: '250c6af7fe2a806495c1f9e1e15f4d75',
    name: 'WhatsApp Follow-up Leads',
    slug: 'whatsapp-followup',
    description: 'Leads requiring follow-up via WhatsApp',
    icon: 'chat',
    color: 'orange'
  },
  {
    id: '268c6af7fe2a805e8b25ee868ec7e569',
    name: 'WhatsApp Bot Leads',
    slug: 'whatsapp-bot',
    description: 'Leads generated through WhatsApp bot interactions',
    icon: 'chat',
    color: 'emerald'
  },
  {
    id: '254c6af7fe2a80beb263e459e36a7fdc',
    name: 'Cold Solutions Website Leads',
    slug: 'website-leads',
    description: 'Direct leads from Cold Solutions website',
    icon: 'language',
    color: 'cyan'
  },
  {
    id: '271c6af7fe2a80f38695d0a28bf9724a',
    name: 'Cold Caller Leads',
    slug: 'new-lead-database',
    description: 'Leads generated from cold calling activities',
    icon: 'phone_in_talk',
    color: 'indigo'
  }
];

export const getDatabaseBySlug = (slug: string): NotionDatabase | undefined => {
  return notionDatabases.find(db => db.slug === slug);
};

export const getDatabaseById = (id: string): NotionDatabase | undefined => {
  return notionDatabases.find(db => db.id === id);
};