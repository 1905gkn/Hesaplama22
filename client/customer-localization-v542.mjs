import rows from './site-translations.json';
import {createInterfaceTranslator} from './translation-core-v542.mjs';
export function installCustomerLocalization(doc=document){
 const translate=createInterfaceTranslator(rows),textStates=new WeakMap(),attrs=new WeakMap();
 const protectedSelector='script,style,textarea,input,canvas,code,[translate="no"],[data-no-translate],[data-user-note]';
 let language='tr';try{const saved=localStorage.getItem('rafexCustomerLanguage');if(['tr','en','fr'].includes(saved))language=saved;}catch{}
 const locale=()=>({tr:'tr-TR',en:'en-GB',fr:'fr-FR'})[language];
 const select=doc.createElement('select');select.id='customerLanguage542';select.setAttribute('aria-label','Language / Langue / Dil');
 for(const [value,text]of [['tr','Türkçe'],['en','English'],['fr','Français']]){const option=doc.createElement('option');option.value=value;option.textContent=text;option.translate=false;select.append(option);}select.value=language;doc.querySelector('body>header')?.append(select);
 const updateText=node=>{if(!node.nodeValue.trim()||node.parentElement?.closest(protectedSelector))return;let state=textStates.get(node);if(!state||state.rendered!==node.nodeValue)state={source:node.nodeValue};state.rendered=translate(state.source,language);textStates.set(node,state);if(node.nodeValue!==state.rendered)node.nodeValue=state.rendered;};
 function apply(root){if(root.nodeType===3){updateText(root);return;}if(root.nodeType!==1||root.closest(protectedSelector))return;const walker=doc.createTreeWalker(root,4);let node;while(node=walker.nextNode())updateText(node);for(const element of [root,...root.querySelectorAll('[title],[aria-label],[placeholder]')]){if(element.closest(protectedSelector))continue;let states=attrs.get(element);if(!states)attrs.set(element,states={});for(const key of ['title','aria-label','placeholder']){const value=element.getAttribute(key);if(value==null)continue;let state=states[key];if(!state||state.rendered!==value)state={source:value};state.rendered=translate(state.source,language);states[key]=state;if(value!==state.rendered)element.setAttribute(key,state.rendered);}}}
 const queue=new Set();let timer;
 const observer=new MutationObserver(records=>{for(const r of records){if(r.target.parentElement?.closest(protectedSelector))continue;if(r.type==='characterData'){if(textStates.get(r.target)?.rendered!==r.target.nodeValue)queue.add(r.target);}else if(r.type==='attributes'){if(attrs.get(r.target)?.[r.attributeName]?.rendered!==r.target.getAttribute(r.attributeName))queue.add(r.target);}else for(const n of r.addedNodes)if(n.nodeType===1||n.nodeType===3)queue.add(n);}if(queue.size&&!timer)timer=setTimeout(()=>{timer=null;for(const n of queue)if(n.isConnected&&!([...queue].some(p=>p!==n&&p.contains?.(n))))apply(n);queue.clear();},16);});
 select.onchange=()=>{language=select.value;doc.documentElement.lang=language;try{localStorage.setItem('rafexCustomerLanguage',language);}catch{}apply(doc.body);doc.dispatchEvent(new CustomEvent('rafex:customer-language',{detail:language}));};
 doc.documentElement.lang=language;
 window.rafexTranslateText=window.rafexDimensionText=translate;
 window.rafexTranslateDrawing438=(root,lang=language)=>{const walker=doc.createTreeWalker(root,4);let n;while(n=walker.nextNode()){let state=textStates.get(n);if(!state||state.rendered!==n.nodeValue)state={source:n.nodeValue};state.rendered=translate(state.source,lang);textStates.set(n,state);if(n.nodeValue!==state.rendered)n.nodeValue=state.rendered;}};
 apply(doc.body);observer.observe(doc.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder']});
 return {translate,locale,get language(){return language;}};
}
