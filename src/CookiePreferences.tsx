import {useEffect,useState,type ReactNode} from 'react';
const key='coursedock-cookie-preferences-v1';
function preference():boolean|null{try{const value=localStorage.getItem(key);return value==='allow'?true:value==='reject'?false:null;}catch{return null;}}
function save(allow:boolean){try{localStorage.setItem('coursedock-cookie-preferences-v1',allow?'allow':'reject');}catch{}window.dispatchEvent(new Event('cookie-preferences'));}
export function CookiePreferences({zh}:{zh:boolean}){
 const [choice,setChoice]=useState(preference),[open,setOpen]=useState(false);
 useEffect(()=>{const update=()=>setChoice(preference());window.addEventListener('cookie-preferences',update);return()=>window.removeEventListener('cookie-preferences',update);},[]);
 const t=(en:string,cn:string)=>zh?cn:en;
 return <section className="cookie-preferences" aria-label={t('Cookie preferences','Cookie 偏好設定')}><button onClick={()=>setOpen(!open)}>{t('Cookie preferences','Cookie 偏好設定')}</button>{(choice===null||open)&&<div role="region" aria-label={t('Choose optional content','選擇選用內容')}><p>{t('Sign-in uses essential cookies and local storage. Optional Google Calendar content stays blocked unless you allow it. CourseDock adds no advertising or analytics trackers. Your choice can be changed here.','登入使用必要 Cookie 與本機儲存。選用的 Google 行事曆內容在取得允許前不會載入。CourseDock 未加入廣告或分析追蹤工具，可隨時於此變更選擇。')}</p><button onClick={()=>{save(false);setOpen(false);}}>{t('Reject optional content','拒絕選用內容')}</button><button onClick={()=>{save(true);setOpen(false);}}>{t('Allow Google Calendar','允許 Google 行事曆')}</button></div>}</section>;
}
export function OptionalCalendar({zh,children}:{zh:boolean;children:ReactNode}){
 const [allowed,setAllowed]=useState(preference()===true);
 useEffect(()=>{const update=()=>setAllowed(preference()===true);window.addEventListener('cookie-preferences',update);return()=>window.removeEventListener('cookie-preferences',update);},[]);
 return allowed?<>{children}</>:<section><p>{zh?'Google 行事曆尚未載入。允許後 Google 將收到您的連線資訊，並可能使用自己的 Cookie。':'Google Calendar is blocked. Allowing it sends connection information to Google, which may use its own cookies.'}</p><button onClick={()=>save(true)}>{zh?'允許並載入行事曆':'Allow and load calendar'}</button></section>;
}
