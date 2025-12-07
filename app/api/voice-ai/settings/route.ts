import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Fetch voice AI settings
export async function GET(request: NextRequest) {
  try {
    const { data: settings, error } = await supabase
      .from('voice_ai_settings')
      .select('*')
      .single();

    if (error) {
      // If no settings exist, return default values
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          settings: {
            daily_call_limit: 50,
            calling_start_hour: 9,
            calling_end_hour: 17,
            max_retries: 3,
            retry_delay_hours: 24,
            enable_voicemail_detection: true,
            enable_dnc_check: true,
            default_agent_voice: 'jennifer',
            enable_call_recording: true,
            auto_analyze_calls: true,
          }
        });
      }

      console.error('Error fetching settings:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error in GET /api/voice-ai/settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update voice AI settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // First, check if settings exist
    const { data: existing, error: fetchError } = await supabase
      .from('voice_ai_settings')
      .select('id')
      .single();

    let result;

    if (fetchError && fetchError.code === 'PGRST116') {
      // No settings exist, insert new
      const { data, error } = await supabase
        .from('voice_ai_settings')
        .insert([body])
        .select()
        .single();

      if (error) {
        console.error('Error inserting settings:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      result = data;
    } else if (fetchError) {
      console.error('Error fetching settings:', fetchError);
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    } else {
      // Settings exist, update them
      const { data, error } = await supabase
        .from('voice_ai_settings')
        .update(body)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      result = data;
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: result
    });
  } catch (error: any) {
    console.error('Error in PUT /api/voice-ai/settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
