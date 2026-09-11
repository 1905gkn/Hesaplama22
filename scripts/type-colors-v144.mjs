export function createTypeColors(saved={}) {
  const palette=['#e00024','#0055ff','#008a30','#8200c9','#009fac','#ed008c','#20262e','#71818b'];
  const assigned=Object.create(null),used=new Set();
  for(const [name,color] of Object.entries(saved))if(/^#[0-9a-f]{6}$/i.test(color)&&!used.has(color.toLowerCase())){assigned[name]=color.toLowerCase();used.add(color.toLowerCase());}
  function candidate(i){
    if(i<palette.length)return palette[i];
    // Exclude yellow, orange and brown hues used by pallets and traverses.
    const h=(110+(i*137.508)%245)%360,s=.58+(i%4)*.08,l=.3+(Math.floor(i/4)%5)*.045;
    const a=s*Math.min(l,1-l),channel=n=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,'0')};
    return '#'+channel(0)+channel(8)+channel(4);
  }
  // Compare colors perceptually, not merely by different hexadecimal values.
  function lab(hex){
    const [r,g,b]=[1,3,5].map(i=>{const c=parseInt(hex.slice(i,i+2),16)/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4});
    const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
    return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];
  }
  const pool=Array.from(new Set(Array.from({length:2048},(_,i)=>candidate(i)))).map(color=>({color,lab:lab(color),distance:Infinity}));
  const update=color=>{const p=lab(color);for(const item of pool)item.distance=Math.min(item.distance,item.lab.reduce((sum,v,i)=>sum+(v-p[i])**2,0));};
  for(const color of used)update(color);
  return {assigned,color(value){
    const key=String(value||'Raf').trim().toUpperCase();if(assigned[key])return assigned[key];
    let n=0;if(/^[A-Z]{1,3}$/.test(key)){for(const c of key)n=n*26+c.charCodeAt(0)-64;n--;}
    else {const digits=key.match(/\d+/);n=digits?Math.max(0,Number(digits[0])-1):Object.keys(assigned).length;}
    n=Number.isSafeInteger(n)?n:0;
    let color=n<palette.length&&!used.has(palette[n])?palette[n]:palette.find(c=>!used.has(c));
    if(!color){let best=null;for(const item of pool)if(!used.has(item.color)&&(!best||item.distance>best.distance))best=item;color=best?.color;}
    if(!color){let i=2048;color=candidate(i);while(used.has(color))color=candidate(++i);}
    assigned[key]=color;used.add(color);update(color);return color;
  }};
}
