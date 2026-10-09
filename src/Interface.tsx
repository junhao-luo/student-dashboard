import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Upload, AlertCircle } from 'lucide-react';
import { LegalPages } from './Legal';

export function Dropdown({label,icon,active=false,children}:{label:string;icon?:React.ReactNode;active?:boolean;children:React.ReactNode}) {
  const [open,setOpen]=useState(false);
  const root=useRef<HTMLDivElement>(null);
  const id=useId();
  useEffect(()=>{const close=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[]);
  function dismiss(){setOpen(false);root.current?.querySelector<HTMLButtonElement>('.dropdown-trigger')?.focus();}
  return <div className="custom-select navigation-dropdown" ref={root} onKeyDown={e=>{
    if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();dismiss();}
    if((e.key==='ArrowDown'||e.key==='ArrowUp')&&e.target===root.current?.querySelector('.dropdown-trigger')){e.preventDefault();setOpen(true);setTimeout(()=>root.current?.querySelector<HTMLButtonElement>('.navigation-menu button')?.focus(),0);}
  }} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}}>
    <button type="button" className={`select-trigger dropdown-trigger ${active?'active':''}`} aria-label={label} aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>{icon}<span>{label}</span><ChevronDown size={16} aria-hidden="true"/></button>
    {open&&<div id={id} className="select-menu navigation-menu" role="dialog" aria-label={label} onClick={e=>{const button=(e.target as Element).closest('button');if(button&&!button.closest('summary')&&!button.matches('[role=combobox],[role=option]'))dismiss();}}>{children}</div>}
  </div>;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const native = useRef<HTMLSelectElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(props.value ?? props.defaultValue ?? ''));
  const [options, setOptions] = useState<{value:string; text:string; disabled:boolean}[]>([]);
  const [label, setLabel] = useState('');
  useEffect(() => {
    const items = Array.from(native.current?.options ?? []).map(o => ({value:o.value,text:o.text,disabled:o.disabled}));
    setOptions(items);
    setLabel(Array.from(native.current?.labels?.[0]?.childNodes ?? []).filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join(' ').trim());
    if (props.value === undefined) setValue(native.current?.value ?? '');
  }, [props.children, props.value]);
  useEffect(() => {
    const close = (e: PointerEvent) => {if (!root.current?.contains(e.target as Node)) setOpen(false);};
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown',close);
  }, []);
  const current = String(props.value ?? value);
  function choose(next:string) {
    setValue(next);
    if (native.current) {
      native.current.value=next;
      props.onChange?.({target:native.current,currentTarget:native.current} as React.ChangeEvent<HTMLSelectElement>);
    }
    setOpen(false);
    root.current?.querySelector('button')?.focus();
  }
  return <div className="custom-select" ref={root}>
    <select {...props} ref={native} value={current || undefined} defaultValue={undefined} onChange={e=>{setValue(e.target.value);props.onChange?.(e);}} className="select-backing" tabIndex={-1} aria-hidden="true" />
    <button type="button" role="combobox" className="select-trigger" disabled={props.disabled} aria-label={props['aria-label'] ?? label} aria-haspopup="listbox" aria-expanded={open} aria-controls={id} onClick={e=>{e.preventDefault();setOpen(!open);}} onKeyDown={e=>{
      if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();setOpen(false);}
      if(e.key==='Tab')setOpen(false);
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setOpen(true);setTimeout(()=>root.current?.querySelector<HTMLButtonElement>('[role=option][aria-selected=true]')?.focus(),0);}
    }}>{options.find(o=>o.value===current)?.text ?? options[0]?.text}<ChevronDown size={16}/></button>
    {open && <div id={id} role="listbox" className="select-menu" aria-label={props['aria-label'] ?? 'Options'}>{options.map((o,i)=><button key={o.value} type="button" role="option" disabled={o.disabled} aria-selected={o.value===current} onClick={e=>{e.preventDefault();choose(o.value);}} onKeyDown={e=>{
      const buttons=Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[role=option]:not(:disabled)')??[]);
      const index=buttons.indexOf(e.currentTarget);
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();buttons[(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}
      if(e.key==='Home'||e.key==='End'){e.preventDefault();buttons[e.key==='Home'?0:buttons.length-1]?.focus();}
      if(e.key==='Escape'){e.preventDefault();setOpen(false);root.current?.querySelector('button')?.focus();}
      if(e.key==='Tab')setOpen(false);
      if(e.key.length===1&&e.key!==' '){buttons.find(b=>b.textContent?.toLowerCase().startsWith(e.key.toLowerCase()))?.focus();}
    }}>{o.text}</button>)}</div>}
  </div>;
}

export function UploadArea({label,accept,busy,onFile,zh}:{label:string;accept:string;busy:boolean;onFile:(file?:File)=>void;zh:boolean}) {
  const input=useRef<HTMLInputElement>(null);
  const [drag,setDrag]=useState(false);
  const [error,setError]=useState('');
  function pick(files:FileList|null){setDrag(false);if(busy)return;if(files&&files.length>1){setError(zh?'請一次上傳一個檔案。':'Upload one file at a time.');return;}setError('');onFile(files?.[0]);}
  return <div className={`upload-area ${drag?'dragging':''}`} onDragOver={e=>{e.preventDefault();if(!busy)setDrag(true);}} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setDrag(false);}} onDrop={e=>{e.preventDefault();pick(e.dataTransfer.files);}}>
    <Upload size={22}/><div><strong>{label}</strong><p>{zh?'拖放檔案到這裡，或選擇檔案。每個檔案上限 10 MB。':'Drop a file here, or choose a file. Up to 10 MB per file.'}</p></div>
    <button type="button" disabled={busy} onClick={()=>input.current?.click()}>{zh?'選擇檔案':'Choose file'}</button>
    <input ref={input} className="visually-hidden" type="file" aria-label={label} accept={accept} disabled={busy} onChange={e=>{pick(e.target.files);e.target.value='';}}/>
    {error&&<p className="error" role="alert">{error}</p>}
  </div>;
}

export function LoadingState({zh=false,compact=false,label}:{zh?:boolean;compact?:boolean;label?:string}) {
  const [slow,setSlow]=useState(false);
  useEffect(()=>{const timer=setTimeout(()=>setSlow(true),3000);return()=>clearTimeout(timer);},[]);
  const text=label??(zh?'正在開啟工作區…':'Opening your workspace…');
  return <div className={`loading-state ${compact?'compact':''}`} role="status" aria-live="polite" aria-busy="true">
    <span className="visually-hidden">{text}</span>
    {slow?<div className="spinner-state"><span className="spinner" aria-hidden="true"/><p>{text}</p></div>:compact?<div className="skeleton-section" aria-hidden="true"><div className="skeleton sk-title"/><div className="skeleton sk-upload"/>{[0,1,2].map(i=><div key={i} className="skeleton sk-row"/>)}</div>:<div className="skeleton-workspace" aria-hidden="true"><div className="skeleton-sidebar"><div className="skeleton sk-brand"/><div className="skeleton sk-row"/>{Array.from({length:7},(_,i)=><div key={i} className="skeleton sk-nav"/>)}</div><div className="skeleton-content"><div className="skeleton sk-title"/><div className="skeleton sk-subtitle"/><div className="skeleton sk-notice"/><div className="skeleton-board"><div><div className="skeleton sk-row"/>{[0,1,2].map(i=><div key={i} className="skeleton sk-agenda"/>)}</div><div><div className="skeleton sk-row"/><div className="skeleton sk-agenda"/></div></div><div className="skeleton sk-upload"/></div></div>}
  </div>;
}

export function ErrorPage({storage=false}:{storage?:boolean}) {
  return <main className="error-page"><AlertCircle size={36}/><h1>{storage?'Could not open your saved workspace':'Something went wrong'}</h1><p>{storage?'Browser storage is unavailable or the saved format cannot be opened. Your saved data has not been overwritten.':'The page could not continue. Reload to reopen your saved workspace.'}</p><p lang="zh-Hant">{storage?'無法開啟已儲存的工作區。資料未被覆寫，請檢查瀏覽器儲存設定後重試。':'頁面發生錯誤。請重新載入以開啟已儲存的工作區。'}</p><button className="primary" onClick={()=>location.reload()}>Try again / 重試</button><a href="#privacy">Privacy / 隱私政策</a></main>;
}
export class ErrorBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<><ErrorPage/><LegalPages/></>:this.props.children;}
}
