import {useEffect,useId,useRef,useState} from 'react';
import {useAction} from 'convex/react';
import {makeFunctionReference} from 'convex/server';
import {Bug,CheckCircle2,Mail,X} from 'lucide-react';
import {Select} from './Interface';
import {diagnosticEvents,recordDiagnostic,startDiagnostics,validReport,type SupportReport} from './support-data';
import './support.css';

function useSubmit(){return useAction(makeFunctionReference<'action',SupportReport,null>('support:submit'));}
function failure(error:unknown,zh:boolean){
  const code=String(error);
  if(code.includes('SUPPORT_NOT_CONFIGURED'))return zh?'郵件服務尚未設定。請直接寄信至 support@coursedock.app。':'Email delivery is not configured yet. Please email support@coursedock.app directly.';
  if(code.includes('LIMIT'))return zh?'已達回報次數上限，請稍後再試或直接寄信給客服。':'Report limit reached. Try later or email support directly.';
  return zh?'無法確認寄送成功。內容已保留，請重試。':'Could not confirm delivery. Your report is preserved; please retry.';
}
export function ContactPage({zh}:{zh:boolean}){
  const [success,setSuccess]=useState(false);
  const send=useSubmit(),[kind,setKind]=useState<'complaint'|'suggestion'>('suggestion'),[subject,setSubject]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[status,setStatus]=useState('');
  const request=useRef<string|null>(null);
  return <section className="contact-page"><p>{zh?'遇到問題，或有想改善的地方？告訴我們。':'Have a concern or an idea for CourseDock? Tell us.'}</p><a className="support-address" href="mailto:support@coursedock.app"><Mail size={20}/>support@coursedock.app</a>
    <form className="support-form" onSubmit={async e=>{e.preventDefault();if(busy)return;setStatus('');setBusy(true);request.current??=crypto.randomUUID();try{await send({kind,subject,message,requestId:request.current,screenshot:null,diagnostics:null});setSubject('');setMessage('');request.current=null;setSuccess(true);}catch(error){setStatus(failure(error,zh));}finally{setBusy(false);}}}>
      <fieldset disabled={busy} onChange={()=>{request.current=null;setStatus('');}}><label>{zh?'類別':'Category'}<Select value={kind} onChange={e=>setKind(e.target.value as typeof kind)}><option value="suggestion">{zh?'建議':'Suggestion'}</option><option value="complaint">{zh?'申訴':'Complaint'}</option></Select></label>
      <label>{zh?'主旨':'Subject'}<input required maxLength={120} value={subject} onChange={e=>setSubject(e.target.value)}/></label>
      <label>{zh?'內容':'Message'}<textarea required minLength={10} maxLength={5000} rows={7} value={message} onChange={e=>setMessage(e.target.value)}/></label>
      <p className="muted">{zh?'內容與已儲存的姓名、學號、系所、班級、學校信箱及手機號碼將寄至 support@coursedock.app，供客服處理與回覆。請勿提供密碼或驗證碼。':'Your message and saved name, student ID, department, class, school email and mobile number are sent to support@coursedock.app for support. Please leave out passwords and verification codes.'}</p>
      <button className="primary" type="submit">{busy?(zh?'傳送中…':'Sending…'):(zh?'傳送給客服':'Send to support')}</button></fieldset><p role="status">{status}</p>
    </form>{success&&<SubmissionConfirmation zh={zh} onClose={()=>setSuccess(false)}/>}</section>;
}
export function SubmissionConfirmation({zh,onClose}:{zh:boolean;onClose:()=>void}){
  const ref=useRef<HTMLDialogElement>(null),id=useId();
  useEffect(()=>{const before=document.activeElement;ref.current?.showModal();return()=>{if(before instanceof HTMLElement&&before.isConnected)before.focus();};},[]);
  return <dialog ref={ref} className="submission-confirmation" data-lenis-prevent data-report-private aria-labelledby={id} onCancel={onClose}><CheckCircle2 size={32} aria-hidden="true"/><h2 id={id}>{zh?'訊息已送出':'Message sent'}</h2><p>{zh?'郵件服務已接受你的訊息並寄送至 support@coursedock.app。客服可透過你的學校信箱回覆。':'The email service accepted your message for support@coursedock.app. Support can reply to your school email.'}</p><button autoFocus className="primary" onClick={onClose}>{zh?'完成':'Done'}</button></dialog>;
}
export function BugReporter({zh,view}:{zh:boolean;view:string}){
  const [success,setSuccess]=useState(false);
  const send=useSubmit(),dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null),request=useRef<string|null>(null);
  const [open,setOpen]=useState(false),[capture,setCapture]=useState(false),[busy,setBusy]=useState(false),[screenshot,setScreenshot]=useState<string|null>(null),[diagnostics,setDiagnostics]=useState<SupportReport['diagnostics']>(null),[subject,setSubject]=useState(''),[message,setMessage]=useState(''),[status,setStatus]=useState('');
  useEffect(startDiagnostics,[]);
  useEffect(()=>{if(open){dialog.current?.showModal();dialog.current?.querySelector('input')?.focus();}else trigger.current?.focus();},[open]);
  useEffect(()=>{if(open&&!capture&&document.activeElement===dialog.current)dialog.current?.querySelector('input')?.focus();},[open,capture]);
  async function report(){
    if(capture)return;setCapture(true);setStatus('');setScreenshot(null);request.current=null;
    try{
      const {toPng}=await import('html-to-image');
      const node=document.getElementById('main');if(!node)throw Error('capture');
      const width=Math.min(node.clientWidth,1500),height=Math.min(window.innerHeight,1500),top=Math.max(0,-node.getBoundingClientRect().top);
      const image=await toPng(node,{width,height,pixelRatio:1,skipFonts:true,fetchRequestInit:{signal:AbortSignal.timeout(8000)},backgroundColor:getComputedStyle(document.documentElement).getPropertyValue('--surface').trim()||'#ffffff',style:{width:`${width}px`,height:`${height+top}px`,transform:`translateY(-${top}px)`,margin:'0'},filter:n=>!(n instanceof Element)||!n.matches('input,textarea,select,img,iframe,video,canvas,[data-report-private],.student-profile')});
      if(image.length>750000)throw Error('size');setScreenshot(image);
    }catch{recordDiagnostic('CAPTURE_FAILED');setStatus(zh?'無法擷取畫面，你仍可提交問題描述與診斷。':'Screenshot unavailable. You can still send the description and diagnostics.');}
    finally{setDiagnostics({view:['overview','courses','tasks','timetable','resources','calendar','settings','contact'].includes(view)?view:'overview',language:zh?'zh':'en',width:Math.min(innerWidth,10000),height:Math.min(innerHeight,10000),events:diagnosticEvents()});setCapture(false);setOpen(true);}
  }
  return <><button ref={trigger} className="bug-fab" data-report-private disabled={capture||busy} aria-label={capture?(zh?'擷取工作區中…':'Capturing workspace…'):(zh?'回報錯誤':'Report a bug')} title={zh?'回報錯誤':'Report a bug'} onClick={report}><Bug size={22}/></button>{capture&&<span className="visually-hidden" role="status" data-report-private>{zh?'擷取工作區中…':'Capturing workspace…'}</span>}
    {open&&<dialog ref={dialog} className="bug-dialog" aria-labelledby="bug-report-title" data-lenis-prevent data-report-private onCancel={e=>{if(busy||capture)e.preventDefault();else setOpen(false);}}><div className="support-dialog-heading"><h2 id="bug-report-title">{zh?'回報 Beta 問題':'Report a beta bug'}</h2><button disabled={busy||capture} aria-label={zh?'關閉':'Close'} onClick={()=>setOpen(false)}><X size={20}/></button></div>
      <p>{zh?'描述發生的情況，以及原本預期的結果。送出前請檢查截圖，可能包含課程或筆記。':'Describe what happened and what you expected. Review the screenshot before sending; it may contain courses or notes.'}</p>
      <form className="support-form" onSubmit={async e=>{e.preventDefault();if(busy||capture)return;request.current??=crypto.randomUUID();const report:SupportReport={kind:'bug',subject,message,screenshot,diagnostics,requestId:request.current};if(!validReport(report)){setStatus(zh?'請檢查內容，描述至少需要 10 個字元。':'Check your report. The description needs at least 10 characters.');return;}setBusy(true);setStatus('');try{await send(report);setScreenshot(null);setSubject('');setMessage('');setDiagnostics(null);request.current=null;setOpen(false);setSuccess(true);}catch(error){setStatus(failure(error,zh));}finally{setBusy(false);}}}>
        <fieldset disabled={busy||capture} onChange={()=>{request.current=null;setStatus('');}}><label>{zh?'問題摘要':'Bug summary'}<input required maxLength={120} value={subject} onChange={e=>setSubject(e.target.value)}/></label><label>{zh?'重現步驟與預期結果':'Steps to reproduce and expected result'}<textarea required minLength={10} maxLength={5000} rows={4} value={message} onChange={e=>setMessage(e.target.value)}/></label>
        {capture&&<p role="status">{zh?'擷取畫面中…':'Capturing workspace…'}</p>}
        {screenshot&&<div className="screenshot-review"><img src={screenshot} alt={zh?'將傳送的工作區截圖':'Workspace screenshot to be sent'}/><button type="button" onClick={()=>{setScreenshot(null);request.current=null;}}>{zh?'移除截圖':'Remove screenshot'}</button></div>}
        {diagnostics&&<details><summary>{zh?'檢視診斷記錄':'Review diagnostic log'}</summary><pre>{JSON.stringify(diagnostics,null,2)}</pre><button type="button" onClick={()=>{setDiagnostics(null);request.current=null;}}>{zh?'移除診斷':'Remove diagnostics'}</button></details>}
        <p className="muted">{zh?'內容、保留的截圖／診斷與已儲存的姓名、學號、系所、班級、學校信箱及手機號碼將寄至 support@coursedock.app。未收集密碼、權杖或原始主控台記錄。':'Your description, retained screenshot/diagnostics, and saved name, student ID, department, class, school email and mobile number go to support@coursedock.app. Passwords, tokens, and raw console logs are not collected.'}</p><button className="primary" type="submit">{busy?(zh?'傳送中…':'Sending…'):(zh?'傳送回報':'Send report')}</button></fieldset><p role="status">{status}</p>
      </form></dialog>}{success&&<SubmissionConfirmation zh={zh} onClose={()=>setSuccess(false)}/>}
  </>;
}
