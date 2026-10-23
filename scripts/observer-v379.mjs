import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-observer="v379"'))return html;
 function replace(from,to){if(html.split(from).length!==2)throw Error('v379 anchor '+from.slice(0,90));html=html.replace(from,to)}
 replace('<label class="field">Varsayılan Dil<select class="user-language-select" id="newUserLanguage">','<label class="field">Hesap yetkisi<select id="newUserRole"><option value="user">Kullanıcı</option><option value="observer">Gözlemci · tüm projeler, yalnız görüntüleme</option></select></label><label class="field">Varsayılan Dil<select class="user-language-select" id="newUserLanguage">');
 replace('defaultLanguage: $("newUserLanguage").value,','defaultLanguage: $("newUserLanguage").value,\n                role: $("newUserRole").value,');
 html=html.replaceAll('x.role === "super" ? "Süper" : "Kullanıcı"','x.role === "super" ? "Süper" : x.role === "observer" ? "Gözlemci" : "Kullanıcı"');
 html=html.replaceAll('user.role === "super" ? "Süper Kullanıcı" : "Kullanıcı"','user.role === "super" ? "Süper Kullanıcı" : user.role === "observer" ? "Gözlemci · Salt okunur" : "Kullanıcı"');
 replace('      function showPage(name) {','      function showPage(name) {\n        if(me?.role === "observer")return window.rafexObserverV379.render();');
 replace('      async function req(url, opt = {}) {',`      async function req(url, opt = {}) {
        if(typeof me !== 'undefined' && me?.role === 'observer' && !['GET','HEAD'].includes(String(opt.method||'GET').toUpperCase()) && url !== '/api/logout')throw new Error('Gözlemci hesabı yalnızca projeleri görüntüleyebilir.');`);
 const runtime=fs.readFileSync(new URL('./observer-v379.js',import.meta.url),'utf8');
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v379 body');
 return html.slice(0,end)+'<script data-observer="v379">'+runtime+'</script>'+html.slice(end);
}
