const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const SUPABASE_URL = 'https://hneczrjshjpxrlstqdda.supabase.co/storage/v1/object/public/MobiStyle';

// Replace "/images/..." with "SUPABASE_URL/..."
content = content.replace(/"\/images\//g, `"${SUPABASE_URL}/`);

// Replace '/images/...' with 'SUPABASE_URL/...'
content = content.replace(/'\/images\//g, `'${SUPABASE_URL}/`);

// Replace `/images/...` with `SUPABASE_URL/...`
content = content.replace(/`\/images\//g, `\`${SUPABASE_URL}/`);

// Replace ${window.location.origin}/images/... with SUPABASE_URL/...
content = content.replace(/\$\{window\.location\.origin\}\/images\//g, `${SUPABASE_URL}/`);

// Fix any double SUPABASE_URL that might have occurred from previous partial replaces
const escapedUrl = SUPABASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const doubleUrlRegex = new RegExp(`${escapedUrl}/${escapedUrl}/`, 'g');
content = content.replace(doubleUrlRegex, `${SUPABASE_URL}/`);

// Fix where window.location.origin is prepended to SUPABASE_URL
const originPlusUrlRegex = new RegExp(`\\$\\{window\\.location\\.origin\\}${escapedUrl}`, 'g');
content = content.replace(originPlusUrlRegex, SUPABASE_URL);


fs.writeFileSync('src/App.tsx', content);
