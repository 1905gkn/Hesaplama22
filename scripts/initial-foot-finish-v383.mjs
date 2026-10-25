export function transform(html){
 if(html.includes('data-initial-foot-finish="v383"'))return html;
 const old=`mekikFootColor:(m2ActiveModule==='mekik2'?document.querySelector('.rafex-mekik-foot-color')?.value:null)||m2LastDrawing?.mekikFootColor||(m2ActiveModule==='drive'?'pgv':'ral5010'), bays, levels, depth,`;
 if(html.split(old).length!==2)throw Error('v383 initial finish anchor');
 html=html.replace(old,`rafexSystem:m2ActiveModule, mekikFootColor:window.rafexInitialFootFinishV383(m2ActiveModule,m2LastDrawing), bays, levels, depth,`);
 const control='row.append(foot,beam);form.prepend(row);';
 if(html.split(control).length!==2)throw Error('v383 controls anchor');
 html=html.replace(control,`try{const current=typeof m2LastDrawing!=='undefined'?m2LastDrawing:null;if(current&&(!current.rafexSystem||current.rafexSystem===key)&&['ral5010','pgv'].includes(current.mekikFootColor))foot.querySelector('select').value=current.mekikFootColor;}catch(_){}row.append(foot,beam);form.prepend(row);`);
 const runtime=String.raw`(()=>{
  window.rafexInitialFootFinishV383=(system,previous)=>{
   const valid=value=>['ral5010','pgv'].includes(value);
   if(system==='mekik2'||system==='drive'){
    const visible=Array.from(document.querySelectorAll('.rafex-mekik-foot-color')).filter(node=>node.isConnected&&node.getClientRects().length>0);
    const choice=visible.at(-1)?.value;
    if(valid(choice))return choice;
   }
   const previousSystem=previous?.rafexSystem||(previous?.systemType==='drive'?'drive':'mekik2');
   if(previousSystem===system&&valid(previous?.mekikFootColor))return previous.mekikFootColor;
   return 'ral5010';
  };
  document.addEventListener('change',event=>{
   if(!event.target.matches?.('.rafex-mekik-foot-color'))return;
   try{if(typeof m2LastDrawing!=='undefined'&&m2LastDrawing)m2LastDrawing.mekikFootColor=event.target.value;}catch(_){}
  });
 })();`;
 const first=html.indexOf('<script');
 return html.slice(0,first)+'<script data-initial-foot-finish="v383">'+runtime+'</script>'+html.slice(first);
}

