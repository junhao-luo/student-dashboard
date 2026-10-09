import test from 'node:test';
import assert from 'node:assert/strict';
import {folderDescendants} from './domain.ts';
test('folder move exclusion includes nested descendants and terminates on cycles',()=>{
 const folders=[{id:'a',name:'A',parentId:''},{id:'b',name:'B',parentId:'a'},{id:'c',name:'C',parentId:'b'},{id:'d',name:'D',parentId:''}];
 assert.deepEqual(folderDescendants(folders,'a'),['a','b','c']);
 assert.deepEqual(folderDescendants([{id:'a',name:'A',parentId:'b'},{id:'b',name:'B',parentId:'a'}],'a'),['a','b']);
});
