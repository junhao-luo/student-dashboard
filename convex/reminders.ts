import {makeFunctionReference} from 'convex/server';
import {v} from 'convex/values';
import {internalAction,internalMutation,type WriteCtx} from './model';

type ReminderTask={title:string;kind:'assignment'|'exam';due:string;done:boolean;reminderDays:number|null};
const sendRef=makeFunctionReference<'action'>('reminders:send');
const jobArgs={id:v.id('reminderJobs'),generation:v.number()};
const mailValue=v.object({email:v.string(),course:v.string(),title:v.string(),kind:v.union(v.literal('assignment'),v.literal('exam')),due:v.string(),attempt:v.number()});

export async function setReminder(ctx:WriteCtx,who:string,key:string,task:ReminderTask|null,course=''){
  const current=await ctx.db.query('reminderJobs').withIndex('by_owner_key',q=>q.eq('owner',who).eq('key',key)).unique();
  if(!task||task.done||task.reminderDays===null||Date.parse(task.due)<=Date.now()){
    if(current){if(current.scheduled)await ctx.scheduler.cancel(current.scheduled);await ctx.db.delete(current._id);}
    return;
  }
  if(current&&current.due===task.due&&current.offset===task.reminderDays){
    if(current.state==='pending'&&current.attempts===0)await ctx.db.patch(current._id,{course,title:task.title,kind:task.kind});
    return;
  }
  if(current?.scheduled)await ctx.scheduler.cancel(current.scheduled);
  const generation=(current?.generation??0)+1;
  const at=Math.max(Date.now()+1000,Date.parse(task.due)-task.reminderDays*86400000);
  const value={owner:who,key,course,title:task.title,kind:task.kind,due:task.due,offset:task.reminderDays,at,generation,state:'pending' as const,attempts:0,leaseUntil:0,email:undefined,firstAttempt:undefined};
  const id=current?current._id:await ctx.db.insert('reminderJobs',value);
  if(current)await ctx.db.patch(id,value);
  const scheduled=await ctx.scheduler.runAt(at,sendRef,{id,generation});
  await ctx.db.patch(id,{scheduled});
}

// Only internal scheduled actions can claim a reminder; clients supply neither owner nor recipient.
export const claim=internalMutation({args:jobArgs,returns:v.union(v.null(),mailValue),handler:async(ctx,{id,generation})=>{
  const job=await ctx.db.get(id),now=Date.now();
  if(!job||job.generation!==generation||job.state==='sent'||job.state==='failed'||job.at>now||(job.state==='sending'&&job.leaseUntil>now))return null;
  const profile=await ctx.db.query('profiles').withIndex('by_owner',q=>q.eq('owner',job.owner)).unique();
  const expires=Date.parse(job.due)+(job.offset===0?15*60000:0);
  if(!profile||expires<=now||job.attempts>=3||(job.firstAttempt!==undefined&&now-job.firstAttempt>=23*3600000)||(job.email&&job.email!==profile.schoolEmail)){
    await ctx.db.patch(id,{state:'failed'});return null;
  }
  const day=new Date(now).toISOString().slice(0,10),month=day.slice(0,7);
  const buckets=[];
  for(const key of ['global',`user:${job.owner}`]){
    const row=await ctx.db.query('reminderBudgets').withIndex('by_key',q=>q.eq('key',key)).unique();
    const daily=row?.day===day?row.daily:0,monthly=row?.month===month?row.monthly:0;
    if(daily>=(key==='global'?50:10)||monthly>=(key==='global'?1000:200)){
      await ctx.db.patch(id,{state:'failed'});return null;
    }
    buckets.push({row,value:{key,day,month,daily:daily+1,monthly:monthly+1}});
  }
  for(const {row,value} of buckets){if(row)await ctx.db.patch(row._id,value);else await ctx.db.insert('reminderBudgets',value);}
  const attempt=job.attempts+1;
  // A watchdog retries a crashed action; provider idempotency keeps its frozen payload unique.
  const scheduled=await ctx.scheduler.runAfter(120000,sendRef,{id,generation});
  await ctx.db.patch(id,{state:'sending',attempts:attempt,leaseUntil:now+120000,firstAttempt:job.firstAttempt??now,email:job.email??profile.schoolEmail,scheduled});
  return {email:job.email??profile.schoolEmail,course:job.course,title:job.title,kind:job.kind,due:job.due,attempt};
}});

export const finish=internalMutation({args:{...jobArgs,attempt:v.number(),success:v.boolean(),retry:v.boolean()},returns:v.null(),handler:async(ctx,args)=>{
  const job=await ctx.db.get(args.id);
  if(!job||job.generation!==args.generation||job.attempts!==args.attempt||job.state!=='sending')return null;
  if(job.scheduled)await ctx.scheduler.cancel(job.scheduled);
  if(args.success){await ctx.db.patch(job._id,{state:'sent',leaseUntil:0});return null;}
  const expires=Date.parse(job.due)+(job.offset===0?15*60000:0);
  if(!args.retry||job.attempts>=3||expires<=Date.now()+300000){await ctx.db.patch(job._id,{state:'failed',leaseUntil:0});return null;}
  const at=Date.now()+300000,scheduled=await ctx.scheduler.runAt(at,sendRef,{id:job._id,generation:job.generation});
  await ctx.db.patch(job._id,{state:'pending',leaseUntil:0,at,scheduled});return null;
}});

export const send=internalAction({args:jobArgs,returns:v.null(),handler:async(ctx,args)=>{
  const mail=await ctx.runMutation(makeFunctionReference<'mutation',typeof args,typeof mailValue.type|null>('reminders:claim'),args);
  if(!mail)return null;
  const key=process.env.RESEND_API_KEY;
  let success=false,retry=false;
  if(key){
    const due=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Taipei',dateStyle:'full',timeStyle:'short'}).format(new Date(mail.due));
    const kind=mail.kind==='exam'?'Exam / 考試':'Assignment / 作業';
    try{
      const response=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`reminder/${args.id}/${args.generation}`},body:JSON.stringify({from:'CourseDock <reminder@eljhon.me>',to:[mail.email],subject:`[CourseDock ${kind}] ${mail.title.replace(/[\r\n]/g,' ')}`,text:`${kind} reminder / 提醒\n\n${mail.title}\nCourse / 課程: ${mail.course}\nDue / 截止時間: ${due} (Asia/Taipei)\n\nCheck the deadline in CourseDock and confirm it against official course information.\n請至 CourseDock 查看期限，並以正式課程資訊確認。\nhttps://coursedock.app/\n\nTo stop future reminders, turn off the task's email reminder and sync the change.\n如需停止後續提醒，請關閉該事項的郵件提醒並同步變更。`})});
      success=response.ok;retry=response.status===429||response.status>=500;
    }catch{retry=true;}
  }
  await ctx.runMutation(makeFunctionReference<'mutation'>('reminders:finish'),{...args,attempt:mail.attempt,success,retry});
  return null;
}});
