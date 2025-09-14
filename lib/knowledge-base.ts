export interface ServiceInfo {
  id: string;
  name: string;
  category: 'voice-agents' | 'chatbots' | 'automation' | 'consulting';
  description: string;
  keyFeatures: string[];
  benefits: string[];
  pricing: {
    startingPrice: string;
    pricingModel: string;
    details: string;
  };
  implementation: {
    timeline: string;
    process: string[];
  };
  useCases: string[];
  roi: {
    avgROI: string;
    paybackPeriod: string;
    costSavings: string;
  };
  technicalSpecs?: {
    integrations: string[];
    platforms: string[];
    requirements: string[];
  };
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  followUpQuestions?: string[];
}

export interface UseCase {
  id: string;
  title: string;
  industry: string;
  description: string;
  benefits: string[];
  implementation: string;
  roi: string;
}

export const COLD_SOLUTIONS_SERVICES: ServiceInfo[] = [
  {
    id: 'ai-voice-agents',
    name: 'AI Voice Agents',
    category: 'voice-agents',
    description: 'Advanced AI-powered voice agents that handle customer calls, bookings, and inquiries 24/7 with human-like conversation capabilities.',
    keyFeatures: [
      'Natural conversation flow with advanced AI',
      '24/7 availability with instant response',
      'Multi-language support',
      'Real-time appointment booking',
      'Lead qualification and routing',
      'Integration with existing systems',
      'Call recording and analytics',
      'Sentiment analysis and reporting'
    ],
    benefits: [
      'Reduce staff workload by up to 80%',
      'Never miss a potential customer call',
      'Consistent service quality',
      'Significant cost savings on staffing',
      'Detailed analytics and insights',
      'Improved customer satisfaction'
    ],
    pricing: {
      startingPrice: 'Based on usage',
      pricingModel: 'Pay-per-call + monthly base fee',
      details: 'Pricing varies based on call volume, features, and integration complexity. Contact us for a personalized quote.'
    },
    implementation: {
      timeline: '2-4 weeks',
      process: [
        'Discovery call to understand requirements',
        'Voice agent design and training',
        'System integration and testing',
        'Training and onboarding',
        'Go-live and ongoing support'
      ]
    },
    useCases: [
      'Appointment booking and scheduling',
      'Lead qualification and nurturing',
      'Customer support and FAQs',
      'After-hours customer service',
      'Follow-up calls and reminders'
    ],
    roi: {
      avgROI: '300-500%',
      paybackPeriod: '2-4 months',
      costSavings: 'Save $3,000-8,000 per month on staffing costs'
    },
    technicalSpecs: {
      integrations: ['CRM systems', 'Calendly', 'Google Calendar', 'Zapier', 'Custom APIs'],
      platforms: ['Phone systems', 'VoIP providers', 'Cloud telephony'],
      requirements: ['Existing phone system', 'CRM integration capabilities']
    }
  }
];

export const COLD_SOLUTIONS_FAQ: FAQ[] = [
  {
    id: 'what-is-ai-voice-agent',
    question: 'What is an AI Voice Agent?',
    answer: 'An AI Voice Agent is an advanced artificial intelligence system that can handle phone calls, have natural conversations with customers, book appointments, answer questions, and perform various customer service tasks 24/7. Our agents are trained specifically for your business to provide personalized service.',
    category: 'general',
    keywords: ['ai', 'voice agent', 'what is', 'definition', 'artificial intelligence']
  },
  {
    id: 'pricing-model',
    question: 'How much does your service cost?',
    answer: 'Our pricing is based on usage and customized to your specific needs. We typically charge a monthly base fee plus a per-call rate. Pricing varies based on call volume, features required, and integration complexity. Most clients see significant cost savings compared to hiring additional staff. Contact us for a personalized quote and ROI analysis.',
    category: 'pricing',
    keywords: ['cost', 'price', 'pricing', 'expensive', 'budget', 'monthly fee']
  },
  {
    id: 'implementation-time',
    question: 'How long does it take to set up?',
    answer: 'Most implementations take 2-4 weeks from start to finish. This includes discovery, agent training, system integration, testing, and go-live. Simple setups can be ready in as little as 1-2 weeks, while complex integrations may take 4-6 weeks.',
    category: 'implementation',
    keywords: ['setup time', 'implementation', 'how long', 'timeline', 'go live']
  },
  {
    id: 'human-like-conversation',
    question: 'Do your AI agents sound human?',
    answer: 'Yes! Our AI agents use advanced natural language processing and speech synthesis to have human-like conversations. They can understand context, handle interruptions, ask clarifying questions, and respond naturally. Many customers don\'t realize they\'re speaking with an AI.',
    category: 'technology',
    keywords: ['human', 'natural', 'conversation', 'realistic', 'voice quality', 'sound']
  },
  {
    id: 'integration-capabilities',
    question: 'Can you integrate with our existing systems?',
    answer: 'Absolutely! We integrate with most CRM systems, calendar applications (Google Calendar, Calendly, Outlook), phone systems, and business tools. We also work with Zapier for additional integrations and can build custom API connections for specific requirements.',
    category: 'technical',
    keywords: ['integration', 'crm', 'calendar', 'systems', 'zapier', 'api']
  }
];

export const USE_CASES: UseCase[] = [
  {
    id: 'real-estate',
    title: 'Real Estate Lead Management',
    industry: 'Real Estate',
    description: 'AI voice agents handle property inquiries, schedule showings, qualify leads, and follow up with potential buyers and sellers.',
    benefits: [
      'Never miss a lead inquiry',
      'Instant response to property questions',
      'Automated showing scheduling',
      'Lead qualification and routing'
    ],
    implementation: 'Integrate with MLS systems and calendar platforms for seamless showing management',
    roi: 'Increase lead conversion by 40% while reducing admin time by 60%'
  },
  {
    id: 'dental-practice',
    title: 'Dental Practice Automation',
    industry: 'Healthcare - Dental',
    description: 'Automate appointment booking, handle patient inquiries, send reminders, and manage emergency calls for dental practices.',
    benefits: [
      '24/7 appointment booking',
      'Reduced no-shows with automated reminders',
      'Emergency triage capabilities',
      'Insurance verification assistance'
    ],
    implementation: 'Connect with practice management software and patient databases',
    roi: 'Increase bookings by 35% and reduce staff overhead by 50%'
  }
];

export class KnowledgeBaseService {
  searchServices(query: string): ServiceInfo[] {
    const searchTerms = query.toLowerCase().split(' ');
    return COLD_SOLUTIONS_SERVICES.filter(service => {
      const searchableText = `${service.name} ${service.description} ${service.keyFeatures.join(' ')} ${service.benefits.join(' ')}`.toLowerCase();
      return searchTerms.some(term => searchableText.includes(term));
    });
  }

  searchFAQ(query: string): FAQ[] {
    const searchTerms = query.toLowerCase().split(' ');
    return COLD_SOLUTIONS_FAQ.filter(faq => {
      const searchableText = `${faq.question} ${faq.answer} ${faq.keywords.join(' ')}`.toLowerCase();
      return searchTerms.some(term => searchableText.includes(term));
    });
  }

  searchUseCases(industry?: string): UseCase[] {
    if (!industry) return USE_CASES;
    return USE_CASES.filter(useCase => 
      useCase.industry.toLowerCase().includes(industry.toLowerCase())
    );
  }

  getServiceById(id: string): ServiceInfo | undefined {
    return COLD_SOLUTIONS_SERVICES.find(service => service.id === id);
  }

  getFAQById(id: string): FAQ | undefined {
    return COLD_SOLUTIONS_FAQ.find(faq => faq.id === id);
  }

  getAllServices(): ServiceInfo[] {
    return COLD_SOLUTIONS_SERVICES;
  }

  getAllFAQ(): FAQ[] {
    return COLD_SOLUTIONS_FAQ;
  }

  getAllUseCases(): UseCase[] {
    return USE_CASES;
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();