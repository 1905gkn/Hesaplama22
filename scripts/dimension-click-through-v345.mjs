export function transform(html){
 if(html.includes('data-dimension-click-through="v345"'))return html;
 const css='<style data-dimension-click-through="v345">#page :is(#m2LayoutSvg,.rafex-drag-scene-v248):not(.m2-dimension-editing) :is(.m2-total-length-label,.m2-total-depth-label,[data-dimension-key^="total-length"],[data-dimension-key^="total-depth"]){pointer-events:none!important;cursor:default!important}</style>';
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v345 body missing');return html.slice(0,end)+css+html.slice(end);
}

