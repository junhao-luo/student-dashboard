import {test} from 'node:test';
import assert from 'node:assert/strict';
import {zipSync,strToU8} from 'fflate';
import {exportWorkspace} from './export.ts';
import {readWorkspaceZip} from './workspace-import.ts';
import type {Workspace} from './storage.ts';
const workspace:Workspace={version:1,lang:'en',dark:false,page:'settings',semester:'115-1',semesters:['115-1'],courses:[{id:'c',semester:'115-1',code:'CS',name:'Course',instructor:'',credits:3,room:'',color:'blue'}],tasks:[],meetings:[],notes:[{id:'n',courseId:'c',title:'Lecture',body:'Notes'}],resources:[{id:'r',courseId:'c',title:'Handout',url:'',fileId:'f',originalName:'handout.pdf',size:8}],folders:[]};
test('domain transfer preserves records, file bytes and PDF type',async()=>{
 const bytes=await exportWorkspace(workspace,async()=>new Blob(['%PDF-123']));
 const restored=await readWorkspaceZip(new File([new Uint8Array(bytes).buffer],'backup.zip'));
 assert.deepEqual(restored.workspace.notes,workspace.notes);
 assert.equal(await restored.files.get('f')!.text(),'%PDF-123');
 assert.equal(restored.files.get('f')!.type,'application/pdf');
});
test('domain transfer refuses missing attachments and orphan notes',async()=>{
 const manifest={format:'coursedock-export',version:1,records:'records.json',files:{}};
 for(const value of [workspace,{...workspace,resources:[],notes:[{...workspace.notes[0],courseId:'missing'}]}]){
 const bytes=zipSync({'manifest.json':strToU8(JSON.stringify(manifest)),'records.json':strToU8(JSON.stringify(value))});
 await assert.rejects(readWorkspaceZip(new File([new Uint8Array(bytes).buffer],'backup.zip')));
 }
});
