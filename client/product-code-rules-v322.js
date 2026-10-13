/* Product-code primitives. Dimensions are millimetres; thickness is mm. */
(function(root){
  'use strict';
  function positive(value){
    const number=Number(String(value).replace(',','.'));
    return Number.isFinite(number)&&number>0?number:null;
  }
  function dimension(value,threshold){
    const number=positive(value);
    if(number===null||!Number.isInteger(number))return '';
    return (number<threshold?'0':'')+String(number);
  }
  function thickness(value){
    const number=positive(value);
    return number===null?'':String(Math.round(number*100));
  }
  function shim(width){
    return ({90:'SIMK100090100',100:'SIMK100090100',120:'SIMK120100',127:'SIMK12725016010',140:'SIM140100'})[Number(width)]||'';
  }
  function weldedShoe(width){
    const number=Number(width);
    if(number===140)return 'APKHR120240140';
    return [90,100,120,127].includes(number)?'APKHR'+String(number).padStart(3,'0'):'';
  }
  function profileData(profile){
    const match=String(profile||'').match(/HR\s*(\d{2,3})[.x×]\d+(?:[.x×]([\d,]+(?:\.\d+)?))?/i);
    return match?{width:Number(match[1]),thickness:positive(match[2])}:null;
  }
  function frame(profile,height,depth){
    const data=profileData(profile),h=dimension(height,10000),d=positive(depth);
    if(!data||!data.thickness||!h||!d||!Number.isInteger(d))return '';
    return 'HR'+String(data.width).padStart(3,'0')+h+String(d)+thickness(data.thickness);
  }
  function ccBeam(profile,length){
    const match=String(profile||'').match(/^CC\s*(\d+)[x×.]\s*(\d+)[x×.]\s*(\d+(?:[,.]\d+)?)/i);
    const l=dimension(length,1000);
    if(!match||!l)return '';
    const h=String(Number(match[1])).padStart(3,'0'),w=String(Number(match[2])).padStart(3,'0');
    return 'CCT'+h+l+h+w+thickness(match[3]);
  }
  function codeFor(item,spec){
    const text=String(spec||''),name=String(item||'').toLocaleLowerCase('tr-TR');
    const p=profileData(text);
    if(name==='ayak pabucu'&&/kaynaklı/i.test(text))return weldedShoe(p?.width);
    if(name==='şim')return shim(p?.width);
    if(name==='kimyasal dübel')return 'KLDM12110';
    if(name==='emniyet pimi')return 'EPHR';
    if(name==='ayak takımı'){
      const h=text.match(/Yükseklik\s+([\d.]+)\s*mm/i),d=text.match(/Derinlik\s+([\d.]+)\s*mm/i);
      return h&&d?frame(text,Number(h[1].replaceAll('.','')),Number(d[1].replaceAll('.',''))):'';
    }
    if(name==='travers'){
      const l=text.match(/^([\d.]+)\s*mm\s*·\s*(CC.*)$/i);
      return l?ccBeam(l[2],Number(l[1].replaceAll('.',''))):'';
    }
    if(name==='düz arabağ'){
      const l=text.match(/^([\d.]+)\s*(?:×|mm)/);
      return l?'DAB90'+dimension(Number(l[1].replaceAll('.','')),1000):'';
    }
    return '';
  }
  function split(spec){
    const text=String(spec||''),match=text.match(/^((?:HR\d+|CCT\d+|APKHR\d+|SIMK?\d+|KLDM12110|EPHR|DAB90\d+))\s*·\s*([\s\S]*)$/);
    return match?{code:match[1],description:match[2]}:{code:'',description:text};
  }
  root.rafexProductCodeRulesV322=Object.freeze({dimension,thickness,shim,weldedShoe,profileData,frame,ccBeam,codeFor,split,anchor:'KLDM12110',safetyPin:'EPHR'});
})(typeof window==='undefined'?globalThis:window);

