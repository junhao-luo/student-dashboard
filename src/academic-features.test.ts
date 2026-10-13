import {test} from 'node:test';import assert from 'node:assert/strict';import {zipSync,strToU8} from 'fflate';
import {semesterCredits,taskStatus,withTaskStatus,type Course,type Task} from './domain.ts';
import {courseFolder,moveFolder,moveResource,folderCourse} from './resource-folders.ts';
import {academicData,validAcademic} from './academic.ts';
import {officeEntries,validateFile} from './files.ts';
import {previewHtml} from './file-preview.ts';
const course:Course={id:'c',name:'Synthetic',semester:'115-1',code:'',instructor:'',credits:3,room:'',color:'blue'};
const task:Task={id:'t',courseId:'c',title:'Study',kind:'assignment',due:'2026-10-15T00:00:00.000Z',done:false,reminderDays:null};
test('semester credits split required/elective and retain unclassified legacy credits',()=>{
 assert.deepEqual(semesterCredits([course,{...course,id:'r',credits:2.5,courseType:'required'},{...course,id:'e',courseType:'elective'},{...course,id:'other',semester:'115-2',credits:20}],'115-1'),{required:2.5,elective:3,unclassified:3,total:8.5});
});
test('task statuses keep legacy completion and reminder cancellation consistent',()=>{
 assert.equal(taskStatus(task),'not_started');assert.equal(taskStatus({...task,done:true}),'complete');
 assert.equal(withTaskStatus(task,'in_progress').done,false);assert.equal(withTaskStatus(task,'complete').done,true);
 const data={semesters:['115-1'],courses:[course],tasks:[{...withTaskStatus(task,'in_progress'),description:'Details',attachments:[{fileId:'f',name:'x.pdf',size:10}]}],meetings:[]};
 assert.ok(validAcademic(academicData(data)));assert.ok(!('attachments' in academicData(data).tasks[0]));
 assert.equal(validAcademic({...data,tasks:[{...task,status:'complete'}]}),false);
 assert.equal(validAcademic({...data,tasks:[{...task,description:'x'.repeat(10001)}]}),false);
});
test('folder moves update descendant course ownership and refuse cycles',()=>{
 const folders=[{id:'a',name:'A',parentId:courseFolder('c'),courseId:'c'},{id:'b',name:'B',parentId:'a',courseId:'c'}];
 const resources=[{id:'r',title:'File',url:'',folderId:'b',courseId:'c'}];
 assert.throws(()=>moveFolder(folders,resources,'a','b'));
 const moved=moveFolder(folders,resources,'a',courseFolder('other'));
 assert.equal(folderCourse('b',moved.folders),'other');assert.equal(moved.resources[0].courseId,'other');
 assert.equal(moveResource(resources[0],'general',folders).courseId,'');
});
test('Office uploads reject disguised archives, macros and oversized decompression',async()=>{
 const doc=zipSync({'word/document.xml':strToU8('<document/>')});await validateFile(new File([doc],'test.docx'));
 await assert.rejects(validateFile(new File([doc],'test.pptx')));
 assert.throws(()=>officeEntries(zipSync({'word/vbaProject.bin':new Uint8Array([1])})));
 assert.throws(()=>officeEntries(zipSync({'word/document.xml':new Uint8Array(9*1024*1024)})));
 assert.throws(()=>officeEntries(zipSync({'../evil.xml':strToU8('x')})));
});
test('new-tab content previews escape executable content',()=>{
 const html=previewHtml('<img onerror=alert(1)>',[{title:'<script>bad</script>',text:'<iframe src="https://bad.example">',images:['javascript:alert(1)']}]);
 assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<iframe'));assert.ok(!html.includes('src="javascript:'));assert.ok(html.includes('&lt;iframe'));
});
