export function transform(html){
 if(html.includes('/* wall-gap-basis-v353 */'))return html;
 const start=html.indexOf('function m2WallMeasurements(rack) {'),end=html.indexOf('\n      /* wall-guides-v225 */',start);if(start<0||end<0)throw Error('v353 wall measurement anchor');
 const part=html.slice(start,end);if(part.split('m2RackBounds(rack)').length!==3)throw Error('v353 wall bounds count');
 return html.slice(0,start)+'/* wall-gap-basis-v353 */ '+part.replaceAll('m2RackBounds(rack)','m2GapBoundsV346(rack)')+html.slice(end);
}

