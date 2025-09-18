import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Retell AI Agent interface
export interface RetellAgent {
  agent_id: string;
  agent_name: string;
  voice_id: string;
  language: string;
  response_engine: {
    type: string;
    llm_id?: string;
  };
  interruption_sensitivity?: number;
  responsiveness?: number;
  enable_backchannel?: boolean;
  reminder_trigger_ms?: number;
  reminder_max_count?: number;
  ambient_sound?: string;
  last_modification_timestamp: number;
  created_timestamp: number;
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const retellApiKey = process.env.RETELL_API_KEY;

    if (!retellApiKey) {
      console.error('❌ RETELL_API_KEY not found in environment variables');
      return NextResponse.json({
        success: false,
        message: 'Retell API key not configured',
        agents: []
      }, { status: 500, headers: corsHeaders });
    }

    console.log('🔑 Retell API Key loaded:', retellApiKey ? `${retellApiKey.substring(0, 8)}...` : 'none');

    // Fetch agents from Retell AI API
    const response = await fetch('https://api.retellai.com/list-agents', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${retellApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch agents from Retell AI:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
        url: 'https://api.retellai.com/list-agents',
        headers: response.headers
      });
      return NextResponse.json({
        success: false,
        message: `Failed to fetch agents from Retell AI: ${response.status} ${response.statusText}`,
        agents: [],
        debug: { status: response.status, error: errorText }
      }, { status: response.status, headers: corsHeaders });
    }

    const data = await response.json();
    console.log('✅ Raw Retell AI response:', JSON.stringify(data, null, 2));
    console.log('✅ Successfully fetched Retell AI agents:', data.agents?.length || 0, 'agents');

    // Handle different possible response structures
    let agentsList = data.agents || data || [];
    if (!Array.isArray(agentsList)) {
      console.log('⚠️ Expected array but got:', typeof agentsList, agentsList);
      agentsList = [];
    }

    console.log('📋 Processing agents list:', agentsList.length, 'items');

    // Transform agent data for the UI
    const transformedAgents = agentsList.map((agent: RetellAgent) => {
      try {
        return {
      id: agent.agent_id,
      name: agent.agent_name || `Agent ${agent.agent_id.slice(-4)}`,
      status: 'active', // Retell AI doesn't provide real-time status, assume active
      voice_id: agent.voice_id,
      language: agent.language || 'en-US',
      response_engine: agent.response_engine?.type || 'unknown',
      last_modified: (() => {
        try {
          return agent.last_modification_timestamp ? new Date(agent.last_modification_timestamp).toISOString() : new Date().toISOString();
        } catch (e) {
          console.warn('Invalid timestamp for agent', agent.agent_id, ':', agent.last_modification_timestamp);
          return new Date().toISOString();
        }
      })(),
      created: (() => {
        try {
          return agent.last_modification_timestamp ? new Date(agent.last_modification_timestamp).toISOString() : new Date().toISOString();
        } catch (e) {
          return new Date().toISOString();
        }
      })(),
      settings: {
        interruption_sensitivity: agent.interruption_sensitivity,
        responsiveness: agent.responsiveness,
        enable_backchannel: agent.enable_backchannel,
        reminder_trigger_ms: agent.reminder_trigger_ms,
        reminder_max_count: agent.reminder_max_count,
        ambient_sound: agent.ambient_sound
      }
    };
      } catch (error) {
        console.error('Error transforming agent:', agent?.agent_id, error);
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      agents: transformedAgents,
      total: transformedAgents.length,
      timestamp: new Date().toISOString(),
      debug: {
        rawDataKeys: Object.keys(data),
        agentsProperty: !!data.agents,
        dataType: typeof data,
        hasAnyAgents: transformedAgents.length > 0
      }
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ Error fetching Retell AI agents:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error while fetching agents',
      agents: []
    }, { status: 500, headers: corsHeaders });
  }
}