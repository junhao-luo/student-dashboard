import {v} from 'convex/values';
export const academicValue=v.object({
 semesters:v.array(v.string()),
 courses:v.array(v.object({id:v.string(),semester:v.string(),code:v.string(),name:v.string(),instructor:v.string(),credits:v.number(),courseType:v.optional(v.union(v.literal('required'),v.literal('elective'))),room:v.string(),color:v.string()})),
 tasks:v.array(v.object({id:v.string(),courseId:v.string(),title:v.string(),kind:v.union(v.literal('assignment'),v.literal('exam')),due:v.string(),done:v.boolean(),status:v.optional(v.union(v.literal('not_started'),v.literal('in_progress'),v.literal('complete'))),description:v.optional(v.string()),reminderDays:v.union(v.null(),v.number())})),
 meetings:v.array(v.object({id:v.string(),courseId:v.string(),day:v.number(),start:v.string(),end:v.string(),room:v.string()})),
});
export const snapshotValue=v.object({revision:v.number(),data:academicValue});
