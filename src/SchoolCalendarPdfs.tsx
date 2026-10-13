import {useEffect,useRef,useState} from 'react';
import {getDocument,GlobalWorkerOptions,type PDFDocumentProxy,type RenderTask} from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import academicUrl from './assets/calendars/fcu-115-academic.pdf?url';
import registrationUrl from './assets/calendars/fcu-115-1-registration.pdf?url';
import {LoadingState} from './Interface';
GlobalWorkerOptions.workerSrc=workerUrl;

function PdfPreview({url,title,zh}:{url:string;title:string;zh:boolean}){
  const [pdf,setPdf]=useState<PDFDocumentProxy|null>(null),[page,setPage]=useState(1),[width,setWidth]=useState(0),[busy,setBusy]=useState(true),[error,setError]=useState(false);
  const container=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{const node=container.current;if(!node)return;const observer=new ResizeObserver(()=>setWidth(Math.floor(node.clientWidth)));observer.observe(node);return()=>observer.disconnect();},[]);
  useEffect(()=>{
    let active=true;const task=getDocument({url});
    void task.promise.then(value=>{if(active)setPdf(value);}).catch(()=>{if(active){setError(true);setBusy(false);}});
    return()=>{active=false;void task.destroy().catch(()=>{});};
  },[url]);
  useEffect(()=>{
    if(!pdf||!width)return;let active=true,render:RenderTask|undefined;setBusy(true);setError(false);
    void pdf.getPage(page).then(async sheet=>{
      if(!active||!canvas.current)return;
      const base=sheet.getViewport({scale:1}),ratio=Math.min(devicePixelRatio||1,2),viewport=sheet.getViewport({scale:width/base.width*ratio});
      const node=canvas.current;node.width=viewport.width;node.height=viewport.height;node.style.width=`${width}px`;node.style.height=`${viewport.height/ratio}px`;
      render=sheet.render({canvas:node,viewport});await render.promise;if(active)setBusy(false);
    }).catch(()=>{if(active){setError(true);setBusy(false);}});
    return()=>{active=false;render?.cancel();};
  },[pdf,page,width]);
  return <section className="calendar-pdf"><div className="section-head"><h2>{title}</h2><a href={url} target="_blank" rel="noopener noreferrer">{zh?'開啟 PDF':'Open PDF'}</a></div>
    <div className="calendar-pdf-controls"><button type="button" disabled={!pdf||page===1} onClick={()=>setPage(page-1)}>{zh?'上一頁':'Previous'}</button><span aria-live="polite">{pdf?(zh?`第 ${page}／${pdf.numPages} 頁`:`Page ${page} of ${pdf.numPages}`):(zh?'載入 PDF':'Loading PDF')}</span><button type="button" disabled={!pdf||page===pdf.numPages} onClick={()=>setPage(page+1)}>{zh?'下一頁':'Next'}</button></div>
    <div className="calendar-pdf-page" ref={container}>{busy&&<LoadingState compact zh={zh}/>}<canvas ref={canvas} role="img" aria-label={`${title} — ${page}`} hidden={busy||error}/>{error&&<p role="alert">{zh?'無法顯示預覽，請使用上方連結開啟 PDF。':'Preview unavailable. Use the link above to open the PDF.'}</p>}</div>
  </section>;
}
export default function SchoolCalendarPdfs({zh}:{zh:boolean}){
  return <div className="school-calendar-pdfs"><p className="muted">{zh?'學校公告 PDF，僅供預覽；不會加入個人課表或提醒。':'University calendar PDFs for reference. They do not add personal classes or reminders.'}</p><PdfPreview url={academicUrl} title={zh?'115 學年度行事曆':'Academic year 115 calendar'} zh={zh}/><PdfPreview url={registrationUrl} title={zh?'115-1 學生選課行事曆':'115-1 course registration calendar'} zh={zh}/></div>;
}
