import {readFileSync,writeFileSync} from 'node:fs';
let src=readFileSync('src/main.tsx','utf8').replace(/\r\n/g,'\n');
src=src.replace('import { TaskViews }','import { DataExport } from "./DataExport";\nimport { TaskViews }');
src=src.replace('loadWorkspace, saveWorkspace, type Workspace','loadWorkspace, saveWorkspace, removeFiles, type Workspace');
src=src.replace('const PdfImport = lazy(', 'const NoteEditor = lazy(() => import("./NoteEditor").then(module=>({default:module.NoteEditor})));\nconst PdfImport = lazy(');
const start=src.indexOf('                <p className="muted">',src.indexOf("{courseTab==='notes'&&<>"));
const end=src.indexOf('                </>}',start);
if(start<0||end<start)throw Error('Note section not found');
src=src.slice(0,start)+`                <Suspense fallback={<LoadingState compact zh={lang==='zh'}/>}>
                  {notes.filter(n=>n.courseId===selectedCourse).map(note=><NoteEditor key={note.id+'-'+lang} note={note} zh={lang==='zh'} dark={dark}
                    onChange={patch=>setNotes(current=>current.map(n=>n.id===note.id?{...n,...patch}:n))}
                    onDelete={async()=>{await removeFiles((note.attachments||[]).map(a=>a.fileId));setNotes(current=>current.filter(n=>n.id!==note.id));}}/>) }
                </Suspense>
`+src.slice(end);
src=src.replace('  function removeCourse(id: string) {','  async function removeCourse(id: string) {');
src=src.replace('    const result = deleteCourse(id, { courses, tasks, meetings, notes });',`    try {await removeFiles(notes.filter(n=>n.courseId===id).flatMap(n=>(n.attachments||[]).map(a=>a.fileId)));}
    catch {setStatus(t('Could not delete course attachments. Try again.','無法刪除課程附件，請重試。'));return;}
    const result = deleteCourse(id, { courses, tasks, meetings, notes });`);
src=src.replace('Sign-in, synchronized storage, ZIP export, and account deletion are not connected in this development preview.','Sign-in, synchronized storage and account deletion are not connected in this development preview.');
src=src.replace('此開發預覽尚未連接登入、跨裝置同步、ZIP 匯出及帳號刪除。','此開發預覽尚未連接登入、跨裝置同步及帳號刪除。');
src=src.replace('        {page === "settings" && (','        {page === "settings" && (');
const settingsEnd=src.indexOf('          </section>\n        )}',src.indexOf('{page === "settings"'));
if(settingsEnd<0)throw Error('Settings section not found');
src=src.slice(0,settingsEnd)+`            <DataExport zh={lang==='zh'} workspace={{version:1,appName,selectedCourse,lang,dark,page,semester,semesters,courses,tasks,meetings,notes,resources,folders,folderId,courseTab,sidebarCollapsed}}/>
`+src.slice(settingsEnd);
writeFileSync('src/main.tsx',src);
