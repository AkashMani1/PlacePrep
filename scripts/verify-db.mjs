const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_role_key_here';
const BASE = 'https://eavjczqputftpkxstxog.supabase.co/rest/v1';
const H = { 'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY };

const tables = [
  'mock_rooms', 'room_participants', 'matchmaking_queue',
  'assessments', 'questions', 'submissions',
  'notifications', 'squads', 'interview_sessions'
];

async function verifyTables() {
  console.log('\n=== SUPABASE LIVE TABLE VERIFICATION ===\n');
  
  let allOk = true;
  for (const table of tables) {
    const res = await fetch(`${BASE}/${table}?limit=1`, { headers: H });
    const ok = res.ok || res.status === 200;
    if (!ok) allOk = false;
    console.log(`${ok ? '✅' : '❌'} ${table.padEnd(25)} (HTTP ${res.status})`);
  }

  console.log('\n' + (allOk ? '✅ ALL TABLES EXIST — DB FULLY DEPLOYED' : '❌ SOME TABLES MISSING'));
  return allOk;
}

verifyTables().catch(console.error);
