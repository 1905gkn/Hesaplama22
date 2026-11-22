export function frameDepth603(palletDepth,requested=1100){const pallet=Math.max(300,Number(palletDepth)||1200),value=Number(requested),depth=Math.max(100,Math.min(pallet,Number.isFinite(value)?value:1100));return {palletDepth:pallet,frameDepth:depth,palletOverhang:(pallet-depth)/2};}

