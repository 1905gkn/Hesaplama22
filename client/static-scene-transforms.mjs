// A read-only layout has fixed world transforms. The renderer still updates the
// camera normally; only explicitly changed overlays/vehicles need a refresh.
export function createStaticSceneTransforms(scene){
 let refreshes=0;
 const refresh=(object=scene)=>{object.updateMatrixWorld(true);refreshes++;};
 refresh();scene.matrixWorldAutoUpdate=false;
 return {refresh,stats:()=>({refreshes})};
}
