import {defineSchema,defineTable} from 'convex/server';
import {v} from 'convex/values';
import {academicValue} from './academicValues';

export const profileInputFields={name:v.string(),studentId:v.string(),department:v.string(),className:v.string(),phone:v.string()};
export const profileFields={...profileInputFields,schoolEmail:v.string()};
export const profileInputValue=v.object(profileInputFields);
export const courseFields={semester:v.string(),code:v.string(),name:v.string(),instructor:v.string(),credits:v.number(),room:v.string(),color:v.string()};
export const taskFields={courseId:v.id('courses'),title:v.string(),kind:v.union(v.literal('assignment'),v.literal('exam')),due:v.string(),done:v.boolean(),reminderDays:v.union(v.null(),v.number())};
export const meetingFields={courseId:v.id('courses'),day:v.number(),start:v.string(),end:v.string(),room:v.string()};
export const profileValue=v.object(profileFields);
export const courseValue=v.object(courseFields);
export default defineSchema({
  supportBudgets:defineTable({key:v.string(),day:v.string(),month:v.string(),daily:v.number(),monthly:v.number()}).index('by_key',['key']),
  academicWorkspaces:defineTable({owner:v.string(),revision:v.number(),requestId:v.string(),data:academicValue}).index('by_owner',['owner']),
  profiles:defineTable({owner:v.string(),...profileFields}).index('by_owner',['owner']),
  courses:defineTable({owner:v.string(),...courseFields}).index('by_owner_semester',['owner','semester']),
  tasks:defineTable({owner:v.string(),...taskFields}).index('by_owner_course',['owner','courseId']),
  meetings:defineTable({owner:v.string(),...meetingFields}).index('by_owner_course',['owner','courseId']),
  limits:defineTable({owner:v.string(),scope:v.union(v.literal('read'),v.literal('write')),window:v.number(),count:v.number()}).index('by_owner_scope',['owner','scope']),
});
