import {makeFunctionReference} from 'convex/server';
import {ConvexError,v} from 'convex/values';
import {internalMutation,type ReadCtx,type WriteCtx,type ActionCtx} from './model';
import type {GenericId} from 'convex/values';
export async function owner(ctx:Pick<ReadCtx,'auth'>|Pick<ActionCtx,'auth'>){
  const identity=await ctx.auth.getUserIdentity();
  if(!identity)throw new ConvexError('SIGN_IN_REQUIRED');
  return identity.tokenIdentifier;
}
export async function requireProfile(ctx:ReadCtx|WriteCtx,id:string){
  const profile=await ctx.db.query('profiles').withIndex('by_owner',q=>q.eq('owner',id)).unique();
  if(!profile)throw new ConvexError('PROFILE_REQUIRED');
  return profile;
}
export async function ownedCourse(ctx:ReadCtx|WriteCtx,id:GenericId<'courses'>){
  const who=await owner(ctx);await requireProfile(ctx,who);
  const course=await ctx.db.get(id);
  if(!course||course.owner!==who)throw new ConvexError('NOT_FOUND');
  return who;
}
export const pageArgs={cursor:v.union(v.string(),v.null()),limit:v.number()};
export function checkPage(cursor:string|null,limit:number){
  if((cursor!==null&&cursor.length>4096)||!Number.isInteger(limit)||limit<1||limit>50)throw new ConvexError('INVALID_LIST');
}
// Queries cannot change counters. Public actions consume a transactional budget before internal reads/writes.
// https://docs.convex.dev/functions/actions
export const consume=internalMutation({
  args:{scope:v.union(v.literal('read'),v.literal('write'))},returns:v.null(),
  handler:async(ctx,{scope})=>{
    const id=await owner(ctx),now=Date.now(),cap=scope==='read'?60:20;
    const bucket=await ctx.db.query('limits').withIndex('by_owner_scope',q=>q.eq('owner',id).eq('scope',scope)).unique();
    if(!bucket){await ctx.db.insert('limits',{owner:id,scope,window:now,count:1});return null;}
    if(now-bucket.window>=60000){await ctx.db.patch(bucket._id,{window:now,count:1});return null;}
    if(bucket.count>=cap)throw new ConvexError('RATE_LIMITED');
    await ctx.db.patch(bucket._id,{count:bucket.count+1});return null;
  },
});
export async function guard(ctx:ActionCtx,scope:'read'|'write'){
  await owner(ctx);
  await ctx.runMutation(makeFunctionReference<'mutation'>('access:consume'),{scope});
}
