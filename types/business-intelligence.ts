// Business Intelligence Types
// Matches the MCP server types but adapted for CRM usage

export interface BusinessIntelligenceLead {
  id: string;
  business_name: string;
  industry?: string;
  website?: string;
  city: string;
  state?: string;
  country: string;
  address?: string;
  zip_code?: string;
  phone?: string;
  google_maps_url?: string;
  analysis_status: 'Not Started' | 'In Progress' | 'Complete' | 'Failed';
  pushed_to_caller: boolean;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface DetectedTechnologies {
  crm?: string;
  bookingSystem?: string;
  liveChat?: string;
  phoneSystem?: string;
  emailMarketing?: string;
  other?: string[];
}

export interface CompetitorInsights {
  mainCompetitors: string[];
  competitorWeaknesses: string[];
  differentiationOpportunities: string[];
  marketPosition: string;
}

export interface ReviewSentiment {
  commonComplaints: string[];
  commonPraises: string[];
  urgentIssues: string[];
  sentimentScore: number; // 0-100
  reviewThemes: string[];
}

export interface BusinessAnalysis {
  id: string;
  lead_id: string;

  // Core analysis
  summary?: string;
  outreach_angle?: string;
  pain_points: string[];
  automation_opportunities: string[];
  recommended_services: string[];
  competitive_advantages: string[];

  // Metrics
  google_rating?: number;
  total_reviews?: number;
  competitors_found?: number;

  // Enhanced data
  detected_technologies?: DetectedTechnologies;
  competitor_insights?: CompetitorInsights;
  review_sentiment?: ReviewSentiment;

  // Raw data
  raw_data?: any;

  analyzed_at: string;
}

export interface BusinessIntelligenceComplete extends BusinessIntelligenceLead {
  // Analysis fields
  summary?: string;
  outreach_angle?: string;
  pain_points: string[];
  automation_opportunities: string[];
  recommended_services: string[];
  competitive_advantages: string[];
  google_rating?: number;
  total_reviews?: number;
  competitors_found?: number;
  detected_technologies?: DetectedTechnologies;
  competitor_insights?: CompetitorInsights;
  review_sentiment?: ReviewSentiment;
  analyzed_at?: string;
}

// CSV Import Types
export interface CSVImportRow {
  business_name: string;
  industry?: string;
  website?: string;
  city: string;
  state?: string;
  country: string;
  address?: string;
  zip_code?: string;
  phone?: string;
  google_maps_url?: string;
}

export interface ImportValidationResult {
  valid: boolean;
  row: CSVImportRow;
  rowNumber: number;
  errors: string[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  duplicates: number;
  errors: number;
  errorDetails: Array<{
    row: number;
    errors: string[];
  }>;
}

// Analysis Processing Types
export interface AnalysisRequest {
  limit?: number; // Max number of leads to analyze
  leadIds?: string[]; // Specific leads to analyze
}

export interface AnalysisProgress {
  totalLeads: number;
  processed: number;
  successful: number;
  failed: number;
  inProgress: boolean;
  currentBatch: number;
  totalBatches: number;
  startTime?: string;
  endTime?: string;
  estimatedTimeRemaining?: number; // seconds
  estimatedCost?: number; // dollars
}

export interface AnalysisResult {
  success: boolean;
  leadId: string;
  businessName: string;
  error?: string;
  analysis?: BusinessAnalysis;
}

// Push to Caller Types
export interface PushToCallerRequest {
  leadIds: string[];
  leadListId?: string; // If not provided, auto-create today's list
  leadListName?: string;
}

export interface PushToCallerResult {
  success: boolean;
  pushedCount: number;
  skippedCount: number;
  failedCount: number;
  leadListId: string;
  leadListName: string;
  errors: string[];
}

// Re-analysis Types
export interface ReanalysisRequest {
  leadId: string;
  forceReanalyze?: boolean; // If true, re-analyze even if already complete
}
