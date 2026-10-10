import {useState} from 'react';
import {Select} from './Interface';
import {fcuPrograms} from './fcu-programs';
import {normalizeStudentProfile,type StudentProfile,type StudentProfileInput} from './student-profile';

const programs:readonly string[]=[...fcuPrograms.undergraduate,...fcuPrograms.graduate];
const CUSTOM='__custom__';

export function StudentProfileForm({zh,profile,onSave}:{zh:boolean;profile:StudentProfile|null;onSave:(value:StudentProfileInput)=>Promise<void>}) {
  const [department,setDepartment]=useState(profile?.department?(programs.includes(profile.department)?profile.department:CUSTOM):'');
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
  return <form className="student-profile" onSubmit={async event=>{
    event.preventDefault();if(busy)return;
    const data=new FormData(event.currentTarget);
    const input={name:String(data.get('name')??''),studentId:String(data.get('studentId')??''),department:department===CUSTOM?String(data.get('customDepartment')??''):department,className:String(data.get('className')??''),phone:String(data.get('phone')??'')};
    const normalized=normalizeStudentProfile(input);
    setError('');setSaved(false);
    if(!normalized){setError(zh?'請填寫所有資料。手機號碼格式為 09xxxxxxxx 或 +8869xxxxxxxx。':'Complete every field. Use 09xxxxxxxx or +8869xxxxxxxx for your mobile number.');return;}
    setBusy(true);
    const {schoolEmail:_,...value}=normalized;
    try{await onSave(value);setSaved(true);}catch{setError(zh?'無法儲存。請檢查資料與連線，稍後再試。':'Could not save. Check the fields and connection, then try again.');}finally{setBusy(false);}
  }}>
    <h1 className="profile-heading">{profile?(zh?'學生資料':'Student profile'):(zh?'完成學生資料':'Complete your student profile')}</h1>
    {!profile&&<p>{zh?'所有註冊方式都需完成以下資料，才能開啟工作區。':'Complete your student details to open the workspace, whichever sign-up method you used.'}</p>}
    <fieldset className="profile-fields" disabled={busy}>
      <label>{zh?'姓名':'Name'}<input name="name" defaultValue={profile?.name??''} required maxLength={120} autoComplete="name"/></label>
      <div className="profile-field"><label>{zh?'學號':'Student ID'}<input name="studentId" defaultValue={profile?.studentId??''} required maxLength={30} pattern="[A-Za-z0-9_]{1,30}" autoComplete="off" aria-describedby="school-email-hint"/></label><small id="school-email-hint" className="muted">{zh?'學校信箱自動使用：學號@o365.fcu.edu.tw':'School email is generated as studentID@o365.fcu.edu.tw.'}</small></div>
      <div className="department-field">
        <label>{zh?'系所 / 學程':'Department / program'}<Select aria-label={zh?'系所 / 學程':'Department / program'} aria-required="true" name="department" value={department} onChange={e=>setDepartment(e.target.value)} search={{label:zh?'搜尋系所或學程':'Search departments or programs',placeholder:zh?'輸入名稱關鍵字':'Search by the official Chinese name',empty:zh?'找不到符合的學程，可新增自訂學程。':'No matching program. You can add a custom program.',alwaysVisible:[CUSTOM]}}><option value="" disabled>{zh?'選擇系所或學程':'Choose a department or program'}</option>{programs.map(name=><option key={name} value={name}>{name}</option>)}<option value={CUSTOM}>{zh?'新增自訂學程':'Add custom program'}</option></Select></label>
        {department===CUSTOM&&<label>{zh?'自行輸入系所 / 學程':'Custom department / program'}<input name="customDepartment" required maxLength={120} defaultValue={profile&&!programs.includes(profile.department)?profile.department:''} autoComplete="off"/></label>}
      </div>
      <label>{zh?'班級':'Class'}<input name="className" defaultValue={profile?.className??''} required maxLength={120} autoComplete="off"/></label>
      <div className="profile-field"><label>{zh?'手機號碼':'Mobile number'}<input name="phone" defaultValue={profile?.phone??''} type="tel" inputMode="tel" required maxLength={13} pattern="(09[0-9]{8}|\+8869[0-9]{8})" placeholder="0912345678" autoComplete="tel" aria-describedby="phone-hint" title={zh?'09 開頭的 10 位數，或 +8869 開頭的 13 個字元，不含空格或連字號。':'10 digits starting with 09, or +886 followed by 9 digits. No spaces or hyphens.'}/></label><small id="phone-hint" className="muted">{zh?'09xxxxxxxx 或 +8869xxxxxxxx，不含空格或連字號。':'09xxxxxxxx or +8869xxxxxxxx, without spaces or hyphens.'}</small></div>
    </fieldset>
    {error&&<p className="error" role="alert">{error}</p>}{saved&&<p role="status">{zh?'學生資料已儲存至帳號。':'Student profile saved to your account.'}</p>}
    <button className="primary" disabled={busy}>{busy?(zh?'正在儲存…':'Saving…'):profile?(zh?'儲存學生資料':'Save student profile'):(zh?'儲存並開啟工作區':'Save and open workspace')}</button>
  </form>;
}
