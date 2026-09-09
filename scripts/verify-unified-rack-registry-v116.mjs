import fs from 'node:fs';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

const workerPath=process.argv[2]||'dist/server/index.js';
const source=fs.readFileSync(workerPath,'utf8');
for(const marker of [
  'CREATE TABLE IF NOT EXISTS rack_type_records',
  'rack_type_records_migrated_v116',
  'path === "/api/rack-types"',
  'createRackRecord(db,user.id',
  'rackLogId(system)',
  "system IN ('b2b','mr')",
  "system IN ('mekik2','drive','konsol')"
])assert(source.includes(marker),'worker registry marker missing: '+marker);
assert(!source.includes('INSERT INTO b2b_rack_types(user_id,type_no,name,drawing,created_at)'), 'B2B saves must use the unified table');
assert(!source.includes('INSERT INTO mekik2_rack_types(user_id,type_no,name,drawing,created_at)'), 'Mekik/Drive/Konsol saves must use the unified table');
assert(!source.includes('INSERT INTO mr_rack_types(user_id,type_no,name,drawing,created_at)'), 'MR saves must use the unified table');

const htmlMatch=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
assert(htmlMatch,'HTML_BASE64 missing');
const html=Buffer.from(htmlMatch[2],'base64').toString('utf8');
for(const marker of ['/api/rack-types','__rafexSnapshot','source:\'registry\'',' · LOG ','Kayıt Logu'])assert(html.includes(marker),'client registry marker missing: '+marker);

const db=new DatabaseSync(':memory:');
db.exec(`
  CREATE TABLE users(id INTEGER PRIMARY KEY);
  CREATE TABLE app_settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
  CREATE TABLE b2b_rack_types(id INTEGER PRIMARY KEY,user_id INTEGER,type_no INTEGER,name TEXT,drawing TEXT,created_at TEXT);
  CREATE TABLE mekik2_rack_types(id INTEGER PRIMARY KEY,user_id INTEGER,type_no INTEGER,name TEXT,drawing TEXT,created_at TEXT);
  CREATE TABLE mr_rack_types(id INTEGER PRIMARY KEY,user_id INTEGER,type_no INTEGER,name TEXT,drawing TEXT,created_at TEXT);
  INSERT INTO users VALUES(1);
`);
const stamp='2026-09-09T10:55:03.000Z';
const plan={feet:[],braces:[]};
const insert=(table,id,no,name,drawing)=>db.prepare(`INSERT INTO ${table}(id,user_id,type_no,name,drawing,created_at) VALUES(?,1,?,?,?,?)`).run(id,no,name,JSON.stringify({plan,totalWidth:1000,railLength:800,...drawing}),stamp);
insert('b2b_rack_types',1,1,'A',{b2b:{levels:4}});
insert('b2b_rack_types',2,2,'B',{b2b:{mr:true},systemType:'mr'});
insert('mekik2_rack_types',3,1,'Tip 1',{});
insert('mekik2_rack_types',4,2,'Tip 2',{rafexSystem:'drive'});
insert('mekik2_rack_types',5,3,'Tip 3',{rafexSystem:'konsol',konsol:{levels:4}});
db.exec(fs.readFileSync('drizzle/0008_unified_rack_type_records.sql','utf8'));
const rows=db.prepare('SELECT system,log_id,drawing FROM rack_type_records ORDER BY id').all();
assert.deepEqual(rows.map(row=>row.system).sort(),['b2b','drive','konsol','mekik2','mr']);
assert(rows.every(row=>/-105503$/.test(row.log_id)),'legacy log IDs must include hour-minute-second');
assert(rows.every(row=>JSON.parse(row.drawing).totalWidth===1000),'each registry row must retain its own complete drawing');
db.exec(fs.readFileSync('drizzle/0008_unified_rack_type_records.sql','utf8'));
assert.equal(db.prepare('SELECT COUNT(*) AS count FROM rack_type_records').get().count,5,'migration must be idempotent');

console.log('PASS: all five systems use one immutable rack registry with timestamped log IDs.');
