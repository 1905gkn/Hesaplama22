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
const marker = 'data-rafex-layout-drag-fastpath="v1"';
if (html.includes(marker)) {
  console.log('Layout drag fast-path already present.');
  process.exit(0);
}

const needle = `function m2RenderLayout() {\n        const layer = $("m2LayoutContent"); if (!layer) return;`;
if (!html.includes(needle)) throw new Error('Layout drag fast-path: m2RenderLayout girisi bulunamadi.');

const injected = `function m2RenderLayout() {\n        const layer = $("m2LayoutContent"); if (!layer) return;\n        /* ${marker}: surukleme sirasinda tum SVG'yi yeniden kurma. */\n        if (m2LayoutState.drag) {\n          const drag = m2LayoutState.drag;\n          if (drag.__rafexFastReady) {\n            const moveRack = (rack, originX, originY) => {\n              if (!rack) return;\n              const node = layer.querySelector('[data-rack="' + rack.id + '"]');\n              if (!node) return;\n              const ox = Number(originX), oy = Number(originY);\n              const dx = Number(rack.x) - ox, dy = Number(rack.y) - oy;\n              const cx = ox + Number(rack.w) / 2, cy = oy + Number(rack.h) / 2;\n              node.setAttribute('transform', 'translate(' + dx + ' ' + dy + ') rotate(' + (Number(rack.angle)||0) + ' ' + cx + ' ' + cy + ')');\n            };\n            const active = m2LayoutState.racks.find((item) => item.id === drag.id);\n            moveRack(active, drag.originX, drag.originY);\n            if (Array.isArray(drag.groupMembers)) {\n              drag.groupMembers.forEach((member) => {\n                const rack = m2LayoutState.racks.find((item) => item.id === member.id);\n                moveRack(rack, member.x, member.y);\n              });\n            }\n            return;\n          }\n          drag.__rafexFastReady = true;\n        }`;

html = html.replace(needle, injected);
const encoded = Buffer.from(html, 'utf8').toString('base64');
source = source.replace(match[0], `const HTML_BASE64 =\n  "${encoded}";`);
fs.writeFileSync(target, source);
console.log('Layout drag fast-path v1 injected.');
