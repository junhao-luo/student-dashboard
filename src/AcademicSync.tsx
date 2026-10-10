import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {useAction} from 'convex/react';
import {makeFunctionReference} from 'convex/server';
import type {accountStorage,Workspace,SyncState} from './storage';
import {academicData,emptyAcademic,type AcademicData,type AcademicSnapshot} from './academic';
import {synchronizedStorage,type AcademicTransport} from './academic-storage';
import {LoadingState} from './Interface';
type Storage=ReturnType<typeof accountStorage>;
const SyncNoticeContext=createContext<ReactNode>(null);
export function useAcademicSyncNotice(){return useContext(SyncNoticeContext);}
export function AcademicSync({storage,render}:{storage:Storage;render:(storage:Storage)=>ReactNode}){
 const get=useAction(makeFunctionReference<'action',{},AcademicSnapshot|null>('academic:get'));
 const save=useAction(makeFunctionReference<'action',{revision:number;requestId:string;data:AcademicData},AcademicSnapshot>('academic:save'));
 const transport=useMemo(()=>({get:()=>get({}),save}),[get,save]);
 return <AcademicSyncReview storage={storage} render={render} transport={transport}/>;
}
export function AcademicSyncReview({storage,render,transport}:{storage:Storage;render:(storage:Storage)=>ReactNode;transport:AcademicTransport}){
 const {get,save}=transport;
 const [review,setReview]=useState<{local?:Workspace;state?:SyncState;cloud:AcademicSnapshot|null}>();
 const [ready,setReady]=useState<'local'|AcademicSnapshot>();
 const [busy,setBusy]=useState(false),[owned,setOwned]=useState(false),[error,setError]=useState(''),[stopped,setStopped]=useState(false);
 const zh=review?.local?.lang==='zh'||document.documentElement.lang.startsWith('zh');
 const t=(en:string,cn:string)=>zh?cn:en;
 useEffect(()=>{let active=true;
  void(async()=>{
   const [local,state]=await Promise.all([storage.loadWorkspace(),storage.syncState()]);
   if(state?.mode==='local'){if(active)setReady('local');return;}
   // Review the older device workspace before offering any cloud import.
   if(!local&&await storage.legacySummary()){if(active)setReady('local');return;}
   const cloud=await get();if(!active)return;
   if(state?.mode==='cloud'&&!state.pending&&cloud){setReady(cloud);return;}
   setReview({local,state,cloud});
  })().catch(()=>{if(active)setError('LOAD_FAILED');});
  return()=>{active=false;};
 },[storage,get]);
 const effective=useMemo(()=>typeof ready==='object'?synchronizedStorage(storage,transport,ready,()=>setStopped(true)):storage,[storage,ready,transport]);
 if(ready)return <SyncNoticeContext.Provider value={<div className="sync-banner" role={stopped?'alert':'status'}>{ready==='local'?t('Academic records are local to this device.','學習紀錄目前儲存於此裝置。'):stopped?t('Cloud sync stopped. Your draft is kept on this device. Reload to review before retrying.','雲端同步已停止，草稿保留於此裝置。請重新載入並檢查後再試。'):t('Courses and planner sync to your account. Notes and files stay on this device. Other devices load updates when reopened.','課程與行事紀錄已連結帳號；筆記及檔案仍留在此裝置。其他裝置重新開啟時會載入更新。')}{(stopped||ready==='local')&&<button onClick={async()=>{if(!stopped)await storage.setSyncState(undefined);location.reload();}}>{t('Review sync','檢查同步')}</button>}</div>}>{render(effective)}</SyncNoticeContext.Provider>;
 if(!review&&!error)return <LoadingState/>;
 if(!review)return <main className="local-import-page"><h1>{t('Could not connect to academic storage','無法連線至學習資料庫')}</h1><p>{t('Your local records have not been replaced. Try again after checking your connection.','本機紀錄尚未被取代。請檢查連線後再試。')}</p><button onClick={()=>location.reload()}>{t('Try again','重試')}</button></main>;
 const data=review.local?academicData(review.local):emptyAcademic();
 return <main className="local-import-page"><h1>{t('Connect your courses and planner','連結課程與行事紀錄')}</h1>
  <p>{t('Review before uploading. Only semesters, courses, assignments, exams and weekly classes will sync. Notes, resources and file bytes remain local. IDs and relationships are preserved.','請先檢查再上傳。僅同步學期、課程、作業、考試與每週課表；筆記、資源及檔案仍保留於本機，原有 ID 與關聯會保留。')}</p>
  <p>{t('On this device','此裝置')}: {data.courses.length} {t('courses','門課程')}, {data.tasks.length} {t('deadlines','項作業／考試')}, {data.meetings.length} {t('classes','個上課時段')}.</p>
  {review.cloud&&<p>{t('In your account','帳號雲端')}: {review.cloud.data.courses.length} {t('courses','門課程')}, {review.cloud.data.tasks.length} {t('deadlines','項作業／考試')}, {review.cloud.data.meetings.length} {t('classes','個上課時段')}.</p>}
  {review.state?.pending&&<p>{t('An earlier save did not finish. Retry the pending request, then publish this device’s draft. A newer cloud revision will stop the retry instead of being overwritten.','先前儲存未完成。重試會先完成待處理請求，再上傳此裝置草稿。若雲端已有較新版本，系統會停止重試，不會覆寫。')}</p>}
  <p>{t('Using cloud records preserves a local backup of the previous workspace. Export your data before switching if you need a portable copy.','使用雲端紀錄前會在本機保留原工作區備份；需要可攜式副本時，請先匯出資料。')}</p>
  <label className="legacy-ownership"><input type="checkbox" checked={owned} onChange={e=>setOwned(e.target.checked)} disabled={busy}/>{t('I reviewed these records and they belong to me.','我已檢查這些紀錄，且資料屬於我。')}</label>
  <div className="form-actions"><button disabled={busy} onClick={async()=>{await storage.setSyncState({mode:'local'});setReady('local');}}>{t('Keep this workspace local','繼續使用本機工作區')}</button>
   {(!review.cloud||review.state?.pending)&&<button className="primary" disabled={!owned||busy} onClick={async()=>{
    setBusy(true);setError('');try{
     await storage.backupBeforeSync(review.local);
     let cloud=review.cloud;
     if(review.state?.pending)cloud=await save(review.state.pending);
     if(!cloud||JSON.stringify(cloud.data)!==JSON.stringify(data)){
      const pending={revision:cloud?.revision??0,requestId:crypto.randomUUID(),data};
      await storage.setSyncState({mode:'cloud',pending});cloud=await save(pending);
     }
     await storage.setSyncState({mode:'cloud'});setReady(cloud!);
    }catch{setError('SAVE_FAILED');}finally{setBusy(false);}
   }}>{review.state?.pending?t('Retry this draft','重試此草稿'):t('Import and enable sync','匯入並啟用同步')}</button>}
   {review.cloud&&<button disabled={!owned||busy} onClick={async()=>{setBusy(true);try{await storage.backupBeforeSync(review.local);await storage.setSyncState({mode:'cloud'});setReady(review.cloud!);}catch{setError('SAVE_FAILED');}finally{setBusy(false);}}}>{t('Use account’s cloud records','使用帳號雲端紀錄')}</button>}
  </div>{error&&<p className="error" role="alert">{t('Could not sync. A newer cloud revision, invalid records or a connection problem may need review. Your local records remain available.','無法同步。請檢查較新的雲端版本、資料格式或網路連線；本機紀錄仍保留。')}</p>}
 </main>;
}
