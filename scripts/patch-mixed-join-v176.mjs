import fs from 'node:fs';
export function mixedJoinPosition(double,single,row,foot,scale){
 const rad=Number(double.angle||0)*Math.PI/180,ux=Math.cos(rad),uy=Math.sin(rad),vx=-uy,vy=ux;
 const cx=double.x+double.w/2,cy=double.y+double.h/2;
 const sign=((single.x+single.w/2-cx)*ux+(single.y+single.h/2-cy)*uy)>=0?1:-1;
 const along=(double.w+single.w)/2-foot*scale,across=(row==='upper'?-1:1)*(double.h-single.h)/2;
 return {x:cx+sign*ux*along+vx*across-single.w/2,y:cy+sign*uy*along+vy*across-single.h/2,sign};
}
export function mixedJoin(first,second){
 const rows=r=>Number(r?.b2bLayout?.rowCount)||1;
 if(!first||!second||!([rows(first),rows(second)].sort().join(',')==='1,2'))return false;
 const double=rows(first)===2?first:second,single=rows(first)===1?first:second;
 const status=text=>document.getElementById('m2FloorStatus').textContent=text;
 const profile=r=>String(r.footProfile||r.footProfileKey||r.b2b?.footProfile||'').trim().toLowerCase().replace(/\s+/g,'').replaceAll(',','.');
 if(first.b2b?.mr||second.b2b?.mr||!profile(first)||profile(first)!==profile(second)||m2B2BFootWidth(first)!==m2B2BFootWidth(second)){
  status('Tekli–çiftli birleşimde ayak tipleri aynı olmalı.');return true;
 }
 if(Math.abs((Number(first.angle||0)-Number(second.angle||0))%360)>.1){status('Birleşecek rafların yönü aynı olmalı.');return true;}
 if(single.joinGroup&&m2LayoutState.racks.some(r=>r.id!==single.id&&r.joinGroup===single.joinGroup)){
  status('Eklenecek tekli bloğu önce mevcut grubundan ayır.');return true;
 }
 if(Math.abs(Number(double.b2bLayout.frameDepth)-Number(single.b2bLayout.frameDepth))>1){status('Ortak ayak için raf derinlikleri aynı olmalı.');return true;}
 const answer=window.prompt('Tekli blok çift sıranın hangi tarafına eklensin?\n1: Üst sıra (yukarı)\n2: Alt sıra (aşağı)','1');
 if(answer===null)return true;
 const value=answer.trim().toLocaleLowerCase('tr'),row=['1','üst','yukarı'].includes(value)?'upper':['2','alt','aşağı'].includes(value)?'lower':null;
 if(!row){status('Birleştirme yapılmadı. Üst sıra için 1, alt sıra için 2 seç.');return true;}
 const next=mixedJoinPosition(double,single,row,m2B2BFootWidth(double),m2LayoutState.scale);
 if(!m2RackInsideArea(single,next.x,next.y,single.angle)||m2RackOverlapsExcept(single,next.x,next.y,single.angle,[double.id])){
  status('Seçilen tarafta duvar veya başka raf var; birleştirme yapılmadı.');return true;
 }
 m2PushUndo('Tekli–çiftli raf birleştirme');
 single.x=next.x;single.y=next.y;single.joinGroup=double.joinGroup||('join-'+Date.now());double.joinGroup=single.joinGroup;
 single.sharedFootWith=double.id;single.sharedFootSide=next.sign>0?'left':'right';single.freePlacement=false;single.staged=false;single.locked=true;
 m2JoinMode=false;m2JoinFirstRackId=null;m2LayoutState.selected=single.id;
 const button=document.getElementById('m2JoinRackButton');button?.classList.remove('active');button?.setAttribute('aria-pressed','false');
 status('Tekli blok '+(row==='upper'?'üst':'alt')+' sıranın ucuna ortak ayakla birleştirildi.');m2RenderLayout();return true;
}
export function transform(html){
 if(html.includes('/* mixed-join-v176 */'))return html;
 const anchor='        if (!first || Math.abs((first.angle - rack.angle) % 180) > .1 || first.b2bLayout.rowCount !== rack.b2bLayout.rowCount)';
 if(!html.includes(anchor))throw Error('v176 join anchor missing');
 html=html.replace(anchor,'        if(mixedJoin(first,rack))return;\n'+anchor);
 const at=html.lastIndexOf('</body>');return html.slice(0,at)+'<script>/* mixed-join-v176 */'+mixedJoinPosition.toString()+'\n'+mixedJoin.toString()+'</script>'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-mixed-join-v176.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
