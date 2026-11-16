// 自動部署用：從 git 追蹤的檔案產生發布清單（路徑 + SHA-256），交給 package-site.mjs 打包。
// 只收通過 package-site 公開規則的檔案；線上一定要有的頁面少一個就停止。
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { packageSite, isPublicPath } from './package-site.mjs';

export const REQUIRED = [
  'index.html', '404.html', 'sitemap.xml', 'works.json', 'works-i18n.json',
  'js/feedback.js', 'js/locale.js', 'i18n/en.json', 'i18n/zh-Hant.json',
  'devlog/index.html', 'privacy/index.html',
  'weekly/index.html', 'weekly/news.css', 'weekly/editorial.css', 'weekly/news.js', 'weekly/feed.xml',
  'weekly/en/index.html', 'weekly/en/feed.xml',
  'weekly/2026-11-03/index.html', 'weekly/2026-11-10/index.html',
  'weekly/en/2026-11-03/index.html', 'weekly/en/2026-11-10/index.html',
  'weekly/en/2026-11-03/medium/index.html', 'weekly/en/2026-11-10/medium/index.html',
  'midterm-sim/index.html', 'wish-lamp/index.html', 'crossroad/index.html', 'relay-ai-guess/index.html',
  'crossroad/survive/index.html', 'crossroad/bump/index.html',
  'clapping-cat/index.html', 'dodge-dog/index.html', 'tool-twins/index.html',
];
// 公開規則以外，另外不上線的 repo 設定檔。
const EXCLUDE = [/^package(-lock)?\.json$/, /^docs\//, /^test-results\//];

export async function buildDist(source, output, { required = REQUIRED } = {}) {
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: source }).toString('utf8').split('\0').filter(Boolean);
  const paths = tracked.filter(p => isPublicPath(p) && !EXCLUDE.some(r => r.test(p)));
  const missing = required.filter(p => !paths.includes(p));
  if (missing.length) throw new Error('Required page missing, not deploying: ' + missing.join(', '));
  const files = [];
  for (const path of paths) {
    const data = await readFile(join(source, path));
    files.push({ path, sha256: createHash('sha256').update(data).digest('hex') });
  }
  return packageSite(source, { files }, output);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const output = process.argv[2];
    if (!output) throw new Error('Usage: node scripts/build-dist.mjs NEW_OUTPUT_DIR');
    const count = await buildDist(process.cwd(), output);
    console.log(`Built ${count} public files into ${output}.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
