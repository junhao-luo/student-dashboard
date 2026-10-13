import {test} from 'node:test';
import assert from 'node:assert/strict';
import {meetingColumns} from './import-layout.ts';
test('overlapping imported meetings have separate lanes without shrinking other periods',()=>{
  assert.deepEqual(meetingColumns([
    {day:1,start:'09:10',end:'12:00'},
    {day:1,start:'10:10',end:'11:00'},
    {day:1,start:'11:10',end:'12:00'},
    {day:1,start:'13:10',end:'15:00'},
    {day:2,start:'09:10',end:'12:00'},
  ]),[{lane:0,count:2},{lane:1,count:2},{lane:1,count:2},{lane:0,count:1},{lane:0,count:1}]);
});
