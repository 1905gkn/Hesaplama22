export function createTypeColors(saved={}) {
  const palette=['#d12f50','#2469d8','#168557','#7d3fc0','#008b9a','#b12791','#283e72','#135b45','#6551dc','#b63f6f','#126ca0','#4f8542','#583067','#13736f','#863b56','#3d53a1'];
  const assigned=Object.create(null),used=new Set();
  for(const [name,color] of Object.entries(saved))if(/^#[0-9a-f]{6}$/i.test(color)&&!used.has(color.toLowerCase())){assigned[name]=color.toLowerCase();used.add(color.toLowerCase());}
  function candidate(i){
    if(i<palette.length)return palette[i];
    // Exclude yellow, orange and brown hues used by pallets and traverses.
    const h=(110+(i*137.508)%245)%360,s=.58+(i%4)*.08,l=.3+(Math.floor(i/4)%5)*.045;
    const a=s*Math.min(l,1-l),channel=n=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,'0')};
    return '#'+channel(0)+channel(8)+channel(4);
  }
  return {assigned,color(value){
    const key=String(value||'Raf').trim().toUpperCase();if(assigned[key])return assigned[key];
    let n=0;if(/^[A-Z]{1,3}$/.test(key)){for(const c of key)n=n*26+c.charCodeAt(0)-64;n--;}
    else {const digits=key.match(/\d+/);n=digits?Math.max(0,Number(digits[0])-1):Object.keys(assigned).length;}
    n=Number.isSafeInteger(n)?n:0;
    let color=candidate(n);while(used.has(color))color=candidate(++n);
    assigned[key]=color;used.add(color);return color;
  }};
}
