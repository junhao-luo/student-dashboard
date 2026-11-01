/// <reference types="vite/client" />
import {test,expect} from 'vitest';
import {convexTest} from 'convex-test';
import {makeFunctionReference} from 'convex/server';
import schema from './schema';
const modules={...import.meta.glob(['./**/*.ts','!./**/*.test.ts']),'./_generated/offline-test.ts':async()=>({})};
const ref=(name:string)=>makeFunctionReference<'action'>(name);
test('acceptance is explicit, timestamped, idempotent and isolated',async()=>{
 const t=convexTest(schema,modules),a=t.withIdentity({subject:'A'}),b=t.withIdentity({subject:'B'});
 await expect(t.action(ref('consent:accept'),{accepted:true,adult:true})).rejects.toThrow();
 await expect(a.action(ref('consent:accept'),{accepted:false,adult:true})).rejects.toThrow();
 expect(await a.action(ref('consent:get'),{})).toBe(false);
 await a.action(ref('consent:accept'),{accepted:true,adult:true});
 await a.action(ref('consent:accept'),{accepted:true,adult:true});
 expect(await a.action(ref('consent:get'),{})).toBe(true);
 expect(await b.action(ref('consent:get'),{})).toBe(false);
 const rows=await t.run(ctx=>ctx.db.query('legalAcceptances').collect());
 expect(rows).toHaveLength(1);expect(rows[0].version).toBe('2026-11-01');expect(rows[0].acceptedAt).toBeGreaterThan(0);
});
