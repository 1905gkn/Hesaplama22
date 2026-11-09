// Immutable edits: a channel selection must never overwrite its neighbours.
export function updateMekikChannels(config,bays,selected,change){
 const c=JSON.parse(JSON.stringify(config||{})),indices=[...new Set(selected)].filter(i=>Number.isInteger(i)&&i>=0&&i<bays);if(!indices.length)return c;
 const valueFor=source=>{if(change.index==null)return change.value;const values=[...(source[change.key]||[])];values[change.index]=change.value;return values;};
 if(indices.length===bays&&!c.lanes?.some(Boolean)){c[change.key]=valueFor(c);return c;}
 const lanes=Array.from({length:bays},(_,i)=>c.lanes?.[i]||null);
 for(const i of indices)lanes[i]={...lanes[i],[change.key]:valueFor({...c,...lanes[i]})};
 c.lanes=lanes;return c;
}
