import {defineSchema,defineTable} from 'convex/server';
import {v} from 'convex/values';

export const profileFields={name:v.string(),studentId:v.string(),department:v.string(),className:v.string(),schoolEmail:v.string(),phone:v.string()};
export const courseFields={semester:v.string(),code:v.string(),name:v.string(),instructor:v.string(),credits:v.number(),room:v.string(),color:v.string()};
export const profileValue=v.object(profileFields);
export const courseValue=v.object(courseFields);
export default defineSchema({
  profiles:defineTable({owner:v.string(),...profileFields}).index('by_owner',['owner']),
  courses:defineTable({owner:v.string(),...courseFields}).index('by_owner_semester',['owner','semester']),
  limits:defineTable({owner:v.string(),scope:v.union(v.literal('read'),v.literal('write')),window:v.number(),count:v.number()}).index('by_owner_scope',['owner','scope']),
});
