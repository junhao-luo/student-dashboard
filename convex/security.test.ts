/// <reference types="vite/client" />
import {convexTest} from 'convex-test';
import {makeFunctionReference} from 'convex/server';
import {test,expect,vi} from 'vitest';
import schema from './schema';
// Offline root hint for convex-test; real codegen awaits a configured deployment.
const modules={...import.meta.glob(['./**/*.ts','!./**/*.test.ts']),'./_generated/offline-test.ts':async()=>({})};
const profile={name:'Test Student',studentId:'D1234567',department:'Computer Science',className:'A',schoolEmail:'D1234567@o365.fcu.edu.tw',phone:'+886 912345678'};
const course={semester:'115-1',code:'CS101',name:'Algorithms',instructor:'Test Instructor',credits:3,room:'A101',color:'blue'};
const ref=(name:string)=>makeFunctionReference<'action'>(name);
const user=(t:ReturnType<typeof convexTest>,id:string)=>t.withIdentity({subject:id,issuer:'https://test-issuer.example',tokenIdentifier:`https://test-issuer.example|${id}`});
test('unauthenticated requests and incomplete profiles cannot access academic records',async()=>{
  const t=convexTest(schema,modules);
  for(const [name,args]of [['profiles:get',{}],['profiles:save',{profile}],['courses:list',{semester:'115-1',limit:50}],['courses:save',{course}]] as const)await expect(t.action(ref(name),args)).rejects.toThrow('SIGN_IN_REQUIRED');
  await expect(user(t,'A').action(ref('courses:save'),{course})).rejects.toThrow('PROFILE_REQUIRED');
});
test('each user has a private profile; server derives owner and trims responses',async()=>{
  const t=convexTest(schema,modules),a=user(t,'A'),b=user(t,'B');
  await a.action(ref('profiles:save'),{profile});
  expect(await b.action(ref('profiles:get'),{})).toBeNull();
  const result=await a.action(ref('profiles:get'),{});
  expect(result).toEqual({...profile,schoolEmail:profile.schoolEmail.toLowerCase()});
  expect(result).not.toHaveProperty('owner');
  await expect(a.action(ref('profiles:save'),{profile:{...profile,owner:'B'}})).rejects.toThrow();
  await expect(a.action(ref('profiles:save'),{profile:{...profile,schoolEmail:'someone@example.com'}})).rejects.toThrow('INVALID_PROFILE');
});
test('cross-user reads, updates and deletion are denied, including owner field tampering',async()=>{
  const t=convexTest(schema,modules),a=user(t,'A'),b=user(t,'B');
  await a.action(ref('profiles:save'),{profile});await b.action(ref('profiles:save'),{profile});
  const id=await a.action(ref('courses:save'),{course});
  expect(await b.action(ref('courses:list'),{semester:'115-1',limit:50})).toEqual([]);
  await expect(b.action(ref('courses:save'),{id,course:{...course,name:'Tampered'}})).rejects.toThrow('NOT_FOUND');
  await expect(b.action(ref('courses:deleteCourse'),{id})).rejects.toThrow('NOT_FOUND');
  await expect(a.action(ref('courses:save'),{course:{...course,owner:'B'}})).rejects.toThrow();
  await expect(a.action(ref('courses:list'),{semester:'115-1',limit:1000})).rejects.toThrow('INVALID_LIST');
  await expect(a.action(ref('courses:save'),{course:{...course,credits:-1}})).rejects.toThrow('INVALID_COURSE');
  expect(await a.action(ref('courses:list'),{semester:'115-1',limit:50})).toHaveLength(1);
});
test('read and write budgets are per verified identity and reset after one minute',async()=>{
  vi.useFakeTimers({toFake:['Date']});
  try{
    const t=convexTest(schema,modules),a=user(t,'A'),b=user(t,'B');
    for(let i=0;i<60;i++)await a.action(ref('profiles:get'),{});
    await expect(a.action(ref('profiles:get'),{})).rejects.toThrow('RATE_LIMITED');
    expect(await b.action(ref('profiles:get'),{})).toBeNull();
    for(let i=0;i<20;i++)await a.action(ref('profiles:save'),{profile});
    await expect(a.action(ref('profiles:save'),{profile})).rejects.toThrow('RATE_LIMITED');
    vi.setSystemTime(Date.now()+60001);
    expect(await a.action(ref('profiles:get'),{})).not.toBeNull();
    await expect(a.action(ref('profiles:save'),{profile})).resolves.toBeNull();
  }finally{vi.useRealTimers();}
});
