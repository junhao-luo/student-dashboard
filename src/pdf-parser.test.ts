import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseTimetable,type PdfText} from './pdf-parser.ts';
function grid():PdfText[]{const headers=['一','二','三','四','五','六','日'].map((day,index)=>({str:`星期${day}`,x:90+index*70,y:800,width:36}));const times=Array.from({length:14},(_,i)=>[{str:`${String(i+8).padStart(2,'0')}:10`,x:50,y:770-i*40,width:20},{str:`${String(i+9).padStart(2,'0')}:00`,x:50,y:750-i*40,width:20}]).flat();return [...headers,...times];}
test('wrapped Chinese course cells combine consecutive periods',()=>{const items=grid();for(const y of [765,725])items.push({str:'測試課程(一)',x:146,y,width:48},{str:'(教師甲)',x:146,y:y-10,width:40},{str:'圖213',x:146,y:y-20,width:20});const rows=parseTimetable(items);assert.equal(rows.length,1);assert.deepEqual(rows[0],{name:'測試課程(一)',instructor:'教師甲',room:'圖213',day:2,start:'08:10',end:'10:00'});});
test('meetings with different rooms stay separate',()=>{const items=grid();for(const [y,room] of [[765,'人101'],[725,'人102']] as const)items.push({str:'課程(教師甲)',x:146,y,width:48},{str:room,x:146,y:y-20,width:20});assert.equal(parseTimetable(items).length,2);});
test('unsupported layouts and missing periods fail without inventing meetings',()=>{assert.throws(()=>parseTimetable([]));assert.throws(()=>parseTimetable(grid().filter(item=>item.str!=='08:10')));assert.throws(()=>parseTimetable(grid()));});
