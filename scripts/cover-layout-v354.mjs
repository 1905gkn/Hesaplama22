export function transform(html){
 if(html.includes('/* cover-layout-v354 */'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v354 anchor '+a.slice(0,95));html=html.replace(a,b);};
 replace('.m2-corporate-cover .m2-corporate-cover-content{position:absolute!important;top:12%;left:15%;margin:0!important}', '/* cover-layout-v354 */ .m2-corporate-cover .m2-corporate-cover-content{position:absolute!important;top:18%;left:15%;margin:0!important}');
 replace('.m2-corporate-cover img { width:220px; max-height:82px;', '.m2-corporate-cover img { width:260px; max-height:100px;');
 replace('color:#8fd3ea; font-size:13px; font-weight:900; letter-spacing:.18em;', 'color:#8fd3ea; font-size:15px; font-weight:900; letter-spacing:.18em;');
 replace('.m2-corporate-cover h1 { margin:12px 0 8px; font-size:40px;', '.m2-corporate-cover h1 { margin:14px 0 10px; font-size:48px;');
 replace('.m2-corporate-cover p { margin:0; color:#d9eaf2; font-size:17px;', '.m2-corporate-cover p { margin:0; color:#d9eaf2; font-size:20px;');
 return html;
}

