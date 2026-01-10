'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BusinessIntelligenceComplete } from '@/types/business-intelligence';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import StandardSidebar from '@/components/StandardSidebar';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<BusinessIntelligenceComplete | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/business-intelligence/leads?leadIds=${leadId}`);
      const data = await response.json();

      if (data.leads && data.leads.length > 0) {
        setLead(data.leads[0]);
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePushToCaller = async () => {
    if (!lead) return;

    const confirmed = confirm(`Push "${lead.business_name}" to Cold Caller?`);
    if (!confirmed) return;

    try {
      const response = await fetch('/api/business-intelligence/push-to-caller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: [lead.id] })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Successfully pushed to Cold Caller!\nLead List: ${data.leadListName}`);
        fetchLead();
      } else {
        alert('Push failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error pushing lead:', error);
      alert('Push failed');
    }
  };

  const handleReanalyze = async () => {
    if (!lead) return;

    const confirmed = confirm(`Re-analyze "${lead.business_name}"?\n\nThis will cost approximately $0.07.`);
    if (!confirmed) return;

    try {
      const response = await fetch('/api/business-intelligence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: [lead.id] })
      });

      const data = await response.json();

      if (data.success) {
        alert('Re-analysis complete!');
        fetchLead();
      } else {
        alert('Re-analysis failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error re-analyzing:', error);
      alert('Re-analysis failed');
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <StandardSidebar />
        <main className="flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
          <div className="p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex">
        <StandardSidebar />
        <main className="flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
          <div className="p-6">
            <p className="text-red-600">Lead not found</p>
            <Link href="/leads/intelligence" className="text-blue-600 hover:underline mt-4 inline-block">
              ← Back to Leads
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <StandardSidebar />
      <main className="flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
        <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/leads/intelligence" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Leads
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{lead.business_name}</h1>
            <p className="text-gray-600 mt-1">
              {lead.industry && <span>{lead.industry} • </span>}
              {lead.city}, {lead.country}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleReanalyze} variant="outline">
              🔄 Re-analyze
            </Button>
            {lead.analysis_status === 'Complete' && !lead.pushed_to_caller && (
              <Button onClick={handlePushToCaller} className="bg-green-600 hover:bg-green-700">
                📤 Push to Caller
              </Button>
            )}
            {lead.pushed_to_caller && (
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-medium">
                ✓ Pushed to Caller
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Business Info Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Business Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Website</label>
            <p className="font-medium">
              {lead.website ? (
                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {lead.website}
                </a>
              ) : '-'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <p className="font-medium">{lead.phone || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Address</label>
            <p className="font-medium">{lead.address || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Google Rating</label>
            <p className="font-medium">
              {lead.google_rating ? `${lead.google_rating} ⭐ (${lead.total_reviews} reviews)` : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      {lead.summary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Executive Summary</h2>
          <p className="text-gray-800 leading-relaxed">{lead.summary}</p>
        </div>
      )}

      {/* Outreach Angle */}
      {lead.outreach_angle && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">📞 Outreach Angle</h2>
          <p className="text-gray-800 leading-relaxed italic">{lead.outreach_angle}</p>
          <button
            onClick={() => navigator.clipboard.writeText(lead.outreach_angle!)}
            className="mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            📋 Copy to clipboard
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Pain Points */}
        {lead.pain_points && lead.pain_points.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🎯 Pain Points</h2>
            <ul className="space-y-2">
              {lead.pain_points.map((point, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="text-gray-800">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Automation Opportunities */}
        {lead.automation_opportunities && lead.automation_opportunities.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">⚡ Automation Opportunities</h2>
            <ul className="space-y-2">
              {lead.automation_opportunities.map((opp, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-800">{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommended Services */}
      {lead.recommended_services && lead.recommended_services.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">💼 Recommended Services</h2>
          <div className="flex flex-wrap gap-2">
            {lead.recommended_services.map((service, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {service}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Competitive Insights */}
      {lead.competitor_insights && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🏆 Competitive Analysis</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Market Position</h3>
              <p className="text-lg font-semibold text-blue-600">{lead.competitor_insights.marketPosition}</p>

              <h3 className="font-medium text-gray-700 mb-2 mt-4">Main Competitors ({lead.competitors_found})</h3>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {lead.competitor_insights.mainCompetitors.map((comp, idx) => (
                  <li key={idx}>{comp}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">Competitor Weaknesses</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {lead.competitor_insights.competitorWeaknesses.map((weak, idx) => (
                  <li key={idx}>{weak}</li>
                ))}
              </ul>

              <h3 className="font-medium text-gray-700 mb-2 mt-4">Differentiation Opportunities</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {lead.competitor_insights.differentiationOpportunities.map((opp, idx) => (
                  <li key={idx}>{opp}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Review Sentiment */}
      {lead.review_sentiment && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">⭐ Review Sentiment Analysis</h2>
          <div className="mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Sentiment Score:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    lead.review_sentiment.sentimentScore >= 75 ? 'bg-green-500' :
                    lead.review_sentiment.sentimentScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${lead.review_sentiment.sentimentScore}%` }}
                ></div>
              </div>
              <span className="font-semibold">{lead.review_sentiment.sentimentScore}/100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-red-600 mb-2">Common Complaints</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {lead.review_sentiment.commonComplaints.map((complaint, idx) => (
                  <li key={idx}>{complaint}</li>
                ))}
              </ul>

              {lead.review_sentiment.urgentIssues.length > 0 && (
                <>
                  <h3 className="font-medium text-red-700 mb-2 mt-4">⚠️ Urgent Issues</h3>
                  <ul className="list-disc list-inside text-sm text-red-700 font-medium space-y-1">
                    {lead.review_sentiment.urgentIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div>
              <h3 className="font-medium text-green-600 mb-2">Common Praises</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {lead.review_sentiment.commonPraises.map((praise, idx) => (
                  <li key={idx}>{praise}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Detected Technologies */}
      {lead.detected_technologies && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🛠️ Detected Technologies</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">CRM:</span>
              <span className="ml-2 font-medium">{lead.detected_technologies.crm || 'None'}</span>
            </div>
            <div>
              <span className="text-gray-600">Booking System:</span>
              <span className="ml-2 font-medium">{lead.detected_technologies.bookingSystem || 'None'}</span>
            </div>
            <div>
              <span className="text-gray-600">Live Chat:</span>
              <span className="ml-2 font-medium">{lead.detected_technologies.liveChat || 'None'}</span>
            </div>
            <div>
              <span className="text-gray-600">Phone System:</span>
              <span className="ml-2 font-medium">{lead.detected_technologies.phoneSystem || 'None'}</span>
            </div>
            <div>
              <span className="text-gray-600">Email Marketing:</span>
              <span className="ml-2 font-medium">{lead.detected_technologies.emailMarketing || 'None'}</span>
            </div>
          </div>
          {lead.detected_technologies.other && lead.detected_technologies.other.length > 0 && (
            <div className="mt-4">
              <span className="text-gray-600 text-sm">Other: </span>
              {lead.detected_technologies.other.map((tech, idx) => (
                <span key={idx} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-2 mt-1">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
        </div>
      </main>
    </div>
  );
}
