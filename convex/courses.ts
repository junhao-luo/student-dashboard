import {makeFunctionReference} from 'convex/server';
import {ConvexError,v} from 'convex/values';
import {action,internalMutation,internalQuery} from './model';
import {owner,guard,requireProfile} from './access';
import {courseValue,courseFields} from './schema';
const output=v.object({id:v.id('courses'),...courseFields});
function validateCourse(c:{semester:string;name:string;code:string;instructor:string;credits:number;room:string;color:string}){
  if(!/^\d{3}-[12]$/.test(c.semester)||!c.name.trim()||c.name.length>120||c.code.length>40||c.instructor.length>100||c.room.length>100||!Number.isFinite(c.credits)||c.credits<0||c.credits>20||!['blue','green','amber','violet'].includes(c.color))throw new ConvexError('INVALID_COURSE');
}
export const read=internalQuery({args:{semester:v.string(),limit:v.number()},returns:v.array(output),handler:async(ctx,{semester,limit})=>{
  const id=await owner(ctx);await requireProfile(ctx,id);
  if(!/^\d{3}-[12]$/.test(semester)||!Number.isInteger(limit)||limit<1||limit>50)throw new ConvexError('INVALID_LIST');
  const courses=await ctx.db.query('courses').withIndex('by_owner_semester',q=>q.eq('owner',id).eq('semester',semester)).take(limit);
  return courses.map(c=>({id:c._id,semester:c.semester,code:c.code,name:c.name,instructor:c.instructor,credits:c.credits,room:c.room,color:c.color}));
}});
export const write=internalMutation({args:{id:v.optional(v.id('courses')),course:courseValue},returns:v.id('courses'),handler:async(ctx,{id,course})=>{
  const who=await owner(ctx);await requireProfile(ctx,who);validateCourse(course);
  const data={...course,name:course.name.trim()};
  if(id){const current=await ctx.db.get(id);if(!current||current.owner!==who)throw new ConvexError('NOT_FOUND');await ctx.db.patch(id,data);return id;}
  return await ctx.db.insert('courses',{owner:who,...data});
}});
export const remove=internalMutation({args:{id:v.id('courses')},returns:v.null(),handler:async(ctx,{id})=>{
  const who=await owner(ctx);await requireProfile(ctx,who);const course=await ctx.db.get(id);
  if(!course||course.owner!==who)throw new ConvexError('NOT_FOUND');
  if(await ctx.db.query('tasks').withIndex('by_owner_course',q=>q.eq('owner',who).eq('courseId',id)).first())throw new ConvexError('COURSE_NOT_EMPTY');
  if(await ctx.db.query('meetings').withIndex('by_owner_course',q=>q.eq('owner',who).eq('courseId',id)).first())throw new ConvexError('COURSE_NOT_EMPTY');
  await ctx.db.delete(id);return null;
}});
export const list=action({args:{semester:v.string(),limit:v.number()},returns:v.array(output),handler:async(ctx,args)=>{
  await guard(ctx,'read');return await ctx.runQuery(makeFunctionReference<'query'>('courses:read'),args);
}});
export const save=action({args:{id:v.optional(v.id('courses')),course:courseValue},returns:v.id('courses'),handler:async(ctx,args)=>{
  await guard(ctx,'write');return await ctx.runMutation(makeFunctionReference<'mutation'>('courses:write'),args);
}});
export const deleteCourse=action({args:{id:v.id('courses')},returns:v.null(),handler:async(ctx,args)=>{
  await guard(ctx,'write');return await ctx.runMutation(makeFunctionReference<'mutation'>('courses:remove'),args);
}});
