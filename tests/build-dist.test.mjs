import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { buildDist, REQUIRED } from '../scripts/build-dist.mjs';

// 規格：自動部署只上傳 git 追蹤、且通過 package-site 公開規則的檔案；
// 線上一定要有的頁面（首頁、週報中英文、開發日誌、各遊戲…）少一個就停止，不部署。
const repo = new URL('..', import.meta.url).pathname;
async function walk(dir, root = dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p, root)); else out.push(relative(root, p).split('\\').join('/'));
  }
  return out;
}

test('builds a site with every required page and nothing private', async () => {
  const out = join(await mkdtemp(join(tmpdir(), 'ohl-dist-')), 'dist');
  await buildDist(repo, out);
  const files = await walk(out);
  for (const p of REQUIRED) assert.ok(files.includes(p), `missing ${p}`);
  for (const f of files) {
    assert.doesNotMatch(f, /(^|\/)\./, `dot path ${f}`);
    assert.doesNotMatch(f, /^(tests|scripts|docs|test-results|node_modules)\//, `tooling ${f}`);
    // 字型授權檔（OFL / LICENSE）依授權要跟字型一起公開，其他 .md 不上線。
    if (!/(^|\/)(OFL[^/]*|LICENSE[^/]*)\.md$/i.test(f)) assert.doesNotMatch(f, /\.(mjs|cjs|md|yml|yaml|sh)$/i, `non-public ${f}`);
    assert.notEqual(f, 'package.json');
  }
  assert.ok(files.includes('i18n/en.json') && files.includes('js/locale.js'), 'homepage i18n files ship');
});

test('refuses to build when a required page is missing', async () => {
  const out = join(await mkdtemp(join(tmpdir(), 'ohl-dist-')), 'dist');
  await assert.rejects(buildDist(repo, out, { required: [...REQUIRED, 'does-not-exist/index.html'] }), /does-not-exist/);
});

test('required list covers the live site sections', () => {
  for (const p of ['index.html', '404.html', 'js/feedback.js', 'weekly/index.html', 'weekly/en/index.html',
    'devlog/index.html', 'privacy/index.html', 'midterm-sim/index.html', 'wish-lamp/index.html',
    'crossroad/index.html', 'relay-ai-guess/index.html', 'clapping-cat/index.html', 'dodge-dog/index.html',
    'tool-twins/index.html']) assert.ok(REQUIRED.includes(p), p);
});
