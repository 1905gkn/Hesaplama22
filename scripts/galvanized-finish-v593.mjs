export function transformViewerSource593(source,system){
 if(source.includes('/* galvanized-finish-v593 */'))return source;
 let from,to;
 if(system==='b2b'){from='this.content.updateMatrixWorld(true);this.addGround();this.fitCamera';to='stabilizeGalvanizedObject593(this.content);this.content.updateMatrixWorld(true);this.addGround();this.fitCamera';}
 if(system==='mr'){from='this.addDimensions(levelYs, totalWidth, depth, uprightHeight);';to='stabilizeGalvanizedObject593(this.root);'+from;}
 if(system==='drive-in'){from='this.nativeFacing=createDriveNativeFacing(this.root);';to='stabilizeGalvanizedObject593(this.root);'+from;}
 if(['konsol','mekik-front'].includes(system)){from='this.root.add(floor);';to=from+'stabilizeGalvanizedObject593(this.root);';}
 if(!from||!source.includes(from))throw Error('Missing PGV finalization '+system);
 return "/* galvanized-finish-v593 */\nimport {stabilizeGalvanizedObject593} from '../client/galvanized-material-v593.mjs';\n"+source.replace(from,to);
}
