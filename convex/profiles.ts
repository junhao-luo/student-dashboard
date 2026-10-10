import {makeFunctionReference} from 'convex/server';
import {ConvexError,v} from 'convex/values';
import {action,internalMutation,internalQuery} from './model';
import {owner,guard} from './access';
import {profileValue,profileInputValue} from './schema';
import {normalizeStudentProfile} from '../src/student-profile';

export const read=internalQuery({args:{},returns:v.union(v.null(),profileValue),handler:async ctx=>{
  const id=await owner(ctx),p=await ctx.db.query('profiles').withIndex('by_owner',q=>q.eq('owner',id)).unique();
  if(!p)return null;
  return {name:p.name,studentId:p.studentId,department:p.department,className:p.className,schoolEmail:p.schoolEmail,phone:p.phone};
}});
export const write=internalMutation({args:{profile:profileInputValue},returns:v.null(),handler:async(ctx,{profile})=>{
  const id=await owner(ctx),data=normalizeStudentProfile(profile);
  if(!data)throw new ConvexError('INVALID_PROFILE');
  const existing=await ctx.db.query('profiles').withIndex('by_owner',q=>q.eq('owner',id)).unique();
  if(existing)await ctx.db.patch(existing._id,data);else await ctx.db.insert('profiles',{owner:id,...data});
  return null;
}});
export const get=action({args:{},returns:v.union(v.null(),profileValue),handler:async ctx=>{
  await guard(ctx,'read');return await ctx.runQuery(makeFunctionReference<'query'>('profiles:read'),{});
}});
export const save=action({args:{profile:profileInputValue},returns:v.null(),handler:async(ctx,args)=>{
  await guard(ctx,'write');return await ctx.runMutation(makeFunctionReference<'mutation'>('profiles:write'),args);
}});
