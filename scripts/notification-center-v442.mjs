import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-rafex-notification-center="v442"'))return html;
 const head=html.indexOf('</head>'),end=html.lastIndexOf('</body>');if(head<0||end<0)throw Error('Notification center document anchors missing.');
 const style='<link rel="stylesheet" href="/notification-center.css" data-rafex-notification-center="v442">';
 html=html.slice(0,end)+'<script src="/notification-center.js" data-rafex-notification-center="v442"></script>'+html.slice(end);
 return html.slice(0,head)+style+html.slice(head);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/notification-center-v442.mjs')){
 const file='dist/index.html';fs.writeFileSync(file,transform(fs.readFileSync(file,'utf8')));
 for(const name of ['notification-center.js','notification-center.css'])fs.copyFileSync('client/'+name,'dist/'+name);
 console.log('Notification bell and persistent history emitted.');
}
