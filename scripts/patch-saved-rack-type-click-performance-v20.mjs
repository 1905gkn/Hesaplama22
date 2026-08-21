import fs from 'node:fs';

const file = 'portal.html';
let source = fs.readFileSync(file, 'utf8');

const from = 'm2SelectedSavedType=index;m2LayoutState.selected=null;m2RenderSavedRackTypes();m2RenderLayout();';
const to = 'm2SelectedSavedType=index;m2LayoutState.selected=null;m2RenderSavedRackTypes();';

if (source.includes(to) && !source.includes(from)) {
  console.log('Saved rack type click performance patch already applied.');
  process.exit(0);
}

if (!source.includes(from)) {
  throw new Error('m2ChooseSavedRackType click handler pattern was not found; refusing an unsafe patch.');
}

source = source.replace(from, to);
fs.writeFileSync(file, source);
console.log('Saved rack type click patched: selecting a saved type no longer rerenders the full free-layout SVG.');
