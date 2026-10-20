export function transform(html){
 if(html.includes('data-single-wall="v344"'))return html;
 const anchor='const m2WallMeasurementInset = 1;';if(html.split(anchor).length!==2)throw Error('v344 wall inset missing');
 html=html.replace(anchor,'const m2WallMeasurementInset = 0;');
 const css='<style data-single-wall="v344">.m2-floor-area,.m2-floor-walls,.rafex-cad-wall{stroke-width:1!important;stroke-linecap:butt!important;vector-effect:non-scaling-stroke}.m2-floor-area-inner,.m2-floor-walls-inner{stroke:none!important;fill:none!important;display:none!important}</style>';
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v344 body missing');return html.slice(0,end)+css+html.slice(end);
}

