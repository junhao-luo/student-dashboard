import {spawnSync} from 'node:child_process';

const coupled=!!process.env.CONVEX_DEPLOY_KEY;
if(process.env.VERCEL_ENV==='production'&&!coupled){
 console.error('Production builds require a scoped Convex deploy key and coupled backend/frontend deployment.');
 process.exit(1);
}
const args=coupled?['scripts/release-build.mjs']:[process.env.npm_execpath,'run','build'];
if(args.some(value=>!value))throw Error('Run this build through npm.');
if(!coupled)console.log('Protected preview: using the explicitly configured existing development backend. Automatic pairing requires its scoped deploy-key setup.');
const result=spawnSync(process.execPath,args,{stdio:'inherit',env:process.env});
if(result.error)console.error('Could not start the hosting build.');
process.exitCode=result.status??1;
