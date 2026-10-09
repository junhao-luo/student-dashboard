import {useState} from 'react';
import {getFile,type Workspace} from './storage';
import {LoadingState} from './Interface';
export function DataExport({workspace,zh}:{workspace:Workspace;zh:boolean}){
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const t=(en:string,cn:string)=>zh?cn:en;
  async function download(){
    setBusy(true);setError('');
    try{
      const {exportWorkspace,downloadBlob}=await import('./export');
      const bytes=await exportWorkspace(structuredClone(workspace),getFile);
      downloadBlob(new Blob([new Uint8Array(bytes).buffer],{type:'application/zip'}),`workspace-${new Date().toISOString().slice(0,10)}.zip`);
    }catch(e){setError(t(e instanceof Error?e.message:'Could not export. Try again.','無法匯出。請確認檔案仍在此瀏覽器，且資料未超過匯出處理上限，再重試。'));}
    finally{setBusy(false);}
  }
  return <section className="data-controls"><h2>{t('Your data','您的資料')}</h2><p className="muted">{t('Download all semesters, records, note blocks, Markdown copies and original attachments from this browser. The ZIP contains private data; keep it somewhere safe.','下載此瀏覽器內所有學期、紀錄、筆記區塊、Markdown 副本與原始附件。ZIP 含私人資料，請妥善保存。')}</p><button disabled={busy} onClick={()=>void download()}>{t('Export workspace ZIP','匯出工作區 ZIP')}</button>{busy&&<LoadingState compact zh={zh} label={t('Preparing export…','正在準備匯出…')}/>}<p role="alert" className="error">{error}</p></section>;
}
