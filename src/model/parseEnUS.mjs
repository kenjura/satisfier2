// parseEnUS.mjs
// Usage: node parseEnUS.mjs
import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./data/raw-data-20250917.json');

try {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  if (Array.isArray(data)) {
    console.log(`Top-level array length: ${data.length}`);
  } else {
    console.log('Top-level JSON is not an array.');
  }
} catch (err) {
  console.error('Failed to parse en-US.json:', err.message);
  process.exit(1);
}
