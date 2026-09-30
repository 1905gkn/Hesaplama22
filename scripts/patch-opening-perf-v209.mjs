import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-opening-perf="v209"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Missing anchor '+a.slice(0,80));html=html.replace(a,b);};
 replace('requestAnimationFrame(() => requestAnimationFrame(() => m2FitView(name, true)));',`if(name==='side')m2ViewCanvas('side')?.__rafexRenderSideV209?.();
        m2QueueViewFitV209(name,true);`);
 replace('      function m2AutoFitAllViews() {\n        requestAnimationFrame(() => requestAnimationFrame(() => {\n          const active = document.querySelector("[data-m2-view]:not([hidden])")?.dataset.m2View;\n          if (active) m2FitView(active, true);\n        }));\n      }',`      let m2FitFrameV209=0;const m2FitJobsV209=new Map();
      function m2QueueViewFitV209(name,reset=false){
        m2FitJobsV209.set(name,reset||m2FitJobsV209.get(name)||false);
        if(m2FitFrameV209)return;
        m2FitFrameV209=requestAnimationFrame(()=>{m2FitFrameV209=0;const jobs=[...m2FitJobsV209];m2FitJobsV209.clear();for(const [view,reset] of jobs){const canvas=m2ViewCanvas(view);if(canvas&&!canvas.closest('[data-m2-view]')?.hidden)m2FitView(view,reset);}});
      }
      function m2AutoFitAllViews() {
        const active=document.querySelector('[data-m2-view]:not([hidden])')?.dataset.m2View;
        if(active)m2QueueViewFitV209(active,true);
      }`);
 replace('requestAnimationFrame(() => m2ApplyViewZoom(name));','m2QueueViewFitV209(name,false);');
 replace('if (renderAuxiliaryViews) $("m2Side").innerHTML = elevation("side");',`if (renderAuxiliaryViews) {
          const sideHost=$("m2Side");
          sideHost.__rafexRenderSideV209=()=>{const markup=elevation('side');if(sideHost.__rafexSideMarkupV209!==markup||!sideHost.querySelector('svg')){sideHost.innerHTML=markup;sideHost.__rafexSideMarkupV209=markup;}sideHost.__rafexRenderSideV209=null;};
          if(!sideHost.closest('[data-m2-view]')?.hidden)sideHost.__rafexRenderSideV209();
        }`);
 replace('topHost.__rafexTopMarkup=top;}','topHost.__rafexTopMarkup=top;m2ApplyViewZoom("top");}');
 return html.replace('</head>','<meta data-opening-perf="v209">\n</head>');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-opening-perf-v209.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
