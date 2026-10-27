export function transform(html){
 if(html.includes('data-equal-distance-font="v367"'))return html;
 const replace=(a,b,n=1)=>{if(html.split(a).length!==n+1)throw Error('v367 anchor '+a.slice(0,100));html=html.split(a).join(b);};
 // New dimensions start at 12; Saved per-label/global font
 // sizes remain inline important values and retain their existing precedence.
 replace('.m2-rack-distance-label { fill:#6f4700; font:900 8.5px Arial;','.m2-rack-distance-label { fill:#6f4700; font:900 12px Arial;');
 replace('.m2-wall-distance-label { fill:#075f40; font:900 8px Arial;','.m2-wall-distance-label { fill:#075f40; font:900 12px Arial;');
 replace('.rafex-common-pair-gap .m2-rack-distance-label{fill:#6f4700!important;font:900 8.5px Arial!important;','.rafex-common-pair-gap .m2-rack-distance-label{fill:#6f4700!important;font:900 12px Arial!important;');
 replace('{font-size:4.25px;stroke-width:1.25px}','{font-size:12px;stroke-width:1.25px}');
 replace('{font-size:4.25px!important;stroke-width:1.25px!important}','{font-size:12px!important;stroke-width:1.25px!important}');
 replace("if(!Number(node.dataset.rafexDimensionFontSize))if(!node.dataset.rafexPdfGapV286)set(node,'font-size','12px');","if(!Number(node.dataset.rafexDimensionFontSize))if(!node.dataset.rafexPdfGapV286)set(node,'font-size','12px');");
 // Give every untouched dimension the same default, including the size input.
 replace('size = (m2DimensionFontSizes[key]??m2DimensionFontSizes.__all);','size = (m2DimensionFontSizes[key]??m2DimensionFontSizes.__all??12);');
 html=html.replace(/(id="m2DimensionFontSize"[^>]*value=")16(")/g,(_,a,b)=>a+'12'+b);
 html=html.replace("(m2DimensionFontSizes[key]??m2DimensionFontSizes.__all)||16","(m2DimensionFontSizes[key]??m2DimensionFontSizes.__all)||12");
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v367 body');return html.slice(0,end)+'<meta data-equal-distance-font="v367">'+html.slice(end);
}

