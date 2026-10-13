import {strFromU8} from 'fflate';
import {officeEntries} from './files.ts';
export type PreviewPage={title:string;text:string;images?:string[]};
export function officePreview(bytes:Uint8Array,extension:string):PreviewPage[]{
  const entries=officeEntries(bytes);
  const paths=Object.keys(entries).filter(path=>extension==='docx'?path==='word/document.xml':extension==='pptx'?/^ppt\/slides\/slide\d+\.xml$/.test(path):/^xl\/worksheets\/sheet\d+\.xml$/.test(path)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  if(!paths.length||paths.length>100)throw Error('No supported content, or too many pages to preview.');
  let total=0;
  const imageUrls=new Map<string,string>();
  const parse=(path:string)=>{
    const xml=strFromU8(entries[path]);
    if(xml.includes('<!DOCTYPE')||xml.includes('<!ENTITY'))throw Error('Unsupported XML.');
    const doc=new DOMParser().parseFromString(xml,'application/xml');
    if(doc.querySelector('parsererror'))throw Error('Invalid Office document.');
    return doc;
  };
  const shared=extension==='xlsx'&&entries['xl/sharedStrings.xml']?Array.from(parse('xl/sharedStrings.xml').getElementsByTagName('si')).map(n=>n.textContent??''):[];
  return paths.map((path,i)=>{
    const doc=parse(path);
    const paragraphs=Array.from(doc.getElementsByTagNameNS('*',extension==='xlsx'?'row':'p'));
    const text=paragraphs.map(p=>extension==='xlsx'?Array.from(p.getElementsByTagNameNS('*','c')).map(c=>{const v=c.getElementsByTagNameNS('*','v')[0]?.textContent??c.textContent??'';return c.getAttribute('t')==='s'?shared[Number(v)]??'':v;}).join('\t'):Array.from(p.getElementsByTagNameNS('*','t')).map(t=>t.textContent).join('')).join('\n');
    total+=text.length;if(total>400000)throw Error('Document text exceeds preview limits.');
    const relPath=path.replace(/\/([^/]+)$/,'/_rels/$1.rels');
    const images:string[]=[];
    if(entries[relPath])for(const relation of Array.from(parse(relPath).getElementsByTagNameNS('*','Relationship'))){
      if(relation.getAttribute('TargetMode')==='External'||!relation.getAttribute('Type')?.endsWith('/image'))continue;
      const parts=path.split('/').slice(0,-1);for(const part of (relation.getAttribute('Target')??'').split('/')){if(part==='..')parts.pop();else if(part&&part!=='.')parts.push(part);}
      const imagePath=parts.join('/'),image=entries[imagePath];if(!image||images.length>=20)continue;
      const cached=imageUrls.get(imagePath);if(cached){images.push(cached);continue;}
      const png=[137,80,78,71,13,10,26,10].every((v,i)=>image[i]===v),jpeg=image[0]===255&&image[1]===216&&image[2]===255;
      if(!png&&!jpeg)continue;
      let binary='';for(let offset=0;offset<image.length;offset+=8192)binary+=String.fromCharCode(...image.subarray(offset,offset+8192));
      const url=`data:${png?'image/png':'image/jpeg'};base64,${btoa(binary)}`;imageUrls.set(imagePath,url);images.push(url);
    }
    return {title:extension==='pptx'?`Slide ${i+1}`:extension==='xlsx'?`Sheet ${i+1}`:'Document',text:text||'(No readable text on this page)',images};
  });
}
export function previewHtml(title:string,pages:PreviewPage[]){
  const escape=(text:string)=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>${escape(title)}</title><style>body{font:16px system-ui;background:#f5f5f6;color:#293237;margin:24px}article{max-width:900px;margin:24px auto;padding:32px;background:white;border:1px solid #e4e6e6;border-radius:12px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;line-height:1.7}img{max-width:100%}</style></head><body><h1>${escape(title)}</h1><p>Content preview. Original Office layout may differ.</p>${pages.map(p=>`<article><h2>${escape(p.title)}</h2><pre>${escape(p.text)}</pre>${(p.images??[]).filter(image=>/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(image)).map(image=>`<img alt="Embedded document image" src="${image}">`).join('')}</article>`).join('')}</body></html>`;
}
