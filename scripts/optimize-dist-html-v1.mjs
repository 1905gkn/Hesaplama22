// Hız optimizasyonu v1: dist/index.html içine gömülü büyük klasik <script>
// bloklarını içerik özetli (hash) ayrı dosyalara taşır. Böylece tarayıcı bu
// dosyaları bir kez indirip önbellekte tutar; ana HTML her açılışta küçük kalır.
// Dosyalar /runtime-assets/ altında, vercel.json'daki "immutable" önbellekle sunulur.
// Davranış korunur: senkron dış script'ler de satır içi script'ler gibi sırayla çalışır.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const htmlPath = path.join(root, 'dist', 'index.html');
const outDir = path.join(root, 'dist', 'runtime-assets');
const MIN_BYTES = Number(process.env.RAFEX_INLINE_MIN_BYTES || 4000);

const html = fs.readFileSync(htmlPath, 'utf8');
fs.mkdirSync(outDir, {recursive: true});

// Kodun başka bir yerinde adıyla aranan (ör. querySelector('style[data-x]'))
// bloklar yerinde bırakılır; aksi halde o kod etiketi bulamaz.
const referenced = attrs => {
  for (const [, name] of attrs.matchAll(/\s(data-[\w-]+)/g)) {
    if (html.includes(`style[${name}`) || html.includes(`script[${name}`)) return true;
    // Etiketi bulup içeriğini okuyan/değiştiren kod varsa da dokunma.
    const re = new RegExp(name.replace(/[-]/g, '\\-') + '[^;]{0,200}?\\.(textContent|innerHTML|innerText|sheet)\\b');
    if (re.test(html)) return true;
  }
  return false;
};

let moved = 0, movedBytes = 0;
const out = html.replace(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi, (whole, attrs = '', body) => {
  if (/\ssrc\s*=/i.test(attrs)) return whole;
  const type = (attrs.match(/\stype\s*=\s*["']?([^"'\s>]+)/i) || [])[1];
  if (type && !/^(text|application)\/javascript$/i.test(type)) return whole;
  if (Buffer.byteLength(body) < MIN_BYTES || referenced(attrs)) return whole;
  const hash = crypto.createHash('sha256').update(body).digest('hex').slice(0, 20);
  const file = `inline-${hash}.js`;
  fs.writeFileSync(path.join(outDir, file), body);
  moved++; movedBytes += Buffer.byteLength(body);
  return `<script${attrs} src="/runtime-assets/${file}"></script>`;
});

// Büyük <style> blokları da aynı şekilde ayrı, önbelleklenen CSS dosyalarına taşınır.
// <link rel="stylesheet"> aynı yerde kaldığı için stil sırası (cascade) değişmez.
let movedCss = 0, movedCssBytes = 0;
const out2 = out.replace(/<style(\s[^>]*)?>([\s\S]*?)<\/style>/gi, (whole, attrs = '', body) => {
  if (/\smedia\s*=/i.test(attrs)) return whole;
  if (Buffer.byteLength(body) < MIN_BYTES || referenced(attrs)) return whole;
  const hash = crypto.createHash('sha256').update(body).digest('hex').slice(0, 20);
  const file = `inline-${hash}.css`;
  fs.writeFileSync(path.join(outDir, file), body);
  movedCss++; movedCssBytes += Buffer.byteLength(body);
  return `<link rel="stylesheet"${attrs} href="/runtime-assets/${file}">`;
});

fs.writeFileSync(htmlPath, out2);
const kb = n => Math.round(n / 1024);
console.log(`optimize-dist-html-v1: ${moved} script (${kb(movedBytes)} KB) ve ${movedCss} stil (${kb(movedCssBytes)} KB) dışarı alındı. HTML ${kb(Buffer.byteLength(html))} KB -> ${kb(Buffer.byteLength(out2))} KB`);
