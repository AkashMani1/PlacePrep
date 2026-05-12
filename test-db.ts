import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eavjczqputftpkxstxog.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_EUl-HQ8WU0WwUNpr-nFP8Q_2ANgWk5P';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  const { data, error } = await supabase.from('assessments').select('*').limit(1);
  console.log('Assessments table check:', data, error);

  const { data: qData, error: qError } = await supabase.from('questions').select('*').limit(1);
  console.log('Questions table check:', qData, qError);
  
  const { data: mqData, error: mqError } = await supabase.from('matchmaking_queue').select('*').limit(1);
  console.log('Matchmaking Queue table check:', mqData, mqError);
}

checkDb();
