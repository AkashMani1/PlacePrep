/**
 * apply-rls.mjs
 */

const fs = await import('fs');
const path = await import('path');

const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) {
    env[key.trim()] = val.join('=').trim().replace(/['"]/g, '');
  }
});

const PAT = env.SUPABASE_PAT;
const PROJECT_REF = 'eavjczqputftpkxstxog';
const MGMT_BASE = 'https://api.supabase.com/v1';

const mgmtH = { 'Authorization': `Bearer ${PAT}`, 'Content-Type': 'application/json' };

async function mgmt(method, urlPath, body) {
  const r = await fetch(`${MGMT_BASE}${urlPath}`, {
    method,
    headers: mgmtH,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: r.status, ok: r.ok, data };
}

async function runSQL(sql) {
  return mgmt('POST', `/projects/${PROJECT_REF}/database/query`, { query: sql });
}

async function applyRLS() {
  const sql = `
    -- Enable RLS on mock_rooms
    ALTER TABLE public.mock_rooms ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if any
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.mock_rooms;
    DROP POLICY IF EXISTS "Enable insert access for all users" ON public.mock_rooms;
    DROP POLICY IF EXISTS "Enable update access for all users" ON public.mock_rooms;

    -- Create policies for anon/authenticated to select, insert, update
    CREATE POLICY "Enable read access for all users" ON public.mock_rooms FOR SELECT USING (true);
    CREATE POLICY "Enable insert access for all users" ON public.mock_rooms FOR INSERT WITH CHECK (true);
    CREATE POLICY "Enable update access for all users" ON public.mock_rooms FOR UPDATE USING (true);
    
    -- Same for room_participants
    ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.room_participants;
    DROP POLICY IF EXISTS "Enable insert access for all users" ON public.room_participants;
    DROP POLICY IF EXISTS "Enable update access for all users" ON public.room_participants;
    DROP POLICY IF EXISTS "Enable delete access for all users" ON public.room_participants;
    
    CREATE POLICY "Enable read access for all users" ON public.room_participants FOR SELECT USING (true);
    CREATE POLICY "Enable insert access for all users" ON public.room_participants FOR INSERT WITH CHECK (true);
    CREATE POLICY "Enable update access for all users" ON public.room_participants FOR UPDATE USING (true);
    CREATE POLICY "Enable delete access for all users" ON public.room_participants FOR DELETE USING (true);
  `;
  
  const result = await runSQL(sql);
  console.log('Result:', result.status, result.data);
}

applyRLS().catch(console.error);
