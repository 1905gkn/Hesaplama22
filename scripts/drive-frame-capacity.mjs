import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

const heights=[6000,7000,8000,9000,10000,10500,11000,11500,12000,12500];
// ST52 / S355JR, Ly 1200 mm. Blank cells are unavailable.
const profiles=[
 ['HR90.80.1,5',3.20,3252],
 ['HR90.80.2,0',4.26,4132,3245],
 ['HR90.80.2,5',5.33,5372,4222,3371],
 ['HR100.80.1,5',3.31,4264,3376],
 ['HR100.80.2,0',4.42,5648,4478,3600],
 ['HR100.80.2,5',5.52,7032,5568,4490,3674],
 ['HR120.80.1,5',3.78,5990,4763,3853,3157],
 ['HR120.80.2,0',5.04,8251,6539,5282,4331,3621,3280,3002],
 ['HR120.80.2,5',6.30,10202,8094,6536,5357,4482,4061,3717,3411],
 ['HR120.80.3,0',7.57,12029,9586,7746,6342,5309,4813,4405,4043],
 ['HR127.105.2,0',5.98,11940,9614,7853,6490,5416,4971,4566,4086,3726,3413],
 ['HR127.105.2,5',7.48,14760,11904,9723,8037,6707,6157,5654,5056,4707,4227],
 ['HR127.105.3,0',8.98,17531,14136,11534,9523,7949,7230,6707,5979,5456,5005],
 ['HR140.120.2,0',6.66,15122,12664,10582,8917,7549,6971,6434,5949,5512,5126],
 ['HR140.120.2,5',8.32,18966,15866,13224,11117,9397,8675,8010,7413,6862,6389],
 ['HR140.120.3,0',9.99,22808,19006,15808,13269,11219,10346,9552,8840,8182,7611]
];
export function resolveDriveFrames(height,total,frameCount) {
 const index=heights.findIndex(column=>height>0&&column>height);
 const tableHeight=heights[index]??null;
 const load=frameCount>0?total/frameCount:NaN;
 const choices=index<0||!Number.isFinite(load)||load<0?[]:profiles.flatMap(([profile,unitWeight,...capacities])=>{
  const capacity=capacities[index];
  if(capacity==null||capacity<load)return [];
  const thickness=Number(profile.split('.').at(-1).replace(',','.'));
  return [{key:'1200::'+profile,ly:1200,profile,width:Number(profile.match(/^HR(\d+)/)[1]),thickness,unitWeight,capacity,margin:capacity-load,qualified:true}];
 }).sort((a,b)=>Number(b.thickness===2)-Number(a.thickness===2)||a.unitWeight-b.unitWeight);
 choices.forEach((choice,index)=>{choice.recommended=index<3;});
 return {tableHeight,load,choices,allChoices:choices,recommendedChoices:choices.slice(0,3),primary:choices[0]||null};
}

export function transform(html){
 if(html.includes('data-drive-frame-capacity'))return html;
 const replace=(pattern,value)=>{if(!(typeof pattern==='string'?html.includes(pattern):pattern.test(html)))throw Error('Drive frame calculation anchor missing: '+pattern);html=html.replace(pattern,value);};
 replace(/^(          sideUprightHeight = )(.+),$/m,
  '$1m2ActiveModule==="drive"?(deep598?.automatic??Math.ceil((firstRailHeight+(levels-1)*levelH+palletHeight+220)/50)*50):($2),');
 replace(/^(          footLoad = )(.+),$/m,'$1m2ActiveModule==="drive"?(footCount>0?totalPalletLoad/footCount:NaN):($2),');
 replace(/^(          footCalculationHeight = )(.+),$/m,'$1m2ActiveModule==="drive"?sideUprightHeight:($2),');
 replace('footSelection = m2ResolveFootProfiles(footCalculationHeight, footLoad),','footSelection = m2ActiveModule==="drive"?rafexResolveDriveFrames(footCalculationHeight,totalPalletLoad,footCount):m2ResolveFootProfiles(footCalculationHeight, footLoad),');
 replace('selection.tableHeight == null ? "İlk kat yüksekliği kapasite tablosunun 3.000 mm sınırını aşıyor."', 'selection.tableHeight == null ? (m2ActiveModule==="drive"?"12.500 mm ve üzeri ayak boyları için tabloda bir üst sütun bulunmuyor.":"İlk kat yüksekliği kapasite tablosunun 3.000 mm sınırını aşıyor.")');
 replace(/(\? "2\. ÖNERİ"\s*)(:\s*choice\.qualified)/,'$1: recommendationIndex === 2 ? "3. ÖNERİ" $2');
 replace('${fmt(choice.capacity)} kg</option>', '${fmt(choice.capacity)} kg${m2ActiveModule==="drive"?" · "+choice.unitWeight.toLocaleString("tr-TR",{minimumFractionDigits:2})+" kg/m":""}</option>');
 replace('$("m2FootLoadFormula").textContent = plan ? (b2bFootCalculation', '$("m2FootLoadFormula").textContent = m2ActiveModule==="drive"&&footCount ? `${fmt(totalPalletLoad)} kg ÷ ${fmt(footCount)} ayak takımı` : plan ? (b2bFootCalculation');
 replace('$("m2FootFirstLevelSummary").textContent = b2bFootCalculation', '$("m2FootFirstLevelSummary").textContent = m2ActiveModule==="drive" ? `Ayak boyu ${fmt(sideUprightHeight)} mm · tablo: ${footSelection.tableHeight?fmt(footSelection.tableHeight)+" mm":"—"} · ${fmt(loadedLevels)} yüklü kat · Ly 1.200 mm · Düşey statik yük` : b2bFootCalculation');
 const at=html.indexOf('<script');
 return html.slice(0,at)+'<script data-drive-frame-capacity>const rafexResolveDriveFrames=(()=>{const heights='+JSON.stringify(heights)+',profiles='+JSON.stringify(profiles)+';return '+resolveDriveFrames.toString()+';})();</script>'+html.slice(at);
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
  let source=fs.readFileSync(file,'utf8');
  if(file.endsWith('.html'))source=transform(source);
  else {
   const match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
   if(!match)throw Error('Missing server HTML');
   source=source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64'));
  }
  fs.writeFileSync(file,source);
 }
}
