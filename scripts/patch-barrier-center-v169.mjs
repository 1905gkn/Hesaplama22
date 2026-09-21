import fs from 'node:fs';
export function barrierShape(symbol){
 const {x,y,w,h}=symbol,t=Math.min(w,h),stroke=t*.06,r=t*.22,inset=t*.5,cy=y+h/2;
 return `<g class="rafex-barrier-v169"><rect x="${x+stroke/2}" y="${y+stroke/2}" width="${Math.max(0,w-stroke)}" height="${Math.max(0,h-stroke)}" rx="${t*.15}" style="fill:#e5be01;stroke:#6d5900;stroke-width:${stroke}"/><line x1="${x+inset}" y1="${cy}" x2="${x+w-inset}" y2="${cy}" style="stroke:#fff3a2;stroke-width:${t*.12}"/><circle cx="${x+inset}" cy="${cy}" r="${r}" fill="#806900"/><circle cx="${x+w-inset}" cy="${cy}" r="${r}" fill="#806900"/></g>`;
}
export function transform(html){
 if(html.includes('function barrierShape(symbol)'))return html;
 const start=html.indexOf('else if(symbol.type==="barrier")shape=`'),end=html.indexOf('`;',start);
 if(start<0||end<0)throw Error('v169 barrier renderer missing');
 html=html.slice(0,start)+'else if(symbol.type==="barrier")shape=barrierShape(symbol);'+html.slice(end+2);
 const anchor='    panCursorV168();\n  }\n  function stopPanEventV168';
 if(!html.includes(anchor))throw Error('v169 pan button anchor missing');
 html=html.replace(anchor,`    var center=byId('m2CenterV169');
    if(!center){center=document.createElement('button');center.id='m2CenterV169';center.type='button';center.textContent='ORTALA';center.title='Çizimi %100 ölçekte ortala';center.onclick=function(){endPanV168();fitAll()};button.insertAdjacentElement('afterend',center)}
    panCursorV168();
  }
  function stopPanEventV168`);
 const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body');
 return html.slice(0,at)+'<script data-barrier-center="v169">'+barrierShape.toString()+'</script><style>#page #m2CenterV169{width:auto!important;padding:0 10px!important}</style>'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-barrier-center-v169.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
