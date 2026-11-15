import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, access, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { packageSite } from '../scripts/package-site.mjs';

const digest = s => createHash('sha256').update(s).digest('hex');
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'ohl-package-'));
  const source = join(root, 'source'), output = join(root, 'release');
  await mkdir(source);
  await writeFile(join(source, 'index.html'), 'public');
  await mkdir(join(source, '.work'));
  await writeFile(join(source, '.work', 'private.html'), 'private');
  return { root, source, output, manifest: { files: [{path:'index.html', sha256:digest('public')}] } };
}
test('copies only pinned files and never includes unlisted private files', async () => {
  const f = await fixture();
  await packageSite(f.source, f.manifest, f.output);
  assert.equal(await readFile(join(f.output,'index.html'),'utf8'), 'public');
  await assert.rejects(access(join(f.output,'.work')));
  assert.equal(await readFile(join(f.source,'.work','private.html'),'utf8'), 'private');
});
test('rejects unsafe paths and duplicates before creating any output', async () => {
  for (const path of ['../private.html','/index.html','C:/index.html','a\\b.html','.work/private.html','assets/.env','node_modules/a.js','backup.sql','a:stream.html','CON.html','a./b.html']) {
    const f = await fixture();
    f.manifest.files.push({path,sha256:digest('private')});
    await assert.rejects(packageSite(f.source,f.manifest,f.output));
    await assert.rejects(access(f.output));
  }
  const f = await fixture();
  f.manifest.files.push({...f.manifest.files[0], path:'INDEX.html'});
  await assert.rejects(packageSite(f.source,f.manifest,f.output));
  await assert.rejects(access(f.output));
});
test('fails closed on missing files, changed hashes, existing outputs and nested outputs', async () => {
  const f = await fixture();
  await writeFile(join(f.source,'index.html'),'changed');
  await assert.rejects(packageSite(f.source,f.manifest,f.output));
  await assert.rejects(access(f.output));
  f.manifest.files[0].path = 'missing.html';
  await assert.rejects(packageSite(f.source,f.manifest,f.output));
  f.manifest.files = [{path:'index.html',sha256:digest('changed')}];
  await assert.rejects(packageSite(f.source,f.manifest,join(f.source,'release')));
  await mkdir(f.output);
  await writeFile(join(f.output,'keep.txt'),'keep');
  await assert.rejects(packageSite(f.source,f.manifest,f.output));
  assert.equal(await readFile(join(f.output,'keep.txt'),'utf8'), 'keep');
});
test('rejects junctions/symlinks inside source', async () => {
  const f = await fixture();
  const outside = join(f.root,'outside');
  await mkdir(outside);
  await writeFile(join(outside,'secret.html'),'private');
  await symlink(outside,join(f.source,'linked'),process.platform === 'win32' ? 'junction' : 'dir');
  f.manifest.files.push({path:'linked/secret.html',sha256:digest('private')});
  await assert.rejects(packageSite(f.source,f.manifest,f.output));
  await assert.rejects(access(f.output));
});
