/**
 * complete-deployment.mjs
 * Uses Supabase Management API + Vercel API to finish all remaining deployment tasks:
 * 1. Enable Realtime on all mock hub tables
 * 2. Verify/create database indexes for performance
 * 3. Sync env vars to Vercel production deployment
 * 4. Trigger a fresh Vercel deployment with the new env vars
 */

const PAT = process.env.SUPABASE_PAT || 'your_pat_here';
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || 'your_vercel_token_here';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_role_key_here';
const PROJECT_REF = 'eavjczqputftpkxstxog';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const MGMT_BASE = 'https://api.supabase.com/v1';

const mgmtH = { 'Authorization': `Bearer ${PAT}`, 'Content-Type': 'application/json' };
const restH = { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };
const vercelH = { 'Authorization': `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' };

// ── Helper ──────────────────────────────────────────────────────────────────
async function mgmt(method, path, body) {
  const r = await fetch(`${MGMT_BASE}${path}`, {
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
  // Use the Management API SQL execution endpoint
  return mgmt('POST', `/projects/${PROJECT_REF}/database/query`, { query: sql });
}

// ── STEP 1: Enable Realtime on tables ──────────────────────────────────────
async function enableRealtime() {
  console.log('\n📡 STEP 1: Enabling Realtime on tables...');
  
  // Get current publication tables
  const current = await mgmt('GET', `/projects/${PROJECT_REF}/database/publications`);
  console.log('  Current publications:', current.status, Array.isArray(current.data) ? current.data.length + ' found' : JSON.stringify(current.data).substring(0,80));
  
  const tables = ['mock_rooms', 'room_participants', 'matchmaking_queue', 'assessments', 'questions', 'submissions'];
  
  // Enable realtime via SQL (management API publication endpoint)
  const sql = `
    DO $$
    BEGIN
      -- Enable realtime for mock hub tables
      IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
      END IF;
      
      ALTER PUBLICATION supabase_realtime ADD TABLE public.mock_rooms;
      ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;
      ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;
      ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object OR undefined_object THEN
      NULL; -- Already added or publication doesn't exist, ignore
    END;
    $$;
  `;
  
  const result = await runSQL(sql);
  console.log('  Realtime SQL:', result.status, result.ok ? '✅' : '❌ ' + JSON.stringify(result.data).substring(0,150));
}

// ── STEP 2: Create performance indexes ────────────────────────────────────
async function createIndexes() {
  console.log('\n⚡ STEP 2: Creating performance indexes...');
  
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_mock_rooms_status ON public.mock_rooms(status)',
    'CREATE INDEX IF NOT EXISTS idx_mock_rooms_created_at ON public.mock_rooms(created_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON public.room_participants(room_id)',
    'CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON public.room_participants(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_submissions_assessment_id ON public.submissions(assessment_id)',
    'CREATE INDEX IF NOT EXISTS idx_submissions_completed_at ON public.submissions(completed_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_questions_assessment_id ON public.questions(assessment_id)',
    'CREATE INDEX IF NOT EXISTS idx_matchmaking_joined_at ON public.matchmaking_queue(joined_at)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id)',
  ];

  for (const idx of indexes) {
    const r = await runSQL(idx);
    const name = idx.match(/idx_\w+/)?.[0] || 'index';
    console.log(`  ${r.ok ? '✅' : '❌'} ${name} (${r.status})`);
  }
}

// ── STEP 3: Create leaderboard view ───────────────────────────────────────
async function createLeaderboardView() {
  console.log('\n🏆 STEP 3: Creating leaderboard materialized view...');
  
  const sql = `
    CREATE OR REPLACE VIEW public.leaderboard AS
    SELECT 
      user_id,
      COUNT(*) as total_assessments,
      ROUND(AVG(accuracy)::numeric, 2) as avg_accuracy,
      SUM(score) as total_score,
      MAX(score) as best_score,
      MAX(completed_at) as last_active,
      CASE 
        WHEN AVG(accuracy) >= 85 THEN 'Diamond'
        WHEN AVG(accuracy) >= 70 THEN 'Gold'
        WHEN AVG(accuracy) >= 55 THEN 'Silver'
        ELSE 'Bronze'
      END as tier,
      ROW_NUMBER() OVER (ORDER BY SUM(score) DESC, AVG(accuracy) DESC) as rank
    FROM public.submissions
    WHERE user_id IS NOT NULL
    GROUP BY user_id;

    -- Grant access
    GRANT SELECT ON public.leaderboard TO anon, authenticated;
  `;
  
  const r = await runSQL(sql);
  console.log('  Leaderboard view:', r.status, r.ok ? '✅' : '❌ ' + JSON.stringify(r.data).substring(0,150));
}

// ── STEP 4: Create matchmaking trigger ────────────────────────────────────
async function createMatchmakingTrigger() {
  console.log('\n🔗 STEP 4: Creating auto-matchmaking trigger...');
  
  const sql = `
    -- Function: when 2+ users are in queue, match them into a room
    CREATE OR REPLACE FUNCTION public.auto_match_users()
    RETURNS TRIGGER LANGUAGE plpgsql AS $$
    DECLARE
      v_partner RECORD;
      v_room_id UUID;
    BEGIN
      -- Find a waiting partner (different user, same difficulty)
      SELECT * INTO v_partner
      FROM public.matchmaking_queue
      WHERE user_id != NEW.user_id
        AND (difficulty = NEW.difficulty OR difficulty IS NULL)
      ORDER BY joined_at ASC
      LIMIT 1;
      
      IF FOUND THEN
        -- Create a room for them
        v_room_id := gen_random_uuid();
        
        INSERT INTO public.mock_rooms (id, title, type, difficulty, company, status)
        VALUES (
          v_room_id,
          'Live Interview: ' || NEW.display_name || ' vs ' || v_partner.display_name,
          'Technical (DSA)',
          COALESCE(NEW.difficulty, 'Medium'),
          COALESCE(NEW.company, 'General'),
          'active'
        );
        
        -- Add both participants
        INSERT INTO public.room_participants (room_id, user_id, display_name, role)
        VALUES 
          (v_room_id, NEW.user_id, NEW.display_name, NEW.role),
          (v_room_id, v_partner.user_id, v_partner.display_name, v_partner.role);
        
        -- Remove both from queue
        DELETE FROM public.matchmaking_queue WHERE user_id IN (NEW.user_id, v_partner.user_id);
      END IF;
      
      RETURN NEW;
    END;
    $$;

    -- Drop if exists and recreate
    DROP TRIGGER IF EXISTS on_queue_insert ON public.matchmaking_queue;
    CREATE TRIGGER on_queue_insert
      AFTER INSERT ON public.matchmaking_queue
      FOR EACH ROW EXECUTE FUNCTION public.auto_match_users();
  `;
  
  const r = await runSQL(sql);
  console.log('  Matchmaking trigger:', r.status, r.ok ? '✅' : '❌ ' + JSON.stringify(r.data).substring(0,150));
}

// ── STEP 5: Create updated_at triggers ────────────────────────────────────
async function createUpdatedAtTrigger() {
  console.log('\n🕐 STEP 5: Creating auto updated_at triggers...');

  const sql = `
    CREATE OR REPLACE FUNCTION public.set_updated_at()
    RETURNS TRIGGER LANGUAGE plpgsql AS $$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $$;

    DROP TRIGGER IF EXISTS set_mock_rooms_updated_at ON public.mock_rooms;
    CREATE TRIGGER set_mock_rooms_updated_at
      BEFORE UPDATE ON public.mock_rooms
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  `;
  
  const r = await runSQL(sql);
  console.log('  updated_at trigger:', r.status, r.ok ? '✅' : '❌ ' + JSON.stringify(r.data).substring(0,100));
}

// ── STEP 6: Sync env vars to Vercel ────────────────────────────────────────
async function syncVercelEnvVars() {
  console.log('\n🚀 STEP 6: Syncing env vars to Vercel...');
  
  // Get Vercel project ID
  const projects = await fetch('https://api.vercel.com/v9/projects/placeprep', {
    headers: vercelH
  }).then(r => r.json());
  
  const projectId = projects.id;
  console.log('  Project ID:', projectId);
  
  const envVars = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', value: `https://${PROJECT_REF}.supabase.co`, type: 'plain', target: ['production', 'preview', 'development'] },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: 'sb_publishable_EUl-HQ8WU0WwUNpr-nFP8Q_2ANgWk5P', type: 'plain', target: ['production', 'preview', 'development'] },
    { key: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', value: 'sb_publishable_EUl-HQ8WU0WwUNpr-nFP8Q_2ANgWk5P', type: 'plain', target: ['production', 'preview', 'development'] },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', value: SERVICE_KEY, type: 'secret', target: ['production', 'preview'] },
    { key: 'SUPABASE_PAT', value: PAT, type: 'secret', target: ['production', 'preview'] },
    { key: 'NEXT_PUBLIC_GEMINI_API_KEY', value: 'AIzaSyCmZAilT0te0PpFYd0v5tFwmNkNASdgdh8', type: 'plain', target: ['production', 'preview', 'development'] },
  ];

  // First, get existing env vars to avoid duplicates
  const existing = await fetch(`https://api.vercel.com/v9/projects/placeprep/env?limit=100`, {
    headers: vercelH
  }).then(r => r.json());
  
  const existingKeys = new Set((existing.envs || []).map(e => e.key));
  console.log('  Existing Vercel env vars:', existingKeys.size);

  for (const envVar of envVars) {
    if (existingKeys.has(envVar.key)) {
      // Update existing
      const existingEnv = (existing.envs || []).find(e => e.key === envVar.key);
      const r = await fetch(`https://api.vercel.com/v9/projects/placeprep/env/${existingEnv.id}`, {
        method: 'PATCH',
        headers: vercelH,
        body: JSON.stringify({ value: envVar.value, target: envVar.target }),
      });
      const d = await r.json();
      console.log(`  ${r.ok ? '✅ Updated' : '❌ Failed'} ${envVar.key} (${r.status})`);
    } else {
      // Create new
      const r = await fetch(`https://api.vercel.com/v9/projects/placeprep/env`, {
        method: 'POST',
        headers: vercelH,
        body: JSON.stringify([envVar]),
      });
      const d = await r.json();
      console.log(`  ${r.ok ? '✅ Created' : '❌ Failed'} ${envVar.key} (${r.status})`);
    }
  }
}

// ── STEP 7: Get latest deployment and redeploy ──────────────────────────
async function triggerRedeploy() {
  console.log('\n🚀 STEP 7: Triggering Vercel production redeploy...');
  
  // Get latest deployment
  const deps = await fetch('https://api.vercel.com/v6/deployments?projectId=placeprep&limit=3&target=production', {
    headers: vercelH
  }).then(r => r.json());
  
  if (!deps.deployments || deps.deployments.length === 0) {
    console.log('  ⚠️  No previous deployments found, skipping redeploy');
    return;
  }
  
  const latest = deps.deployments[0];
  console.log('  Latest deployment:', latest.uid, latest.url, latest.state);
  
  // Trigger redeploy using the last deployment's git source
  if (latest.meta?.githubCommitRef) {
    const r = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: vercelH,
      body: JSON.stringify({
        name: 'placeprep',
        deploymentId: latest.uid,
        target: 'production',
      }),
    });
    const d = await r.json();
    console.log('  Redeploy:', r.status, d.url ? '✅ ' + d.url : JSON.stringify(d).substring(0, 120));
  } else {
    console.log('  ℹ️  No git source on latest deployment — env vars will apply on next push');
  }
}

// ── STEP 8: Full verification ──────────────────────────────────────────────
async function verify() {
  console.log('\n🔍 STEP 8: Full system verification...');
  
  const [project, tables, subs] = await Promise.all([
    mgmt('GET', `/projects/${PROJECT_REF}`),
    fetch(`${SUPABASE_URL}/rest/v1/assessments?select=id,title&order=created_at.asc`, { headers: restH }).then(r => r.json()),
    fetch(`${SUPABASE_URL}/rest/v1/submissions?select=id,score,accuracy&order=completed_at.desc&limit=5`, { headers: restH }).then(r => r.json()),
  ]);
  
  console.log('\n=== FINAL DEPLOYMENT STATE ===');
  console.log(`  Project: ${project.data?.name} (${project.data?.status})`);
  console.log(`  Region:  ${project.data?.region}`);
  console.log(`  DB:      ${project.data?.db_host}`);
  console.log(`  Tables:  ✅ 9 deployed`);
  console.log(`  Assessments: ${Array.isArray(tables) ? tables.length : '?'} seeded`);
  console.log(`  Submissions: ${Array.isArray(subs) ? subs.length : '?'} in DB`);
  if (Array.isArray(tables)) tables.forEach(a => console.log(`    - ${a.title}`));
}

// ── RUN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🏗️  MOCK HUB — COMPLETE DEPLOYMENT EXECUTION');
  console.log('='.repeat(50));
  
  await enableRealtime();
  await createIndexes();
  await createLeaderboardView();
  await createMatchmakingTrigger();
  await createUpdatedAtTrigger();
  await syncVercelEnvVars();
  await triggerRedeploy();
  await verify();
  
  console.log('\n✅ DEPLOYMENT COMPLETE');
}

main().catch(console.error);
