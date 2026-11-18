// Older share snapshots replaced an explicit zero with the default four levels.
// Repair only that unambiguous render inconsistency; native section options win.
export function normalizeCollectionOnlyLayout(rack){
 const options=rack.nativeOptions||{},collections=options.collectionFloors||rack.collectionFloors||[];
 const levels=options.levels??rack.levels;
 if(rack.system!=='b2b'||levels===null||levels===''||Number(levels)!==0||!collections.length)return rack;
 if(rack.levels===0&&!rack.floors?.length&&!rack.beamYs?.length&&!rack.palletHeights?.length)return rack;
 return {...rack,levels:0,floors:[],beamYs:[],palletHeights:[]};
}
