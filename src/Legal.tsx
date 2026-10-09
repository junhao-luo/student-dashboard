import { useEffect, useState, useRef } from 'react';

const pages = ['privacy','terms','data-privacy'] as const;
export function LegalPages({zh=false,name='CourseDock'}:{zh?:boolean;name?:string}) {
  const [page,setPage]=useState(location.hash.slice(1));
  useEffect(()=>{const change=()=>setPage(location.hash.slice(1));window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);},[]);
  const t=(en:string,cn:string)=>zh?cn:en;
  const titles={'privacy':t('Privacy policy','隱私政策'),'terms':t('Terms and conditions','使用條款'),'data-privacy':t('Your data and privacy','資料與隱私')};
  const selected=pages.includes(page as typeof pages[number])?page as typeof pages[number]:null;
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{if(selected)dialog.current?.showModal();},[selected]);
  return <>
    <footer className="legal-footer"><span>© {new Date().getFullYear()} {name}. {t('User content belongs to its owners.','使用者內容歸其權利人所有。')}</span><nav aria-label={t('Legal information','法律資訊')}>{pages.map(p=><a key={p} href={`#${p}`}>{titles[p]}</a>)}</nav></footer>
    {selected&&<dialog ref={dialog} className="legal-overlay" onCancel={()=>{location.hash='';}} aria-labelledby="legal-title"><article className="legal-document"><button className="legal-close" onClick={()=>{location.hash='';}}>{t('Back to workspace','返回工作區')}</button><h1 id="legal-title">{titles[selected]}</h1><p className="muted">{t('Updated October 9, 2026 · Local development preview','更新日期：2026 年 10 月 9 日 · 本機開發預覽')}</p>
      {selected==='privacy'&&<>
        <h2>{t('What this preview stores','此預覽儲存的資料')}</h2><p>{t('Course details, notes, class meetings, deadlines, resource links, uploaded resource files, and your settings are saved in this browser to run your study workspace. Account sign-in, student profiles, cloud sync, and reminder emails are not connected.','課程資料、筆記、上課時間、作業期限、資源連結、上傳的資源檔案及設定儲存在此瀏覽器，用於提供學習工作區。帳號登入、學生資料、雲端同步與提醒郵件尚未連接。')}</p>
        <h2>{t('Where data goes','資料傳送方式')}</h2><p>{t('This preview does not send your notes or uploads to an app server. Timetable PDFs are read on this device; the source PDF is discarded after review. Imported class details are saved when you confirm. Resource files remain in browser storage until deleted. No analytics or advertising trackers are installed.','此預覽不會將筆記或上傳檔案傳送到應用程式伺服器。課表 PDF 在裝置上讀取，預覽結束後不保留原始 PDF；確認後儲存匯入的課程資料。資源檔案保留在瀏覽器中直到刪除。未安裝分析或廣告追蹤工具。')}</p>
        <h2>{t('External services','外部服務')}</h2><p>{t('Opening the school calendar loads a Google Calendar embed. Google receives a connection from your browser and applies its own privacy policy. Opening resource links takes you to the linked provider. External providers may use cookies independently of this app.','開啟學校行事曆時會載入 Google Calendar 嵌入內容。Google 會收到瀏覽器連線並適用其隱私政策。資源連結會開啟相應網站，外部服務可能自行使用 Cookie。')}</p><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">{t('Google privacy policy','Google 隱私政策')}</a>
        <h2>{t('Before account services launch','帳號服務推出前')}</h2><p>{t('This notice must be updated with the operator’s identity and privacy contact, active providers, retention periods, and the process for data requests before public account services launch. This preview is not a claim of legal compliance.','公開推出帳號服務前，須補充營運者身分、隱私聯絡方式、實際服務供應商、保存期限及資料申請流程。此預覽不代表已完成法律合規審查。')}</p>
      </>}
      {selected==='terms'&&<>
        <h2>{t('Using the workspace','使用工作區')}</h2><p>{t(`${name} is an independent student planning project. It is not an official Feng Chia University or MyFCU service. Check important dates against official university information.`,`${name} 是獨立的學生規劃專案，並非逢甲大學或 MyFCU 官方服務。重要日期請以學校公告為準。`)}</p>
        <h2>{t('Your files and content','檔案與內容')}</h2><p>{t('You keep ownership of your notes and uploads. Only add content you may use. Do not upload others’ personal data without permission, distribute infringing materials, or attempt to disrupt the service. Third-party files, trademarks, and software remain subject to their owners’ rights and licenses.','筆記及上傳內容的權利仍歸您所有。請僅新增您有權使用的內容，未經許可不得上傳他人個資、散布侵權資料或破壞服務。第三方檔案、商標與軟體仍適用各自的權利及授權。')}</p>
        <h2>{t('Preview limitations','預覽限制')}</h2><p>{t('This is a free development preview. Availability and data recovery are not guaranteed. Browser storage can be cleared or lost. Keep separate copies of important notes and files. PDF imports need your review; only the supported one-page MyFCU grid is currently recognized.','此版本為免費開發預覽，不保證持續可用或資料復原。瀏覽器儲存可能被清除或遺失，重要筆記與檔案請另行備份。PDF 匯入須經您確認，目前僅支援單頁 MyFCU 課表格式。')}</p>
      </>}
      {selected==='data-privacy'&&<>
        <h2>{t('Your controls','您的資料控制')}</h2><p>{t('You can edit or delete courses, notes, deadlines, classes and resources in their views. Download attachments from notes or Resources, or export the complete browser workspace as a ZIP in Settings. The ZIP contains private data; store it securely. Account deletion will become available when accounts are connected.','您可在各頁面編輯或刪除課程、筆記、作業期限、課表與資源。在筆記或資源頁下載附件，或於設定匯出完整瀏覽器工作區 ZIP。ZIP 含私人資料，請安全保存。帳號連接後才會提供帳號刪除功能。')}</p>
        <h2>{t('Clear this device','清除此裝置資料')}</h2><p>{t('To remove all preview data, clear this site’s storage in your browser settings. This permanently removes the local workspace and uploaded files. It does not remove copies you already downloaded. Save important files elsewhere first.','若要移除全部預覽資料，請在瀏覽器設定清除此網站的儲存資料。這會永久移除本機工作區及上傳檔案，不會刪除已下載的副本。請先另外保存重要檔案。')}</p>
        <h2>{t('Shared devices','共用裝置')}</h2><p>{t('Anyone using this browser profile can open the local workspace. This preview has no account access protection or app-level encryption. Use your own device and do not enter sensitive student-profile information yet.','使用同一瀏覽器設定檔的人可開啟本機工作區。此預覽尚無帳號存取保護或應用程式層級加密。請使用自己的裝置，暫勿填入敏感的學生個人資料。')}</p>
      </>}
    </article></dialog>}
  </>;
}
