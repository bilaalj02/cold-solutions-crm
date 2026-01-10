// Bulk Lead Processor
// Ported from cold-solutions-mcp-server/src/bulk-lead-processor.ts

import { createClient } from '@/lib/supabase/server';
import { BusinessAnalyzerService, BusinessData, BusinessAnalysisResult } from './business-analyzer';
import { AIAnalysisService, AIAnalysisOutput } from './ai-analysis-service';
import { BusinessIntelligenceLead } from '@/types/business-intelligence';

export interface ProcessingResult {
  success: boolean;
  businessName: string;
  leadId: string;
  error?: string;
  analysis?: AIAnalysisOutput;
}

export interface BulkProcessingStatus {
  totalLeads: number;
  processed: number;
  successful: number;
  failed: number;
  inProgress: boolean;
  currentBatch: number;
  totalBatches: number;
  results: ProcessingResult[];
  startTime?: Date;
  endTime?: Date;
  estimatedCost?: number;
}

export class BulkLeadProcessor {
  private businessAnalyzer: BusinessAnalyzerService;
  private aiAnalysis: AIAnalysisService;

  // Rate limiting settings (same as MCP)
  private batchSize: number = 5;
  private delayBetweenBatches: number = 90000; // 90 seconds
  private delayBetweenLeads: number = 5000; // 5 seconds

  constructor(googleApiKey: string, openaiApiKey: string) {
    this.businessAnalyzer = new BusinessAnalyzerService(googleApiKey);
    this.aiAnalysis = new AIAnalysisService(openaiApiKey, 'gpt-4o');
  }

  /**
   * Process multiple leads in batches with rate limiting
   */
  async processBulkLeads(leadIds?: string[], limit: number = 100): Promise<BulkProcessingStatus> {
    const status: BulkProcessingStatus = {
      totalLeads: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      inProgress: true,
      currentBatch: 0,
      totalBatches: 0,
      results: [],
      startTime: new Date()
    };

    try {
      console.log(`🚀 Starting bulk lead processing...`);

      // Fetch unanalyzed leads
      const leads = await this.fetchUnanalyzedLeads(leadIds, limit);
      status.totalLeads = leads.length;
      status.totalBatches = Math.ceil(leads.length / this.batchSize);
      status.estimatedCost = leads.length * 0.07; // $0.07 per lead estimate

      console.log(`📊 Found ${leads.length} leads to process in ${status.totalBatches} batches`);
      console.log(`💰 Estimated cost: $${status.estimatedCost.toFixed(2)}`);

      if (leads.length === 0) {
        console.log('✅ No unanalyzed leads found');
        status.inProgress = false;
        status.endTime = new Date();
        return status;
      }

      // Process in batches
      for (let i = 0; i < leads.length; i += this.batchSize) {
        const batch = leads.slice(i, i + this.batchSize);
        status.currentBatch = Math.floor(i / this.batchSize) + 1;

        console.log(`\n📦 Processing batch ${status.currentBatch}/${status.totalBatches} (${batch.length} leads)`);

        // Update leads to "In Progress"
        await this.updateLeadsStatus(batch.map(l => l.id), 'In Progress');

        // Process batch concurrently
        const batchResults = await Promise.all(
          batch.map(async (lead, idx) => {
            if (idx > 0) {
              await this.delay(this.delayBetweenLeads);
            }
            return this.processSingleLead(lead);
          })
        );

        // Update status
        for (const result of batchResults) {
          status.processed++;
          status.results.push(result);
          if (result.success) {
            status.successful++;
          } else {
            status.failed++;
          }
        }

        console.log(`✅ Batch ${status.currentBatch} complete: ${batchResults.filter(r => r.success).length}/${batch.length} successful`);

        // Delay between batches
        if (i + this.batchSize < leads.length) {
          console.log(`⏳ Waiting ${this.delayBetweenBatches / 1000} seconds before next batch...`);
          await this.delay(this.delayBetweenBatches);
        }
      }

      status.inProgress = false;
      status.endTime = new Date();

      const duration = ((status.endTime.getTime() - status.startTime!.getTime()) / 1000 / 60).toFixed(2);
      console.log(`\n🎉 Bulk processing complete!`);
      console.log(`   Total: ${status.totalLeads} leads`);
      console.log(`   Successful: ${status.successful}`);
      console.log(`   Failed: ${status.failed}`);
      console.log(`   Duration: ${duration} minutes`);

      return status;

    } catch (error) {
      console.error('❌ Error in bulk processing:', error);
      status.inProgress = false;
      status.endTime = new Date();
      return status;
    }
  }

  /**
   * Process a single lead
   */
  private async processSingleLead(lead: BusinessIntelligenceLead): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      success: false,
      businessName: lead.business_name,
      leadId: lead.id
    };

    try {
      console.log(`   🔍 Analyzing: ${lead.business_name}`);

      // Convert to BusinessData format
      const businessData: BusinessData = {
        businessName: lead.business_name,
        industry: lead.industry || '',
        website: lead.website || '',
        city: lead.city,
        country: lead.country,
        address: lead.address,
        zipCode: lead.zip_code,
        state: lead.state,
        googleMapsUrl: lead.google_maps_url
      };

      // 1. Analyze business
      const analysisResult: BusinessAnalysisResult = await this.businessAnalyzer.analyzeBusiness(businessData);

      // 2. Find competitors
      console.log(`   🏢 Finding competitors...`);
      analysisResult.competitors = await this.businessAnalyzer.findCompetitors(
        businessData.industry,
        businessData.city,
        businessData.country,
        businessData.businessName
      );

      // 3. AI Analysis
      console.log(`   🤖 Running AI analysis...`);
      const aiAnalysis = await this.aiAnalysis.analyzeBusinessData(analysisResult);
      result.analysis = aiAnalysis;

      // 4. Save results to database
      console.log(`   💾 Saving to database...`);
      await this.saveAnalysisResults(lead.id, aiAnalysis, analysisResult);

      result.success = true;
      console.log(`   ✅ ${lead.business_name} - Complete`);

    } catch (error) {
      console.error(`   ❌ ${lead.business_name} - Failed:`, error);
      result.error = error instanceof Error ? error.message : 'Unknown error';

      // Update lead status to Failed
      await this.updateLeadStatus(lead.id, 'Failed', result.error);
    }

    return result;
  }

  /**
   * Fetch unanalyzed leads from database
   */
  private async fetchUnanalyzedLeads(leadIds?: string[], limit: number = 100): Promise<BusinessIntelligenceLead[]> {
    const supabase = createClient();

    let query = supabase
      .from('business_intelligence_leads')
      .select('*')
      .in('analysis_status', ['Not Started', 'Failed'])
      .limit(limit);

    // Filter by specific lead IDs if provided
    if (leadIds && leadIds.length > 0) {
      query = query.in('id', leadIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching leads:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Update lead statuses to "In Progress"
   */
  private async updateLeadsStatus(leadIds: string[], status: string): Promise<void> {
    const supabase = createClient();

    await supabase
      .from('business_intelligence_leads')
      .update({ analysis_status: status })
      .in('id', leadIds);
  }

  /**
   * Update single lead status with error
   */
  private async updateLeadStatus(leadId: string, status: string, errorMessage?: string): Promise<void> {
    const supabase = createClient();

    await supabase
      .from('business_intelligence_leads')
      .update({
        analysis_status: status,
        error_message: errorMessage || null
      })
      .eq('id', leadId);
  }

  /**
   * Save analysis results to database
   */
  private async saveAnalysisResults(
    leadId: string,
    analysis: AIAnalysisOutput,
    businessResult: BusinessAnalysisResult
  ): Promise<void> {
    const supabase = createClient();

    // First, update the lead status
    await supabase
      .from('business_intelligence_leads')
      .update({
        analysis_status: 'Complete',
        error_message: null
      })
      .eq('id', leadId);

    // Then insert/upsert the analysis
    await supabase
      .from('business_analysis')
      .upsert({
        lead_id: leadId,
        summary: analysis.summary,
        outreach_angle: analysis.outreachAngle,
        pain_points: analysis.painPoints,
        automation_opportunities: analysis.automationOpportunities,
        recommended_services: analysis.recommendedServices || [],
        competitive_advantages: analysis.competitiveAdvantages || [],
        google_rating: businessResult.googlePlacesData?.rating || null,
        total_reviews: businessResult.googlePlacesData?.totalReviews || null,
        competitors_found: businessResult.competitors?.length || 0,
        detected_technologies: analysis.detectedTechnologies || null,
        competitor_insights: analysis.competitorInsights || null,
        review_sentiment: analysis.reviewSentiment || null,
        raw_data: {
          googlePlacesData: businessResult.googlePlacesData,
          websiteData: businessResult.websiteData,
          reviews: businessResult.reviews,
          competitors: businessResult.competitors
        },
        analyzed_at: new Date().toISOString()
      }, {
        onConflict: 'lead_id'
      });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
