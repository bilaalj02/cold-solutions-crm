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
    id: '254c6af7fe2a80beb263e459e36a7fdc',
    name: 'Cold Solutions Website',
    slug: 'website-leads',
    description: 'Direct leads from Cold Solutions website',
    icon: 'language',
    color: 'cyan'
  },
  {
    id: '269c6af7fe2a809db106f5e0fd83d540',
    name: 'Inbound Leads',
    slug: 'inbound',
    description: 'Inbound leads from website and marketing campaigns',
    icon: 'call_received',
    color: 'blue'
  },
  {
    id: '265c6af7fe2a80febfa8cd94864f68f7',
    name: 'AI Audit (Pre-Call)',
    slug: 'ai-audit-pre-call',
    description: 'Leads scheduled for AI audit agent calls',
    icon: 'psychology',
    color: 'purple'
  },
  {
    id: '267c6af7fe2a8018b541f86689336ead',
    name: 'AI Audit (Post-Call)',
    slug: 'ai-audit-post-call',
    description: 'Leads that have completed AI audit calls',
    icon: 'psychology_alt',
    color: 'green'
  },
  {
    id: '271c6af7fe2a80f38695d0a28bf9724a',
    name: 'CRM Database',
    slug: 'new-lead-database',
    description: 'CRM database for managing leads',
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