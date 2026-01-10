import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer;

    // Parse the incoming form data
    const body = await request.json();

    const {
      name,
      email,
      phone,
      company,
      position,
      service, // Which service/button they clicked
      message,
      // Additional fields that might come from forms
      ...additionalFields
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    console.log(`📥 New website lead: ${name} from ${service || 'website'}`);

    // Determine the source based on the service/button clicked
    const leadSource = service || 'Website';

    // Map service to tags
    const tags: string[] = [];
    if (service) {
      tags.push(service);
    }

    // Create the lead object with generated UUID
    const newLead = {
      id: randomUUID(),
      name,
      email,
      phone: phone || '',
      company: company || '',
      position: position || '',
      source: 'Website',
      status: 'New',
      priority: determinePriority(service),
      score: calculateInitialScore(service),
      notes: message || '',
      tags,
      lead_list_id: null, // Will be set if needed
      custom_fields: {
        serviceInterest: service,
        formMessage: message,
        ...additionalFields
      }
    };

    // Insert into leads table
    const { data: insertedLead, error: insertError } = await supabase
      .from('leads')
      .insert(newLead)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error inserting lead:', insertError);
      return NextResponse.json(
        { error: 'Failed to save lead: ' + insertError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Lead created successfully: ${insertedLead.id}`);

    // Log activity (let Supabase auto-generate created_at)
    await supabase.from('lead_activities').insert({
      lead_id: insertedLead.id,
      type: 'Note',
      description: `Lead submitted via website form: ${service || 'General Contact'}`,
      created_by: 'system'
    });

    // Return success response
    return NextResponse.json({
      success: true,
      leadId: insertedLead.id,
      message: 'Lead submitted successfully'
    });

  } catch (error) {
    console.error('❌ Error processing website lead:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process lead' },
      { status: 500 }
    );
  }
}

/**
 * Determine priority based on the service requested
 */
function determinePriority(service?: string): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (!service) return 'Medium';

  const highPriorityServices = ['AI Audit', 'Free Consultation', 'Enterprise'];
  const criticalServices = ['Emergency', 'Urgent'];

  if (criticalServices.some(s => service.toLowerCase().includes(s.toLowerCase()))) {
    return 'Critical';
  }

  if (highPriorityServices.some(s => service.toLowerCase().includes(s.toLowerCase()))) {
    return 'High';
  }

  return 'Medium';
}

/**
 * Calculate initial score based on service interest
 */
function calculateInitialScore(service?: string): number {
  if (!service) return 50;

  // Higher scores for high-value services
  const scoreMap: Record<string, number> = {
    'AI Audit': 80,
    'Free Consultation': 75,
    'Automation': 70,
    'AI Agent': 70,
    'CRM': 65,
    'Chatbot': 60,
    'General': 50
  };

  for (const [key, score] of Object.entries(scoreMap)) {
    if (service.toLowerCase().includes(key.toLowerCase())) {
      return score;
    }
  }

  return 50;
}
