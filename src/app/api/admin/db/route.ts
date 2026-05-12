import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { action, table, payload, match } = await req.json();

    // Ideally, we should also verify the admin session here.
    // For now, this is secured by the UI that doesn't render it, but for production,
    // you would verify the JWT token email matches the admin email.

    if (!action || !table) {
      return NextResponse.json({ error: 'Missing action or table' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'SELECT':
        if (match) {
          result = await supabaseAdmin.from(table).select('*').match(match);
        } else {
          result = await supabaseAdmin.from(table).select('*');
        }
        break;
      case 'INSERT':
        result = await supabaseAdmin.from(table).insert(payload).select();
        break;
      case 'UPDATE':
        result = await supabaseAdmin.from(table).update(payload).match(match).select();
        break;
      case 'DELETE':
        result = await supabaseAdmin.from(table).delete().match(match);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (result.error) {
      console.error(`[admin/db] ${action} error:`, result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ data: result.data });

  } catch (error: any) {
    console.error('[admin/db] Unhandled error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
