export function AboutSystem({zh}:{zh:boolean}){
 const t=(en:string,cn:string)=>zh?cn:en;
 const updates=[{date:'2026-10-13',changes:[
  t('Semester credit totals and required/elective course types.','學期學分總計與必修／選修課程類型。'),
  t('Assignment tables with three statuses, descriptions, attachments and calendar detail popups.','作業表格支援三種狀態、說明、附件及月曆詳情視窗。'),
  t('Course resource folders, nested subfolders, file moves and local PDF/Office previews.','課程資源資料夾、子資料夾、檔案移動與本機 PDF／Office 預覽。'),
  t('Editable timetable import, live clock/current class, school calendar PDFs and submission confirmations.','可編輯課表匯入、即時時鐘與目前課程、學校行事曆 PDF 及送出確認視窗。'),
  t('Student ID format validation and a simpler first timetable import.','學號格式驗證與更簡潔的首次課表匯入流程。'),
 ]},{date:'2026-10-10',changes:[
  t('Google, GitHub and email sign-in with required student profiles.','Google、GitHub 與電子郵件登入，以及必填學生資料。'),
  t('English/Traditional Chinese, remembered appearance, private course/planner sync and workspace export.','英文／繁體中文、記憶外觀設定、私人課程與行事紀錄同步及工作區匯出。'),
  t('Contact support and beta bug reports.','聯絡客服與 Beta 問題回報。'),
 ]}];
 return <section className="about-system" aria-labelledby="about-system-title"><h2 id="about-system-title">{t('About CourseDock','關於 CourseDock')}</h2><dl className="system-version"><dt>{t('System version','系統版本')}</dt><dd>{__APP_VERSION__} <span className="muted">Beta</span></dd></dl><p className="muted">{t('CourseDock is in beta testing. Some features may have issues.','CourseDock 正在 Beta 測試中，部分功能可能出現問題。')}</p><h3>{t('Changelog','更新紀錄')}</h3>{updates.map((update,i)=><details key={update.date} className="changelog-entry" open={i===0}><summary><time dateTime={update.date}>{new Intl.DateTimeFormat(zh?'zh-TW':'en-GB',{timeZone:'Asia/Taipei',year:'numeric',month:'long',day:'numeric'}).format(new Date(update.date+'T12:00:00+08:00'))}</time>{i===0&&<span className="muted"> · {t('Latest changes','最新更新')}</span>}</summary><ul>{update.changes.map(change=><li key={change}>{change}</li>)}</ul></details>)}</section>;
}
