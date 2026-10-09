import {makeFunctionReference} from 'convex/server';
import {ConvexError,v} from 'convex/values';
import {action,internalMutation,internalQuery} from './model';
import {owner,guard} from './access';
import {profileValue} from './schema';

export const read=internalQuery({args:{},returns:v.union(v.null(),profileValue),handler:async ctx=>{
  const id=await owner(ctx),p=await ctx.db.query('profiles').withIndex('by_owner',q=>q.eq('owner',id)).unique();
  if(!p)return null;
  return {name:p.name,studentId:p.studentId,department:p.department,className:p.className,schoolEmail:p.schoolEmail,phone:p.phone};
}});
export const write=internalMutation({args:{profile:profileValue},returns:v.null(),handler:async(ctx,{profile})=>{
  const id=await owner(ctx),clean=Object.fromEntries(Object.entries(profile).map(([key,value])=>[key,value.trim()]));
  if(Object.values(clean).some(value=>!value||value.length>120)||!/[A-Za-z0-9]/.test(clean.studentId)||!/^[-+0-9 ()]{6,30}$/.test(clean.phone)||!/^\w{1,30}$/.test(clean.studentId)||clean.schoolEmail.toLowerCase()!==`${clean.studentId.toLowerCase()}@o365.fcu.edu.tw`)throw new ConvexError('INVALID_PROFILE');
  const data={...profile,name:clean.name,studentId:clean.studentId,department:clean.department,className:clean.className,schoolEmail:clean.schoolEmail.toLowerCase(),phone:clean.phone};
  const existing=await ctx.db.query('profiles').withIndex('by_owner',q=>q.eq('owner',id)).unique();
  if(existing)await ctx.db.patch(existing._id,data);else await ctx.db.insert('profiles',{owner:id,...data});
  return null;
}});
export const get=action({args:{},returns:v.union(v.null(),profileValue),handler:async ctx=>{
  await guard(ctx,'read');return await ctx.runQuery(makeFunctionReference<'query'>('profiles:read'),{});
}});
export const save=action({args:{profile:profileValue},returns:v.null(),handler:async(ctx,args)=>{
  await guard(ctx,'write');return await ctx.runMutation(makeFunctionReference<'mutation'>('profiles:write'),args);
}});
