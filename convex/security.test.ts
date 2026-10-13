/// <reference types="vite/client" />
import {convexTest} from 'convex-test';
import {makeFunctionReference} from 'convex/server';
import {test,expect,vi} from 'vitest';
import schema from './schema';
// Offline root hint keeps tests usable before a local deployment/codegen is configured.
const modules={...import.meta.glob(['./**/*.ts','!./**/*.test.ts']),'./_generated/offline-test.ts':async()=>({})};
const profile={name:'Test Student',studentId:'D1234567',department:'Computer Science',className:'A',phone:'+886912345678'};
const course={semester:'115-1',code:'CS101',name:'Algorithms',instructor:'Test Instructor',credits:3,room:'A101',color:'blue'};
const ref=(name:string)=>makeFunctionReference<'action'>(name);
const user=(t:ReturnType<typeof convexTest>,id:string)=>t.withIdentity({subject:id,issuer:'https://test-issuer.example',tokenIdentifier:`https://test-issuer.example|${id}`});
const academic={semesters:['115-1'],courses:[{...course,id:'local-course'}],tasks:[{id:'local-task',courseId:'local-course',title:'Exam',kind:'exam',due:'2026-10-11T02:00:00.000Z',done:false,reminderDays:1}],meetings:[{id:'local-meeting',courseId:'local-course',day:1,start:'09:10',end:'10:00',room:'A101'}]};

test('every public business endpoint denies anonymous identity and exhausted shared budgets',async()=>{
 const t=convexTest(schema,modules),a=user(t,'A');await a.action(ref('profiles:save'),{profile});
 const courseId=await a.action(ref('courses:save'),{course});
 const task={courseId,title:'Study',kind:'assignment',due:'2026-10-11T02:00:00.000Z',done:false,reminderDays:null};
 const meeting={courseId,day:1,start:'09:10',end:'10:00',room:'A101'};
 const taskId=await a.action(ref('tasks:save'),{task}),meetingId=await a.action(ref('meetings:save'),{meeting});
 const endpoints:[string,Record<string,unknown>][]=[
  ['profiles:get',{}],['profiles:save',{profile}],['academic:get',{}],['academic:save',{revision:0,requestId:'budget',data:academic}],
  ['support:submit',{kind:'suggestion',subject:'Test',message:'Synthetic report message',requestId:'12345678-1234-1234-1234-123456789abc',screenshot:null,diagnostics:null}],
  ['courses:list',{semester:'115-1',limit:1}],['courses:save',{course}],['courses:deleteCourse',{id:courseId}],
  ['tasks:list',{courseId,cursor:null,limit:1}],['tasks:save',{task}],['tasks:deleteTask',{id:taskId}],
  ['meetings:list',{courseId,cursor:null,limit:1}],['meetings:save',{meeting}],['meetings:deleteMeeting',{id:meetingId}],
 ];
 await t.run(async ctx=>{
  const buckets=await ctx.db.query('limits').collect();
  for(const scope of ['read','write'] as const){
   const bucket=buckets.find(b=>b.scope===scope);
   const values={count:scope==='read'?60:20,window:Date.now()};
   if(bucket)await ctx.db.patch(bucket._id,values);else await ctx.db.insert('limits',{owner:'https://test-issuer.example|A',scope,...values});
  }
 });
 for(const [name,args]of endpoints){
  await expect(t.action(ref(name),args),name).rejects.toThrow('SIGN_IN_REQUIRED');
  await expect(a.action(ref(name),args),name).rejects.toThrow('RATE_LIMITED');
 }
 expect(await t.run(async ctx=>(await ctx.db.query('courses').collect()).length)).toBe(1);
 expect(await t.run(async ctx=>(await ctx.db.query('tasks').collect()).length)).toBe(1);
});

test('concurrent writes cannot exceed one identity budget',async()=>{
 const t=convexTest(schema,modules),a=user(t,'A');
 const results=await Promise.allSettled(Array.from({length:25},()=>a.action(ref('profiles:save'),{profile})));
 expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(20);
 for(const r of results)if(r.status==='rejected')expect(String(r.reason)).toContain('RATE_LIMITED');
});

test('record capacity is atomic, private per owner, and still permits edits at the cap',async()=>{
 const t=convexTest(schema,modules),a=user(t,'A'),b=user(t,'B');
 await a.action(ref('profiles:save'),{profile});await b.action(ref('profiles:save'),{profile});
 await t.run(async ctx=>{for(let i=0;i<99;i++)await ctx.db.insert('courses',{owner:'https://test-issuer.example|A',...course});});
 const race=await Promise.allSettled([a.action(ref('courses:save'),{course}),a.action(ref('courses:save'),{course})]);
 expect(race.filter(r=>r.status==='fulfilled')).toHaveLength(1);
 expect(race.filter(r=>r.status==='rejected').map(r=>String(r.reason))).toEqual([expect.stringContaining('RECORD_LIMIT_REACHED')]);
 const id=await t.run(async ctx=>(await ctx.db.query('courses').first())!._id);
 await expect(a.action(ref('courses:save'),{id,course:{...course,name:'Edited at capacity'}})).resolves.toBe(id);
 await expect(b.action(ref('courses:save'),{course})).resolves.toBeTruthy();
});

test('multibyte snapshots cannot bypass the byte budget',async()=>{
 const t=convexTest(schema,modules),a=user(t,'A');await a.action(ref('profiles:save'),{profile});
 const data={...academic,tasks:Array.from({length:900},(_,i)=>({...academic.tasks[0],id:`task-${i}`,title:'學'.repeat(200)}))};
 expect(JSON.stringify(data).length).toBeLessThan(400000);
 expect(new TextEncoder().encode(JSON.stringify(data)).byteLength).toBeGreaterThan(400000);
 await expect(a.action(ref('academic:save'),{revision:0,requestId:'oversized-unicode',data})).rejects.toThrow('INVALID_ACADEMIC');
 expect(await a.action(ref('academic:get'),{})).toBeNull();
});
test('academic import preserves IDs, is owner-isolated, idempotent and rejects stale writes',async()=>{
 const t=convexTest(schema,modules),a=user(t,'A'),b=user(t,'B');
 await expect(t.action(ref('academic:get'),{})).rejects.toThrow('SIGN_IN_REQUIRED');
 await expect(a.action(ref('academic:save'),{revision:0,requestId:'first',data:academic})).rejects.toThrow('PROFILE_REQUIRED');
 await a.action(ref('profiles:save'),{profile});await b.action(ref('profiles:save'),{profile});
 const input={revision:0,requestId:'first',data:academic};
 const first=await a.action(ref('academic:save'),input);
 expect(first).toEqual({revision:1,data:academic});
 expect(await a.action(ref('academic:save'),input)).toEqual(first);
 expect(await b.action(ref('academic:get'),{})).toBeNull();
 expect(await a.action(ref('academic:get'),{})).toEqual(first);
 await expect(a.action(ref('academic:save'),{...input,requestId:'stale'})).rejects.toThrow('SYNC_CONFLICT');
 await expect(a.action(ref('academic:save'),{...input,data:{...academic,tasks:[]}})).rejects.toThrow('REQUEST_REUSED');
 await expect(a.action(ref('academic:save'),{...input,owner:'B'})).rejects.toThrow();
 const race=await Promise.allSettled(['device1','device2'].map(requestId=>a.action(ref('academic:save'),{revision:1,requestId,data:academic})));
 expect(race.filter(r=>r.status==='fulfilled')).toHaveLength(1);
 expect(await a.action(ref('academic:get'),{})).toMatchObject({revision:2});
});
test('academic snapshots reject duplicate IDs, orphan relationships and oversized input atomically',async()=>{
 const t=convexTest(schema,modules),a=user(t,'A');await a.action(ref('profiles:save'),{profile});
 for(const data of [{...academic,courses:[...academic.courses,...academic.courses]},{...academic,tasks:[{...academic.tasks[0],courseId:'foreign-course'}]},{...academic,meetings:[{...academic.meetings[0],day:8}]},{...academic,semesters:[]},{...academic,courses:Array(101).fill(academic.courses[0])},{...academic,courses:[{...academic.courses[0],owner:'B'}]}]){
  await expect(a.action(ref('academic:save'),{revision:0,requestId:'invalid',data})).rejects.toThrow();
 }
 expect(await a.action(ref('academic:get'),{})).toBeNull();
});
test('unauthenticated requests and incomplete profiles cannot access academic records',async()=>{
  const t=convexTest(schema,modules);
  for(const [name,args]of [['profiles:get',{}],['profiles:save',{profile}],['courses:list',{semester:'115-1',limit:50}],['courses:save',{course}]] as const)await expect(t.action(ref(name),args)).rejects.toThrow('SIGN_IN_REQUIRED');
  await expect(user(t,'A').action(ref('courses:save'),{course})).rejects.toThrow('PROFILE_REQUIRED');
  for(const field of Object.keys(profile))await expect(user(t,'A').action(ref('profiles:save'),{profile:{...profile,[field]:' '}})).rejects.toThrow('INVALID_PROFILE');
  await expect(user(t,'A').action(ref('courses:list'),{semester:'115-1',limit:50})).rejects.toThrow('PROFILE_REQUIRED');
});
test('each user has a private profile; server derives owner and trims responses',async()=>{
  const t=convexTest(schema,modules),a=user(t,'A'),b=user(t,'B');
  await a.action(ref('profiles:save'),{profile});
  expect(await b.action(ref('profiles:get'),{})).toBeNull();
  const result=await a.action(ref('profiles:get'),{});
  expect(result).toEqual({...profile,schoolEmail:'d1234567@o365.fcu.edu.tw',phone:'0912345678'});
  expect(result).not.toHaveProperty('owner');
  await expect(a.action(ref('profiles:save'),{profile:{...profile,owner:'B'}})).rejects.toThrow();
  await expect(a.action(ref('profiles:save'),{profile:{...profile,schoolEmail:'someone@example.com'}})).rejects.toThrow();
});
test('school email is generated in storage and regenerated when the student ID changes',async()=>{
  const t=convexTest(schema,modules),a=user(t,'A');
  await a.action(ref('profiles:save'),{profile});
  await a.action(ref('profiles:save'),{profile:{...profile,studentId:' D7654321 ',department:'自訂學程'}});
  const stored=await t.run(async ctx=>(await ctx.db.query('profiles').collect())[0]);
  expect(stored).toMatchObject({studentId:'D7654321',schoolEmail:'d7654321@o365.fcu.edu.tw',phone:'0912345678',department:'自訂學程'});
  await expect(a.action(ref('profiles:save'),{profile:{...profile,schoolEmail:'forged@example.com'}})).rejects.toThrow();
  expect(await a.action(ref('profiles:get'),{})).toMatchObject({schoolEmail:'d7654321@o365.fcu.edu.tw'});
});
test('student ID format is enforced server-side and failed updates preserve the profile',async()=>{
  const t=convexTest(schema,modules),a=user(t,'A');
  for(const studentId of ['D1234567','M1234567','P1234567']){
    await a.action(ref('profiles:save'),{profile:{...profile,studentId}});
    expect(await a.action(ref('profiles:get'),{})).toMatchObject({studentId,schoolEmail:`${studentId.toLowerCase()}@o365.fcu.edu.tw`});
  }
  for(const studentId of ['D123456','D12345678','A1234567','d1234567','m1234567','p1234567','12345678','D123_567','D123A567','D１２３４５６７','D123 567']){
    await expect(a.action(ref('profiles:save'),{profile:{...profile,studentId}})).rejects.toThrow('INVALID_PROFILE');
  }
  expect(await a.action(ref('profiles:get'),{})).toMatchObject({studentId:'P1234567',schoolEmail:'p1234567@o365.fcu.edu.tw'});
});
test('Taiwan mobile format is enforced server-side and failed updates preserve the profile',async()=>{
  const t=convexTest(schema,modules),a=user(t,'A');
  for(const phone of ['0912345678','+886912345678']){
    await a.action(ref('profiles:save'),{profile:{...profile,phone}});
    expect(await a.action(ref('profiles:get'),{})).toMatchObject({phone:'0912345678'});
  }
  for(const phone of ['091234567','09123456789','0812345678','+8860912345678','+886 912345678','0912-345-678','+14155552671','０９１２３４５６７８','09abcdefgh','04 12345678']){
    await expect(a.action(ref('profiles:save'),{profile:{...profile,phone}})).rejects.toThrow('INVALID_PROFILE');
  }
  expect(await a.action(ref('profiles:get'),{})).toMatchObject({phone:'0912345678'});
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
test('course types and deadline details/status sync with bounded validation',async()=>{
 const t=convexTest(schema,modules),a=user(t,'A');await a.action(ref('profiles:save'),{profile});
 const courseId=await a.action(ref('courses:save'),{course:{...course,courseType:'elective'}});
 expect((await a.action(ref('courses:list'),{semester:'115-1',limit:50}))[0].courseType).toBe('elective');
 const task={courseId,title:'Study',kind:'assignment',due:'2026-10-15T00:00:00.000Z',done:false,status:'in_progress',description:'Read chapter one',reminderDays:null};
 await a.action(ref('tasks:save'),{task});
 expect((await a.action(ref('tasks:list'),{courseId,cursor:null,limit:50})).items[0]).toMatchObject({status:'in_progress',description:'Read chapter one'});
 await expect(a.action(ref('tasks:save'),{task:{...task,status:'complete'}})).rejects.toThrow('INVALID_TASK');
 await expect(a.action(ref('tasks:save'),{task:{...task,description:'x'.repeat(10001)}})).rejects.toThrow('INVALID_TASK');
 await expect(a.action(ref('courses:save'),{course:{...course,courseType:'forged'}})).rejects.toThrow();
 const data={...academic,courses:[{...academic.courses[0],courseType:'required'}],tasks:[{...academic.tasks[0],status:'in_progress',description:'Homework details'}]};
 await a.action(ref('academic:save'),{revision:0,requestId:'details',data});
 expect((await a.action(ref('academic:get'),{})).data.tasks[0]).toMatchObject({status:'in_progress',description:'Homework details'});
 await expect(a.action(ref('academic:save'),{revision:1,requestId:'forged-status',data:{...data,tasks:[{...data.tasks[0],status:'complete'}]}})).rejects.toThrow('INVALID_ACADEMIC');
 await expect(a.action(ref('academic:save'),{revision:1,requestId:'local-files',data:{...data,tasks:[{...data.tasks[0],attachments:[]}]}})).rejects.toThrow();
 const storedTasks=(await a.action(ref('tasks:list'),{courseId,cursor:null,limit:50})).items;
 await a.action(ref('tasks:save'),{id:storedTasks[0].id,task:{courseId,title:'Legacy edit',kind:'assignment',due:task.due,done:true,reminderDays:null}});
 const legacyTask=(await a.action(ref('tasks:list'),{courseId,cursor:null,limit:50})).items[0];
 expect(legacyTask).not.toHaveProperty('status');expect(legacyTask).not.toHaveProperty('description');expect(legacyTask.done).toBe(true);
 await a.action(ref('courses:save'),{id:courseId,course});
 expect((await a.action(ref('courses:list'),{semester:'115-1',limit:50}))[0]).not.toHaveProperty('courseType');
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
test('tasks enforce ownership of both the record and linked course, and preserve updates',async()=>{
  const t=convexTest(schema,modules),a=user(t,'A'),b=user(t,'B');
  await a.action(ref('profiles:save'),{profile});await b.action(ref('profiles:save'),{profile});
  const courseId=await a.action(ref('courses:save'),{course});
  const otherCourse=await b.action(ref('courses:save'),{course});
  const task={courseId,title:'Review algorithms',kind:'exam',due:'2026-10-11T02:00:00.000Z',done:false,reminderDays:1};
  const id=await a.action(ref('tasks:save'),{task});
  await expect(b.action(ref('tasks:list'),{courseId,cursor:null,limit:50})).rejects.toThrow('NOT_FOUND');
  await expect(b.action(ref('tasks:save'),{id,task:{...task,courseId:otherCourse}})).rejects.toThrow('NOT_FOUND');
  await expect(a.action(ref('tasks:save'),{id,task:{...task,courseId:otherCourse}})).rejects.toThrow('NOT_FOUND');
  await expect(b.action(ref('tasks:deleteTask'),{id})).rejects.toThrow('NOT_FOUND');
  await expect(a.action(ref('tasks:save'),{task:{...task,owner:'B'}})).rejects.toThrow();
  await a.action(ref('tasks:save'),{id,task:{...task,done:true}});
  const result=await a.action(ref('tasks:list'),{courseId,cursor:null,limit:50});
  expect(result).toEqual({items:[{...task,id,done:true}],cursor:null,isDone:true});
  await expect(a.action(ref('courses:deleteCourse'),{id:courseId})).rejects.toThrow('COURSE_NOT_EMPTY');
  await a.action(ref('tasks:deleteTask'),{id});
  await a.action(ref('courses:deleteCourse'),{id:courseId});
});
test('task pagination is bounded and invalid times/reminders are refused',async()=>{
  const t=convexTest(schema,modules),a=user(t,'A');
  await a.action(ref('profiles:save'),{profile});const courseId=await a.action(ref('courses:save'),{course});
  const task={courseId,title:'Study',kind:'assignment',due:'2026-10-11T02:00:00.000Z',done:false,reminderDays:null};
  for(const patch of [{due:'2026-02-30T02:00:00.000Z'},{due:'2026-10-11T10:00'},{reminderDays:-1},{reminderDays:0.5},{title:' '.repeat(201)}])await expect(a.action(ref('tasks:save'),{task:{...task,...patch}})).rejects.toThrow('INVALID_TASK');
  await expect(a.action(ref('tasks:list'),{courseId,cursor:null,limit:51})).rejects.toThrow('INVALID_LIST');
  await expect(a.action(ref('tasks:list'),{courseId,cursor:'x'.repeat(4097),limit:5})).rejects.toThrow('INVALID_LIST');
  const first=await a.action(ref('tasks:save'),{task}),second=await a.action(ref('tasks:save'),{task:{...task,title:'Read'}});
  const page=await a.action(ref('tasks:list'),{courseId,cursor:null,limit:1});
  expect(page.items.map((item:{id:string})=>item.id)).toEqual([first]);expect(page.isDone).toBe(false);
  const next=await a.action(ref('tasks:list'),{courseId,cursor:page.cursor,limit:1});
  expect(next.items.map((item:{id:string})=>item.id)).toEqual([second]);
  await expect(t.action(ref('tasks:list'),{courseId,cursor:null,limit:1})).rejects.toThrow('SIGN_IN_REQUIRED');
});
test('class meetings validate times and protect linked courses and record owners',async()=>{
  const t=convexTest(schema,modules),a=user(t,'A'),b=user(t,'B');
  await a.action(ref('profiles:save'),{profile});await b.action(ref('profiles:save'),{profile});
  const courseId=await a.action(ref('courses:save'),{course}),otherCourse=await b.action(ref('courses:save'),{course});
  const meeting={courseId,day:1,start:'09:10',end:'10:00',room:'A101'};
  const id=await a.action(ref('meetings:save'),{meeting});
  await expect(b.action(ref('meetings:list'),{courseId,cursor:null,limit:50})).rejects.toThrow('NOT_FOUND');
  await expect(b.action(ref('meetings:save'),{id,meeting:{...meeting,courseId:otherCourse}})).rejects.toThrow('NOT_FOUND');
  await expect(a.action(ref('meetings:save'),{id,meeting:{...meeting,courseId:otherCourse}})).rejects.toThrow('NOT_FOUND');
  await expect(b.action(ref('meetings:deleteMeeting'),{id})).rejects.toThrow('NOT_FOUND');
  await expect(a.action(ref('meetings:save'),{meeting:{...meeting,owner:'B'}})).rejects.toThrow();
  for(const patch of [{day:8},{day:1.5},{start:'25:00'},{end:'09:10'},{room:'x'.repeat(101)}])await expect(a.action(ref('meetings:save'),{meeting:{...meeting,...patch}})).rejects.toThrow('INVALID_MEETING');
  await a.action(ref('meetings:save'),{id,meeting:{...meeting,room:'B202'}});
  expect(await a.action(ref('meetings:list'),{courseId,cursor:null,limit:1})).toEqual({items:[{...meeting,id,room:'B202'}],cursor:null,isDone:true});
  await expect(a.action(ref('meetings:list'),{courseId,cursor:null,limit:100})).rejects.toThrow('INVALID_LIST');
  await expect(a.action(ref('courses:deleteCourse'),{id:courseId})).rejects.toThrow('COURSE_NOT_EMPTY');
  await a.action(ref('meetings:deleteMeeting'),{id});
  await a.action(ref('courses:deleteCourse'),{id:courseId});
  await expect(t.action(ref('meetings:save'),{meeting})).rejects.toThrow('SIGN_IN_REQUIRED');
});
