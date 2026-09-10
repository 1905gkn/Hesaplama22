export function buildPdfFootCountGroups(inputRacks) {
  const racks = Array.isArray(inputRacks) ? inputRacks.filter(Boolean) : [];
  const byId = new Map(racks.map((rack) => [Number(rack.id), rack]));
  const links = new Map(racks.map((rack) => [Number(rack.id), []]));

  racks.forEach((rack) => {
    const id = Number(rack.id), parent = Number(rack.sharedFootWith);
    if (!Number.isFinite(id) || !Number.isFinite(parent) || !byId.has(parent)) return;
    links.get(id)?.push(parent);
    links.get(parent)?.push(id);
  });

  const visited = new Set(), components = [];
  racks.forEach((rack) => {
    const first = Number(rack.id);
    if (visited.has(first)) return;
    const stack = [first], members = [];
    while (stack.length) {
      const id = stack.pop();
      if (visited.has(id)) continue;
      visited.add(id);
      const member = byId.get(id);
      if (member) members.push(member);
      (links.get(id) || []).forEach((next) => { if (!visited.has(next)) stack.push(next); });
    }
    if (members.length) components.push(members);
  });

  const boundsOf = (rack) => {
    const x = Number(rack.x) || 0, y = Number(rack.y) || 0;
    const rawW = Math.max(0, Number(rack.w) || 0), rawH = Math.max(0, Number(rack.h) || 0);
    const quarter = Math.abs(Math.round(Number(rack.angle) || 0) % 180) === 90;
    const width = quarter ? rawH : rawW, height = quarter ? rawW : rawH;
    const cx = x + rawW / 2, cy = y + rawH / 2;
    return { left:cx - width / 2, right:cx + width / 2, top:cy - height / 2, bottom:cy + height / 2 };
  };

  const groups = components.map((members) => {
    const memberIds = new Set(members.map((rack) => Number(rack.id)));
    const frameSystem = members.some((rack) => Boolean(rack.b2bLayout));
    let footTeams = 0;
    members.forEach((rack) => {
      if (rack.b2bLayout) {
        const rowCount = Math.max(1, Number(rack.b2bLayout.rowCount) || (rack.b2b?.rowType === "double" ? 2 : 1));
        const sharesInsideGroup = memberIds.has(Number(rack.sharedFootWith));
        footTeams += 2 * rowCount - (sharesInsideGroup ? rowCount : 0);
        return;
      }
      const profileCount = Array.isArray(rack.plan?.feet) ? rack.plan.feet.length : 0;
      footTeams += profileCount * Math.max(1, (Number(rack.bays) || 0) + 1);
    });
    const boxes = members.map(boundsOf);
    const left = Math.min(...boxes.map((box) => box.left));
    const right = Math.max(...boxes.map((box) => box.right));
    const top = Math.min(...boxes.map((box) => box.top));
    const bottom = Math.max(...boxes.map((box) => box.bottom));
    const first = members[0] || {};
    const system = String(first.rafexSystem || first.rafexSystemLabel || (first.b2bLayout ? "B2B" : "RAF")).toUpperCase();
    const block = String(first.blockName || first.typeName || first.name || "Raf bloğu").trim();
    return {
      block,
      system,
      moduleCount:members.length,
      rowCount:Math.max(1, ...members.map((rack) => Number(rack.b2bLayout?.rowCount) || 1)),
      footTeamCount:Math.max(0, Math.round(footTeams)),
      uprightCount:Math.max(0, Math.round(frameSystem ? footTeams * 2 : footTeams)),
      frameSystem,
      bounds:{ left, right, top, bottom, cx:(left + right) / 2, cy:(top + bottom) / 2 },
      rackIds:members.map((rack) => rack.id),
    };
  });

  groups.sort((a, b) => a.bounds.top - b.bounds.top || a.bounds.left - b.bounds.left);
  return groups.map((group, index) => ({ ...group, code:`G${index + 1}` }));
}

