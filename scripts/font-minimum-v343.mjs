export function transform(html){
 if(html.includes('data-font-minimum="v343"'))return html;
 let inputs=0,clamps=0;
 html=html.replace(/(<input id="(?:m2DimensionFontSize|m2AnnotationFontSize|kcfDimFont|kcfTextFont)" type="number" min=")6"/g,(_,prefix)=>{inputs++;return prefix+'1"';});
 html=html.replace(/Math\.max\(6,(\s*Math\.min\((?:36|72),)/g,(_,tail)=>{clamps++;return 'Math.max(1,'+tail;});
 if(inputs!==4||clamps!==5)throw Error('v343 font anchors: inputs='+inputs+' clamps='+clamps);
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v343 body missing');return html.slice(0,end)+'<meta data-font-minimum="v343">'+html.slice(end);
}

