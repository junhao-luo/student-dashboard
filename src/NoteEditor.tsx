import {useEffect,useRef,useState} from 'react';
import {useCreateBlockNote} from '@blocknote/react';
import {BlockNoteView} from '@blocknote/mantine';
import {en,zhTW} from '@blocknote/core/locales';
import type {PartialBlock} from '@blocknote/core';
import '@blocknote/mantine/style.css';
import {UploadArea} from './Interface';
import {getFile,putFile,removeFile} from './storage';
import {downloadBlob} from './export';
import {cleanNoteContent,validateNoteFile} from './note-content';
import type {Note} from './domain';

export function NoteEditor({note,onChange,onDelete,zh,dark}:{note:Note;onChange:(patch:Partial<Note>)=>void;onDelete:()=>Promise<void>;zh:boolean;dark:boolean}){
  const t=(enText:string,cn:string)=>zh?cn:enText;
  const [ready,setReady]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const latest=useRef(note),change=useRef(onChange),alive=useRef(true),uploading=useRef(false),urls=useRef(new Map<string,string>());
  latest.current=note;change.current=onChange;
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;for(const url of urls.current.values())URL.revokeObjectURL(url);urls.current.clear();};},[]);
  async function saveImage(file:File){
    if(uploading.current)throw Error('Wait for the current upload.');
    uploading.current=true;setBusy(true);setError('');
    try{
      await validateNoteFile(file,['png','jpg','jpeg']);
      const id=crypto.randomUUID();await putFile(id,file);
      if(!alive.current){await removeFile(id);throw Error('Note was closed during upload.');}
      const attachments=[...(latest.current.attachments||[]),{fileId:id,name:file.name,size:file.size,kind:'image' as const}];
      latest.current={...latest.current,attachments};change.current({attachments});
      return `local-file:${id}`;
    }catch(e){if(alive.current)setError(t(e instanceof Error?e.message:'Image upload failed.','圖片上傳失敗。請使用 10 MB 以內的 PNG/JPEG，並確認儲存空間。'));throw e;}
    finally{uploading.current=false;if(alive.current)setBusy(false);}
  }
  // Official setup/persistence: https://www.blocknotejs.org/docs/getting-started/editor-setup
  const editor=useCreateBlockNote({dictionary:zh?zhTW:en,uploadFile:saveImage,resolveFileUrl:async uri=>{
    if(!/^local-file:[a-zA-Z0-9-]+$/.test(uri))return '';
    const id=uri.slice(11);if(urls.current.has(id))return urls.current.get(id)!;
    const blob=await getFile(id);if(!blob)throw Error('Image is missing from this browser.');
    const url=URL.createObjectURL(blob);if(!alive.current){URL.revokeObjectURL(url);return '';}
    urls.current.set(id,url);return url;
  }});
  useEffect(()=>{
    try{
      const content=latest.current.blocks?JSON.parse(latest.current.blocks):editor.tryParseMarkdownToBlocks(latest.current.body);
      const blocks=cleanNoteContent(content) as PartialBlock[];
      if(blocks.length)editor.replaceBlocks(editor.document,blocks);
      setReady(true);
    }catch{setError(t('Could not open the rich note. Your original text is preserved; download it below.','無法開啟區塊筆記。原始文字已保留，可於下方下載。'));}
  },[editor]);
  function markdown(){
    // The HTML serializer creates image elements; use an inert data image while converting.
    const inert='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aIJsAAAAASUVORK5CYII=';
    const serialized=JSON.stringify(cleanNoteContent(editor.document)).replace(/local-file:([a-zA-Z0-9-]+)/g,`${inert}#local-file:$1`);
    return editor.blocksToMarkdownLossy(JSON.parse(serialized)).split(inert+'#').join('');
  }
  function save(){
    if(!ready)return;
    const blocks=JSON.stringify(cleanNoteContent(editor.document));
    if(blocks.length>2*1024*1024){setError(t('This note exceeds the 2 MB editing limit. Shorten it before saving.','此筆記超過 2 MB 編輯上限，請縮短內容後儲存。'));return;}
    change.current({blocks,body:markdown()});
  }
  async function upload(file:File){
    if(uploading.current)return;
    if(/\.(png|jpe?g)$/i.test(file.name)){
      try{const url=await saveImage(file);if(alive.current){editor.insertBlocks([{type:'image',props:{url,name:file.name}}],editor.document[editor.document.length-1],'after');save();}}
      catch{/* saveImage reports the upload error. */}
      return;
    }
    uploading.current=true;setBusy(true);setError('');
    try{
      const ext=await validateNoteFile(file,['md','pdf']);
      if(ext==='md'){
        if(file.size>1024*1024)throw Error('Markdown imports are limited to 1 MB for safe editing.');
        const text=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());
        if(text.includes('\0'))throw Error('Markdown must be UTF-8 text.');
        const blocks=cleanNoteContent(editor.tryParseMarkdownToBlocks(text)) as PartialBlock[];
        if(blocks.length>5000)throw Error('This Markdown file contains too many blocks.');
        if(JSON.stringify([...editor.document,...blocks]).length>2*1024*1024)throw Error('Import exceeds the 2 MB note editing limit.');
        if(!alive.current)return;
        editor.insertBlocks(blocks,editor.document[editor.document.length-1],'after');
        change.current({sourceMarkdown:(latest.current.sourceMarkdown||'')+text+'\n',blocks:JSON.stringify(editor.document),body:markdown()});
      }else{
        const id=crypto.randomUUID();await putFile(id,file);
        if(!alive.current){await removeFile(id);return;}
        change.current({attachments:[...(latest.current.attachments||[]),{fileId:id,name:file.name,size:file.size,kind:'pdf'}]});
      }
    }catch(e){if(alive.current)setError(t(e instanceof Error?e.message:'Import failed.','匯入失敗。請使用 UTF-8 Markdown（最多 1 MB）或 PDF（最多 10 MB），並確認儲存空間。'));}
    finally{uploading.current=false;if(alive.current)setBusy(false);}
  }
  function move(direction:-1|1){
    const block=editor.getTextCursorPosition().block;
    if(direction===-1)editor.moveBlocksUp(block);else editor.moveBlocksDown(block);
    save();
  }
  return <article className="note rich-note" id={'note-'+note.id}>
    <input className="note-title" aria-label={t('Note title','筆記標題')} maxLength={120} value={note.title} onChange={e=>onChange({title:e.target.value})}/>
    <p className="muted">{t('Type / to add a block. Drag the block handle to reorder, or use Move block up/down. Markdown imports append; remote images are omitted—upload images here.','輸入 / 新增區塊。拖曳區塊控制點排序，或使用上移／下移。Markdown 會加入筆記末尾；遠端圖片不會載入，請於此上傳圖片。')}</p>
    <div className="note-actions"><button disabled={!ready||busy} onClick={()=>move(-1)}>{t('Move block up','上移區塊')}</button><button disabled={!ready||busy} onClick={()=>move(1)}>{t('Move block down','下移區塊')}</button><button onClick={()=>downloadBlob(new Blob([note.body],{type:'text/markdown;charset=utf-8'}),`${note.title||'note'}.md`)}>{t('Download Markdown','下載 Markdown')}</button></div>
    {ready&&<div className="note-canvas"><BlockNoteView editor={editor} theme={dark?'dark':'light'} onChange={save}/></div>}
    <UploadArea label={t('Import Markdown, PDF or image','匯入 Markdown、PDF 或圖片')} accept=".md,.pdf,.png,.jpg,.jpeg" busy={busy||!ready} zh={zh} onFile={file=>{if(file)void upload(file);}}/>
    <p className="muted">{t('Markdown: UTF-8, up to 1 MB. PDF: up to 10 MB, kept as an attachment. Images can be uploaded through the image block.','Markdown：UTF-8，最多 1 MB。PDF：最多 10 MB，保留為附件。圖片可透過圖片區塊上傳。')}</p>
    <ul className="note-attachments">{(note.attachments||[]).map(a=><li key={a.fileId}><span>{a.name}</span><small>{Math.ceil(a.size/1024)} KB</small><button onClick={async()=>{try{const blob=await getFile(a.fileId);if(!blob)throw Error();downloadBlob(blob,a.name);}catch{setError(t('Attachment could not be downloaded. Check browser storage.','無法下載附件，請檢查瀏覽器儲存設定。'));}}}>{t('Download','下載')}</button></li>)}</ul>
    {error&&<p role="alert" className="error">{error}</p>}
    <button className="danger" disabled={busy} onClick={()=>{if(confirm(t('Delete this note and its attachments from this browser?','從此瀏覽器刪除此筆記及附件？')))void onDelete().catch(()=>setError(t('Could not delete the note. Try again.','無法刪除筆記，請重試。')));}}>{t('Delete note','刪除筆記')}</button>
  </article>;
}
