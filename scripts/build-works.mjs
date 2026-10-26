// 列出 onholdlab 所有開了 GitHub Pages 的公開 repo，寫進 works.json，首頁的「最新資訊」讀這個檔。
// 類型看 repo 的 topics：有 game → 遊戲，有 tool → 工具，都沒有 → 作品。
// 名稱與介紹看 repo 的 description：寫成「中文名稱｜一句話介紹」；沒有｜就整段當介紹，名稱用 repo 名。
// 要英文版就寫成「中文名稱｜中文介紹｜English name｜English blurb」，英文首頁會用後兩段。
import { writeFileSync } from 'node:fs';

const OWNER = process.env.OWNER || 'onholdlab';
const SELF = `${OWNER}.github.io`.toLowerCase();
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'onholdlab-works' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function list(kind) {
  const out = [];
  for (let page = 1; page < 20; page++) {
    const r = await fetch(`https://api.github.com/${kind}/${OWNER}/repos?per_page=100&page=${page}&type=public`, { headers });
    if (!r.ok) { if (page === 1) return null; break; }
    const batch = await r.json();
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

export function toWork(r) {
  const topics = (r.topics || []).map(t => t.toLowerCase());
  const type = topics.some(t => t === 'game' || t.endsWith('-game')) ? '遊戲'
             : topics.some(t => t === 'tool' || t.endsWith('-tool')) ? '工具' : '作品';
  const desc = (r.description || '').trim();
  const m = desc.split(/\s*[｜|]\s*/);
  let title, blurb, title_en = '', blurb_en = '';
  if (m.length >= 4) [title, blurb, title_en, blurb_en] = [m[0], m[1], m[2], m.slice(3).join(' ')];
  else if (m.length > 1) [title, blurb] = [m[0], m.slice(1).join(' ')];
  else [title, blurb] = [r.name, desc];
  const url = (r.homepage && /^https?:\/\//.test(r.homepage)) ? r.homepage : `https://${OWNER}.github.io/${r.name}/`;
  return { title, blurb, title_en, blurb_en, type, url, repo: r.name, created: r.created_at };
}

export function build(repos) {
  return repos
    .filter(r => r.has_pages && !r.private && !r.archived && !r.fork && r.name.toLowerCase() !== SELF)
    .map(toWork)
    .sort((a, b) => b.created.localeCompare(a.created));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const repos = (await list('orgs')) || (await list('users'));
  if (!repos) { console.error('拿不到 repo 清單'); process.exit(1); }
  const works = build(repos);
  writeFileSync('works.json', JSON.stringify({ updated: new Date().toISOString(), works }, null, 1) + '\n');
  console.log(`寫入 ${works.length} 件作品`);
}
