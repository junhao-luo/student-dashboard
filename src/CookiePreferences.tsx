import {useEffect,useState,type ReactNode} from 'react';
const key='coursedock-cookie-preferences-v1';
function preference():boolean|null{try{const value=localStorage.getItem(key);return value==='allow'?true:value==='reject'?false:null;}catch{return null;}}
function save(allow:boolean){try{localStorage.setItem('coursedock-cookie-preferences-v1',allow?'allow':'reject');}catch{}window.dispatchEvent(new Event('cookie-preferences'));}
export function CookiePreferences({zh}:{zh:boolean}){
 const [choice,setChoice]=useState(preference),[open,setOpen]=useState(false);
 useEffect(()=>{const update=()=>setChoice(preference());window.addEventListener('cookie-preferences',update);return()=>window.removeEventListener('cookie-preferences',update);},[]);
 const t=(en:string,cn:string)=>zh?cn:en;
 const visible=choice===null||open;
 return <section className="cookie-preferences" aria-label={t('Cookie preferences','Cookie 偏好設定')}>{!visible&&<button className="cookie-trigger" onClick={()=>setOpen(true)}>{t('Cookie preferences','Cookie 偏好設定')}</button>}{visible&&<div className="cookie-notice" role="region" aria-labelledby="cookie-title"><h2 id="cookie-title">{t('Your privacy choices','您的隱私選擇')}</h2><p>{t('We use essential storage for sign-in and your workspace. Google Calendar loads only with your permission. No advertising or analytics trackers are added.','我們使用必要儲存來提供登入與工作區。Google 行事曆只會在您允許後載入；未加入廣告或分析追蹤工具。')}</p><p className="cookie-detail">{t('You can change your choice anytime.','您可隨時變更選擇。')}</p><div className="cookie-actions"><button onClick={()=>{save(false);setOpen(false);}}>{t('Essential only','僅使用必要項目')}</button><button onClick={()=>{save(true);setOpen(false);}}>{t('Allow calendar','允許行事曆')}</button></div></div>}</section>;
}
export function OptionalCalendar({zh,children}:{zh:boolean;children:ReactNode}){
 const [allowed,setAllowed]=useState(preference()===true);
 useEffect(()=>{const update=()=>setAllowed(preference()===true);window.addEventListener('cookie-preferences',update);return()=>window.removeEventListener('cookie-preferences',update);},[]);
 return allowed?<>{children}</>:<section><p>{zh?'Google 行事曆尚未載入。允許後 Google 將收到您的連線資訊，並可能使用自己的 Cookie。':'Google Calendar is blocked. Allowing it sends connection information to Google, which may use its own cookies.'}</p><button onClick={()=>save(true)}>{zh?'允許並載入行事曆':'Allow and load calendar'}</button></section>;
}
