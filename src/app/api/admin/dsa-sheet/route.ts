import { NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/admin';
import { buildSeedAdminRecords } from '@/lib/dsaSheetAdmin';
import { supabaseAdmin } from '@/lib/supabase';

const TABLE_NAME = 'dsa_sheet_questions';

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return { ok: false, status: 401, error: 'Missing authorization token.' };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user || !isAdminEmail(data.user.email)) {
    return { ok: false, status: 403, error: 'You do not have permission to manage the DSA sheet.' };
  }

  return { ok: true, user: data.user };
}

async function ensureSeedData() {
  const existing = await supabaseAdmin
    .from(TABLE_NAME)
    .select('id', { count: 'exact', head: true });

  if (existing.error) {
    throw existing.error;
  }

  if ((existing.count ?? 0) > 0) {
    return;
  }

  const seedRecords = buildSeedAdminRecords();
  const insertResult = await supabaseAdmin.from(TABLE_NAME).insert(seedRecords);
  if (insertResult.error) {
    throw insertResult.error;
  }
}

async function readQuestions() {
  await ensureSeedData();

  const result = await supabaseAdmin
    .from(TABLE_NAME)
    .select('*')
    .order('section_order', { ascending: true })
    .order('item_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (result.error) {
    throw result.error;
  }

  return result.data ?? [];
}

export async function GET() {
  try {
    const data = await readQuestions();
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load DSA sheet questions.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const result = await supabaseAdmin.from(TABLE_NAME).insert(body).select().single();

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create question.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id, updates } = await request.json();
    if (!id || !updates) {
      return NextResponse.json({ error: 'Missing question id or updates.' }, { status: 400 });
    }

    const result = await supabaseAdmin.from(TABLE_NAME).update(updates).eq('id', id).select().single();
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update question.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing question id.' }, { status: 400 });
    }

    const result = await supabaseAdmin.from(TABLE_NAME).delete().eq('id', id);
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete question.' }, { status: 500 });
  }
}
