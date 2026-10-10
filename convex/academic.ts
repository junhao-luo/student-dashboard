import {v,ConvexError} from 'convex/values';
import {makeFunctionReference} from 'convex/server';
import {action,internalMutation,internalQuery} from './model';
import {guard,owner,requireProfile} from './access';
import {academicValue,snapshotValue} from './academicValues';
import {validAcademic} from '../src/academic';
const args={revision:v.number(),requestId:v.string(),data:academicValue};
export const read=internalQuery({args:{},returns:v.union(v.null(),snapshotValue),handler:async ctx=>{
 const who=await owner(ctx);await requireProfile(ctx,who);
 const current=await ctx.db.query('academicWorkspaces').withIndex('by_owner',q=>q.eq('owner',who)).unique();
 return current?{revision:current.revision,data:current.data}:null;
}});
export const write=internalMutation({args,returns:snapshotValue,handler:async(ctx,input)=>{
 const who=await owner(ctx);await requireProfile(ctx,who);
 if(!Number.isSafeInteger(input.revision)||input.revision<0||!/^[-\w]{1,80}$/.test(input.requestId)||!validAcademic(input.data))throw new ConvexError('INVALID_ACADEMIC');
 const current=await ctx.db.query('academicWorkspaces').withIndex('by_owner',q=>q.eq('owner',who)).unique();
 if(current?.requestId===input.requestId){
  if(JSON.stringify(current.data)!==JSON.stringify(input.data)||current.revision!==input.revision+1)throw new ConvexError('REQUEST_REUSED');
  return {revision:current.revision,data:current.data};
 }
 if((current?.revision??0)!==input.revision)throw new ConvexError('SYNC_CONFLICT');
 const revision=input.revision+1;
 if(current)await ctx.db.patch(current._id,{revision,requestId:input.requestId,data:input.data});
 else await ctx.db.insert('academicWorkspaces',{owner:who,revision,requestId:input.requestId,data:input.data});
 return {revision,data:input.data};
}});
export const get=action({args:{},returns:v.union(v.null(),snapshotValue),handler:async ctx=>{await guard(ctx,'read');return await ctx.runQuery(makeFunctionReference<'query'>('academic:read'),{});}});
export const save=action({args,returns:snapshotValue,handler:async(ctx,input)=>{await guard(ctx,'write');return await ctx.runMutation(makeFunctionReference<'mutation'>('academic:write'),input);}});
