/// <reference types="vite/client" />
import {convexTest} from 'convex-test';
import {makeFunctionReference} from 'convex/server';
import {test,expect,vi} from 'vitest';
import schema from './schema';
const modules={...import.meta.glob(['./**/*.ts','!./**/*.test.ts']),'./_generated/offline-test.ts':async()=>({})};
const ref=(name:string)=>makeFunctionReference<'action'>(name);
const profile={name:'Synthetic',studentId:'D1234567',department:'Test',className:'A',phone:'0912345678'};
const report={kind:'suggestion',subject:'Test feedback',message:'A synthetic support message.',requestId:'12345678-1234-1234-1234-123456789abc',screenshot:null,diagnostics:null};
test('support denies anonymous, missing profile, field tampering and unconfigured sender',async()=>{
 const t=convexTest(schema,modules),a=t.withIdentity({subject:'A'});
 await expect(t.action(ref('support:submit'),report)).rejects.toThrow('SIGN_IN_REQUIRED');
 vi.stubEnv('RESEND_API_KEY','test-placeholder');
 try{
  await expect(a.action(ref('support:submit'),report)).rejects.toThrow('PROFILE_REQUIRED');
  await a.action(ref('profiles:save'),{profile});
  await expect(a.action(ref('support:submit'),{...report,to:'attacker@example.com'})).rejects.toThrow();
  await expect(a.action(ref('support:submit'),{...report,profile:{...profile,name:'Spoofed'}})).rejects.toThrow();
  await expect(a.action(ref('support:submit'),{...report,screenshot:'data:text/html;base64,AAAA'})).rejects.toThrow('INVALID_REPORT');
  vi.stubEnv('RESEND_API_KEY','');
  await expect(a.action(ref('support:submit'),report)).rejects.toThrow('SUPPORT_NOT_CONFIGURED');
 }finally{vi.unstubAllEnvs();}
});
test('each contact type includes the authenticated student and bug emails carry PNG and diagnostic attachments',async()=>{
 const t=convexTest(schema,modules),a=t.withIdentity({subject:'A'}),b=t.withIdentity({subject:'B'});
 await a.action(ref('profiles:save'),{profile});
 const other={...profile,name:'Other Student',studentId:'D7654321',department:'Other Program',className:'B',phone:'0987654321'};
 await b.action(ref('profiles:save'),{profile:other});
 const fetcher=vi.fn().mockResolvedValue(new Response('{}',{status:200}));vi.stubGlobal('fetch',fetcher);vi.stubEnv('RESEND_API_KEY','test-placeholder');
 try{
  for(const kind of ['complaint','suggestion'])await a.action(ref('support:submit'),{...report,kind});
  const screenshot='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=';
  const diagnostics={view:'courses',language:'en',width:390,height:844,events:[{code:'CLIENT_ERROR',time:'2026-10-10T06:00:00.000Z'}]};
  await b.action(ref('support:submit'),{...report,kind:'bug',screenshot,diagnostics});
  for(const call of fetcher.mock.calls.slice(0,2)){
   const mail=JSON.parse(call[1].body);
   for(const value of [...Object.values(profile),'d1234567@o365.fcu.edu.tw'])expect(mail.text).toContain(value);
   expect(mail.text).not.toContain(other.name);expect(mail.attachments).toEqual([]);
  }
  const bug=JSON.parse(fetcher.mock.calls[2][1].body);
  for(const value of [...Object.values(other),'d7654321@o365.fcu.edu.tw'])expect(bug.text).toContain(value);
  expect(bug.text).not.toContain(profile.studentId);expect(bug.text).toContain('CLIENT_ERROR');
  expect(bug.attachments[0]).toEqual({filename:'workspace.png',content:screenshot.slice(22),content_type:'image/png'});
  expect(JSON.parse(atob(bug.attachments[1].content))).toEqual(diagnostics);
 }finally{vi.unstubAllGlobals();vi.unstubAllEnvs();}
});
test('support reserves concurrent quota, fixes destination/reply address, hides provider errors',async()=>{
 const t=convexTest(schema,modules),a=t.withIdentity({subject:'A'});await a.action(ref('profiles:save'),{profile});
 const fetcher=vi.fn().mockResolvedValue(new Response('{}',{status:200}));vi.stubGlobal('fetch',fetcher);vi.stubEnv('RESEND_API_KEY','test-placeholder');
 try{
  const result=await Promise.allSettled(Array.from({length:5},(_,i)=>a.action(ref('support:submit'),{...report,requestId:`12345678-1234-1234-1234-123456789ab${i}`})));
  expect(result.filter(r=>r.status==='fulfilled')).toHaveLength(3);expect(fetcher).toHaveBeenCalledTimes(3);
  for(const r of result)if(r.status==='rejected')expect(String(r.reason)).toContain('SUPPORT_LIMIT_REACHED');
  const mail=JSON.parse(fetcher.mock.calls[0][1].body);expect(mail.to).toEqual(['support@coursedock.app']);expect(mail.reply_to).toBe('d1234567@o365.fcu.edu.tw');expect(mail.html).toBeUndefined();
  expect(fetcher.mock.calls[0][1].headers['Idempotency-Key']).toMatch(/^support\/[a-f0-9]{64}$/);
  const b=t.withIdentity({subject:'B'});await b.action(ref('profiles:save'),{profile});fetcher.mockResolvedValue(new Response('private provider details',{status:403}));
  await expect(b.action(ref('support:submit'),report)).rejects.toThrow('SUPPORT_DELIVERY_FAILED');
 }finally{vi.unstubAllGlobals();vi.unstubAllEnvs();}
});
