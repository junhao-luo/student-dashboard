import {unzipSync,strFromU8} from 'fflate';
import {validAcademic} from './academic.ts';
import {safeResourceUrl} from './domain.ts';
import {validateFile} from './files.ts';
import type {Workspace} from './storage';

export async function readWorkspaceZip(file:File):Promise<{workspace:Workspace;files:Map<string,File>}>{
  if(file.size>210*1024*1024)throw Error('Backup exceeds the processing limit.');
  let total=0,count=0;
  const entries=unzipSync(new Uint8Array(await file.arrayBuffer()),{filter:entry=>{
    total+=entry.originalSize;
    if(++count>30000||total>200*1024*1024||entry.originalSize>20*1024*1024||entry.name.includes('..')||entry.name.includes('\\')||entry.name.startsWith('/'))throw Error('Invalid or oversized backup.');
    return entry.name==='manifest.json'||entry.name==='records.json'||entry.name.startsWith('files/');
  }});
  const manifest=JSON.parse(strFromU8(entries['manifest.json']??new Uint8Array()));
  const workspace:Workspace=JSON.parse(strFromU8(entries['records.json']??new Uint8Array()));
  const id=(value:unknown)=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(value);
  const text=(value:unknown,max=10000)=>typeof value==='string'&&value.length<=max;
  if(manifest.format!=='coursedock-export'||manifest.version!==1||manifest.records!=='records.json'||workspace.version!==1||!validAcademic(workspace)||!Array.isArray(workspace.notes)||!Array.isArray(workspace.resources)||!Array.isArray(workspace.folders??[])||workspace.notes.length>10000||workspace.resources.length>10000||(workspace.folders?.length??0)>10000)throw Error('Unsupported backup records.');
  const courses=new Set(workspace.courses.map(c=>c.id)),folders=workspace.folders??[];
  for(const group of [workspace.notes,workspace.resources,folders])if(new Set(group.map(v=>v.id)).size!==group.length||group.some(v=>!id(v.id)))throw Error('Duplicate or invalid record identifiers.');
  if(workspace.notes.some(n=>!courses.has(n.courseId)||!text(n.title,200)||!text(n.body,2000000)||(n.blocks!==undefined&&!text(n.blocks,2000000))))throw Error('Invalid note.');
  if(workspace.resources.some(r=>!text(r.title,200)||!text(r.url,2000)||(r.url&&!safeResourceUrl(r.url))||(r.courseId&&!courses.has(r.courseId))))throw Error('Invalid resource.');
  const folderIds=new Set(folders.map(f=>f.id));
  for(const folder of folders){
    if(!text(folder.name,200)||(folder.courseId&&!courses.has(folder.courseId)))throw Error('Invalid folder.');
    const seen=new Set([folder.id]);let parent=folder.parentId;
    while(parent&&folderIds.has(parent)){if(seen.has(parent))throw Error('Folder cycle.');seen.add(parent);parent=folders.find(f=>f.id===parent)!.parentId;}
  }
  const references=[...workspace.resources.flatMap(r=>r.fileId?[{fileId:r.fileId,name:r.originalName||r.title,size:r.size}]:[]),...workspace.notes.flatMap(n=>n.attachments??[]),...workspace.tasks.flatMap(t=>t.attachments??[])];
  const files=new Map<string,File>();let fileTotal=0;
  for(const ref of references){
    if(!id(ref.fileId))throw Error('Invalid attachment identifier.');
    const record=Object.hasOwn(manifest.files??{},ref.fileId)?manifest.files[ref.fileId]:undefined;
    const bytes=record&&entries[record.path];
    if(!record||!bytes||!record.path.startsWith('files/')||bytes.length!==record.size||(ref.size!==undefined&&bytes.length!==ref.size))throw Error('Missing or incomplete attachment.');
    if(files.has(ref.fileId))continue;
    const extension=String(record.name).split('.').pop()?.toLowerCase()??'';
    const types:Record<string,string>={pdf:'application/pdf',md:'text/markdown',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
    const restored=new File([new Uint8Array(bytes).buffer],record.name,{type:types[extension]??''});
    await validateFile(restored);fileTotal+=restored.size;
    if(fileTotal>100*1024*1024)throw Error('Attachments exceed the 100 MB storage limit.');
    files.set(ref.fileId,restored);
  }
  for(const note of workspace.notes)for(const match of (note.body+' '+(note.blocks??'')).matchAll(/local-file:([A-Za-z0-9-]+)/g))if(!files.has(match[1]))throw Error('Missing note image.');
  if(!['en','zh'].includes(workspace.lang)||typeof workspace.dark!=='boolean'||!workspace.semesters.includes(workspace.semester))throw Error('Invalid workspace preferences.');
  workspace.page='overview';workspace.selectedCourse=undefined;
  return {workspace,files};
}
