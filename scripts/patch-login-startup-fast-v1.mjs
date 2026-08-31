import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Login startup fast v1: HTML_BASE64 bulunamadi");

let html = Buffer.from(match[3], "base64").toString("utf8");

const bootStart = html.indexOf("async function boot(){");
const loginStart = html.indexOf("\n$('loginForm').onsubmit=", bootStart);
if (bootStart < 0 || loginStart < 0) throw new Error("Login startup fast v1: boot blogu bulunamadi");

const fastBoot = `async function boot(){
  const bootstrapPromise=req('/api/bootstrap').catch(()=>null);
  const mePromise=req('/api/me').catch(()=>null);
  const [b,x]=await Promise.all([bootstrapPromise,mePromise]);
  setup=!!(b&&b.needsSetup);
  if(x&&x.user){enter(x.user);return}
  if(setup){
    $('authTitle').textContent='Ilk Kurulum';
    $('authText').textContent='Ilk super kullanici hesabini olusturun. Bu ekran yalnizca bir kez gorunur.';
    $('authButton').textContent='Super Kullanici Olustur';
    $('loginPass').autocomplete='new-password';
  }
}`;
html = html.slice(0, bootStart) + fastBoot + html.slice(loginStart);

const enterStart = html.indexOf("async function enter(user){");
const logoutStart = html.indexOf("async function logout(){", enterStart);
if (enterStart < 0 || logoutStart < 0) throw new Error("Login startup fast v1: enter blogu bulunamadi");

const fastEnter = `async function enter(user){
  me=user;
  $('auth').classList.add('hidden');
  $('app').classList.remove('hidden');
  $('who').textContent=user.username;
  $('role').textContent=user.role==='super'?'Super Kullanici':'Kullanici';
  if(user.role==='super')$('adminNav').classList.remove('hidden');else $('adminNav').remove();
  showPage('drive');
  Promise.resolve().then(()=>loadProjects()).catch(()=>{});
}`;
html = html.slice(0, enterStart) + fastEnter + html.slice(logoutStart);

for (const required of [
  "const bootstrapPromise=req('/api/bootstrap')",
  "const mePromise=req('/api/me')",
  "Promise.all([bootstrapPromise,mePromise])",
  "showPage('drive')",
  "Promise.resolve().then(()=>loadProjects()).catch(()=>{})"
]) {
  if (!html.includes(required)) throw new Error("Login startup fast v1 dogrulama eksigi: " + required);
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("Login startup fast v1: bootstrap/me paralel, projects arka planda yukleniyor.");
