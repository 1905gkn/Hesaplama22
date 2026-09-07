// Pure record-based calculations, shared by the build runtime and regression tests.
export function inventorySystem(rack) {
  rack = rack || {};
  const d = rack.drawing || rack;
  const aliases = {b2b:'b2b',mr:'mr',mekik:'mekik2',mekik2:'mekik2',shuttle:'mekik2',drive:'drive','drive-in':'drive',drivein:'drive',konsol:'konsol','konsol-kollu':'konsol',cantilever:'konsol'};
  for (const value of [rack.rafexSystem,rack.__rafexSystem,d.rafexSystem,d.systemType]) {
    const key = String(value || '').toLowerCase();
    if (aliases[key]) return aliases[key];
  }
  if (d.b2b?.mr || d.plan?.mr || d.b2bLayout?.palletType === 'mr') return 'mr';
  if (d.layoutView === 'konsol-top' || d.konsol) return 'konsol';
  if (d.b2bLayout || d.b2b) return 'b2b';
  if (['fifo','lifo'].includes(String(d.systemType || '').toLowerCase())) return 'mekik2';
  return 'unknown';
}

export function konsolInventory(rack) {
  const d = rack.drawing || rack, k = d.konsol || d.spec || {};
  const count = Math.max(2, Math.round(Number(k.count || d.uprightCount || d.plan?.feet?.length) || 2));
  const levels = Math.max(1, Math.round(Number(k.levels || d.levels) || 1));
  const sides = k.side === 'double' || d.doubleSided ? 2 : 1;
  const height = Number(k.height || d.totalRackHeight || d.sideUprightHeight) || 0;
  const arm = Number(k.arm || d.armLength || d.palD) || 0;
  const table = {2:[2],3:[3],4:[4],5:[5],6:[4,2],7:[4,3],8:[4,4],9:[4,5],10:[5,5],11:[4,4,3],12:[4,4,4]};
  let rest = count;
  const plan = [];
  while (rest > 12) { plan.push(4); rest -= 4; }
  plan.push(...table[rest]);
  const rows = [
    {name:'Konsol ayak',qty:count,spec:[k.uprightProfile,height ? height+' mm' : ''].filter(Boolean).join(' · '),unit:'adet'},
    {name:'Konsol kolu',qty:count*levels*sides,spec:[k.armProfile,arm ? arm+' mm' : ''].filter(Boolean).join(' · '),unit:'adet'}
  ];
  // A set already contains its horizontal/diagonal braces; do not count them twice.
  for (const size of new Set(plan)) rows.push({name:size+'’lü çapraz seti',qty:plan.filter(x=>x===size).length,spec:height+' mm ayak',unit:'set'});
  return rows;
}
