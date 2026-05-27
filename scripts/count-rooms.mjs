const SUPABASE_URL = 'https://eavjczqputftpkxstxog.supabase.co';
const ANON_KEY = 'sb_publishable_EUl-HQ8WU0WwUNpr-nFP8Q_2ANgWk5P';

async function main() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/mock_rooms?select=*&status=eq.waiting`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Prefer': 'count=exact'
    }
  });
  const count = res.headers.get('content-range');
  console.log("Range/Count:", count);
}

main();
