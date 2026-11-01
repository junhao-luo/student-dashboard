import {test} from 'node:test';
import assert from 'node:assert/strict';
import {splitClass,joinClass} from './class-options.ts';
test('class dropdown migration preserves custom values and separates known sections',()=>{
 assert.deepEqual(splitClass('一甲'),{year:'一年級',section:'甲班'});
 assert.equal(joinClass(...Object.values(splitClass('Graduate cohort A')) as [string,string]),'Graduate cohort A');
 assert.deepEqual(splitClass('延修／延畢 / 乙班'),{year:'延修／延畢',section:'乙班'});
 assert.equal(joinClass('碩士班（不分年級）','無分班'),'碩士班（不分年級）');
 assert.equal(joinClass('','甲班'),'');
});
