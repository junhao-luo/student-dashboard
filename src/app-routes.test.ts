import {test} from 'node:test';
import assert from 'node:assert/strict';
import {appPath,routerPath,isAccountPath} from './app-routes.ts';

test('account routes retain subpath exactly once and preserve callback parameters',()=>{
  const base='/student-dashboard/';
  assert.equal(appPath(base,'/sign-in'),'/student-dashboard/sign-in');
  assert.equal(routerPath(base,'/student-dashboard/dashboard?code=test#x','https://eljhon.me'),'/dashboard?code=test#x');
  assert.equal(routerPath(base,'https://eljhon.me/student-dashboard/sign-up','https://eljhon.me'),'/sign-up');
  assert.equal(routerPath(base,'/student-dashboard','https://eljhon.me'),'/');
  assert.equal(appPath('/','/sign-in'),'/sign-in');
  assert.equal(routerPath('/','/dashboard','http://localhost:5180'),'/dashboard');
  assert.throws(()=>routerPath(base,'https://evil.example/student-dashboard','https://eljhon.me'));
  assert.throws(()=>routerPath(base,'/student-dashboard-other','https://eljhon.me'));
  assert.throws(()=>routerPath(base,'/','https://eljhon.me'));
});

test('unknown workspace routes show 404 while managed authentication subroutes remain available',()=>{
 for(const path of ['/','/dashboard','/onboarding','/sign-in','/sign-up','/sign-in/factor-one','/sign-up/verify-email-address'])assert.equal(isAccountPath(path),true);
 for(const path of ['/missing','/dashboard/missing','/sign-in-other','/sign-up-other'])assert.equal(isAccountPath(path),false);
 assert.equal(appPath('/student-dashboard/','/'),'/student-dashboard/');
});
