import {v,ConvexError} from 'convex/values';
import {makeFunctionReference} from 'convex/server';
import {action,internalMutation,internalQuery} from './model';
import {owner,guard} from './access';
const version='2026-11-01';
export const read=internalQuery({args:{},returns:v.boolean(),handler:async ctx=>{
 const who=await owner(ctx);return !!(await ctx.db.query('legalAcceptances').withIndex('by_owner',q=>q.eq('owner',who)).unique())?.version.match(/^2026-11-01$/);
}});
export const write=internalMutation({args:{accepted:v.boolean(),adult:v.boolean()},returns:v.null(),handler:async(ctx,args)=>{
 if(!args.accepted||!args.adult)throw new ConvexError('CONSENT_REQUIRED');
 const who=await owner(ctx),existing=await ctx.db.query('legalAcceptances').withIndex('by_owner',q=>q.eq('owner',who)).unique();
 if(existing?.version===version)return null;
 const data={owner:who,version,acceptedAt:Date.now(),adult:true};
 if(existing)await ctx.db.patch(existing._id,data);else await ctx.db.insert('legalAcceptances',data);return null;
}});
export const get=action({args:{},returns:v.boolean(),handler:async ctx=>{await guard(ctx,'read');return ctx.runQuery(makeFunctionReference<'query'>('consent:read'),{});}});
export const accept=action({args:{accepted:v.boolean(),adult:v.boolean()},returns:v.null(),handler:async(ctx,args)=>{await guard(ctx,'write');return ctx.runMutation(makeFunctionReference<'mutation'>('consent:write'),args);}});
