import * as THREE from 'three';
// Immutable label contents and world anchors. Camera movement is handled by
// the normal GPU view/projection matrices, never by per-label DOM positioning.
export function planStaticLabels(labels,measure,maxTextureSize=2048){
 const unique=new Map(),entries=[];
 for(const label of labels){const key=JSON.stringify([label.text,label.detail||'',label.color,label.fontSize||13,label.background||'',label.border||'']);if(!unique.has(key)){
  const fontSize=label.fontSize||13,detailSize=10,maxWidth=label.background?360:180;
  const shorten=(text,size)=>{text=String(text||'');if(measure(text,size)<=maxWidth-14)return text;while(text.length&&measure(text+'…',size)>maxWidth-14)text=text.slice(0,-1);return text+'…';};
  const text=shorten(label.text,fontSize),detail=shorten(label.detail,detailSize),width=Math.ceil(Math.max(measure(text,fontSize),detail?measure(detail,detailSize):0))+14,height=fontSize+8+(detail?detailSize+3:0);
  const entry={...label,text,detail,fontSize,detailSize,width,height,instances:[]};unique.set(key,entry);entries.push(entry);
 }unique.get(key).instances.push(label.position.slice());}
 if(!entries.length)return [];
 const scale=2,cellW=Math.max(...entries.map(e=>e.width))*scale+4,cellH=Math.max(...entries.map(e=>e.height))*scale+4,limit=Math.max(128,Math.min(2048,maxTextureSize)),cols=Math.max(1,Math.floor(limit/cellW)),rows=Math.max(1,Math.floor(limit/cellH)),capacity=cols*rows,pages=[];
 for(let start=0;start<entries.length;start+=capacity){const items=entries.slice(start,start+capacity),usedCols=Math.min(cols,items.length),usedRows=Math.ceil(items.length/cols);pages.push({width:usedCols*cellW,height:usedRows*cellH,items:items.map((entry,i)=>({...entry,x:(i%cols)*cellW+2,y:Math.floor(i/cols)*cellH+2})),scale});}
 return pages;
}
export function createStatic3DLabels(labels,{maxTextureSize=2048,anchorY=0,document:doc=globalThis.document}={}){
 const measureCanvas=doc.createElement('canvas'),measureContext=measureCanvas.getContext('2d'),measure=(text,size)=>{measureContext.font='600 '+size+'px Arial,sans-serif';return measureContext.measureText(text).width;};
 const pages=planStaticLabels(labels,measure,maxTextureSize),group=new THREE.Group(),resources=[];
 for(const page of pages){const canvas=doc.createElement('canvas');canvas.width=page.width;canvas.height=page.height;const ctx=canvas.getContext('2d');ctx.scale(page.scale,page.scale);
  const sizes=[],rects=[],positions=[];
  for(const item of page.items){const x=item.x/page.scale,y=item.y/page.scale;
   if(item.background){ctx.fillStyle=item.background;ctx.fillRect(x,y,item.width,item.height);ctx.strokeStyle=item.border||'#739c87';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,item.width-1,item.height-1);}
   const text=(content,size,baseline)=>{ctx.font='600 '+size+'px Arial,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillStyle=item.color||'#247fba';if(!item.background){ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.strokeText(content,x+item.width/2,baseline);}ctx.fillText(content,x+item.width/2,baseline);};
   text(item.text,item.fontSize,y+4);if(item.detail)text(item.detail,item.detailSize,y+item.fontSize+7);
   for(const position of item.instances){positions.push(position);sizes.push(item.width,item.height);rects.push(item.x/page.width,1-(item.y+item.height*page.scale)/page.height,(item.x+item.width*page.scale)/page.width,1-item.y/page.height);}
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
  const geometry=new THREE.PlaneGeometry(1,1);geometry.setAttribute('labelSize',new THREE.InstancedBufferAttribute(new Float32Array(sizes),2));geometry.setAttribute('atlasRect',new THREE.InstancedBufferAttribute(new Float32Array(rects),4));
  const material=new THREE.ShaderMaterial({uniforms:{atlas:{value:texture},viewport:{value:new THREE.Vector2(1,1)},anchorY:{value:anchorY}},transparent:true,depthTest:false,depthWrite:false,toneMapped:false,
   vertexShader:'attribute vec2 labelSize; attribute vec4 atlasRect; uniform vec2 viewport; uniform float anchorY; varying vec2 labelUv; void main(){ vec4 center=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(0.0,0.0,0.0,1.0); vec2 pixel=(position.xy+vec2(0.0,anchorY))*labelSize; center.xy+=pixel*2.0/max(viewport,vec2(1.0))*center.w; if(center.w<=0.0)center=vec4(2.0,2.0,2.0,1.0); gl_Position=center; labelUv=mix(atlasRect.xy,atlasRect.zw,uv); }',
   fragmentShader:'uniform sampler2D atlas; varying vec2 labelUv; void main(){ vec4 color=texture2D(atlas,labelUv); if(color.a<0.01)discard; gl_FragColor=color;\n#include <colorspace_fragment>\n}'
  });
  const mesh=new THREE.InstancedMesh(geometry,material,positions.length),matrix=new THREE.Matrix4();positions.forEach((p,i)=>mesh.setMatrixAt(i,matrix.makeTranslation(...p)));mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;mesh.renderOrder=101;group.add(mesh);resources.push({geometry,material,texture,mesh,canvas});
 }
 return {group,atlasPages:pages.length,count:labels.length,resize(width,height){resources.forEach(r=>r.material.uniforms.viewport.value.set(width,height));},visible(value){group.visible=value;},dispose(){for(const r of resources){r.geometry.dispose();r.material.dispose();r.texture.dispose();r.mesh.dispose();r.canvas.width=r.canvas.height=1;}group.clear();}};
}
