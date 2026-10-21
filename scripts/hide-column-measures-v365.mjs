export function transform(html){
 if(html.includes('data-column-measure-hidden="v365"'))return html;
 const start=html.indexOf('function m2ColumnDistanceGuide('),end=html.indexOf('function m2SetRackCenterDistance(',start+10);if(start<0||end<start)throw Error('v365 column guide anchor');
 html=html.slice(0,start)+'function m2ColumnDistanceGuide(){return "";}\n      '+html.slice(end);
 const replace=(a,b,n=1)=>{if(html.split(a).length!==n+1)throw Error('v365 anchor '+a.slice(0,100));html=html.split(a).join(b);};
 // Both the normal editor and the lightweight drag editor omit this field.
 replace('nearestColumn=m2NearestColumnGap(measurementRack)','nearestColumn=null',2);
 // Selecting a column must not draw the reverse rack-to-column measurement.
 replace('const nearest=m2NearestSymbolRackRelation(symbol);if(nearest)add','const nearest=symbol.type==="column"?null:m2NearestSymbolRackRelation(symbol);if(nearest)add');
 const body=html.lastIndexOf('</body>');if(body<0)throw Error('v365 body');return html.slice(0,body)+'<meta data-column-measure-hidden="v365">'+html.slice(body);
}

