import {ConvexHttpClient} from 'convex/browser';
import {makeFunctionReference} from 'convex/server';

const url=process.env.VITE_CONVEX_URL;
if(!/^https:\/\/[a-z0-9-]+\.convex\.cloud$/.test(url??''))throw Error('Set VITE_CONVEX_URL to the specific deployment being checked.');
let failed=false;
for(const mode of ['anonymous','forged-token']){
 const client=new ConvexHttpClient(url);
 if(mode==='forged-token')client.setAuth('not-a-valid-signed-jwt');
 for(const name of ['profiles:get','academic:get']){
  try{
   await client.action(makeFunctionReference(name),{});
   console.error(`${mode} ${name}: FAIL (unexpected success)`);failed=true;
  }catch(error){
   const message=String(error);
   // Network failures do not demonstrate authentication enforcement.
   const denied=message.includes('SIGN_IN_REQUIRED')||/InvalidAuthHeader|Unauthenticated|invalid.*JWT|JWT.*invalid|Invalid token|could not authenticate|could not be decoded/i.test(message);
   console.log(`${mode} ${name}: ${denied?'DENIED':'INCONCLUSIVE'}`);
   if(!denied)failed=true;
  }
 }
}
process.exitCode=failed?1:0;
