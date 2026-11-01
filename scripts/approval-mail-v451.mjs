import tls from 'node:tls';
import net from 'node:net';
import {timingSafeEqual,createHmac} from 'node:crypto';
const json=(data,status=200)=>Response.json(data,{status,headers:{'cache-control':'no-store'}});
export async function smtpApproval({to,name,title,code,projectNumber},env=process.env,{verifyOnly=false}={}){
 const host=env.RAFEX_SMTP_HOST,user=env.RAFEX_SMTP_USER,password=env.RAFEX_SMTP_PASSWORD;
 if(!host||!user||!password)throw Error('SMTP_CONFIG');
 const plain=env.RAFEX_SMTP_TRANSPORT==='plain',port=Number(env.RAFEX_SMTP_PORT)||(plain?587:465);
 const socket=plain?net.connect({host,port}):tls.connect({host,port,servername:host,rejectUnauthorized:true});
 socket.setTimeout(15000,()=>socket.destroy(Error('SMTP_TIMEOUT')));
 let buffer='',lines=[],queue=[],waiters=[],failure=null;
 const deliver=value=>{const waiter=waiters.shift();if(waiter)waiter.resolve(value);else queue.push(value);};
 socket.on('data',chunk=>{buffer+=chunk.toString('utf8');let at;while((at=buffer.indexOf('\r\n'))>=0){const line=buffer.slice(0,at);buffer=buffer.slice(at+2);lines.push(line);if(/^\d{3} /.test(line)){deliver({code:Number(line.slice(0,3)),lines});lines=[];}}});
 const fail=()=>{failure=Error('SMTP_CONNECTION');for(const waiter of waiters.splice(0))waiter.reject(failure);};socket.on('error',fail);socket.on('close',fail);
 const next=()=>failure?Promise.reject(failure):queue.length?Promise.resolve(queue.shift()):new Promise((resolve,reject)=>waiters.push({resolve,reject}));
 const expect=async codes=>{const result=await next();if(!codes.includes(result.code))throw Error('SMTP_REJECTED_'+result.code);return result;};
 let phase='connection';
 const command=async(line,codes=[250])=>{socket.write(line+'\r\n');return expect(codes);};
 try{
  await expect([220]);const capabilities=await command('EHLO rafex-configurator.vercel.app');
  phase='authentication';
  if(capabilities.lines.some(line=>/AUTH.*CRAM-MD5/i.test(line))){const challenge=await command('AUTH CRAM-MD5',[334]);const digest=createHmac('md5',password).update(Buffer.from(challenge.lines.at(-1).slice(4),'base64')).digest('hex');await command(Buffer.from(user+' '+digest).toString('base64'),[235]);}else{await command('AUTH LOGIN',[334]);await command(Buffer.from(user).toString('base64'),[334]);await command(Buffer.from(password).toString('base64'),[235]);}
  if(!verifyOnly){phase='envelope';
   await command('MAIL FROM:<'+user+'>');await command('RCPT TO:<'+to+'>',[250,251]);await command('DATA',[354]);
   const subject='=?UTF-8?B?'+Buffer.from('RAFEX · Proje onaylama kodu').toString('base64')+'?=';
   const body=Buffer.from('Sayın '+name+',\n\n'+title+'\nProje No: '+(projectNumber||'Belirtilmemiş (eski paylaşım)')+'\n\nOnaylama kodunuz: '+code+'\n\nBu kod 10 dakika geçerlidir. Kodu yalnızca RAFEX proje görüntüleme sayfasına girin.\nBu işlemi siz başlatmadıysanız kodu paylaşmayın.\n\nRAFEX Raf Sistemleri').toString('base64').match(/.{1,76}/g).join('\r\n');
   phase='message';socket.write('From: RAFEX <'+user+'>\r\nTo: <'+to+'>\r\nSubject: '+subject+'\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n'+body+'\r\n.\r\n');await expect([250]);
  }
  await command('QUIT',[221]);
 }catch(error){error.smtpPhase=phase;throw error;}finally{socket.destroy();}
}
export async function approvalMailRelay(request,env=process.env){
 if(request.method!=='POST')return json({error:'Yöntem desteklenmiyor.'},405);
 const supplied=Buffer.from((request.headers.get('authorization')||'').replace(/^Bearer /,'')),expected=Buffer.from(env.RAFEX_APPROVAL_RELAY_SECRET||'');
 if(!expected.length||supplied.length!==expected.length||!timingSafeEqual(supplied,expected))return json({error:'Yetkisiz.'},401);
 let data;try{const text=await request.text();if(text.length>4096)throw Error();data=JSON.parse(text);}catch{return json({error:'Geçersiz veri.'},400);}
 if(data.verifyOnly!==true&&(!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(data.to||'')||/[\r\n]/.test(data.to)||String(data.to).length>254||!/^\d{6}$/.test(data.code||'')||typeof data.name!=='string'||data.name.length>120||typeof data.title!=='string'||data.title.length>160))return json({error:'Geçersiz veri.'},400);
 try{await smtpApproval(data,env,{verifyOnly:data.verifyOnly===true});return json({ok:true});}catch(error){const reason=/^SMTP_REJECTED_\d{3}$/.test(error.message)?error.message:error.code||'SMTP_CONNECTION';console.error('SMTP approval delivery failed',error.smtpPhase||'connection',reason);return json({error:'E-posta gönderilemedi. Lütfen daha sonra yeniden deneyin.',reason,phase:error.smtpPhase||'connection'},502);}
}