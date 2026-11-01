// Shared Drive-In upright height: upper load top plus the 220mm top connection allowance.
export function driveInUprightHeight(c){
 const positive=(v,f)=>Number.isFinite(Number(v))&&Number(v)>0?Number(v):f;
 const first=Number(c.firstLevelHeight??c.firstRailHeight);
 return (Number.isFinite(first)&&first>=0?first:430)+Math.max(0,Math.round(positive(c.levels,4))-1)*positive(c.levelSpacing??c.levelH,1580)+positive(c.palletHeight,1200)+220;
}
