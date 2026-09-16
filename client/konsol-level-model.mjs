export function konsolLevelGeometry(rows,extension){
 let top=0;
 return rows.map((r,i)=>{top+=Number(r.distance);return {...r,top,productHeight:Math.max(50,Number(rows[i+1]?.distance??extension)-100)};});
}
export function evaluateKonsolLevels(u,a,s){
 const E=200000,G=E/2.6,fy=235,g=9.81,area=u.areaCm2*100,I=u.ixCm4*1e4,W=u.wxCm3*1e3;
 const round=(v,d)=>Math.round(v*10**d)/10**d;
 const geometry=konsolLevelGeometry(s.levelRows,s.gap),H=s.capacityHeight||geometry.at(-1).top+s.gap;
 if(geometry[0].top-a.heightMm<=u.heightMm||geometry.some((r,i)=>i&&r.distance<=a.heightMm))return {safe:false};
 const rows=geometry.map(r=>{const L=r.depth,qArm=round(a.massKgM*g/1000,5),qLoad=round((r.load/s.count)*g/L,5),q=qArm+qLoad;
 return {...r,y:r.top-a.heightMm/2,L,q,force:q*L,moment:round(q*L*L/2,2),designMoment:round((qArm*1.3+qLoad*1.4)*L*L/2,2),local:round(q*L**4/(8*E*a.ixCm4*1e4),2)+q*L*L/(2*G*a.heightMm*a.webMm)};});
 const qCol=round(u.massKgM*g/1000,5),pcr=Math.PI**2*E*I/(2*H)**2,weak=Math.PI**2*E*u.iyCm4*1e4/2000**2;
 const fe=Math.min(pcr,weak)/area,pc=.658**(fy/fe)*fy*area*.9,mc=W*fy*.9;
 const axial=rows.reduce((sum,r)=>sum+r.force,0),moment=rows.reduce((sum,r)=>sum+r.moment,0);
 const axialRatio=round(axial*1.4+qCol*H*1.3,1)/pc,momentRatio=moment*1.4/mc;
 const columnUsage=axialRatio>=.2?axialRatio+8/9*momentRatio:axialRatio/2+momentRatio;
 const checks=rows.map(r=>{const rotation=rows.reduce((sum,other)=>sum+other.moment*Math.min(r.y,other.y)/(E*I),0);
 const total=round(r.local+round(round(rotation,5)*r.L,2)+round(qCol/(E*area)*(H*r.y-r.y*r.y/2),4),2);
 const armUsage=r.designMoment/(.9*fy*a.wxCm3*1e3),localLimit=r.L/200,totalLimit=Math.min(15,r.L/100);
 return {...r,total,armUsage,localLimit,totalLimit,safe:armUsage<1&&r.local<localLimit&&total<=totalLimit};});
 const critical=checks.reduce((a,b)=>a.total/a.totalLimit>=b.total/b.totalLimit?a:b);
 return {safe:Number.isFinite(columnUsage)&&columnUsage<1&&axial+qCol*H<pcr&&checks.every(r=>r.safe),columnUsage,armUsage:Math.max(...checks.map(r=>r.armUsage)),total:critical.total,totalLimit:critical.totalLimit,height:H,first:rows[0].y,checks,mass:u.massKgM*(H+s.base)/1000+a.massKgM*rows.reduce((sum,r)=>sum+r.L,0)/1000};
}
export function validateKonsolLevels(rows,count){
 if(!Array.isArray(rows)||rows.length!==count)return 'Her kat için bilgi girin.';
 for(let i=0;i<rows.length;i++){const r=rows[i];if(!r||!['distance','load','depth'].every(k=>Number.isFinite(r[k])))return (i+1)+'. katın tüm alanlarını doldurun.';
 if(r.distance<=0||r.distance>10000)return (i+1)+'. kat mesafesi 0–10.000 mm aralığında olmalı (0 hariç).';
 if(r.load<0||r.load>50000)return (i+1)+'. kat yükü 0–50.000 kg aralığında olmalı.';
 if(r.depth<250||r.depth>3000)return (i+1)+'. kat derinliği 250–3.000 mm aralığında olmalı.';}
 return '';
}

