import {test} from 'node:test';
import assert from 'node:assert/strict';
import {currentClasses} from './class-now.ts';
const meetings=[{id:'one',courseId:'course',day:2,start:'09:10',end:'10:00',room:'A101'},{id:'two',courseId:'other',day:2,start:'09:30',end:'11:00',room:'B101'}];
test('current class uses Taiwan day/time, includes the start and excludes the end',()=>{
 assert.deepEqual(currentClasses(meetings,new Date('2026-10-13T01:10:00Z')).map(m=>m.id),['one']);
 assert.deepEqual(currentClasses(meetings,new Date('2026-10-13T01:45:00Z')).map(m=>m.id),['one','two']);
 assert.deepEqual(currentClasses(meetings,new Date('2026-10-13T02:00:00Z')).map(m=>m.id),['two']);
 assert.deepEqual(currentClasses(meetings,new Date('2026-10-12T01:45:00Z')),[]);
 assert.deepEqual(currentClasses([{...meetings[0],day:1,start:'00:00',end:'01:00'}],new Date('2026-10-11T16:10:00Z')).map(m=>m.id),['one']);
});
