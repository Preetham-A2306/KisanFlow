const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
envText.split('\n').forEach(l => {
  const p = l.trim().split('=');
  if (p.length >= 2) env[p[0].trim()] = p.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const tables = ['procurement_centres', 'schedules', 'tokens', 'procurements', 'updates', 'farmers'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*');
    console.log('=== TABLE:', t, '===');
    console.log(JSON.stringify(data, null, 2));
  }
}
check();


