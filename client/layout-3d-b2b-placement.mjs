export function b2bFrameLayout(r){
 const depth=r.frameDepth;
 const starts=r.positions?.slice(0,r.rows)||[],pitch=depth+r.rowGap,consistent=starts.length===r.rows&&Math.abs(starts.at(-1)-starts[0]+r.palletDepth-r.depth)<.000001&&starts.every((start,i)=>i===0||Math.abs(start-starts[i-1]-pitch)<.000001);
 const centers=consistent?starts.map(start=>start+r.palletDepth/2-r.depth/2):Array.from({length:r.rows},(_,i)=>(i-(r.rows-1)/2)*pitch);
 return {depth,centers};
}
export function b2bBeamMountZ(r,frame,beam,side){
 const face=Number.isFinite(frame.outerFaces?.[String(side)])?frame.outerFaces[String(side)]*r.frameDepth/frame.depth:side*r.frameDepth/2;
 // Seat the connector against the outside upright face, independently of pallets.
 return face+side*((beam?.depth||.063)/2-.004);
}
