import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Disable static generation, force dynamic rendering
export const dynamic = 'force-dynamic';

// Delay initialization of Supabase client to avoid build-time environment variable issues
// Support both NEXT_PUBLIC_ and COZE_ prefixes
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing required Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    console.log("Starting to delete fake tools added today...\n");

    // Get today's date (2026-03-29)
    const today = new Date('2026-03-29T00:00:00+08:00').toISOString();
    const nextDay = new Date('2026-03-30T00:00:00+08:00').toISOString();

    console.log(`Query date range: ${today} to ${nextDay}\n`);

    // Query all tools added today
    const { data: todayTools, error: queryError } = await supabase
      .from('tools')
      .select('id, name, created_at')
      .gte('created_at', today)
      .lt('created_at', nextDay);

    if (queryError) {
      console.error('Query error:', queryError);
      return NextResponse.json({ error: 'Query failed', details: queryError.message }, { status: 500 });
    }

    console.log(`Found ${todayTools?.length || 0} tools added today\n`);

    if (!todayTools || todayTools.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No fake tools found to delete',
        deletedCount: 0
      });
    }

    // Delete all tools added today
    const { error: deleteError } = await supabase
      .from('tools')
      .delete()
      .gte('created_at', today)
      .lt('created_at', nextDay);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ error: 'Delete failed', details: deleteError.message }, { status: 500 });
    }

    console.log(`Successfully deleted ${todayTools.length} fake tools\n`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${todayTools.length} fake tools`,
      deletedCount: todayTools.length,
      deletedTools: todayTools
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
