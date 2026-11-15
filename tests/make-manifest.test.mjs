import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { makeManifest } from '../scripts/make-manifest.mjs';
import { packageSite } from '../scripts/package-site.mjs';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'ohl-manifest-'));
  t.after(() => rm(root, {recursive:true, force:true}));
  const source = join(root, 'source');
  await mkdir(source);
  const put = async (path, data = 'content') => {
    const target = join(source, path);
    await mkdir(resolve(target, '..'), {recursive:true});
    await writeFile(target, data);
  };
  return {root, source, put};
}

test('shares packaging exclusions at every depth and produces packageable byte hashes', async t => {
  const f = await fixture(t);
  for (const path of ['.secret.json', '.hidden/a.html', 'assets/.hidden/a.js', 'work/a.html', 'assets/WORK/a.json', 'tests/a.js', 'scripts/a.js', 'outputs/a.html', 'node_modules/a.js', 'README.md', 'backup.sql']) await f.put(path);
  const publicPaths = ['index.html', 'assets/a.bin', 'fonts/OFL.md', '_headers', '_redirects'];
  for (const path of publicPaths) await f.put(path, Buffer.from([0, 255, 13, 10, 128]));
  const {manifest, diff} = await makeManifest(f.source);
  assert.deepEqual(manifest.files.map(e => e.path), [...publicPaths].sort());
  assert.deepEqual(diff, {added:[...publicPaths].sort(), removed:[], changed:[]});
  assert.equal(await packageSite(f.source, manifest, join(f.root, 'release')), publicPaths.length);
  assert.deepEqual(await readFile(join(f.root, 'release/assets/a.bin')), Buffer.from([0, 255, 13, 10, 128]));
});

test('reports added, removed and changed paths, preserves formal manifest, excludes control files', async t => {
  const f = await fixture(t);
  await f.put('keep.html', 'same');
  await f.put('change.html', 'before');
  await f.put('remove.html');
  const formal = join(f.source, 'manifest.json');
  const draft = join(f.source, 'draft.json');
  const first = await makeManifest(f.source, formal, draft);
  const original = JSON.stringify(first.manifest);
  await writeFile(formal, original);
  await rm(draft);
  await f.put('change.html', 'after');
  await rm(join(f.source, 'remove.html'));
  await f.put('new.html');
  const next = await makeManifest(f.source, formal, draft);
  assert.deepEqual(next.diff, {added:['new.html'], removed:['remove.html'], changed:['change.html']});
  assert.equal(await readFile(formal, 'utf8'), original);
  assert.deepEqual(JSON.parse(await readFile(draft, 'utf8')), next.manifest);
  assert.deepEqual(next.manifest.files.map(e => e.path), ['change.html', 'keep.html', 'new.html']);
  await assert.rejects(makeManifest(f.source, formal, draft), /exist/i);
  await assert.rejects(makeManifest(f.source, formal, formal));
  assert.equal(await readFile(formal, 'utf8'), original);
});

test('CLI accepts a source directory and prints the diff', async t => {
  const f = await fixture(t);
  await f.put('new.html');
  const stdout = execFileSync(process.execPath, [resolve('scripts/make-manifest.mjs'), f.source], {encoding:'utf8'});
  assert.match(stdout, /Added:\s+new.html/);
  assert.match(stdout, /Removed: \(none\)/);
  assert.match(stdout, /Changed: \(none\)/);
  const manifest = JSON.parse(await readFile(join(f.source, '.release-manifest.draft.json'), 'utf8'));
  assert.deepEqual(manifest.files.map(e => e.path), ['new.html']);
});

test('never follows directory links outside the source', async t => {
  const f = await fixture(t);
  const outside = join(f.root, 'private');
  await mkdir(outside);
  await writeFile(join(outside, 'secret.html'), 'secret');
  await symlink(outside, join(f.source, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  await f.put('index.html');
  const {manifest} = await makeManifest(f.source);
  assert.deepEqual(manifest.files.map(e => e.path), ['index.html']);
});
