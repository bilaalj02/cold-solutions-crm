'use client';

import { BusinessIntelligenceComplete } from '@/types/business-intelligence';
import Link from 'next/link';

interface LeadTableProps {
  leads: BusinessIntelligenceComplete[];
  loading: boolean;
  selectedLeads: string[];
  onSelectionChange: (selected: string[]) => void;
  onRefresh: () => void;
}

export default function LeadTable({
  leads,
  loading,
  selectedLeads,
  onSelectionChange,
  onRefresh
}: LeadTableProps) {
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelectionChange(leads.map(l => l.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedLeads.includes(id)) {
      onSelectionChange(selectedLeads.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedLeads, id]);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Not Started': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Complete': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">No leads found. Import a CSV to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedLeads.length === leads.length}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Business Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Industry
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rating
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Opportunities
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Pushed
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className={`hover:bg-gray-50 ${selectedLeads.includes(lead.id) ? 'bg-blue-50' : ''}`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={() => handleSelectOne(lead.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{lead.business_name}</div>
                  {lead.website && (
                    <div className="text-xs text-gray-500 truncate max-w-xs">{lead.website}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {lead.industry || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {lead.city}, {lead.country}
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(lead.analysis_status)}
                  {lead.error_message && (
                    <div className="text-xs text-red-600 mt-1" title={lead.error_message}>
                      Error
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {lead.google_rating ? (
                    <div>
                      <div className="font-medium">{lead.google_rating} ⭐</div>
                      <div className="text-xs text-gray-500">{lead.total_reviews} reviews</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {lead.automation_opportunities && lead.automation_opportunities.length > 0 ? (
                    <span className="text-green-600 font-medium">
                      {lead.automation_opportunities.length} found
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {lead.pushed_to_caller ? (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      ✓ Pushed
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {lead.analysis_status === 'Complete' ? (
                    <Link
                      href={`/leads/intelligence/${lead.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          Showing {leads.length} leads · {selectedLeads.length} selected
        </p>
      </div>
    </div>
  );
}
