'use client'

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

interface StandardSidebarProps {
  className?: string;
}

export default function StandardSidebar({ className = '' }: StandardSidebarProps) {
  const [leadsDropdownOpen, setLeadsDropdownOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const getActiveStyle = (path: string) => {
    return isActive(path)
      ? { backgroundColor: '#3dbff2' }
      : {};
  };

  const getActiveClass = (path: string) => {
    return isActive(path)
      ? 'text-white'
      : 'text-white hover:bg-opacity-20 hover:bg-white';
  };

  return (
    <div className={`flex min-h-screen w-72 flex-col justify-between text-white p-4 ${className}`} style={{backgroundColor: '#0a2240'}}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col p-4">
          <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
          <p className="text-sm font-normal leading-normal" style={{color: '#a0a0a0'}}>Your Business, Streamlined</p>
        </div>

        <nav className="flex flex-col gap-2">
          {/* Dashboard */}
          <a
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass('/')}`}
            style={getActiveStyle('/')}
            href="/"
          >
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>dashboard</span>
            <p className="text-sm font-medium leading-normal">Dashboard</p>
          </a>

          {/* Leads Database Dropdown */}
          <div className="flex flex-col">
            <button
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg w-full text-left transition-colors ${getActiveClass('/leads')}`}
              style={getActiveStyle('/leads')}
              onClick={() => setLeadsDropdownOpen(!leadsDropdownOpen)}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined" style={{fontSize: '20px'}}>group</span>
                <p className="text-sm font-medium leading-normal">Leads Database</p>
              </div>
              <span className={`material-symbols-outlined transition-transform ${leadsDropdownOpen ? 'rotate-180' : ''}`} style={{fontSize: '16px'}}>
                expand_more
              </span>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${leadsDropdownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="ml-4 mt-2 flex flex-col gap-1">
                <a className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-opacity-20 hover:bg-white text-white text-sm transition-colors" href="/leads">
                  <span className="material-symbols-outlined" style={{fontSize: '16px'}}>database</span>
                  <p className="text-sm leading-normal">All Leads</p>
                </a>
                <a className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-opacity-20 hover:bg-white text-white text-sm transition-colors" href="/database/Cold Solutions Inbound">
                  <span className="material-symbols-outlined" style={{fontSize: '16px'}}>call_received</span>
                  <p className="text-sm leading-normal">Inbound Leads</p>
                </a>
                <a className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-opacity-20 hover:bg-white text-white text-sm transition-colors" href="/database/website-leads">
                  <span className="material-symbols-outlined" style={{fontSize: '16px'}}>language</span>
                  <p className="text-sm leading-normal">Website Leads</p>
                </a>
                <a className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-opacity-20 hover:bg-white text-white text-sm transition-colors" href="/database/ai-audit-pre-call">
                  <span className="material-symbols-outlined" style={{fontSize: '16px'}}>psychology</span>
                  <p className="text-sm leading-normal">AI Audit (Pre-Call)</p>
                </a>
                <a className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-opacity-20 hover:bg-white text-white text-sm transition-colors" href="/database/ai-audit-post-call">
                  <span className="material-symbols-outlined" style={{fontSize: '16px'}}>psychology_alt</span>
                  <p className="text-sm leading-normal">AI Audit (Post-Call)</p>
                </a>
                <a className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-opacity-20 hover:bg-white text-white text-sm transition-colors" href="/database/Whats App followup leads">
                  <span className="material-symbols-outlined" style={{fontSize: '16px'}}>chat</span>
                  <p className="text-sm leading-normal">WhatsApp Follow-up</p>
                </a>
                <a className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-opacity-20 hover:bg-white text-white text-sm transition-colors" href="/database/Whatsapp bot leads">
                  <span className="material-symbols-outlined" style={{fontSize: '16px'}}>smart_toy</span>
                  <p className="text-sm leading-normal">WhatsApp Bot Leads</p>
                </a>
                <a className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-opacity-20 hover:bg-white text-white text-sm transition-colors" href="/leads/management">
                  <span className="material-symbols-outlined" style={{fontSize: '16px'}}>settings</span>
                  <p className="text-sm leading-normal">Advanced Management</p>
                </a>
                <a className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-opacity-20 hover:bg-white text-white text-sm transition-colors" href="/leads/duplicates">
                  <span className="material-symbols-outlined" style={{fontSize: '16px'}}>content_copy</span>
                  <p className="text-sm leading-normal">Duplicates</p>
                </a>
              </div>
            </div>
          </div>

          {/* Email Management */}
          <a
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass('/email')}`}
            style={getActiveStyle('/email')}
            href="/email"
          >
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>email</span>
            <p className="text-sm font-medium leading-normal">Email Management</p>
          </a>

          {/* Automation Hub */}
          <a
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass('/automation')}`}
            style={getActiveStyle('/automation')}
            href="/automation"
          >
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>smart_toy</span>
            <p className="text-sm font-medium leading-normal">Automation Hub</p>
          </a>

          {/* Performance Analytics */}
          <a
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass('/analytics')}`}
            style={getActiveStyle('/analytics')}
            href="/analytics"
          >
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>analytics</span>
            <p className="text-sm font-medium leading-normal">Performance Analytics</p>
          </a>

          {/* Operations Console */}
          <a
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass('/operations')}`}
            style={getActiveStyle('/operations')}
            href="/operations"
          >
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>dvr</span>
            <p className="text-sm font-medium leading-normal">Operations Console</p>
          </a>

          {/* Calls Database */}
          <a
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${getActiveClass('/calls')}`}
            style={getActiveStyle('/calls')}
            href="/calls"
          >
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>phone_in_talk</span>
            <p className="text-sm font-medium leading-normal">Calls Database</p>
          </a>
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        <div className="px-4 py-3 rounded-lg bg-opacity-10 bg-white">
          <p className="text-xs font-medium" style={{color: '#a0a0a0'}}>SIGNED IN AS</p>
          <p className="text-sm font-medium text-white">User</p>
          <p className="text-xs" style={{color: '#a0a0a0'}}>user@example.com</p>
        </div>
        <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white transition-colors" href="/settings">
          <span className="material-symbols-outlined" style={{fontSize: '20px'}}>settings</span>
          <p className="text-sm font-medium leading-normal">Settings</p>
        </a>
      </div>
    </div>
  );
}