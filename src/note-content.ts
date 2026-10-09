import {safeResourceUrl} from './domain.ts';

// Imported media never fetches a third-party URL. Images must be uploaded locally.
export function cleanNoteContent(value:unknown,depth=0):unknown {
  if(depth>30)throw Error('Note nesting exceeds the processing limit.');
  if(Array.isArray(value))return value.map(item=>cleanNoteContent(item,depth+1));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>{
    if(key==='href')return [key,typeof item==='string'?(safeResourceUrl(item)||''):''];
    if(key==='url')return [key,typeof item==='string'&&/^local-file:[a-zA-Z0-9-]+$/.test(item)?item:''];
    return [key,cleanNoteContent(item,depth+1)];
  }));
  return value;
}

export async function validateNoteFile(file:File,extensions:string[]) {
  const ext=file.name.split('.').pop()?.toLowerCase()||'';
  if(!extensions.includes(ext)||!file.size||file.size>10*1024*1024)throw Error('Use an allowed file up to 10 MB.');
  const bytes=new Uint8Array(await file.slice(0,8).arrayBuffer());
  if((ext==='pdf'&&new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')||
    (ext==='png'&&![137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b))||
    (['jpg','jpeg'].includes(ext)&&(bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)))throw Error('File content does not match its extension.');
  return ext;
}
