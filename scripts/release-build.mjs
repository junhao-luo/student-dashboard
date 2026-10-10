import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

// Never fall back to a developer's CLI login or implicitly deploy to production.
if(!process.env.CONVEX_DEPLOY_KEY){
 console.error('Coupled deployment requires an environment-scoped CONVEX_DEPLOY_KEY in the hosting secret store.');
 process.exit(1);
}
const pkg=JSON.parse(fs.readFileSync('node_modules/convex/package.json','utf8'));
const bin=typeof pkg.bin==='string'?pkg.bin:pkg.bin.convex;
const result=spawnSync(process.execPath,[path.resolve('node_modules/convex',bin),'deploy','--cmd-url-env-var-name','VITE_CONVEX_URL','--cmd','npm run build'],{stdio:'inherit',env:process.env});
if(result.error)console.error('Could not start the coupled deployment.');
process.exitCode=result.status??1;
