// Business Analyzer Service
// Ported from cold-solutions-mcp-server/src/business-analyzer.ts

import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

export interface BusinessData {
  businessName: string;
  industry: string;
  website: string;
  city: string;
  country: string;
  notionPageId?: string;
  // Optional verification data
  address?: string;
  zipCode?: string;
  state?: string;
  googleMapsUrl?: string;
}

export interface BusinessAnalysisResult {
  businessInfo: BusinessData;
  googlePlacesData?: GooglePlacesData;
  websiteData?: WebsiteData;
  onlinePresence?: OnlinePresence;
  reviews?: Review[];
  competitors?: CompetitorData[];
  rawData: string; // Combined data for AI analysis
}

export interface GooglePlacesData {
  placeId?: string;
  rating?: number;
  totalReviews?: number;
  priceLevel?: string;
  types?: string[];
  phoneNumber?: string;
  address?: string;
  openingHours?: string[];
  website?: string;
}

export interface WebsiteData {
  title?: string;
  metaDescription?: string;
  headings: string[];
  services: string[];
  technologies: string[];
  hasContactForm: boolean;
  hasLiveChat: boolean;
  hasBookingSystem: boolean;
  socialLinks: string[];
  emailAddresses: string[];
  phoneNumbers: string[];
  aboutUsContent?: string;
  teamSize?: string;
  pricingMentioned?: boolean;
  detectedTools?: string[];
  pagesCrawled?: string[];
}

export interface OnlinePresence {
  hasWebsite: boolean;
  hasFacebook: boolean;
  hasLinkedIn: boolean;
  hasInstagram: boolean;
  hasTwitter: boolean;
  hasYelp: boolean;
  hasGoogleBusiness: boolean;
}

export interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
  source: string;
}

export interface CompetitorData {
  name: string;
  rating?: number;
  totalReviews?: number;
  address?: string;
  website?: string;
  priceLevel?: string;
}

export class BusinessAnalyzerService {
  private googleApiKey: string;

  constructor(googleApiKey: string) {
    this.googleApiKey = googleApiKey;
  }

  /**
   * Main method to analyze a business
   */
  async analyzeBusiness(businessData: BusinessData): Promise<BusinessAnalysisResult> {
    console.log(`🔍 Starting analysis for: ${businessData.businessName}`);

    const result: BusinessAnalysisResult = {
      businessInfo: businessData,
      rawData: ''
    };

    try {
      // 1. Get Google Places data
      console.log(`📍 Fetching Google Places data...`);

      // If Google Maps URL is provided, try to extract Place ID first
      if (businessData.googleMapsUrl) {
        const placeId = this.extractPlaceIdFromUrl(businessData.googleMapsUrl);
        if (placeId) {
          result.googlePlacesData = await this.getGooglePlacesDataByPlaceId(placeId);
        }
      }

      // Fallback to search if no direct Place ID
      if (!result.googlePlacesData) {
        const verificationData = {
          address: businessData.address,
          zipCode: businessData.zipCode,
          website: businessData.website,
          state: businessData.state
        };
        result.googlePlacesData = await this.getGooglePlacesData(
          businessData.businessName,
          businessData.city,
          businessData.country,
          verificationData
        );
      }

      // 2. Get website data if available
      if (businessData.website) {
        console.log(`🌐 Scraping website: ${businessData.website}`);
        result.websiteData = await this.scrapeWebsite(businessData.website);
      }

      // 3. Get online presence
      console.log(`📱 Checking online presence...`);
      result.onlinePresence = await this.checkOnlinePresence(businessData.businessName);

      // 4. Get reviews
      if (result.googlePlacesData?.placeId) {
        console.log(`⭐ Fetching reviews...`);
        result.reviews = await this.getReviews(result.googlePlacesData.placeId);
      }

      // 5. Compile raw data for AI analysis
      result.rawData = this.compileRawData(result);

      console.log(`✅ Analysis complete for: ${businessData.businessName}`);
      return result;

    } catch (error) {
      console.error(`❌ Error analyzing ${businessData.businessName}:`, error);
      result.rawData = this.compileRawData(result);
      return result;
    }
  }

  /**
   * Extract Place ID from Google Maps URL
   */
  extractPlaceIdFromUrl(googleMapsUrl: string): string | undefined {
    try {
      // Pattern 1: Place ID in URL path (e.g., /place/ChIJ...)
      const placeIdMatch = googleMapsUrl.match(/place\/([^\/]+)/);
      if (placeIdMatch && placeIdMatch[1].startsWith('ChIJ')) {
        return placeIdMatch[1].split('?')[0];
      }

      // Pattern 2: Place ID as query parameter
      const urlParams = new URL(googleMapsUrl).searchParams;
      const placeIdParam = urlParams.get('place_id');
      if (placeIdParam) {
        return placeIdParam;
      }

      return undefined;
    } catch (error) {
      console.error('Error extracting Place ID from URL:', error);
      return undefined;
    }
  }

  /**
   * Get Google Places data using direct Place ID
   */
  async getGooglePlacesDataByPlaceId(placeId: string): Promise<GooglePlacesData | undefined> {
    try {
      console.log(`  📍 Using direct Place ID: ${placeId}`);

      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,price_level,types,formatted_phone_number,formatted_address,opening_hours,website,reviews&key=${this.googleApiKey}`;

      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      if (detailsData.status !== 'OK') {
        console.log(`  ⚠️  Error fetching place details: ${detailsData.status}`);
        return undefined;
      }

      const place = detailsData.result;

      return {
        placeId,
        rating: place.rating,
        totalReviews: place.user_ratings_total,
        priceLevel: place.price_level ? '$'.repeat(place.price_level) : undefined,
        types: place.types,
        phoneNumber: place.formatted_phone_number,
        address: place.formatted_address,
        openingHours: place.opening_hours?.weekday_text,
        website: place.website
      };

    } catch (error) {
      console.error('Error fetching Google Places data by Place ID:', error);
      return undefined;
    }
  }

  /**
   * Get data from Google Places API with fallback to broader search
   */
  private async getGooglePlacesData(
    businessName: string,
    city: string,
    country: string,
    verificationData?: { address?: string; zipCode?: string; website?: string; state?: string }
  ): Promise<GooglePlacesData | undefined> {
    try {
      const query = `${businessName} ${city} ${country}`;
      const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address&key=${this.googleApiKey}`;

      let searchResponse = await fetch(searchUrl);
      let searchData = await searchResponse.json();

      // Fallback to broader search if no results
      if ((!searchData.candidates || searchData.candidates.length === 0) && verificationData?.state) {
        console.log(`⚠️  No results for ${city}, trying broader search with ${verificationData.state}...`);
        const fallbackQuery = `${businessName} ${verificationData.state} ${country}`;
        const fallbackUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(fallbackQuery)}&inputtype=textquery&fields=place_id,name,formatted_address&key=${this.googleApiKey}`;
        searchResponse = await fetch(fallbackUrl);
        searchData = await searchResponse.json();
      }

      if (!searchData.candidates || searchData.candidates.length === 0) {
        console.log(`⚠️  No Google Places data found for ${businessName}`);
        return undefined;
      }

      const placeId = searchData.candidates[0].place_id;

      // Get place details
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,price_level,types,formatted_phone_number,formatted_address,opening_hours,website,reviews&key=${this.googleApiKey}`;

      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      if (detailsData.status !== 'OK') {
        console.log(`⚠️  Error fetching place details: ${detailsData.status}`);
        return undefined;
      }

      const place = detailsData.result;

      return {
        placeId,
        rating: place.rating,
        totalReviews: place.user_ratings_total,
        priceLevel: place.price_level ? '$'.repeat(place.price_level) : undefined,
        types: place.types,
        phoneNumber: place.formatted_phone_number,
        address: place.formatted_address,
        openingHours: place.opening_hours?.weekday_text,
        website: place.website
      };

    } catch (error) {
      console.error('Error fetching Google Places data:', error);
      return undefined;
    }
  }

  /**
   * Scrape website for data
   */
  private async scrapeWebsite(websiteUrl: string): Promise<WebsiteData | undefined> {
    let browser;
    try {
      // Normalize URL
      let url = websiteUrl;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
      const page = await context.newPage();

      const websiteData: WebsiteData = {
        title: '',
        metaDescription: '',
        headings: [],
        services: [],
        technologies: [],
        hasContactForm: false,
        hasLiveChat: false,
        hasBookingSystem: false,
        socialLinks: [],
        emailAddresses: [],
        phoneNumbers: [],
        aboutUsContent: '',
        teamSize: '',
        pricingMentioned: false,
        detectedTools: [],
        pagesCrawled: []
      };

      // Pages to crawl
      const baseUrl = new URL(url);
      const pagesToCrawl = [
        url,
        `${baseUrl.origin}/about`,
        `${baseUrl.origin}/about-us`,
        `${baseUrl.origin}/services`,
        `${baseUrl.origin}/contact`
      ];

      let allHtml = '';

      for (const pageUrl of pagesToCrawl) {
        try {
          await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 15000 });
          const html = await page.content();
          allHtml += html + '\n';
          websiteData.pagesCrawled!.push(pageUrl);
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.log(`  ⚠️  Could not crawl ${pageUrl}`);
        }
      }

      await browser.close();

      const $ = cheerio.load(allHtml);
      const pageText = allHtml.toLowerCase();

      websiteData.title = $('title').first().text();
      websiteData.metaDescription = $('meta[name="description"]').first().attr('content');

      $('h1, h2, h3').each((_, el) => {
        const text = $(el).text().trim();
        if (text && websiteData.headings.length < 30) {
          websiteData.headings.push(text);
        }
      });

      websiteData.hasContactForm = $('form').length > 0;

      const chatIndicators = ['intercom', 'tawk.to', 'zendesk', 'drift', 'livechat'];
      websiteData.hasLiveChat = chatIndicators.some(indicator => pageText.includes(indicator));

      const bookingIndicators = ['calendly', 'acuity', 'booking', 'appointment'];
      websiteData.hasBookingSystem = bookingIndicators.some(indicator => pageText.includes(indicator));

      const techIndicators = [
        { name: 'WordPress', check: () => pageText.includes('wp-content') },
        { name: 'Shopify', check: () => pageText.includes('shopify') },
        { name: 'Wix', check: () => pageText.includes('wix.com') }
      ];

      websiteData.technologies = techIndicators
        .filter(tech => tech.check())
        .map(tech => tech.name);

      console.log(`  ✅ Crawled ${websiteData.pagesCrawled!.length} pages`);

      return websiteData;

    } catch (error) {
      console.error(`Error scraping website ${websiteUrl}:`, error);
      if (browser) {
        await browser.close();
      }
      return undefined;
    }
  }

  private async checkOnlinePresence(businessName: string): Promise<OnlinePresence> {
    return {
      hasWebsite: true,
      hasFacebook: false,
      hasLinkedIn: false,
      hasInstagram: false,
      hasTwitter: false,
      hasYelp: false,
      hasGoogleBusiness: false
    };
  }

  async getReviews(placeId: string): Promise<Review[]> {
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${this.googleApiKey}`;

      const response = await fetch(detailsUrl);
      const data = await response.json();

      if (data.status !== 'OK' || !data.result.reviews) {
        return [];
      }

      return data.result.reviews.slice(0, 5).map((review: any) => ({
        author: review.author_name,
        rating: review.rating,
        text: review.text,
        date: new Date(review.time * 1000).toISOString(),
        source: 'Google'
      }));

    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }

  private compileRawData(result: BusinessAnalysisResult): string {
    const sections: string[] = [];

    sections.push(`BUSINESS INFORMATION:
Name: ${result.businessInfo.businessName}
Industry: ${result.businessInfo.industry}
Location: ${result.businessInfo.city}, ${result.businessInfo.country}
Website: ${result.businessInfo.website || 'Not provided'}`);

    if (result.googlePlacesData) {
      sections.push(`\nGOOGLE BUSINESS PROFILE:
Rating: ${result.googlePlacesData.rating || 'N/A'} stars
Total Reviews: ${result.googlePlacesData.totalReviews || 0}
Price Level: ${result.googlePlacesData.priceLevel || 'Unknown'}
Phone: ${result.googlePlacesData.phoneNumber || 'N/A'}`);
    }

    if (result.websiteData) {
      sections.push(`\nWEBSITE ANALYSIS:
Has Contact Form: ${result.websiteData.hasContactForm ? 'Yes' : 'No'}
Has Live Chat: ${result.websiteData.hasLiveChat ? 'Yes' : 'No'}
Has Booking System: ${result.websiteData.hasBookingSystem ? 'Yes' : 'No'}
Technology Stack: ${result.websiteData.technologies.join(', ') || 'Unknown'}`);
    }

    if (result.reviews && result.reviews.length > 0) {
      sections.push(`\nRECENT REVIEWS (${result.reviews.length}):`);
      result.reviews.forEach((review, idx) => {
        sections.push(`Review ${idx + 1}: ${review.rating}★ - ${review.text.substring(0, 200)}`);
      });
    }

    return sections.join('\n');
  }

  async findCompetitors(
    industry: string,
    city: string,
    country: string,
    excludeBusinessName?: string
  ): Promise<CompetitorData[]> {
    try {
      const location = `${city}, ${country}`;

      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${this.googleApiKey}`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status !== 'OK' || !geocodeData.results[0]) {
        return [];
      }

      const { lat, lng } = geocodeData.results[0].geometry.location;

      const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=${this.getGooglePlaceType(industry)}&key=${this.googleApiKey}`;

      const nearbyResponse = await fetch(nearbyUrl);
      const nearbyData = await nearbyResponse.json();

      if (nearbyData.status !== 'OK') {
        return [];
      }

      const competitors: CompetitorData[] = [];

      for (const place of nearbyData.results.slice(0, 5)) {
        if (excludeBusinessName && place.name.toLowerCase().includes(excludeBusinessName.toLowerCase())) {
          continue;
        }

        competitors.push({
          name: place.name,
          rating: place.rating,
          totalReviews: place.user_ratings_total,
          address: place.vicinity,
          priceLevel: place.price_level ? '$'.repeat(place.price_level) : undefined
        });

        await new Promise(resolve => setTimeout(resolve, 200));
      }

      return competitors;

    } catch (error) {
      console.error('Error finding competitors:', error);
      return [];
    }
  }

  private getGooglePlaceType(industry: string): string {
    const industryMap: Record<string, string> = {
      'restaurant': 'restaurant',
      'hvac': 'plumber',
      'plumbing': 'plumber',
      'construction': 'general_contractor',
      'law': 'lawyer',
      'accounting': 'accounting',
      'real estate': 'real_estate_agency'
    };

    const normalized = industry.toLowerCase();
    for (const [key, value] of Object.entries(industryMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }

    return 'establishment';
  }
}
