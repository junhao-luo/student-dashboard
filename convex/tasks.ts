import {makeFunctionReference} from 'convex/server';
import {ConvexError,v} from 'convex/values';
import {action,internalMutation,internalQuery} from './model';
import {owner,guard,ownedCourse,pageArgs,checkPage,requireRecordCapacity} from './access';
import {taskFields} from './schema';
import {setReminder} from './reminders';
const value=v.object(taskFields),output=v.object({id:v.id('tasks'),...taskFields});
const listArgs={courseId:v.id('courses'),...pageArgs};
const page=v.object({items:v.array(output),cursor:v.union(v.string(),v.null()),isDone:v.boolean()});
export const read=internalQuery({args:listArgs,returns:page,handler:async(ctx,{courseId,cursor,limit})=>{
  const who=await ownedCourse(ctx,courseId);checkPage(cursor,limit);
  // https://docs.convex.dev/database/pagination
  const result=await ctx.db.query('tasks').withIndex('by_owner_course',q=>q.eq('owner',who).eq('courseId',courseId)).paginate({cursor,numItems:limit,maximumRowsRead:100});
  return {items:result.page.map(t=>({id:t._id,courseId:t.courseId,title:t.title,kind:t.kind,due:t.due,done:t.done,reminderDays:t.reminderDays})),cursor:result.isDone?null:result.continueCursor,isDone:result.isDone};
}});
export const write=internalMutation({args:{id:v.optional(v.id('tasks')),task:value},returns:v.id('tasks'),handler:async(ctx,{id,task})=>{
  const who=await ownedCourse(ctx,task.courseId);
  const time=Date.parse(task.due);
  if(!task.title.trim()||task.title.length>200||!Number.isFinite(time)||new Date(time).toISOString()!==task.due||time<Date.UTC(2000,0,1)||time>=Date.UTC(2100,0,1)||(task.reminderDays!==null&&(!Number.isInteger(task.reminderDays)||task.reminderDays<0||task.reminderDays>365)))throw new ConvexError('INVALID_TASK');
  const data={...task,title:task.title.trim()};
  const course=await ctx.db.get(task.courseId);
  if(id){const current=await ctx.db.get(id);if(!current||current.owner!==who)throw new ConvexError('NOT_FOUND');await ctx.db.patch(id,data);await setReminder(ctx,who,`task:${id}`,data,course!.name);return id;}
  await requireRecordCapacity(ctx,'tasks',who);
  const created=await ctx.db.insert('tasks',{owner:who,...data});
  await setReminder(ctx,who,`task:${created}`,data,course!.name);return created;
}});
export const remove=internalMutation({args:{id:v.id('tasks')},returns:v.null(),handler:async(ctx,{id})=>{
  const who=await owner(ctx),task=await ctx.db.get(id);
  if(!task||task.owner!==who)throw new ConvexError('NOT_FOUND');
  await ownedCourse(ctx,task.courseId);await setReminder(ctx,who,`task:${id}`,null);await ctx.db.delete(id);return null;
}});
export const list=action({args:listArgs,returns:page,handler:async(ctx,args)=>{await guard(ctx,'read');return await ctx.runQuery(makeFunctionReference<'query'>('tasks:read'),args);}});
export const save=action({args:{id:v.optional(v.id('tasks')),task:value},returns:v.id('tasks'),handler:async(ctx,args)=>{await guard(ctx,'write');return await ctx.runMutation(makeFunctionReference<'mutation'>('tasks:write'),args);}});
export const deleteTask=action({args:{id:v.id('tasks')},returns:v.null(),handler:async(ctx,args)=>{await guard(ctx,'write');return await ctx.runMutation(makeFunctionReference<'mutation'>('tasks:remove'),args);}});
