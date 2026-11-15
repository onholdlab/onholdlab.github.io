import { lstat, realpath, readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute, dirname, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const extensions = new Set(['.html','.css','.js','.json','.xml','.txt','.png','.jpg','.jpeg','.webp','.gif','.svg','.ico','.woff','.woff2','.ttf','.mp3','.wav','.ogg','.mp4','.webm','.glb','.gltf','.bin']);
function safePath(path) {
  if (typeof path !== 'string' || !path || /[\\:*?"<>|\x00-\x1f]/.test(path) || isAbsolute(path)) throw new Error('Unsafe path: ' + path);
  const parts = path.split('/');
  if (parts.some(p => !p || p.startsWith('.') || /[. ]$/.test(p) || /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(p) || /^(node_modules|work|outputs|tests|scripts)$/i.test(p))) throw new Error('Private or unsafe path: ' + path);
  const license = /^(OFL[^/]*|LICENSE[^/]*)\.md$/i.test(parts.at(-1));
  if (!extensions.has(extname(path).toLowerCase()) && !license && !['_headers','_redirects'].includes(path)) throw new Error('Not a public asset: ' + path);
}
function within(root, candidate) {
  const rel = relative(root,candidate);
  return rel === '' || (!isAbsolute(rel) && rel !== '..' && !rel.startsWith('..' + sep));
}
async function noLinks(root, path) {
  let current = root;
  for (const part of path.split('/')) {
    current = resolve(current,part);
    const st = await lstat(current);
    if (st.isSymbolicLink()) throw new Error('Symlink/junction not allowed: ' + path);
  }
  if (!(await lstat(current)).isFile()) throw new Error('Expected file: ' + path);
  if (!within(root,await realpath(current))) throw new Error('File escapes source: ' + path);
  return current;
}

export async function packageSite(source, manifest, output) {
  source = await realpath(source);
  output = resolve(output);
  // The parent must exist; realpath also resolves Windows junction aliases.
  const parent = await realpath(dirname(output));
  output = resolve(parent,relative(dirname(output),output));
  if (within(source,output) || within(output,source)) throw new Error('Source and output must be separate');
  try { await lstat(output); throw new Error('Output already exists'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!manifest || !Array.isArray(manifest.files) || !manifest.files.length) throw new Error('Expected nonempty files list');
  const paths = new Set();
  const files = [];
  for (const entry of manifest.files) {
    safePath(entry.path);
    const key = entry.path.toLowerCase();
    if (paths.has(key)) throw new Error('Duplicate path: ' + entry.path);
    paths.add(key);
    if (!/^[a-f0-9]{64}$/.test(entry.sha256 || '')) throw new Error('Missing SHA-256: ' + entry.path);
    const data = await readFile(await noLinks(source,entry.path));
    if (createHash('sha256').update(data).digest('hex') !== entry.sha256) throw new Error('Hash mismatch: ' + entry.path);
    files.push({path:entry.path,data});
  }
  // All files are verified before creating output. No recursive source copy.
  await mkdir(output);
  for (const {path,data} of files) {
    const target = resolve(output,path);
    await mkdir(dirname(target),{recursive:true});
    await writeFile(target,data,{flag:'wx'});
  }
  return files.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [source,manifestPath,output] = process.argv.slice(2);
    if (!source || !manifestPath || !output) throw new Error('Usage: node scripts/package-site.mjs SOURCE MANIFEST.json NEW_OUTPUT');
    const count = await packageSite(source,JSON.parse(await readFile(manifestPath,'utf8')),output);
    console.log(`Prepared ${count} verified public files. Nothing deployed.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
