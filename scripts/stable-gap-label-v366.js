(()=>{
 function key(a,b){const lo=Math.min(Number(a),Number(b)),hi=Math.max(Number(a),Number(b)),keys=['pair-gap:'+lo+':'+hi,'pair-gap:'+hi+':'+lo,'gap:'+lo+':'+hi,'gap:'+hi+':'+lo],offsets=typeof m2DimensionOffsets==='undefined'?{}:m2DimensionOffsets,fonts=typeof m2DimensionFontSizes==='undefined'?{}:m2DimensionFontSizes;return keys.find(k=>Object.hasOwn(offsets,k)||Object.hasOwn(fonts,k))||keys[0];}
 function position(key,x,y){const parts=key.split(':'),reverse=parts.length===3?'pair-gap:'+parts[2]+':'+parts[1]:'',offsets=typeof m2DimensionOffsets==='undefined'?{}:m2DimensionOffsets,offset=offsets[key]||offsets[reverse]||{};return{x:x+(Number(offset.x)||0),y:y+(Number(offset.y)||0)};}
 window.rafexStableGapLabelV366={key,position};
})();

