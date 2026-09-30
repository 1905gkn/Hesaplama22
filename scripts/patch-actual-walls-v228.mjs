import fs from 'node:fs';
export function transform(html){if(html.includes('actual-walls-v228'))return html;
const start=html.indexOf('      function m2WallMeasurements(rack) {');
const helper=`      /* actual-walls-v228 */
      function m2ActualWallsV228(box){
        const vertical=[],horizontal=[];
        for(const segment of m2PerfWallGeometryTable().segments){
          if(segment.vertical&&box.cy>=segment.minY-.5&&box.cy<=segment.maxY+.5)vertical.push(segment.a.x);
          if(segment.horizontal&&box.cx>=segment.minX-.5&&box.cx<=segment.maxX+.5)horizontal.push(segment.a.y);
        }
        return {left:Math.max(...vertical.filter(x=>x<=box.left+.5)),right:Math.min(...vertical.filter(x=>x>=box.right-.5)),top:Math.max(...horizontal.filter(y=>y<=box.top+.5)),bottom:Math.min(...horizontal.filter(y=>y>=box.bottom-.5))};
      }
`;
html=html.slice(0,start)+helper+html.slice(start);
const a=html.indexOf('        const box=m2CombinedRackBounds(rack),walls=m2PerfWallGeometryTable(),verticalWalls=[]'),b=html.indexOf('        const leftSurface=',a);
if(a<0||b<0)throw Error('Missing geometry');html=html.slice(0,a)+`        const box=m2CombinedRackBounds(rack),actual=m2ActualWallsV228(box),{left:leftWall,right:rightWall,top:topWall,bottom:bottomWall}=actual;
`+html.slice(b);
html=html.replace('        m2PerfRememberDistanceDependency(rack,"walls",result);','        for(const direction of Object.keys(result))if(!Number.isFinite(actual[direction]))delete result[direction];\n        m2PerfRememberDistanceDependency(rack,"walls",result);');
html=html.replace('current = m2WallMeasurements(rack)[direction];','current = m2WallMeasurements(rack)[direction]; if(!current)return;');
const old='const box=m2SymbolBounds(symbol),xs=m2LayoutState.points.map((point)=>point.x),ys=m2LayoutState.points.map((point)=>point.y),walls={left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)},lines=[];';
if(!html.includes(old))throw Error('Missing symbol geometry');html=html.replace(old,'const box=m2SymbolBounds(symbol),walls=m2ActualWallsV228(box),lines=[];');
html=html.replace('const add=(x1,y1,x2,y2,mm,key)=>{const value=', 'const add=(x1,y1,x2,y2,mm,key)=>{if(![x1,y1,x2,y2,mm].every(Number.isFinite))return;const value=');return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-actual-walls-v228.mjs')){const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}
