import fs from 'node:fs';import vm from 'node:vm';
const file='client/site-translations.json',rows=JSON.parse(fs.readFileSync(file,'utf8'));
const add=row=>{if(!rows.some(r=>r[0]===row[0]))rows.push(row)};
const html=fs.readFileSync('portal.html','utf8'),start=html.indexOf('const UI_TRANSLATIONS ='),end=html.indexOf('      function applyTranslations(',start),context={appLanguage:'tr'};
vm.runInNewContext(html.slice(start,end)+';this.dictionary=UI_TRANSLATIONS;',context);
for(const [tr,en]of Object.entries(context.dictionary.en))if(context.dictionary.fr[tr])add([tr,en,context.dictionary.fr[tr]]);
const source=fs.readFileSync('client/site-localization.js','utf8'),extra={};
vm.runInNewContext(source.slice(source.indexOf('const rows ='),source.indexOf('  for (const [tr, en, fr]'))+';this.rows=rows;',extra);
for(const row of extra.rows)add(row);
const quoteSource=fs.readFileSync('scripts/attributed-quotes-v358.js','utf8');
const quotes=JSON.parse(quoteSource.slice(quoteSource.indexOf('['),quoteSource.indexOf('];')+1));
const french=fs.readFileSync('client/quote-french-v542.txt','utf8').trim().split(/\r?\n/);
const firstEnglish=['Alone we can do so little; together we can accomplish so much.','Optimism is the faith that leads to achievement; without hope, nothing can be done.','Genius is one percent inspiration and ninety-nine percent perspiration.','Education is the most powerful weapon you can use to change the world.','Our nation continues to advance and rise in the face of every difficulty.','Understanding is necessary for progress.','We cannot be truly happy without trying to brighten the lives of others.'];
if(french.length!==quotes.length)throw Error('Every quote needs a French translation: '+french.length+'/'+quotes.length);
quotes.forEach((q,i)=>add([q.text,q.original||firstEnglish[i],french[i]]));
for(const line of fs.readFileSync('client/translation-additions-v542.txt','utf8').trim().split(/\r?\n/)){const row=line.split('|');if(row.length!==3)throw Error('Invalid translation: '+line);const i=rows.findIndex(r=>r[0]===row[0]);if(i<0)rows.push(row);else rows[i]=row;}
const unique=[...new Map(rows.map(r=>[r[0],r])).values()];
fs.writeFileSync(file,JSON.stringify(unique,null,2)+'\n');console.log(unique.length+' complete TR/EN/FR labels');
