import { NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/admin';
import { supabaseAdmin } from '@/lib/supabase';

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return { ok: false, status: 401, error: 'Missing authorization token.' };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user || !isAdminEmail(data.user.email)) {
    return { ok: false, status: 403, error: 'You do not have permission to manage admin data.' };
  }

  return { ok: true };
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAdmin(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { action, table, payload, match } = await req.json();

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
