import fs from 'node:fs';
import vm from 'node:vm';
export function transform(html){
 if(html.includes('data-note-pins="v505"'))return html;
 if(!html.includes('function sharedNotesRuntimeV405'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v505 missing '+a.slice(0,100));html=html.replace(a,b)};
 replace(".sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at)||Number(b.id)-Number(a.id))", ".sort((a,b)=>Number(!!Number(b.pinned))-Number(!!Number(a.pinned))||Date.parse(b.created_at)-Date.parse(a.created_at)||Number(b.id)-Number(a.id))");
 replace("window.rafexNotesV405={", `window.rafexNotesV405={
  async pin(id,button){const note=byId(id);if(!note||loading||button?.disabled)return;if(button)button.disabled=true;try{await req('/api/todos/'+id+'/pin',{method:'POST',body:JSON.stringify({pinned:!Number(note.pinned)})});signature='';await loadTodos();}catch(error){message(error.message,true);}finally{if(button?.isConnected)button.disabled=false;}},`);
 replace("+(closed?'Kapalı':'Açık')+'</span>'+(newNote?", `+(closed?'Kapalı':'Açık')+'</span><button type="button" class="note-pin-v505 '+(Number(n.pinned)?'is-pinned':'')+'" aria-pressed="'+!!Number(n.pinned)+'" title="'+(Number(n.pinned)?'Başa tutturmayı kaldır':'Başa tuttur')+'" aria-label="'+(Number(n.pinned)?'Başa tutturmayı kaldır':'Başa tuttur')+'" onclick="rafexNotesV405.pin('+n.id+',this)"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 3h6l-1 7 4 4v2H6v-2l4-4-1-7ZM12 16v6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></span>'+(newNote?`);
 replace('<header><span class="note-state ', '<header><span class="note-state-pin-v505"><span class="note-state ');
 replace("+(newNote?'note-new-v406':'')+'\" data-note=", "+(newNote?'note-new-v406 ':'')+(Number(n.pinned)?'note-pinned-v505':'')+'\" data-note=");
 html=html.replace('</head>',`<style data-note-pins="v505">
 .note-row-v405 header .note-state-pin-v505{display:inline-flex!important;align-items:center!important;align-self:flex-start!important;gap:4px!important;flex:0 0 auto;white-space:nowrap}
 .note-row-v405 header .note-state-pin-v505 .note-state{margin:0!important;align-self:center!important}
 .note-row-v405 header .note-pin-v505{display:inline-flex!important;align-items:center;justify-content:center;width:26px!important;min-width:26px!important;height:26px!important;min-height:26px!important;padding:5px!important;border:1px solid transparent;border-radius:8px;background:transparent;color:#75827b;flex:0 0 auto;cursor:pointer}
 .note-row-v405 header .note-pin-v505:hover{background:#e5eee8;color:#214f3b}
 .note-row-v405 header .note-pin-v505.is-pinned{color:#976006;background:#fff0cf;border-color:#e3bb65}
 .note-pin-v505:focus-visible{outline:2px solid #214f3b;outline-offset:2px}
 .note-pinned-v505{border-left:3px solid #d1a13a!important}
 </style></head>`);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);
 return html;
}
if(/[\\/]note-pins-v505\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let source=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))source=transform(source);else{const m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('v505 HTML missing');source=source.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,source);console.log('PASS v505: '+file);
}

