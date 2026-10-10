import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';

// Print filenames and check names only; never print matched credentials or source lines.
const failures=new Set();
const checked=new Set();
const endpoints=[];
const secretPatterns=[/\b(?:sk_live_|sk_test_)[A-Za-z0-9]{20,}/,/\bgh[pousr]_[A-Za-z0-9]{30,}/,/\bgithub_pat_[A-Za-z0-9_]{40,}/,/\bAKIA[A-Z0-9]{16}\b/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/];
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const inScope=file=>/^(src\/|convex\/|scripts\/|\.github\/|package(?:-lock)?\.json$|vercel\.json$|vite\.config\.ts$|index\.html$|\.env\.example$)/.test(file);
function inspect(file,content,syntax=false){
 checked.add(file);
 if(secretPatterns.some(pattern=>pattern.test(content)))failures.add(`Credential pattern: ${file}`);
 if(!syntax||!file.match(/\.[cm]?[jt]sx?$/))return;
 const source=ts.createSourceFile(file,content,ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 if(file.startsWith('convex/')&&!file.includes('_generated/')&&file!=='convex/model.ts'){
  for(const statement of source.statements){
   if(!ts.isVariableStatement(statement)||!statement.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword))continue;
   for(const declaration of statement.declarationList.declarations){
    const call=declaration.initializer;
    if(!call||!ts.isCallExpression(call)||!ts.isIdentifier(call.expression))continue;
    const builder=call.expression.text;
    if(['query','mutation','httpAction','queryGeneric','mutationGeneric','httpActionGeneric'].includes(builder))failures.add(`New public transport requires security review: ${file}`);
    if(builder!=='action')continue;
    const definition=call.arguments[0];
    if(!definition||!ts.isObjectLiteralExpression(definition)){failures.add(`Unrecognized public action: ${file}`);continue;}
    const properties=definition.properties.filter(p=>ts.isPropertyAssignment(p)||ts.isShorthandPropertyAssignment(p));
    const handler=properties.find(p=>ts.isPropertyAssignment(p)&&p.name.getText(source)==='handler');
    if(!properties.some(p=>p.name.getText(source)==='args')||!properties.some(p=>p.name.getText(source)==='returns')||!handler||!handler.initializer.getText(source).includes('await guard('))failures.add(`Missing action boundary declaration/budget: ${file}`);
    endpoints.push(`${file}:${declaration.name.getText(source)}`);
   }
  }
 }
 function visit(node){
  if(ts.isJsxAttribute(node)&&node.name.getText(source)==='dangerouslySetInnerHTML')failures.add(`Unsafe HTML sink: ${file}`);
  if(ts.isBinaryExpression(node)&&node.operatorToken.kind===ts.SyntaxKind.EqualsToken&&ts.isPropertyAccessExpression(node.left)&&['innerHTML','outerHTML'].includes(node.left.name.text))failures.add(`Unsafe HTML assignment: ${file}`);
  if(ts.isCallExpression(node)){
   if(ts.isIdentifier(node.expression)&&node.expression.text==='eval')failures.add(`Dynamic code execution: ${file}`);
   if(ts.isPropertyAccessExpression(node.expression)&&node.expression.expression.getText(source)==='localStorage'&&node.expression.name.text==='setItem')failures.add(`Persistent JavaScript storage write requires review: ${file}`);
  }
  ts.forEachChild(node,visit);
 }
 visit(source);
}
for(const file of tracked){
 if(/(^|\/)\.env(?:\.|$)/i.test(file)&&file!=='.env.example')failures.add(`Tracked environment file: ${file}`);
 if(inScope(file)&&fs.existsSync(file))inspect(file,fs.readFileSync(file,'utf8'),!file.endsWith('.test.ts')&&!file.includes('_generated/'));
}
// Include newly created application/check files before their first commit.
for(const root of ['src','convex','scripts','dist']){
 if(!fs.existsSync(root))continue;
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name).replaceAll('\\','/');
  if(entry.isDirectory())walk(file);else if(/\.(?:[cm]?[jt]sx?|html|json|css)$/.test(file))inspect(file,fs.readFileSync(file,'utf8'),root!=='dist'&&!file.endsWith('.test.ts')&&!file.includes('_generated/'));
 }}
 walk(root);
}
if(process.argv.includes('--history')){
 const commits=execFileSync('git',['rev-list','--all'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
 const pattern='(sk_live_|sk_test_)[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|AKIA[A-Z0-9]{16}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----';
 for(const commit of commits){
  try{
   const matches=execFileSync('git',['grep','-I','-l','-E','-e',pattern,commit,'--','src/','convex/','scripts/','.github/','package.json','package-lock.json','vercel.json','vite.config.ts','index.html','.env.example'],{encoding:'utf8'});
   for(const file of matches.trim().split('\n').filter(Boolean))failures.add(`History credential pattern: ${file}`);
  }catch(error){if(error.status!==1)throw error;}
  const names=execFileSync('git',['ls-tree','-r','--name-only',commit],{encoding:'utf8'}).split('\n');
  for(const file of names)if(/(^|\/)\.env(?:\.|$)/i.test(file)&&file!=='.env.example')failures.add(`Historical environment file: ${commit.slice(0,7)}:${file}`);
 }
 console.log(`History scanned: ${commits.length} reachable commits (application/configuration paths).`);
}
console.log(`Security static checks: ${checked.size} files, ${failures.size} findings; ${new Set(endpoints).size} public action declarations reviewed. Pattern scanning and syntax checks do not prove runtime security.`);
for(const finding of failures)console.error(finding);
process.exitCode=failures.size?1:0;
