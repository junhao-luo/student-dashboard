import {test} from 'node:test';
import assert from 'node:assert/strict';
import {unzipSync,strFromU8} from 'fflate';
import {exportWorkspace,exportName} from './export.ts';
import type {Workspace} from './storage.ts';
const workspace:Workspace={version:1,lang:'en',dark:false,page:'courses',semester:'115-1',semesters:['115-1'],courses:[],tasks:[],meetings:[],folders:[],notes:[{id:'note',courseId:'course',title:'../Lecture',body:'![diagram](local-file:file-1)',blocks:'[]',sourceMarkdown:'# Original',attachments:[{fileId:'file-1',name:'../diagram.png',size:3,kind:'image'}]}],resources:[{id:'r',fileId:'file-1',title:'diagram',originalName:'../diagram.png',url:''}]};
test('ZIP preserves records, original attachments, imported Markdown and image relationships',async()=>{
  let reads=0;
  const bytes=await exportWorkspace(workspace,async()=>{reads++;return new Blob(['abc']);});
  const files=unzipSync(bytes),manifest=JSON.parse(strFromU8(files['manifest.json']));
  assert.equal(reads,1);
  assert.deepEqual(JSON.parse(strFromU8(files['records.json'])),workspace);
  assert.equal(strFromU8(files[manifest.files['file-1'].path]),'abc');
  assert.equal(strFromU8(files['notes/1-original.md']),'# Original');
  assert.match(strFromU8(files[manifest.notes[0].path]),/\.\.\/files\/1-_diagram.png/);
  for(const path of Object.keys(files))assert.ok(!path.split('/').includes('..'));
});
test('ZIP refuses missing files rather than silently dropping attachments',async()=>{
  await assert.rejects(exportWorkspace(workspace,async()=>undefined),/missing/);
});
test('export filenames cannot escape their directories',()=>{
  assert.equal(exportName('../../secret\n.txt'),'_.._secret_.txt');
});
test('ZIP includes original assignment attachments',async()=>{
 const value={...workspace,notes:[],resources:[],tasks:[{id:'t',courseId:'c',title:'Study',kind:'assignment' as const,due:'2026-10-15T00:00:00.000Z',done:false,reminderDays:null,attachments:[{fileId:'assignment-file',name:'handout.pdf',size:3}]}]};
 const entries=unzipSync(await exportWorkspace(value,async()=>new Blob(['abc'])));
 const manifest=JSON.parse(strFromU8(entries['manifest.json']));
 assert.equal(strFromU8(entries[manifest.files['assignment-file'].path]),'abc');
});
