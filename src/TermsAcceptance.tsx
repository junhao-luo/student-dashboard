import {useEffect,useState,type ReactNode} from 'react';
import {useAction} from 'convex/react';
import {makeFunctionReference} from 'convex/server';
export function SignUpConsent({zh,children}:{zh:boolean;children:ReactNode}){
 const [accepted,setAccepted]=useState(false),[adult,setAdult]=useState(false);
 return <section className="consent-checks"><label className="consent-row"><input type="checkbox" checked={adult} onChange={e=>setAdult(e.target.checked)}/><span>{zh?'我已年滿 18 歲。':'I am at least 18 years old.'}</span></label><label className="consent-row"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/><span>{zh?'我同意':'I agree to the'} <a href="#terms">{zh?'使用條款':'Terms of Service'}</a> {zh?'並已閱讀':'and have read the'} <a href="#privacy">{zh?'隱私政策':'Privacy Policy'}</a>{zh?'。':'.'}</span></label>{accepted&&adult?children:<p>{zh?'請先確認上述項目以繼續註冊。':'Confirm both items to continue signing up.'}</p>}</section>;
}
export function TermsAcceptance({zh,children}:{zh:boolean;children:ReactNode}){
 const get=useAction(makeFunctionReference<'action',{},boolean>('consent:get'));
 const accept=useAction(makeFunctionReference<'action',{accepted:boolean;adult:boolean},null>('consent:accept'));
 const [ready,setReady]=useState(false),[terms,setTerms]=useState(false),[adult,setAdult]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(false);
 useEffect(()=>{let active=true;void get({}).then(value=>{if(active)setReady(value);}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[get]);
 if(ready)return <>{children}</>;
 return <form className="consent-panel" onSubmit={async e=>{e.preventDefault();if(!terms||!adult)return;setBusy(true);setError(false);try{await accept({accepted:terms,adult});setReady(true);}catch{setError(true);}finally{setBusy(false);}}}><h1>{zh?'使用條款與隱私':'Terms and privacy'}</h1><p>{zh?'啟用帳號前，請閱讀政策並確認。版本：2026-11-01。此同意不包含行銷郵件。':'Before activating your workspace, review these policies. Version: 2026-11-01. This does not opt you into marketing.'}</p><label className="consent-row"><input type="checkbox" required checked={adult} onChange={e=>setAdult(e.target.checked)}/><span>{zh?'我已年滿 18 歲。':'I am at least 18 years old.'}</span></label><label className="consent-row"><input type="checkbox" required checked={terms} onChange={e=>setTerms(e.target.checked)}/><span>{zh?'我同意':'I agree to the'} <a href="#terms">{zh?'使用條款':'Terms of Service'}</a> {zh?'並確認已閱讀':'and acknowledge the'} <a href="#privacy">{zh?'隱私政策':'Privacy Policy'}</a>{zh?'。':'.'}</span></label><button className="primary" disabled={!terms||!adult||busy}>{zh?'同意並繼續':'Agree and continue'}</button>{error&&<p role="alert">{zh?'無法確認或儲存同意，請重新載入再試。':'Could not check or save acceptance. Reload and try again.'}</p>}</form>;
}
