import {defineConfig} from 'vite';
import {readFileSync,writeFileSync} from 'node:fs';
const {version}=JSON.parse(readFileSync(new URL('./package.json',import.meta.url),'utf8'));

export default defineConfig(()=>({
  base:'/',
  plugins:[{name:'legacy-domain-transfer',closeBundle(){
    const html=readFileSync('dist/index.html','utf8');
    writeFileSync('dist/legacy.html',html.replaceAll('"/assets/','"/student-dashboard/assets/').replace('"/favicon.svg"','"/student-dashboard/favicon.svg"'));
  }}],
  define:{__APP_VERSION__:JSON.stringify(version)},
}));
