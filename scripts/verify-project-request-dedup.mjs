import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(process.argv[2] || 'portal.html', 'utf8');
const start = html.indexOf('      let pendingProjectList = null;');
const end = html.indexOf('      async function boot()', start);
assert.ok(start >= 0 && end > start, 'Request implementation must be present');
function harness() {
  const calls = [];
  const context = vm.createContext({ structuredClone, window: {}, translatedUiText: x => x,
    fetch: (url, options) => new Promise((resolve, reject) => calls.push({url, options, resolve, reject})) });
  vm.runInContext(html.slice(start, end), context);
  const finish = (index, data = {projects:[{id:index, payload:{name:'original'}}]}, status = 200) =>
    calls[index].resolve({ok:status < 400, headers:{get:()=>'application/json'}, json:async()=>data});
  return {calls, req:context.req, finish};
}
{
  const h = harness(), a = h.req('/api/projects'), b = h.req('/api/projects');
  assert.equal(h.calls.length, 1, 'Two concurrent list consumers use one fetch');
  h.finish(0);
  const [first, second] = await Promise.all([a,b]);
  first.projects[0].payload.name = 'edited';
  assert.equal(second.projects[0].payload.name, 'original', 'Consumers must not share mutable records');
  const next = h.req('/api/projects');
  assert.equal(h.calls.length, 2, 'Explicit later refresh must fetch fresh data');
  h.finish(1); await next;
}
{
  const h = harness(), a = h.req('/api/projects'), b = h.req('/api/projects');
  const checked = Promise.allSettled([a,b]); h.calls[0].reject(new Error('offline'));
  assert.ok((await checked).every(r=>r.status === 'rejected'));
  const retry = h.req('/api/projects'); assert.equal(h.calls.length, 2);
  h.finish(1); await retry;
}
for (const [url, method] of [['/api/projects','POST'],['/api/projects/7','DELETE'],['/api/login','POST'],['/api/logout','POST']]) {
  const h = harness(), old = h.req('/api/projects'), mutation = h.req(url, {method});
  const during = h.req('/api/projects'); assert.equal(h.calls.length, 3, 'Mutation start invalidates pending read');
  h.finish(1, {}); await mutation;
  const fresh = h.req('/api/projects'); assert.equal(h.calls.length, 4, 'Mutation completion invalidates overlapping read');
  h.finish(0); await old;
  const joined = h.req('/api/projects'); assert.equal(h.calls.length, 4, 'Old completion must not clear newer pending read');
  h.finish(2); h.finish(3); await Promise.all([during,fresh,joined]);
}
{
  const h = harness();
  const requests = [h.req('/api/projects',{cache:'no-store'}), h.req('/api/projects',{cache:'no-store'}),
    h.req('/api/todos'),h.req('/api/todos'),h.req('/api/projects',{method:'POST'}),h.req('/api/projects',{method:'POST'})];
  assert.equal(h.calls.length, 6, 'Custom requests, other endpoints and writes remain independent');
  h.calls.forEach((_,i)=>h.finish(i)); await Promise.all(requests);
}
console.log('PASS: concurrent reads, isolated records, fresh refresh, failure retry, mutation/session invalidation and request isolation');
