// harness 檔案：測試用的靜態伺服器，提供 repo 根目錄於 127.0.0.1:4174。來源：onholdlab/rules 的 templates/harness-web。
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const TYPES = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.glb': 'model/gltf-binary' };
const root = fs.realpathSync(ROOT);
const withinRoot = file => {
  const relative = path.relative(root, file);
  return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
};
http.createServer(async (req, res) => {
  const reply = status => { res.writeHead(status); res.end(String(status)); };
  let pathname;
  try {
    pathname = decodeURIComponent(req.url.split('?')[0]);
  } catch {
    return reply(400);
  }
  if (!pathname.startsWith('/') || pathname.includes('\0')) return reply(400);

  let file = path.join(root, pathname);
  if (!withinRoot(file)) return reply(404);
  try {
    if (pathname.endsWith('/') || (await fs.promises.stat(file)).isDirectory()) {
      file = path.join(file, 'index.html');
    }
    file = await fs.promises.realpath(file);
    if (!withinRoot(file) || !(await fs.promises.stat(file)).isFile()) return reply(404);
  } catch {
    return reply(404);
  }
  const stream = fs.createReadStream(file);
  stream.on('error', () => res.headersSent ? res.destroy() : reply(404));
  res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
  stream.pipe(res);
}).listen(4174, '127.0.0.1');
