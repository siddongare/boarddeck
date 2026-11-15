import fs from 'node:fs';
import path from 'node:path';

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://gghboqnkweqkzldexbsc.supabase.co';

const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

const out = path.join(process.cwd(), 'assets', 'supa-env.js');
const content =
  '// Auto-generated at build time when Vercel env vars are linked\n' +
  'window.BOARDDECK_CONFIG = {\n' +
  `  supabaseUrl: ${JSON.stringify(url)},\n` +
  `  supabaseAnonKey: ${JSON.stringify(anonKey)}\n` +
  '};\n';

fs.writeFileSync(out, content, 'utf8');
console.log(`Wrote assets/supa-env.js (url=${url ? 'set' : 'empty'}, key=${anonKey ? 'set' : 'empty'})`);
