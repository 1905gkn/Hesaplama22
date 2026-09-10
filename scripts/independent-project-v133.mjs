// Persist a self-contained document. IDs are remapped by relationship, never by
// replacing arbitrary numbers (which could also be physical measurements).
export function independentProject(record, uuid, timestamp) {
  const copy = JSON.parse(JSON.stringify(record));
  const payload = copy.payload, layout = payload.layout || {};
  const racks = layout.racks || [], types = payload.rackTypes || [];
  let sequence = 0;
  const used = new Set([...racks, ...types, ...(layout.symbols || []), ...(layout.userNotes || [])].map(x => String(x.id)));
  const nextId = () => { let id; do { id = timestamp * 1000 + ++sequence; } while (used.has(String(id))); used.add(String(id)); return id; };
  const rackIds = new Map(racks.map(r => [String(r.id), nextId()]));
  if (rackIds.size !== racks.length) throw new Error('Aynı kimlikli raflar var; bağımsız kayıt oluşturulamadı.');
  const typeIds = new Map(types.map(r => [String(r.id), nextId()]));
  const symbolIds = new Map((layout.symbols || []).map(r => [String(r.id), nextId()]));
  const groups = new Map(), braces = new Map();
  const mapped = (map, id) => id == null ? id : map.get(String(id)) ?? id;
  const named = (map, id, kind) => { if (id == null || id === '') return id; const key = String(id); if (!map.has(key)) map.set(key, uuid + ':' + kind + ':' + map.size); return map.get(key); };
  const remapRack = rack => {
    rack.id = mapped(rackIds, rack.id);
    for (const key of ['sharedFootWith', 'rackId', 'tunnelRackId']) if (key in rack) rack[key] = mapped(rackIds, rack[key]);
    for (const key of ['rackTypeId', 'savedTypeId']) if (key in rack) rack[key] = mapped(typeIds, rack[key]);
    if ('joinGroup' in rack) rack.joinGroup = named(groups, rack.joinGroup, 'group');
    if (rack.independentBlockId) rack.independentBlockId = uuid + ':block:' + rack.id;
    for (const brace of rack.seismicBraces || []) {
      if (brace.id != null) brace.id = named(braces, brace.id, 'brace');
      if (brace.rackIds) brace.rackIds = brace.rackIds.map(id => mapped(rackIds, id));
    }
  };
  racks.forEach(remapRack);
  if (payload.drawing) remapRack(payload.drawing);
  types.forEach((type, index) => {
    type.id = mapped(typeIds, type.id); type.source = 'project';
    type.logId = uuid + ':type:' + index; type.createdAt = new Date(timestamp).toISOString();
    type.projectUuid = uuid;
  });
  for (const symbol of layout.symbols || []) { symbol.id = mapped(symbolIds, symbol.id); for (const key of ['rackId', 'tunnelRackId']) if (key in symbol) symbol[key] = mapped(rackIds, symbol[key]); }
  for (const note of layout.userNotes || []) note.id = nextId();
  for (const key of ['distanceRackId', 'pinnedRackId']) if (key in layout) layout[key] = mapped(rackIds, layout[key]);
  layout.pinnedDimensionsByRack = Object.fromEntries(Object.entries(layout.pinnedDimensionsByRack || {}).map(([id, value]) => [mapped(rackIds, id), value]));
  const dimensionKey = key => String(key)
    .replace(/^((?:total-)?(?:length|depth)-(?:top|bottom|left|right)|gap|column-gap):([0-9]+)$/, (all, prefix, id) => prefix + ':' + mapped(rackIds, id))
    .replace(/^wall:([0-9]+):/, (all, id) => 'wall:' + mapped(rackIds, id) + ':')
    .replace(/^symbol-gap:([0-9]+):/, (all, id) => 'symbol-gap:' + mapped(symbolIds, id) + ':');
  for (const key of ['dimensionOffsets', 'dimensionFontSizes']) if (layout[key]) layout[key] = Object.fromEntries(Object.entries(layout[key]).map(([id, value]) => [dimensionKey(id), value]));
  if (layout.hiddenSummaryDimensions) layout.hiddenSummaryDimensions = layout.hiddenSummaryDimensions.map(dimensionKey);
  for (const key of ['length', 'depth']) if (layout.visibleRackDimensions?.[key]) layout.visibleRackDimensions[key] = layout.visibleRackDimensions[key].map(id => mapped(rackIds, id));
  for (const key of ['selected', 'drag', 'hover']) delete layout[key];
  payload.projectIdentity = { uuid, createdAt: new Date(timestamp).toISOString(), independent: true, schemaVersion: 1 };
  return copy;
}
