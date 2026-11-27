import fs from 'node:fs';
const appPath = 'dist/index.html';
const source = fs.readFileSync(appPath,'utf8');
const boot = 'async function boot() {\n        const b = await req("/api/bootstrap");';
const logout = 'await req("/api/logout", { method: "POST", body: "{}" });\n        location.reload();';
if (!source.includes(boot) || !source.includes(logout)) throw Error('Missing workspace auth anchors');
const workspace = source.replace(boot,`async function boot() {
        try {
          const response = await fetch("/api/me", { cache: "no-store" });
          if (response.status === 401) {
            location.replace("/" + location.search + location.hash);
            return;
          }
          if (response.ok) {
            const session = await response.json();
            if (session.user) {
              enter(session.user);
              return;
            }
          }
        } catch {}
        const b = await req("/api/bootstrap");`).replace(logout,`await req("/api/logout", { method: "POST", body: "{}" });
        location.replace("/");`);
const login = fs.readFileSync(new URL('../client/login.html',import.meta.url),'utf8');
fs.writeFileSync('dist/workspace.html',workspace);
fs.writeFileSync(appPath,login);
