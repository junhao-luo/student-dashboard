import {unzipSync} from 'fflate';
export const fileAccept='.pdf,.md,.png,.jpg,.jpeg,.docx,.pptx,.xlsx';
export function officeEntries(bytes:Uint8Array):Record<string,Uint8Array>{
  let total=0,count=0;
  if(bytes.length>10*1024*1024)throw Error('File exceeds 10 MB.');
  return unzipSync(bytes,{filter:entry=>{
    if(++count>2000||entry.name.includes('..')||entry.name.includes('\\')||/vbaProject|macros/i.test(entry.name))throw Error('Unsupported Office archive.');
    total+=entry.originalSize;
    if(entry.originalSize>8*1024*1024||total>32*1024*1024)throw Error('Office file exceeds preview processing limits.');
    return /^(word|ppt|xl)\/.+\.(xml|rels|png|jpe?g)$/.test(entry.name);
  }});
}
export async function validateFile(file:File){
  const extension=file.name.split('.').pop()?.toLowerCase()??'';
  if(!['pdf','md','png','jpg','jpeg','docx','pptx','xlsx'].includes(extension)||!file.size||file.size>10*1024*1024)throw Error('Use PDF, Markdown, PNG/JPEG or DOCX/PPTX/XLSX up to 10 MB.');
  const bytes=new Uint8Array(await file.arrayBuffer());
  if((extension==='pdf'&&new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')||(extension==='png'&&![137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))||(['jpg','jpeg'].includes(extension)&&(bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)))throw Error('File contents do not match its extension.');
  if(['docx','pptx','xlsx'].includes(extension)){
    const entries=officeEntries(bytes),part=extension==='docx'?'word/document.xml':extension==='pptx'?'ppt/presentation.xml':'xl/workbook.xml';
    if(!entries[part])throw Error('File is not a supported Office document.');
  }
}
