import assert from 'node:assert/strict';import {combineProductPages} from './combine-product-pages-v581.mjs';
// Deterministic layout harness: variable row heights, page capacity and DOM
// invalidations. This checks row identity/order and forced-layout work separately
// from browser-dependent font rendering.
let revision=0,painted=-1,flushes=0,copiedRows=0;
class Element{
 constructor(cls='',height=0,id=''){this.className=cls;this.height=height;this.id=id;this.children=[];this.dataset={};this.style={setProperty(){}};this.parentElement=null;this.textContent='';}
 appendChild(n){n.remove();this.children.push(n);n.parentElement=this;revision++;return n;}
 append(...nodes){nodes.forEach(n=>this.appendChild(n));}
 remove(){const p=this.parentElement;if(p){p.children.splice(p.children.indexOf(this),1);this.parentElement=null;revision++;}}
 before(...nodes){const p=this.parentElement;let i=p.children.indexOf(this);for(const n of nodes){n.remove();p.children.splice(i++,0,n);n.parentElement=p;}revision++;}
 getAttribute(){return null;}removeAttribute(){}
 matches(selector){return selector==='h3'?this.className==='heading':this.className.split(' ').includes(selector.replace('.',''));}
 querySelectorAll(selector){const direct=selector.startsWith(':scope>');selector=selector.replace(':scope>','');const result=[];for(const c of this.children){if(c.matches(selector))result.push(c);if(!direct)result.push(...c.querySelectorAll(selector));}return result;}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
 cloneNode(deep){if(this.matches('.m2-corporate-bom-row'))copiedRows++;const c=new Element(this.className,this.height,this.id);c.textContent=this.textContent;if(deep)this.children.forEach(n=>c.appendChild(n.cloneNode(true)));return c;}
 total(){if(this.matches('.m2-corporate-bom-card'))return 40+this.querySelectorAll('.m2-corporate-bom-row').reduce((n,r)=>n+r.height,0)+12;return this.height;}
 getBoundingClientRect(){if(painted!==revision){painted=revision;flushes++;}if(this.matches('.rafex-product-flow'))return {bottom:500,width:960};if(this.matches('.m2-corporate-bom-row')){const card=this.parentElement,body=card.parentElement;let bottom=100+40;for(const c of body.children){if(c===card)break;bottom+=c.total();}for(const r of card.children){if(r.matches('.m2-corporate-bom-row'))bottom+=r.height;if(r===this)break;}return{bottom};}return{width:960,bottom:700};}
}
const document={body:new Element(),createElement:()=>new Element(),getElementById:()=>null};globalThis.document=document;
const target=new Element();document.body.appendChild(target);const expected=[];
for(let section=0;section<5;section++){const page=new Element('m2-corporate-page'),card=new Element('m2-corporate-bom-card'),title=new Element('heading');title.textContent='Products';card.appendChild(title);for(let row=0;row<150;row++){const id=`${section}:${row}`,n=new Element('m2-corporate-bom-row',row%11===0?61:22,id);expected.push(id);card.appendChild(n);}page.appendChild(card);target.appendChild(page);}
const originalRows=target.querySelectorAll('.m2-corporate-bom-row');revision=0;painted=-1;flushes=0;copiedRows=0;combineProductPages(target);
const pages=target.children,actual=target.querySelectorAll('.m2-corporate-bom-row');assert.deepEqual(actual.map(n=>n.id),expected);assert.deepEqual(actual,originalRows);assert(pages.every(p=>p.querySelector('.m2-corporate-bom-row')),'No empty continuation pages');
for(const page of pages)for(const row of page.querySelectorAll('.m2-corporate-bom-row'))assert(row.getBoundingClientRect().bottom<=498,'All variable-height rows fit page');
assert.equal(copiedRows,750,'Original table rows cloned only once, never per continuation');assert(+target.dataset.productLayoutBatches590<70);assert(flushes<150,'Layout invalidations scale with pages rather than rows');
console.log(JSON.stringify({pass:true,rows:actual.length,pages:pages.length,layoutBatches:+target.dataset.productLayoutBatches590,layoutFlushes:flushes,originalRowsPreserved:true,descriptionWrapHeightsPreserved:true}));
