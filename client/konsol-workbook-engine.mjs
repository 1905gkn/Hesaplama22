import {evaluateKonsolLevels,validateKonsolLevels} from './konsol-level-model.mjs';
// Port of Gelismiş Statik Analiz F16:F19. Units: N, mm, MPa.
// Source formulas and rounding are preserved; weak-axis restraint is fixed at 2000 mm.
export function evaluateKonsolWorkbook(u,a,s) {
  const round=(v,d=0)=>Math.sign(v)*Math.round((Math.abs(v)+Number.EPSILON)*10**d)/10**d;
  const E=200000,g=9.81,G=E/2.6,fy=s.fy||235,L=s.arm,H=s.height,n=s.levels;
  const area=u.areaCm2*100,I=u.ixCm4*1e4,W=u.wxCm3*1e3;
  const qCol=round(u.massKgM*g/1000,5),qArm=round(a.massKgM*g/1000,5),qLoad=round(s.load*g/L,5),q=qArm+qLoad;
  const moment=round(q*L*L/2,2),EI=E*I;
  const pcr=Math.PI**2*E*I/(2*H)**2;
  const weakPcr=Math.PI**2*E*aSafeIy(u)/(2000**2);
  const fe=Math.min(pcr,weakPcr)/area,fcr=.658**(fy/fe)*fy;
  const pc=fcr*area*.9,mc=W*fy*.9;
  const axial=round(n*q*L*1.4+qCol*H*1.3,1),designMoment=n*moment*1.4;
  const axialRatio=axial/pc,momentRatio=designMoment/mc;
  const columnUsage=axialRatio>=.2?axialRatio+8/9*momentRatio:axialRatio/2+momentRatio;
  const armUsage=round((qArm*1.3+qLoad*1.4)*L*L/2,2)/(.9*fy*a.wxCm3*1000);
  const local=round(q*L**4/(8*E*a.ixCm4*10000),2)+q*L*L/(2*G*a.heightMm*a.webMm);
  const heights=Array.from({length:n},(_,i)=>s.first+i*s.gap),rotations=[];
  for(let i=0;i<n;i++) {
    let rotation;
    // D27:D32 contain explicit expressions. D33 onward use the recurrence.
    if(i===0)rotation=moment*s.first/EI*(n>=2?n:0);
    else if(i===1)rotation=rotations[0]-moment*heights[0]/EI*n+moment*heights[0]/EI+moment*heights[1]/EI*(n-1);
    else if(i<=5)rotation=moment/EI*(heights.slice(0,i).reduce((x,y)=>x+y,0)+heights[i]*(n-i));
    else rotation=rotations[i-1]-moment*heights[i-1]/EI*(n-i+1)+moment*heights[i-1]/EI+moment*heights[i]/EI*(n-i);
    rotations.push(round(rotation,5));
  }
  const totals=heights.map((y,i)=>round(local+round(rotations[i]*L,2)+round(qCol/(E*area)*(H*y-y*y/2),4),2));
  const total=Math.max(...totals),localLimit=L/200,totalLimit=Math.min(15,L/100);
  return {columnUsage,armUsage,local,total,localLimit,totalLimit,axialRatio,momentRatio,pcr,
    safe:[columnUsage,armUsage,local,total].every(Number.isFinite)&&columnUsage<1&&armUsage<1&&local<localLimit&&total<=totalLimit&&n*q*L+qCol*H<pcr,
    mass:u.massKgM*(H+s.base)/1000+a.massKgM*L*n/1000};
  function aSafeIy(p){return p.iyCm4*10000;}
}

export function recommendKonsolWorkbook(profiles,s) {
  if(![s.arm,s.gap,s.levels,s.load,s.count].every(v=>Number.isFinite(v)&&v>0))return {valid:false,reason:'Yük, kol boyu, kat aralığı ve taşıyan kol adedini doldurun.'};
  if(s.sides!==1)return {valid:false,reason:'Bu Excel tek taraflı yük durumunu hesaplıyor. Çift taraflı raf için doğrulanmış yük durumu gerekli.'};
  if(!Number.isInteger(s.levels)||s.levels<2||s.levels>12)return {valid:false,reason:'Kaynak hesap bu uygulamada 2–12 kol katı için kullanılır. Tek kat için kaynak dönme formülü ayrıca doğrulanmalı.'};
  if(s.levelRows){const error=validateKonsolLevels(s.levelRows,s.levels);if(error)return {valid:false,reason:error};}
  if(s.actualHeight&&s.levelRows&&s.actualHeight<s.levelRows.reduce((sum,r)=>sum+r.distance,0))return {valid:false,reason:'Ayak yüksekliği en üst kol kotundan kısa olamaz.'};
  const candidates=[];
  for(const u of profiles.filter(p=>p.name.startsWith('IPE ')))for(const a of profiles.filter(p=>p.name.startsWith('NPI '))) {
    // Same elevations as the existing 3D viewer: base profile top + n net gaps.
    const first=u.heightMm+s.gap-a.heightMm/2;
    const height=u.heightMm+s.gap*(s.levels+1);
    if(first<=0||s.gap<=a.heightMm)continue;
    const result=s.levelRows?evaluateKonsolLevels(u,a,s):evaluateKonsolWorkbook(u,a,{...s,first,height,load:s.load/s.count});
    if(result.safe)candidates.push({u:{...u,key:u.name.toLowerCase().replaceAll(' ','')},a:{...a,key:a.name.toLowerCase().replaceAll(' ','')},...result,height:result.height||height,first:result.first||first});
  }
  candidates.sort((x,y)=>x.mass-y.mass||x.u.heightMm-y.u.heightMm||x.a.heightMm-y.a.heightMm);
  return {valid:!!candidates.length,choice:candidates[0]||null,reason:candidates.length?'':'Excel kapasite ve sehim kontrollerini sağlayan ayak–kol çifti bulunamadı.',...s,armLoad:s.load/s.count};
}
