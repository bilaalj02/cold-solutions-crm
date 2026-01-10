'use client'

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../lib/auth';

interface StandardSidebarProps {
  className?: string;
}

export default function StandardSidebar({ className = '' }: StandardSidebarProps) {
  const [leadsDropdownOpen, setLeadsDropdownOpen] = useState(false);
  const [emailDropdownOpen, setEmailDropdownOpen] = useState(false);
  const [voiceAIDropdownOpen, setVoiceAIDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const getActiveClass = (path: string) => {
    return isActive(path)
      ? 'glass-button text-white shadow-lg'
      : 'text-gray-200 hover:glass-button';
  };

  // Define navigation items in a fixed order
  const navigationItems = [
    {
      path: '/',
      icon: 'dashboard',
      label: 'Dashboard',
      type: 'link'
    },
    {
      path: '/leads',
      icon: 'groups',
      label: 'Leads Database',
      type: 'dropdown',
      subItems: [
        { path: '/leads', icon: 'database', label: 'All Leads' },
        { path: '/leads/intelligence', icon: 'psychology', label: 'Business Intelligence' },
        { path: '/leads/database/website-leads', icon: 'language', label: 'Cold Solutions Website' },
        { path: '/leads/database/inbound', icon: 'call_received', label: 'Inbound Leads' },
        { path: '/leads/database/ai-audit-pre-call', icon: 'psychology', label: 'AI Audit (Pre-Call)' },
        { path: '/leads/database/ai-audit-post-call', icon: 'psychology_alt', label: 'AI Audit (Post-Call)' },
        { path: '/leads/database/new-lead-database', icon: 'phone_in_talk', label: 'CRM Database' }
      ]
    },
    {
      path: '/email',
      icon: 'mail',
      label: 'Email Management',
      type: 'dropdown',
      subItems: [
        { path: '/email', icon: 'dashboard', label: 'Overview' },
        { path: '/email/inbox', icon: 'inbox', label: 'Inbox' },
        { path: '/email/logs', icon: 'receipt_long', label: 'Email Logs' },
        { path: '/email/settings', icon: 'settings', label: 'Settings' }
      ]
    },
    {
      path: '/automation',
      icon: 'precision_manufacturing',
      label: 'Automation Hub',
      type: 'link'
    },
    {
      path: '/analytics',
      icon: 'insights',
      label: 'Performance Analytics',
      type: 'link'
    },
    {
      path: '/operations',
      icon: 'monitor_heart',
      label: 'Operations Console',
      type: 'link'
    },
    {
      path: '/calls',
      icon: 'call',
      label: 'Calls Database',
      type: 'link'
    },
    {
      path: '/voice-ai',
      icon: 'robot',
      label: 'Voice AI Caller',
      type: 'dropdown',
      subItems: [
        { path: '/voice-ai/leads', icon: 'contact_page', label: 'Leads' },
        { path: '/voice-ai/campaigns', icon: 'campaign', label: 'Campaigns' },
        { path: '/voice-ai/queue', icon: 'list_alt', label: 'Call Queue' },
        { path: '/voice-ai/call-logs', icon: 'history', label: 'Call Logs' },
        { path: '/voice-ai/analytics', icon: 'analytics', label: 'Analytics' },
        { path: '/voice-ai/settings', icon: 'tune', label: 'Settings' }
      ]
    }
  ];

  return (
    <div
      className={`flex min-h-screen flex-col justify-between text-white p-4 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'} ${className}`}
      style={{
        position: 'relative',
        zIndex: 50,
        background: 'rgba(10, 34, 64, 0.98)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '4px 0 24px 0 rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 glass-button rounded-full p-2 text-white hover:scale-110 transition-transform z-20"
        style={{
          background: 'rgba(61, 191, 242, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 12px rgba(61, 191, 242, 0.3)'
        }}
      >
        <span className="material-symbols-outlined text-lg">
          {isCollapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>

      <div className="flex flex-col gap-8">
        {/* Logo Section */}
        <div className="flex flex-col p-4">
          {!isCollapsed ? (
            <>
              <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
              <p className="text-sm font-normal leading-normal text-gray-300">Your Business, Streamlined</p>
            </>
          ) : (
            <div className="flex items-center justify-center">
              <span className="text-2xl font-bold text-white">CS</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navigationItems.map((item) => (
            <div key={item.path} className="flex flex-col">
              {item.type === 'link' ? (
                <Link
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${getActiveClass(item.path)}`}
                  href={item.path}
                  title={isCollapsed ? item.label : ''}
                >
                  <span className="material-symbols-outlined" style={{fontSize: '20px'}}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="text-sm font-medium leading-normal">{item.label}</span>
                  )}
                </Link>
              ) : (
                <>
                  <button
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl w-full text-left transition-all ${getActiveClass(item.path)}`}
                    onClick={() => {
                      if (!isCollapsed) {
                        if (item.path === '/leads') {
                          setLeadsDropdownOpen(!leadsDropdownOpen);
                        } else if (item.path === '/email') {
                          setEmailDropdownOpen(!emailDropdownOpen);
                        } else if (item.path === '/voice-ai') {
                          setVoiceAIDropdownOpen(!voiceAIDropdownOpen);
                        }
                      }
                    }}
                    title={isCollapsed ? item.label : ''}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined" style={{fontSize: '20px'}}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="text-sm font-medium leading-normal">{item.label}</span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <span
                        className={`material-symbols-outlined transition-transform duration-300 ${
                          (item.path === '/leads' && leadsDropdownOpen) || (item.path === '/email' && emailDropdownOpen) || (item.path === '/voice-ai' && voiceAIDropdownOpen) ? 'rotate-180' : ''
                        }`}
                        style={{fontSize: '16px'}}
                      >
                        expand_more
                      </span>
                    )}
                  </button>

                  {!isCollapsed && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        ((item.path === '/leads' && leadsDropdownOpen) || (item.path === '/email' && emailDropdownOpen) || (item.path === '/voice-ai' && voiceAIDropdownOpen)) ? 'max-h-[600px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="ml-4 flex flex-col gap-1">
                        {item.subItems?.map((subItem) => (
                          <Link
                            key={subItem.path}
                            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:glass-button text-gray-200 text-sm transition-all"
                            href={subItem.path}
                          >
                            <span className="material-symbols-outlined" style={{fontSize: '16px'}}>
                              {subItem.icon}
                            </span>
                            <span className="text-sm leading-normal">{subItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-2">
        {user && !isCollapsed && (
          <div className="px-4 py-3 rounded-xl glass-button">
            <p className="text-xs font-medium text-gray-400">SIGNED IN AS</p>
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-gray-300">{user.email}</p>
            <p className="text-xs mt-1 text-gray-400">{user.role}</p>
          </div>
        )}

        <Link
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:glass-button text-gray-200 transition-all"
          href="/settings"
          title={isCollapsed ? 'Settings' : ''}
        >
          <span className="material-symbols-outlined" style={{fontSize: '20px'}}>settings</span>
          {!isCollapsed && (
            <span className="text-sm font-medium leading-normal">Settings</span>
          )}
        </Link>

        {user && (
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:glass-button text-gray-200 transition-all"
            title={isCollapsed ? 'Sign Out' : ''}
          >
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>logout</span>
            {!isCollapsed && (
              <span className="text-sm font-medium leading-normal">Sign Out</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}