export function b2bFrameLayout(r){
 const depth=r.frameDepth;
 const centers=r.positions?.length>=r.rows?r.positions.slice(0,r.rows).map(start=>start+r.palletDepth/2-r.depth/2):Array.from({length:r.rows},(_,i)=>(i-(r.rows-1)/2)*(depth+r.rowGap));
 return {depth,centers};
}
export function b2bBeamMountZ(r,frame,beam,side){
 const face=Number.isFinite(frame.innerFaces?.[String(side)])?frame.innerFaces[String(side)]*r.frameDepth/frame.depth:side*(r.frameDepth/2-.08);
 // The connector's near face touches the upright's inner face. Pallet overhang
 // has no part in this mounting position.
 return face-side*((beam?.depth||.063)/2-.004);
}
