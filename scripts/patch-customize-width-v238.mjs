import fs from 'node:fs';
export function sectionWidthForCount(layout,count){
 const n=Math.max(1,Math.min(4,Math.round(Number(count)||1)));
 if(n===Number(layout.palletCount)&&Number(layout.sectionWidth)>0)return Number(layout.sectionWidth);
 return layout.palletType==='euro'&&n===4?3600:n*(Number(layout.palletWidth)||800)+(n+1)*75;
}
export function syncResizedRack(rack,count,scale,foot,view){
 const layout={...rack.b2bLayout},width=sectionWidthForCount(layout,count);layout.palletCount=count;layout.sectionWidth=width;rack.b2bLayout=layout;
 rack.b2b={...rack.b2b,palletCount:count,importedSectionWidth:width};rack.footType=foot;rack.widthMm=width+2*foot;rack.totalWidth=rack.widthMm;rack.w=Math.max(.5,rack.widthMm*scale);
 if(view)rack.b2bViewerOptions={...view,palletCount:count,sectionWidth:width,moduleCount:1,moduleOptions:null};
 return rack;
}
export function transform(html){
 if(html.includes('data-customize-width="v238"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Missing width anchor '+a.slice(0,90));html=html.replace(a,b);};
 replace('out.palletCount=Math.max(1,Number(count?.value)||out.palletCount);','out.palletCount=Math.max(1,Math.min(4,Math.round(Number(count?.value)||out.palletCount)));out.sectionWidth=rafexSectionWidthV238({...rack.b2bLayout,palletWidth:out.palletWidth},out.palletCount);');
 const start=html.indexOf('      function m2B2BResizeRack(rack, palletCount) {'),end=html.indexOf('      function m2B2BCopyRack(',start);if(start<0||end<0)throw Error('Resize missing');
 html=html.slice(0,start)+`      function m2B2BResizeRack(rack,palletCount){
 if(!rack?.b2bLayout)return rack;
 const count=Math.max(1,Math.min(4,Math.round(Number(palletCount)||1))),view=window.rafexReadRackDetailV135?.(rack,'b2b')||rack.b2bViewerOptions;
 rafexSyncWidthV238(rack,count,m2LayoutState.scale,m2B2BFootWidth(rack),view);
 delete rack.rackDetail;if(window.rafexSealRackDetailV135)rack.rackDetail=window.rafexSealRackDetailV135(rack).rackDetail;
 return rack;
 }
`+html.slice(end);
 replace('return Number(rack?.b2bLayout?.sectionWidth)||Number(window.rafexB2BCustomizeOptionsV120?.(rack)?.sectionWidth)||0;', 'return rack?.b2bLayout?rafexSectionWidthV238(rack.b2bLayout,Number(document.getElementById("m2CustomizePalletCount")?.value)||rack.b2bLayout.palletCount):0;');
 const at=html.lastIndexOf('</body>');return html.slice(0,at)+'<script data-customize-width="v238">const rafexSectionWidthV238='+sectionWidthForCount.toString()+';const sectionWidthForCount=rafexSectionWidthV238;const rafexSyncWidthV238='+syncResizedRack.toString()+';</script>'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-customize-width-v238.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}
