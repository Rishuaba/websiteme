import { readFileSync, writeFileSync } from 'node:fs';

const bodyPath = process.argv[2];
if (!bodyPath) {
  console.error('Missing issue body file');
  process.exit(2);
}

const body = readFileSync(bodyPath, 'utf8');
const match = body.match(/```json\s*([\s\S]*?)```/);
if (!match) {
  console.error('No JSON block');
  process.exit(2);
}

let data;
try {
  data = JSON.parse(match[1]);
} catch {
  console.error('Bad JSON');
  process.exit(2);
}
if (!Array.isArray(data) || data.length > 40) {
  console.error('Blog list must be an array of at most 40 posts');
  process.exit(2);
}

function parseISO(iso) {
  const found = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!found) return '';
  const year = Number(found[1]);
  const month = Number(found[2]);
  const day = Number(found[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return '';
  return found[0];
}

function safeHref(value) {
  const href = String(value || '').trim();
  if (!href) return '';
  if (/^https?:\/\/\S+$/i.test(href)) return href;
  if (href.charAt(0) === '/' && href.charAt(1) !== '/') return href;
  if (/^(?:posts\/)?[a-z0-9][a-z0-9._~/-]*$/i.test(href) && !href.includes('..')) return href;
  return null;
}

const posts = [];
for (const item of data) {
  if (!item || typeof item !== 'object') {
    console.error('Bad post');
    process.exit(2);
  }
  const title = String(item.title || '').trim().slice(0, 140);
  const date = parseISO(String(item.date || ''));
  if (!title || !date) {
    console.error('Each post needs a title and a real date');
    process.exit(2);
  }
  let href = safeHref(item.href || '');
  if (href === null) href = '';
  posts.push({
    title,
    date,
    summary: String(item.summary || '').trim().slice(0, 240),
    href,
  });
}

posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
writeFileSync('posts.json', `${JSON.stringify(posts, null, 2)}\n`);
console.log(`Wrote ${posts.length} post${posts.length === 1 ? '' : 's'}`);
