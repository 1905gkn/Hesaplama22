// Apply after historical row/height source patches, so they cannot restore the
// old fixed overlap or reverse the physical connector contact.
export function transformMrConnectors596(source){
 if(source.includes('/* measured-connector-contact-596 */'))return source;
 const anchor='const beamDepth = Math.max(1, traverse.size.z);';if(!source.includes(anchor))throw Error('MR connector depth anchor');
 source=source.replace(anchor,anchor+'\n      /* measured-connector-contact-596 */\n      const connectorScale596=width/Math.max(1,traverse.size.x-2*traverse.endOverlap),connectorOverlap596=traverse.endOverlap*connectorScale596;');
 let scales=0;source=source.replace(/beam\.scale\.set\((?:width \/ traverse\.size\.x|\(width \+ beamOverlap \* 2\) \/ traverse\.size\.x), traverseHeight \/ traverse\.size\.y, 1\);/g,()=>{scales++;return 'beam.scale.set(connectorScale596, traverseHeight / traverse.size.y, 1);';});if(!scales)throw Error('MR connector scale anchor');
 const front=/if \(side === "front"\) \{\s*(?:beam\.rotation\.y = (?:Math\.PI|0);\s*)?beam\.position\.set\(moduleX(?: \+ width| - beamOverlap)?, levelY, (?:beamDepth|0|rowZ)\);/;
 if(!front.test(source))throw Error('MR front connector anchor');const rowed=source.match(front)[0].includes('rowZ');source=source.replace(front,'if (side === "front") {\n              beam.rotation.y = 0;\n              beam.position.set(moduleX-connectorOverlap596, levelY, '+(rowed?'rowZ-.2':'-.2')+');');
 const back=/\} else \{\s*(?:beam\.rotation\.y = Math\.PI;\s*)?beam\.position\.set\(moduleX(?: \+ width(?: \+ beamOverlap)?)?, levelY, (?:Math\.max\(0, depth - beamDepth\)|depth|rowZ \+ depth)\);/;
 if(!back.test(source))throw Error('MR rear connector anchor');source=source.replace(back,'} else {\n              beam.rotation.y = Math.PI;\n              beam.position.set(moduleX + width + connectorOverlap596, levelY, '+(rowed?'rowZ + depth + .2':'depth + .2')+');');
 return source;
}
