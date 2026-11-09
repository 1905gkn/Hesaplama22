// Commit numeric rack edits through the same synchronous path as choice controls.
export const runtime="\n(function(){\n  if(window.b2bQueueLiveInputV486)return;\n  let pending=null,timer=null;\n  const applied=new WeakMap();\n  function cancel(){clearTimeout(timer);timer=null;pending=null;}\n  function usable(input){\n    return input&&input.isConnected&&document.getElementById(input.id)===input&&\n      input.closest('.b2b-input-card')&&typeof m2ActiveModule!=='undefined'&&m2ActiveModule==='b2b'&&\n      input.value.trim()!==''&&(input.tagName==='SELECT'||Number.isFinite(Number(input.value)))&&input.validity.valid;\n  }\n  function flush(){\n    const input=pending;cancel();\n    if(!usable(input)||applied.get(input)===input.value)return;\n    b2bApplyInputs({target:input,type:'change',deferred:true});\n    applied.set(input,input.value);\n    if(typeof b2b3DUpdateTimer!=='undefined'){\n      clearTimeout(b2b3DUpdateTimer);b2b3DUpdateTimer=null;\n    }\n    if(document.getElementById('b2bMain3DCanvas'))b2bUpdateMain3D();\n  }\n  window.b2bQueueLiveInputV486=function(event){\n    const input=event&&event.target;\n    if(!usable(input)){cancel();return;}\n    if(input.tagName==='SELECT'){cancel();pending=input;flush();return;}\n    if(pending===input&&timer)return;\n    cancel();pending=input;timer=setTimeout(flush,160);\n  };\n  function finish(event){\n    if(pending===event.target)flush();\n  }\n  document.addEventListener('change',finish,true);\n  document.addEventListener('focusout',finish,true);\n})();\n";
export function transform(html){
 if(html.includes('data-b2b-live-input="v486"'))return html;
 const handler='oninput="b2bApplyInputs(event)"';
 const count=html.split(handler).length-1;
 if(count<8)throw Error('B2B live input handlers missing: '+count);
 html=html.replaceAll(handler,'oninput="b2bQueueLiveInputV486(event)"');
 const end=html.lastIndexOf('</body>');
 if(end<0)throw Error('B2B live input body missing');
 return html.slice(0,end)+'<script data-b2b-live-input="v486">'+runtime+'</script>'+html.slice(end);
}

