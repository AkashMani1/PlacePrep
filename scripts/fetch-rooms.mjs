import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) {
    env[key.trim()] = val.join('=').trim().replace(/['"]/g, '');
  }
});

const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const BASE = env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1';
const H = { 'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY };

async function fetchRooms() {
  const res = await fetch(`${BASE}/mock_rooms?limit=1`, { headers: H });
  const data = await res.json();
  console.log(data);
}
fetchRooms();
