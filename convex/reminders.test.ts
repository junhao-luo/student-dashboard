/// <reference types="vite/client" />
import {convexTest} from 'convex-test';
import {makeFunctionReference} from 'convex/server';
import {test,expect,vi} from 'vitest';
import schema from './schema';
const modules={...import.meta.glob(['./**/*.ts','!./**/*.test.ts']),'./_generated/offline-test.ts':async()=>({})};
const action=(name:string)=>makeFunctionReference<'action'>(name);
const profile={name:'Synthetic',studentId:'D1234567',department:'Test',className:'A',phone:'0912345678'};
const course={semester:'115-1',code:'TEST',name:'Synthetic Course',instructor:'Test',credits:3,room:'A101',color:'blue'};
async function setup(){
 const t=convexTest(schema,modules),a=t.withIdentity({subject:'A'}),b=t.withIdentity({subject:'B'});
 await a.action(action('profiles:save'),{profile});await b.action(action('profiles:save'),{profile:{...profile,studentId:'D7654321'}});
 const courseId=await a.action(action('courses:save'),{course});
 const task={courseId,title:'Synthetic exam',kind:'exam',due:new Date(Date.now()+2*86400000).toISOString(),done:false,reminderDays:1};
 return {t,a,b,task};
}
test('reminders schedule atomically, do not duplicate on save, and cancel on completion or deletion',async()=>{
 const {t,a,b,task}=await setup();const id=await a.action(action('tasks:save'),{task});
 let jobs=await t.run(ctx=>ctx.db.query('reminderJobs').collect());expect(jobs).toHaveLength(1);expect(jobs[0].at).toBe(Date.parse(task.due)-86400000);
 const original=jobs[0];await a.action(action('tasks:save'),{id,task:{...task,title:'Renamed'}});
 jobs=await t.run(ctx=>ctx.db.query('reminderJobs').collect());expect(jobs[0].scheduled).toBe(original.scheduled);expect(jobs[0].title).toBe('Renamed');
 await expect(b.action(action('tasks:save'),{id,task})).rejects.toThrow('NOT_FOUND');
 await a.action(action('tasks:save'),{id,task:{...task,done:true}});expect(await t.run(ctx=>ctx.db.query('reminderJobs').collect())).toHaveLength(0);
 await a.action(action('tasks:save'),{id,task});await a.action(action('tasks:deleteTask'),{id});expect(await t.run(ctx=>ctx.db.query('reminderJobs').collect())).toHaveLength(0);
});
test('snapshot sync schedules reminders and cancels deleted tasks; disabled and past tasks never schedule',async()=>{
 const {t,a,task}=await setup();
 const data={semesters:['115-1'],courses:[{...course,id:'course-local'}],tasks:[{...task,id:'task-local',courseId:'course-local'}],meetings:[]};
 await a.action(action('academic:save'),{revision:0,requestId:'first',data});
 expect(await t.run(ctx=>ctx.db.query('reminderJobs').collect())).toHaveLength(1);
 await a.action(action('academic:save'),{revision:1,requestId:'second',data:{...data,tasks:[]}});
 expect(await t.run(ctx=>ctx.db.query('reminderJobs').collect())).toHaveLength(0);
 await a.action(action('tasks:save'),{task:{...task,reminderDays:null}});
 await a.action(action('tasks:save'),{task:{...task,due:new Date(Date.now()-1000).toISOString()}});
 expect(await t.run(ctx=>ctx.db.query('reminderJobs').collect())).toHaveLength(0);
});
test('email sender and recipient are fixed server-side, retries are idempotent and obsolete generations are refused',async()=>{
 const {t,a,task}=await setup();await a.action(action('tasks:save'),{task});
 const job=(await t.run(ctx=>ctx.db.query('reminderJobs').collect()))[0];
 await t.run(ctx=>ctx.db.patch(job._id,{at:Date.now()-1}));
 const fetcher=vi.fn().mockResolvedValueOnce(new Response('{}',{status:503})).mockResolvedValue(new Response('{}',{status:200}));
 vi.stubGlobal('fetch',fetcher);vi.stubEnv('RESEND_API_KEY','test-placeholder');
 try{
  await t.action(action('reminders:send'),{id:job._id,generation:job.generation-1});expect(fetcher).not.toHaveBeenCalled();
  await t.action(action('reminders:send'),{id:job._id,generation:job.generation});
  expect((await t.run(ctx=>ctx.db.get(job._id)))?.state).toBe('pending');
  await t.run(ctx=>ctx.db.patch(job._id,{at:Date.now()-1}));
  await t.action(action('reminders:send'),{id:job._id,generation:job.generation});
  await t.action(action('reminders:send'),{id:job._id,generation:job.generation});
  expect(fetcher).toHaveBeenCalledTimes(2);
  const mail=JSON.parse(fetcher.mock.calls[0][1].body);expect(mail.from).toBe('CourseDock <reminder@eljhon.me>');expect(mail.to).toEqual(['d1234567@o365.fcu.edu.tw']);expect(mail.text).toContain('Synthetic exam');expect(mail.text).toContain('Asia/Taipei');expect(mail.html).toBeUndefined();
  expect(fetcher.mock.calls[1][1].headers['Idempotency-Key']).toBe(fetcher.mock.calls[0][1].headers['Idempotency-Key']);
  expect((await t.run(ctx=>ctx.db.get(job._id)))?.state).toBe('sent');
 }finally{vi.unstubAllGlobals();vi.unstubAllEnvs();}
});
test('concurrent claims reserve send limits; missing configuration and permanent failure stop sending',async()=>{
 const {t,a,task}=await setup();await a.action(action('tasks:save'),{task});
 const job=(await t.run(ctx=>ctx.db.query('reminderJobs').collect()))[0];await t.run(ctx=>ctx.db.patch(job._id,{at:Date.now()-1}));
 const fetcher=vi.fn().mockResolvedValue(new Response('{}',{status:200}));vi.stubGlobal('fetch',fetcher);vi.stubEnv('RESEND_API_KEY','test-placeholder');
 try{
  await Promise.all([1,2,3].map(()=>t.action(action('reminders:send'),{id:job._id,generation:job.generation})));expect(fetcher).toHaveBeenCalledTimes(1);
  const budgets=await t.run(ctx=>ctx.db.query('reminderBudgets').collect());expect(budgets.map(row=>row.daily)).toEqual([1,1]);
  const id=await a.action(action('tasks:save'),{task:{...task,title:'Second'}});const next=(await t.run(ctx=>ctx.db.query('reminderJobs').collect())).find(row=>row.key===`task:${id}`)!;
  await t.run(ctx=>ctx.db.patch(next._id,{at:Date.now()-1}));vi.stubEnv('RESEND_API_KEY','');await t.action(action('reminders:send'),{id:next._id,generation:next.generation});expect((await t.run(ctx=>ctx.db.get(next._id)))?.state).toBe('failed');expect(fetcher).toHaveBeenCalledTimes(1);
 }finally{vi.unstubAllGlobals();vi.unstubAllEnvs();}
});
test('zero-day reminders allow scheduler delay, while quota exhaustion and expired delivery are refused',async()=>{
 const {t,a,task}=await setup();await a.action(action('tasks:save'),{task:{...task,reminderDays:0}});
 const job=(await t.run(ctx=>ctx.db.query('reminderJobs').collect()))[0];
 await t.run(ctx=>ctx.db.patch(job._id,{due:new Date(Date.now()-1000).toISOString(),at:Date.now()-1000}));
 const claim=makeFunctionReference<'mutation'>('reminders:claim');
 expect(await t.mutation(claim,{id:job._id,generation:job.generation})).not.toBeNull();
 await t.run(async ctx=>{
  const global=await ctx.db.query('reminderBudgets').withIndex('by_key',q=>q.eq('key','global')).unique();await ctx.db.patch(global!._id,{daily:50});
 });
 const second=await a.action(action('tasks:save'),{task});
 const blocked=(await t.run(ctx=>ctx.db.query('reminderJobs').collect())).find(row=>row.key===`task:${second}`)!;
 await t.run(ctx=>ctx.db.patch(blocked._id,{at:Date.now()-1000}));
 expect(await t.mutation(claim,{id:blocked._id,generation:blocked.generation})).toBeNull();
 expect((await t.run(ctx=>ctx.db.get(blocked._id)))?.state).toBe('failed');
 await t.run(ctx=>ctx.db.patch(job._id,{state:'pending',due:new Date(Date.now()-16*60000).toISOString()}));
 expect(await t.mutation(claim,{id:job._id,generation:job.generation})).toBeNull();
});
