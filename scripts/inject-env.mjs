import fs from 'node:fs';
import path from 'node:path';

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://gghboqnkweqkzldexbsc.supabase.co';

const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnaGJvcW5rd2Vxa3psZGV4YnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3MzQzNzQsImV4cCI6MjExMDMxMDM3NH0.ST_cunsXMDHWM9JlfZVfmm1sB3OSOXV_QATX8pKw92c';

const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_ANON_KEY;

const out = path.join(process.cwd(), 'assets', 'supa-env.js');
const content =
  '// Auto-generated at build time when Vercel env vars are linked\n' +
  'window.BOARDDECK_CONFIG = {\n' +
  `  supabaseUrl: ${JSON.stringify(url)},\n` +
  `  supabaseAnonKey: ${JSON.stringify(anonKey)}\n` +
  '};\n';

fs.writeFileSync(out, content, 'utf8');
console.log(`Wrote assets/supa-env.js (url=${url ? 'set' : 'empty'}, key=${anonKey ? 'set' : 'empty'})`);
