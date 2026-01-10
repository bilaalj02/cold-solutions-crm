// AI Analysis Service
// Ported from cold-solutions-mcp-server/src/ai-analysis-service.ts

import OpenAI from 'openai';
import { BusinessAnalysisResult } from './business-analyzer';
import {
  DetectedTechnologies,
  CompetitorInsights,
  ReviewSentiment
} from '@/types/business-intelligence';

export interface AIAnalysisOutput {
  automationOpportunities: string[];
  painPoints: string[];
  summary: string;
  outreachAngle: string;
  competitiveAdvantages?: string[];
  recommendedServices?: string[];
  detectedTechnologies?: DetectedTechnologies;
  competitorInsights?: CompetitorInsights;
  reviewSentiment?: ReviewSentiment;
}

export class AIAnalysisService {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o') {
    this.openai = new OpenAI({ apiKey });
    this.model = model;
  }

  /**
   * Analyze business data using OpenAI
   */
  async analyzeBusinessData(analysisResult: BusinessAnalysisResult): Promise<AIAnalysisOutput> {
    console.log(`🤖 Starting AI analysis for ${analysisResult.businessInfo.businessName}...`);

    try {
      const prompt = this.buildAnalysisPrompt(analysisResult);

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(analysisResult.businessInfo.industry)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3500,
        response_format: { type: 'json_object' }
      });

      const responseText = completion.choices[0].message.content;
      if (!responseText) {
        throw new Error('No response from OpenAI');
      }

      const analysis = JSON.parse(responseText) as AIAnalysisOutput;

      console.log(`✅ AI analysis complete for ${analysisResult.businessInfo.businessName}`);
      console.log(`   - Found ${analysis.automationOpportunities.length} automation opportunities`);
      console.log(`   - Identified ${analysis.painPoints.length} pain points`);

      return analysis;

    } catch (error) {
      console.error(`❌ Error in AI analysis:`, error);

      // Return fallback analysis
      return {
        automationOpportunities: ['Unable to analyze - AI service error'],
        painPoints: ['Unable to analyze - AI service error'],
        summary: `Analysis failed for ${analysisResult.businessInfo.businessName}`,
        outreachAngle: 'Please retry analysis'
      };
    }
  }

  private getSystemPrompt(industry?: string): string {
    return `You are an expert business automation consultant and competitive intelligence analyst specializing in AI solutions for small to medium businesses.

Your expertise includes:
- Identifying automation opportunities and pain points
- Analyzing competitor landscapes and market positioning
- Detecting existing technology stacks from website and business data
- Deep sentiment analysis of customer reviews
- Industry-specific insights and recommendations

Your analysis should be:
- Highly specific and actionable
- ROI-focused with quantifiable benefits
- Tailored to the business's industry and maturity level
- Grounded in the actual data provided (no assumptions)

Focus on automation opportunities that Cold Solutions provides:
- AI Receptionist (24/7 call handling, appointment booking)
- AI Chatbot (website engagement, lead qualification)
- Free AI Audit (business process analysis)
- Database Reactivation (re-engage past customers)
- Custom Automation (workflows, integrations, CRM)`;
  }

  private buildAnalysisPrompt(analysisResult: BusinessAnalysisResult): string {
    const { businessInfo, googlePlacesData, websiteData, reviews, competitors } = analysisResult;

    let prompt = `Analyze the following business and provide comprehensive insights in JSON format.

BUSINESS DETAILS:
${analysisResult.rawData}

Provide your analysis in the following JSON structure:
{
  "automationOpportunities": [
    "List 3-5 specific, actionable automation opportunities with estimated ROI impact"
  ],
  "painPoints": [
    "List 3-5 specific pain points based on review analysis, website gaps, or industry patterns"
  ],
  "summary": "2-3 sentence summary covering: business type, digital maturity level, and market position",
  "outreachAngle": "A compelling 2-3 sentence outreach message that connects specific pain points to concrete solutions",
  "competitiveAdvantages": [
    "List 2-3 actual advantages they have over competitors based on reviews/data"
  ],
  "recommendedServices": [
    "List 2-3 specific Cold Solutions services that would benefit them most"
  ],
  "detectedTechnologies": {
    "crm": "Name of CRM if detected or null",
    "bookingSystem": "Name of booking system if detected or null",
    "liveChat": "Name of live chat tool if detected or null",
    "phoneSystem": "Phone system if detected or null",
    "emailMarketing": "Email platform if detected or null",
    "other": ["Other detected technologies"]
  },
  "competitorInsights": {
    "mainCompetitors": ["List 2-3 primary competitors by name"],
    "competitorWeaknesses": ["List 2-3 weaknesses you can identify"],
    "differentiationOpportunities": ["List 2-3 ways to stand out using automation"],
    "marketPosition": "Leader/Strong Player/Middle of Pack/Lagging Behind"
  },
  "reviewSentiment": {
    "commonComplaints": ["Extract 3-5 complaint themes from reviews"],
    "commonPraises": ["Extract 3-5 praise themes from reviews"],
    "urgentIssues": ["List 1-3 critical issues"],
    "sentimentScore": 75,
    "reviewThemes": ["List 3-5 major themes"]
  }
}

ANALYSIS GUIDELINES:`;

    if (websiteData) {
      prompt += `\n\n📱 TECHNOLOGY DETECTION:`;
      prompt += `\n- Website has live chat: ${websiteData.hasLiveChat ? 'YES' : 'NO'}`;
      prompt += `\n- Website has booking system: ${websiteData.hasBookingSystem ? 'YES' : 'NO'}`;
      if (!websiteData.hasLiveChat && !websiteData.hasBookingSystem) {
        prompt += `\n- OPPORTUNITY: Missing both live chat and booking - high-priority recommendations`;
      }
    }

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      prompt += `\n\n⭐ REVIEW ANALYSIS (${reviews.length} reviews, avg ${avgRating.toFixed(1)}/5):`;
      prompt += `\n- Extract specific complaints and praises from review texts`;
      prompt += `\n- Calculate sentimentScore: 90+ = Excellent, 75-89 = Good, 60-74 = Fair, <60 = Poor`;
    }

    if (competitors && competitors.length > 0) {
      prompt += `\n\n🏆 COMPETITOR ANALYSIS (${competitors.length} competitors found):`;
      prompt += `\n- Emphasize automation as competitive edge`;
    }

    prompt += `\n\n💡 FINAL REMINDERS:`;
    prompt += `\n- Be SPECIFIC: Use actual data points and numbers`;
    prompt += `\n- Be ACTIONABLE: Clear implementation paths`;
    prompt += `\n- Be ROI-FOCUSED: Quantify benefits`;
    prompt += `\n- ONLY use information provided`;
    prompt += `\n\nProvide analysis in valid JSON format only.`;

    return prompt;
  }
}
