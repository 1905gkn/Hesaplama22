import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const portal = fs.readFileSync('portal.html', 'utf8');
const enter = portal.slice(portal.indexOf('async function enter(user)'), portal.indexOf('async function logout()'));
const patch = fs.readFileSync('scripts/patch-login-home-sidebar.mjs', 'utf8');
const needle = patch.match(/const languageNeedle = '([^\n]+)';/)[1];
const fastPath = patch.match(/const languageFastPath = `([\s\S]*?)`;/)[1];
assert(enter.includes(needle), 'build patch must match login source');
for (const code of [enter, enter.replace(needle, fastPath)]) {
  for (const selected of ['tr', 'en', 'fr']) {
    for (const stored of ['tr', 'en', 'fr']) {
      const state = { language: selected, report: 'fr', page: null };
      const context = vm.createContext({
        me: null, appLanguage: selected,
        $: id => id === 'authLanguage' ? { value: selected } : { classList: { add() {}, remove() {} }, remove() {} },
        changeProgramLanguage: async lang => { state.language = lang; },
        applyModuleVisibility() {}, loadProjects: async () => {}, showPage: page => { state.page = page; }
      });
      await vm.runInContext(`${code};enter({default_language:'${stored}',role:'super',username:'test'});`, context);
      assert.equal(state.language, selected);
      assert.equal(state.page, 'home');
      assert.equal(state.report, 'fr');
    }
  }
}
console.log('PASS: source and production login preserve TR/EN/FR selection against all account defaults.');
