import {makeFunctionReference} from 'convex/server';
import {ConvexError,v} from 'convex/values';
import {action,internalMutation} from './model';
import {guard,owner,requireProfile} from './access';
import {validReport} from '../src/support-data';

const fields={kind:v.union(v.literal('complaint'),v.literal('suggestion'),v.literal('bug')),subject:v.string(),message:v.string(),requestId:v.string(),screenshot:v.union(v.string(),v.null()),diagnostics:v.union(v.null(),v.object({view:v.string(),language:v.union(v.literal('en'),v.literal('zh')),width:v.number(),height:v.number(),events:v.array(v.object({code:v.union(v.literal('CLIENT_ERROR'),v.literal('UNHANDLED_REJECTION'),v.literal('CAPTURE_FAILED')),time:v.string()}))}))};
export const reserve=internalMutation({args:{},returns:v.string(),handler:async ctx=>{
  const who=await owner(ctx),profile=await requireProfile(ctx,who),now=Date.now();
  const day=new Date(now).toISOString().slice(0,10),month=day.slice(0,7);
  // Separate transactional caps reserve capacity even when the email provider fails.
  for(const key of ['global',`user:${who}`]){
    const row=await ctx.db.query('supportBudgets').withIndex('by_key',q=>q.eq('key',key)).unique();
    const daily=row?.day===day?row.daily:0,monthly=row?.month===month?row.monthly:0;
    if(daily>=(key==='global'?10:3)||monthly>=(key==='global'?100:20))throw new ConvexError('SUPPORT_LIMIT_REACHED');
    const value={key,day,month,daily:daily+1,monthly:monthly+1};
    if(row)await ctx.db.patch(row._id,value);else await ctx.db.insert('supportBudgets',value);
  }
  return profile.schoolEmail;
}});
export const submit=action({args:fields,returns:v.null(),handler:async(ctx,args)=>{
  await guard(ctx,'write');
  if(!validReport(args))throw new ConvexError('INVALID_REPORT');
  const key=process.env.RESEND_API_KEY;
  if(!key)throw new ConvexError('SUPPORT_NOT_CONFIGURED');
  const replyTo=await ctx.runMutation(makeFunctionReference<'mutation',{},string>('support:reserve'),{});
  const who=await owner(ctx);
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${who}:${args.requestId}`));
  const id=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
  const attachments=[];
  if(args.screenshot)attachments.push({filename:'workspace.png',content:args.screenshot.slice(22),content_type:'image/png'});
  if(args.diagnostics)attachments.push({filename:'diagnostics.txt',content:btoa(JSON.stringify(args.diagnostics,null,2)),content_type:'text/plain'});
  try{
    const response=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`support/${id}`},body:JSON.stringify({from:'CourseDock <reminder@eljhon.me>',to:['support@eljhon.me'],reply_to:replyTo,subject:`[CourseDock ${args.kind}] ${args.subject.replace(/[\r\n]/g,' ')}`,text:`Reply address: ${replyTo}\nReport: ${args.requestId}\n\n${args.message}`,attachments})});
    if(!response.ok)throw new Error('provider');
    return null;
  }catch{throw new ConvexError('SUPPORT_DELIVERY_FAILED');}
}});
