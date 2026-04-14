const fs = require('fs');
let content = fs.readFileSync('public/base.json', 'utf-8');

const SUPABASE_URL = 'https://hneczrjshjpxrlstqdda.supabase.co/storage/v1/object/public/MobiStyle';

// Replace "/images/..." with "SUPABASE_URL/..."
content = content.replace(/"\/images\//g, `"${SUPABASE_URL}/`);

fs.writeFileSync('public/base.json', content);
