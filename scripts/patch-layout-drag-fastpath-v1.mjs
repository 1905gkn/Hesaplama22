import fs from 'node:fs';

const target = 'dist/server/index.js';
if (!fs.existsSync(target)) {
  console.log('Layout drag fast-path skipped: dist not present.');
  process.exit(0);
}

let source = fs.readFileSync(target, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1\s*;/);
if (!match) throw new Error('Layout drag fast-path: HTML_BASE64 bulunamadi.');

let html = Buffer.from(match[2], 'base64').toString('utf8');
const marker = 'data-rafex-layout-drag-fastpath="v2"';
if (html.includes(marker)) {
  console.log('Layout drag fast-path v2 already present.');
  process.exit(0);
}

const needle = `function m2RenderLayout() {\n        const layer = $("m2LayoutContent"); if (!layer) return;`;
if (!html.includes(needle)) throw new Error('Layout drag fast-path: m2RenderLayout girisi bulunamadi.');

const injected = `function m2RenderLayout() {\n        const layer = $("m2LayoutContent"); if (!layer) return;\n        /* ${marker}: tekli ve birlesik/uzatilmis bloklarda sadece hareket eden SVG gruplarini guncelle. */\n        if (m2LayoutState.drag) {\n          const drag = m2LayoutState.drag;\n          const origins = Array.isArray(drag.groupMembers) && drag.groupMembers.length\n            ? drag.groupMembers\n            : [{ id: drag.id, x: drag.originX, y: drag.originY }];\n          if (drag.__rafexFastReady) {\n            origins.forEach((origin) => {\n              const rack = m2LayoutState.racks.find((item) => Number(item.id) === Number(origin.id));\n              if (!rack) return;\n              const node = layer.querySelector('[data-rack="' + rack.id + '"]');\n              if (!node) return;\n              const ox = Number(origin.x), oy = Number(origin.y);\n              const dx = Number(rack.x) - ox, dy = Number(rack.y) - oy;\n              const cx = ox + Number(rack.w) / 2, cy = oy + Number(rack.h) / 2;\n              node.setAttribute('transform', 'translate(' + dx + ' ' + dy + ') rotate(' + (Number(rack.angle)||0) + ' ' + cx + ' ' + cy + ')');\n            });\n            return;\n          }\n          drag.__rafexFastReady = true;\n        }`;

html = html.replace(needle, injected);
const encoded = Buffer.from(html, 'utf8').toString('base64');
source = source.replace(match[0], `const HTML_BASE64 =\n  "${encoded}";`);
fs.writeFileSync(target, source);
console.log('Layout drag fast-path v2 injected.');
