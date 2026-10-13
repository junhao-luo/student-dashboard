import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeStudentProfile} from './student-profile.ts';
const profile={name:'Synthetic Student',studentId:'D1234567',department:'Test',className:'A',phone:'0912345678'};

test('student IDs require an uppercase D, M or P and exactly seven ASCII digits',()=>{
  for(const studentId of ['D1234567','M1234567','P1234567']){
    assert.equal(normalizeStudentProfile({...profile,studentId})?.schoolEmail,`${studentId.toLowerCase()}@o365.fcu.edu.tw`);
  }
  for(const studentId of ['D123456','D12345678','A1234567','d1234567','m1234567','p1234567','12345678','D123_567','D123A567','D１２３４５６７','D123 567']){
    assert.equal(normalizeStudentProfile({...profile,studentId}),null,studentId);
  }
  assert.equal(normalizeStudentProfile({...profile,studentId:' M1234567 '})?.studentId,'M1234567');
});
