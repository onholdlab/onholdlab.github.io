import { readdir, readFile, writeFile, realpath } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { safePath } from './package-site.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function makeManifest(source = repoRoot, manifestPath, draftPath) {
  source = await realpath(source);
  manifestPath = resolve(manifestPath ?? resolve(source, '.release-manifest.json'));
  draftPath = resolve(draftPath ?? resolve(source, '.release-manifest.draft.json'));
  if (manifestPath.toLowerCase() === draftPath.toLowerCase()) throw new Error('Draft must differ from formal manifest');
  // Resolve parent aliases so control files inside source never enter the draft.
  const canonical = async path => resolve(await realpath(dirname(path)), path.slice(dirname(path).length + 1));
  manifestPath = await canonical(manifestPath);
  draftPath = await canonical(draftPath);
  if (manifestPath.toLowerCase() === draftPath.toLowerCase()) throw new Error('Draft must differ from formal manifest');
  let previous = {files:[]};
  try { previous = JSON.parse(await readFile(manifestPath, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!previous || !Array.isArray(previous.files)) throw new Error('Expected formal manifest files list');
  const old = new Map();
  for (const entry of previous.files) {
    safePath(entry.path);
    if (!/^[a-f0-9]{64}$/.test(entry.sha256 || '') || old.has(entry.path)) throw new Error('Invalid formal manifest entry: ' + entry.path);
    old.set(entry.path, entry.sha256);
  }
  const files = [];
  const keys = new Set();
  async function scan(directory, prefix = '') {
    for (const entry of await readdir(directory, {withFileTypes:true})) {
      const path = prefix + entry.name;
      const target = resolve(directory, entry.name);
      if ([manifestPath, draftPath].some(control => control.toLowerCase() === target.toLowerCase())) continue;
      // Use the packager's validation for both traversal and file selection.
      try { safePath(path, {directory:entry.isDirectory()}); }
      catch { continue; }
      if (entry.isDirectory()) await scan(target, path + '/');
      else if (entry.isFile()) {
        const key = path.toLowerCase();
        if (keys.has(key)) throw new Error('Duplicate path: ' + path);
        keys.add(key);
        files.push({path, sha256:createHash('sha256').update(await readFile(target)).digest('hex')});
      }
      // Symlinks and junctions are not traversed or included.
    }
  }
  await scan(source);
  files.sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  if (!files.length) throw new Error('No public files found');
  const current = new Map(files.map(entry => [entry.path, entry.sha256]));
  const diff = {
    added:files.filter(entry => !old.has(entry.path)).map(entry => entry.path),
    removed:[...old.keys()].filter(path => !current.has(path)).sort(),
    changed:files.filter(entry => old.has(entry.path) && old.get(entry.path) !== entry.sha256).map(entry => entry.path)
  };
  const manifest = {files};
  await writeFile(draftPath, JSON.stringify(manifest, null, 2) + '\n', {flag:'wx'});
  return {manifest, diff, draftPath};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = process.argv.slice(2);
    if (args.length > 3) throw new Error('Usage: node scripts/make-manifest.mjs [SOURCE [MANIFEST.json [DRAFT.json]]]');
    const {manifest, diff, draftPath} = await makeManifest(...args);
    for (const [label, paths] of [['Added', diff.added], ['Removed', diff.removed], ['Changed', diff.changed]]) {
      console.log(`${label}:` + (paths.length ? '\n' + paths.map(path => '  ' + path).join('\n') : ' (none)'));
    }
    console.log(`Draft: ${draftPath} (${manifest.files.length} files). Review before renaming to the formal manifest. Nothing deployed.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
