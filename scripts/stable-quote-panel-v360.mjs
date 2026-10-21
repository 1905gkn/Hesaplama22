export function transform(html){
 if(html.includes('data-stable-quote-panel="v360"'))return html;
 if(!html.includes('data-attributed-quotes="v358"'))throw Error('v360 attributed carousel missing');
 // Keep every daily quotation in the same grid cell so the tallest reserves
 // its full height. Visibility hides inactive text and links without reflow.
 const css='.rafex-daily-motivation-v355 ol{display:grid;grid-template-columns:minmax(0,1fr);align-items:start}.rafex-daily-motivation-v355 ol>li{display:block;grid-area:1/1;min-width:0;visibility:hidden;pointer-events:none;overflow-wrap:anywhere}.rafex-daily-motivation-v355 ol>li.active{visibility:visible;pointer-events:auto}';
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v360 body');
 return html.slice(0,end)+'<style data-stable-quote-panel="v360">'+css+'</style>'+html.slice(end);
}

