import {createContext,useContext,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {accountStorage} from './storage';
import {AcademicSync} from './AcademicSync';

const StorageContext=createContext<ReturnType<typeof accountStorage>|null>(null);
export function LocalWorkspaceProvider({account,children}:{account:string;children:ReactNode}) {
  const storage=useMemo(()=>accountStorage(account),[account]);
  return <AcademicSync storage={storage} render={effective=><StorageContext.Provider value={effective}>{children}</StorageContext.Provider>}/>;
}
export function useWorkspaceStorage(){
  const storage=useContext(StorageContext);
  if(!storage)throw Error('Workspace storage requires a signed-in account.');
  return storage;
}
export function LegacyImport({zh,onImported,onSkip}:{zh:boolean;onImported:()=>void;onSkip?:()=>void}) {
  const storage=useWorkspaceStorage();
  const [summary,setSummary]=useState<Awaited<ReturnType<typeof storage.legacySummary>>>();
  const [owned,setOwned]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const errorMessage=useRef<HTMLParagraphElement>(null);
  useEffect(()=>{if(error)errorMessage.current?.focus();},[error]);
  const t=(en:string,cn:string)=>zh?cn:en;
  useEffect(()=>{let active=true;void storage.legacySummary().then(value=>{if(active)setSummary(value);}).catch(()=>{if(active)setError(zh?'無法檢查先前的工作區。':'Could not review the previous workspace.');});return()=>{active=false;};},[storage,zh]);
  if(!summary&&!error)return null;
  return <section className="legacy-import"><h2>{t('Previous workspace on this device','此裝置先前的工作區')}</h2>
    <p>{t('Older browser data has no account owner. Import it only if it belongs to you. This copies records and attachments into your local account workspace; it does not upload them to the cloud.','舊瀏覽器資料尚未指定帳號。請只匯入屬於您的資料；這會將紀錄及附件複製到您帳號的本機工作區，不會上傳至雲端。')}</p>
    {summary&&<><dl className="legacy-counts">{([
      ['courses','Courses','課程'],['notes','Notes','筆記'],['tasks','Deadlines','作業與考試'],['meetings','Class meetings','上課時段'],['resources','Resources','資源'],['folders','Folders','資料夾'],
    ] as const).map(([key,en,cn])=><div key={key}><dt>{t(en,cn)}</dt><dd>{summary[key]}</dd></div>)}</dl>
    <p className="muted">{t('Import requires an empty account workspace. Originals stay on this device. Once imported, this shared copy cannot be claimed by another account.','匯入需要空白的帳號工作區。原始資料會保留於此裝置；匯入後，其他帳號無法再次領取這份共用副本。')}</p>
    <label className="legacy-ownership"><input type="checkbox" name="legacyOwnership" autoComplete="off" checked={owned} onChange={e=>setOwned(e.target.checked)} disabled={busy}/>{t('These records and attachments belong to me.','這些紀錄及附件屬於我。')}</label>
    <div className="form-actions">{onSkip&&<button disabled={busy} onClick={onSkip}>{t('Start with an empty workspace','從空白工作區開始')}</button>}<button className="primary" disabled={!owned||busy} onClick={async()=>{
      setBusy(true);setError('');try{await storage.importLegacy();onImported();}catch{setError(t('Import stopped. Your account must be empty, all attachments must be available, and the original data must be unclaimed. No partial copy was saved.','匯入已停止。帳號工作區須為空白、所有附件須完整，且舊資料尚未被領取；未儲存任何不完整的副本。'));}finally{setBusy(false);}
    }}>{busy?t('Importing…','正在匯入…'):t('Import into this account','匯入至此帳號')}</button></div></>}
    {error&&<p ref={errorMessage} tabIndex={-1} role="alert" className="error">{error}</p>}
  </section>;
}
