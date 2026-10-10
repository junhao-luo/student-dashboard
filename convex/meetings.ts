import {makeFunctionReference} from 'convex/server';
import {ConvexError,v} from 'convex/values';
import {action,internalMutation,internalQuery} from './model';
import {owner,guard,ownedCourse,pageArgs,checkPage} from './access';
import {meetingFields} from './schema';
import {validateMeeting} from '../src/domain';
const value=v.object(meetingFields),output=v.object({id:v.id('meetings'),...meetingFields});
const listArgs={courseId:v.id('courses'),...pageArgs};
const page=v.object({items:v.array(output),cursor:v.union(v.string(),v.null()),isDone:v.boolean()});
export const read=internalQuery({args:listArgs,returns:page,handler:async(ctx,{courseId,cursor,limit})=>{
  const who=await ownedCourse(ctx,courseId);checkPage(cursor,limit);
  const result=await ctx.db.query('meetings').withIndex('by_owner_course',q=>q.eq('owner',who).eq('courseId',courseId)).paginate({cursor,numItems:limit,maximumRowsRead:100});
  return {items:result.page.map(m=>({id:m._id,courseId:m.courseId,day:m.day,start:m.start,end:m.end,room:m.room})),cursor:result.isDone?null:result.continueCursor,isDone:result.isDone};
}});
export const write=internalMutation({args:{id:v.optional(v.id('meetings')),meeting:value},returns:v.id('meetings'),handler:async(ctx,{id,meeting})=>{
  const who=await ownedCourse(ctx,meeting.courseId);
  if(validateMeeting({...meeting,id:''})||meeting.room.length>100)throw new ConvexError('INVALID_MEETING');
  const data={...meeting,room:meeting.room.trim()};
  if(id){const current=await ctx.db.get(id);if(!current||current.owner!==who)throw new ConvexError('NOT_FOUND');await ctx.db.patch(id,data);return id;}
  return await ctx.db.insert('meetings',{owner:who,...data});
}});
export const remove=internalMutation({args:{id:v.id('meetings')},returns:v.null(),handler:async(ctx,{id})=>{
  const who=await owner(ctx),meeting=await ctx.db.get(id);
  if(!meeting||meeting.owner!==who)throw new ConvexError('NOT_FOUND');
  await ownedCourse(ctx,meeting.courseId);await ctx.db.delete(id);return null;
}});
export const list=action({args:listArgs,returns:page,handler:async(ctx,args)=>{await guard(ctx,'read');return await ctx.runQuery(makeFunctionReference<'query'>('meetings:read'),args);}});
export const save=action({args:{id:v.optional(v.id('meetings')),meeting:value},returns:v.id('meetings'),handler:async(ctx,args)=>{await guard(ctx,'write');return await ctx.runMutation(makeFunctionReference<'mutation'>('meetings:write'),args);}});
export const deleteMeeting=action({args:{id:v.id('meetings')},returns:v.null(),handler:async(ctx,args)=>{await guard(ctx,'write');return await ctx.runMutation(makeFunctionReference<'mutation'>('meetings:remove'),args);}});
