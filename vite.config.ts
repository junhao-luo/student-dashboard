import {defineConfig} from 'vite';
import {readFileSync,writeFileSync,mkdirSync,cpSync} from 'node:fs';
const {version}=JSON.parse(readFileSync(new URL('./package.json',import.meta.url),'utf8'));

export default defineConfig(()=>({
  base:'/',
  plugins:[{name:'legacy-domain-transfer',closeBundle(){
    const html=readFileSync('dist/index.html','utf8');
    mkdirSync('dist/student-dashboard',{recursive:true});
    writeFileSync('dist/student-dashboard/index.html',html.replaceAll('"/assets/','"/student-dashboard/assets/').replace('"/favicon.svg"','"/student-dashboard/favicon.svg"'));
    cpSync('dist/assets','dist/student-dashboard/assets',{recursive:true});
    cpSync('dist/favicon.svg','dist/student-dashboard/favicon.svg');
  }}],
  define:{__APP_VERSION__:JSON.stringify(version)},
}));
