// PDF.js paths are drawing data only. Text in a document is never executed.
const multiply=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
export async function readVectors(page,OPS){
  const viewport=page.getViewport({scale:1}), list=await page.getOperatorList(), content=await page.getTextContent();
  let matrix=viewport.transform.slice(),color='#000000',stack=[];const lines=[];
  const point=(x,y)=>({x:matrix[0]*x+matrix[2]*y+matrix[4],y:matrix[1]*x+matrix[3]*y+matrix[5]});
  for(let i=0;i<list.fnArray.length;i++){
    const op=list.fnArray[i],a=list.argsArray[i];
    if(op===OPS.save)stack.push({matrix:matrix.slice(),color});
    else if(op===OPS.restore){const s=stack.pop();if(s){matrix=s.matrix;color=s.color;}}
    else if(op===OPS.transform)matrix=multiply(matrix,a);
    else if(op===OPS.setStrokeRGBColor)color=a[0];
    else if(op===OPS.paintFormXObjectBegin){stack.push({matrix:matrix.slice(),color});if(a[0])matrix=multiply(matrix,a[0]);}
    else if(op===OPS.paintFormXObjectEnd){const s=stack.pop();if(s){matrix=s.matrix;color=s.color;}}
    else if(op===OPS.constructPath && [OPS.stroke,OPS.closeStroke,OPS.fillStroke,OPS.eoFillStroke,OPS.closeFillStroke,OPS.closeEOFillStroke].includes(a[0])){
      const path=a[1][0];let last=null,start=null;
      const segment=p=>{if(last&&Math.hypot(p.x-last.x,p.y-last.y)>.05)lines.push({x0:last.x,y0:last.y,x1:p.x,y1:p.y,color});last=p;};
      for(let j=0;j<path.length;){const code=path[j++];
        if(code===0){last=point(path[j++],path[j++]);start=last;}
        else if(code===1)segment(point(path[j++],path[j++]));
        else if(code===2){j+=4;last=point(path[j++],path[j++]);}
        else if(code===3){j+=2;last=point(path[j++],path[j++]);}
        else if(code===4){if(start)segment(start);}
        else throw Error('PDF vektör biçimi desteklenmiyor.');
      }
    }
  }
  const text=content.items.filter(t=>t.str?.trim()).map(t=>{const m=multiply(viewport.transform,t.transform);return {text:t.str.trim(),x:m[4],y:m[5],width:t.width,height:t.height,vertical:Math.abs(m[1])>Math.abs(m[0])};});
  return {lines,text,width:viewport.width,height:viewport.height};
}
