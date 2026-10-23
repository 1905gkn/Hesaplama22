export function transformViewerSource(source){
 if(source.includes('/* b2b-level-limit-v378 */'))return source;
 const replace=(from,to)=>{if(source.split(from).length!==2)throw Error('v378 viewer anchor '+from);source=source.replace(from,to);};
 replace('levels: clamp(Math.round(Number(next.levels) || 4), 1, 15),','levels: clamp(Math.round(Number(next.levels) || 4), 1, 25),');
 replace('level <= 15','level <= 25');
 replace('Math.min(14, Math.round(Number(humanLevel) || 1) - 1)','Math.min(24, Math.round(Number(humanLevel) || 1) - 1)');
 return '/* b2b-level-limit-v378 */\n'+source;
}

export function transform(html){
 if(html.includes('data-b2b-level-limit="v378"'))return html;
 const replace=(from,to)=>{if(html.split(from).length!==2)throw Error('v378 HTML anchor '+from);html=html.replace(from,to);};
 replace('id="b2bLevels" type="number" min="1" max="15"','id="b2bLevels" type="number" min="1" max="25"');
 replace('id="m2CustomizeLevels" type="number" min="1" max="15"','id="m2CustomizeLevels" type="number" min="1" max="25"');
 replace('const inputLevels = Math.max(1, Math.round(Number($("b2bLevels")?.value) || 1));','const inputLevels = Math.max(1, Math.min(25, Math.round(Number($("b2bLevels")?.value) || 1)));');
 replace('m2LimitedNumber("m2Levels", 1, 15, "kat")','m2LimitedNumber("m2Levels", 1, m2ActiveModule === "b2b" ? 25 : 15, "kat")');
 const custom=/Math\.min\(\s*15\s*,(?=[^\n;]{0,160}m2CustomizeLevels)/g;
 const hits=[...html.matchAll(custom)].length;if(hits<6)throw Error('v378 custom level anchors '+hits);
 html=html.replace(custom,'Math.min(Number(document.getElementById("m2CustomizeLevels")?.max)||25,');
 replace("Math.min(15, Math.round(Number(document.getElementById('b2bLevels')?.value) || 1))","Math.min(25, Math.round(Number(document.getElementById('b2bLevels')?.value) || 1))");
 replace('Math.min(14, Math.round(Number(humanLevel) || 1) - 1)','Math.min(24, Math.round(Number(humanLevel) || 1) - 1)');
 const runtime=`(()=>{
 const apply=b2bApplyInputs;
 b2bApplyInputs=window.b2bApplyInputs=function(){
  const input=document.getElementById('b2bLevels');
  if(input){input.max='25';if(input.value!==''&&Number.isFinite(Number(input.value)))input.value=String(Math.max(1,Math.min(25,Math.round(Number(input.value)))));}
  if(m2ActiveModule==='b2b'){const internal=document.getElementById('m2Levels');if(internal)internal.max='25';}
  return apply.apply(this,arguments);
 };
 const open=m2OpenCustomizeModal;
 m2OpenCustomizeModal=window.m2OpenCustomizeModal=function(id){
  const rack=m2LayoutState.racks.find(r=>String(r.id)===String(id)),mr=!!(rack?.b2b?.mr||rack?.rafexSystem==='mr'||rack?.b2bLayout?.palletType==='mr');
  const sync=()=>{const input=document.getElementById('m2CustomizeLevels');if(input)input.max=mr?'15':'25';};
  sync();const result=open.apply(this,arguments);sync();return result;
 };
})();`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v378 body');
 return html.slice(0,end)+'<script data-b2b-level-limit="v378">'+runtime+'</script>'+html.slice(end);
}
