import {parse} from 'acorn';

// Compile explicit render calls into application code. Native browser
// prototypes remain untouched; quoted scripts/templates are never regex-edited.
export function localizeRenderSources(source) {
  const ast=parse(source,{ecmaVersion:'latest',sourceType:'script',allowReturnOutsideFunction:true});
  const changes=[];
  function visit(node) {
    if(!node||typeof node!=='object')return;
    if(node.type==='CallExpression'&&node.callee.type==='MemberExpression'&&!node.callee.computed&&node.callee.property.name==='insertAdjacentHTML'&&node.arguments.length===2) {
      const target=source.slice(node.callee.object.start,node.callee.object.end);
      changes.push({start:node.start,end:node.end,text:`(window.rafexInsertUiHTML?window.rafexInsertUiHTML(${target},${source.slice(node.arguments[0].start,node.arguments[0].end)},${source.slice(node.arguments[1].start,node.arguments[1].end)}):(${source.slice(node.start,node.end)}))`});
      return;
    }
    if(node.type==='CallExpression'&&node.callee.type==='MemberExpression'&&!node.callee.computed&&node.callee.property.name==='setAttribute'&&node.arguments.length===2&&['title','placeholder','aria-label'].includes(node.arguments[0].value)) {
      const target=source.slice(node.callee.object.start,node.callee.object.end);
      changes.push({start:node.start,end:node.end,text:`(window.rafexSetUiAttribute?window.rafexSetUiAttribute(${target},${source.slice(node.arguments[0].start,node.arguments[0].end)},${source.slice(node.arguments[1].start,node.arguments[1].end)}):(${source.slice(node.start,node.end)}))`});
      return;
    }
    if(node.type==='AssignmentExpression'&&node.operator==='='&&node.left.type==='MemberExpression'&&!node.left.computed&&['textContent','innerHTML'].includes(node.left.property.name)) {
      const target=source.slice(node.left.object.start,node.left.object.end);
      const value=localizeRenderSourcesExpression(node.right);
      const helper=node.left.property.name==='textContent'?'rafexSetUiText':'rafexSetUiHTML';
      changes.push({start:node.start,end:node.end,text:`(window.${helper}?window.${helper}(${target},${value}):(${source.slice(node.start,node.end)}))`});
      return;
    }
    for(const value of Object.values(node))if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object')visit(value);
  }
  function localizeRenderSourcesExpression(node){return source.slice(node.start,node.end);}
  visit(ast);
  for(const change of changes.sort((a,b)=>b.start-a.start))source=source.slice(0,change.start)+change.text+source.slice(change.end);
  return source;
}
