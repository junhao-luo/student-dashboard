import {zipSync, strToU8} from 'fflate';
import type {Workspace} from './storage.ts';

export function exportName(value:string):string {
  return value.normalize('NFC').replace(/[\\/:*?"<>|\x00-\x1f]/g,'_').replace(/^\.+/,'').slice(0,100).trim() || 'untitled';
}

// Source: https://github.com/101arrowz/fflate#zip-archives — store originals without recompression.
export async function exportWorkspace(workspace:Workspace, readFile:(id:string)=>Promise<Blob|undefined>) {
  const entries:Record<string,Uint8Array>={};
  const files=new Map<string,{path:string;name:string;size:number}>();
  const references=[...workspace.resources.filter(r=>r.fileId).map(r=>({id:r.fileId!,name:r.originalName||r.title})),
    ...workspace.notes.flatMap(n=>(n.attachments||[]).map(a=>({id:a.fileId,name:a.name}))),...workspace.tasks.flatMap(t=>(t.attachments||[]).map(a=>({id:a.fileId,name:a.name})))];
  if(references.length>10000||workspace.notes.length>10000)throw Error('Export contains too many files or notes.');
  let total=0;
  function add(path:string,bytes:Uint8Array){total+=bytes.byteLength;if(total>200*1024*1024)throw Error('Export exceeds the 200 MB processing limit.');entries[path]=bytes;}
  for(const ref of references){
    if(files.has(ref.id))continue;
    const blob=await readFile(ref.id);
    if(!blob)throw Error('An attachment is missing. Export stopped to avoid an incomplete backup.');
    if(blob.size>10*1024*1024)throw Error('An attachment exceeds the file limit.');
    const path=`files/${files.size+1}-${exportName(ref.name)}`;
    add(path,new Uint8Array(await blob.arrayBuffer()));
    files.set(ref.id,{path,name:ref.name,size:blob.size});
  }
  const records=strToU8(JSON.stringify(workspace,null,2));
  if(records.byteLength>20*1024*1024)throw Error('Workspace records exceed the 20 MB export limit.');
  add('records.json',records);
  const notes: {id:string;courseId:string;path:string;sourcePath?:string}[]=[];
  for(const [index,note] of workspace.notes.entries()){
    const path=`notes/${index+1}-${exportName(note.title)}.md`;
    const body=note.body.replace(/local-file:([a-zA-Z0-9-]+)/g,(_match,id:string)=>{
      const file=files.get(id);if(!file)throw Error('A note image is missing its attachment record.');
      return '../'+file.path.split('/').map(encodeURIComponent).join('/');
    });
    add(path,strToU8(body));
    const sourcePath=note.sourceMarkdown!==undefined?`notes/${index+1}-original.md`:undefined;
    if(sourcePath)add(sourcePath,strToU8(note.sourceMarkdown!));
    notes.push({id:note.id,courseId:note.courseId,path,sourcePath});
  }
  add('manifest.json',strToU8(JSON.stringify({format:'coursedock-export',version:1,exportedAt:new Date().toISOString(),records:'records.json',notes,files:Object.fromEntries(files),notice:'Contains private academic data. Store securely. Canonical block data is in records.json; Markdown may omit editor formatting.'},null,2)));
  return zipSync(entries,{level:0});
}

export function downloadBlob(blob:Blob,name:string){
  const url=URL.createObjectURL(blob), anchor=document.createElement('a');
  anchor.href=url;anchor.download=exportName(name);anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
