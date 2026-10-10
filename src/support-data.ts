export type Diagnostic = {code:'CLIENT_ERROR'|'UNHANDLED_REJECTION'|'CAPTURE_FAILED';time:string};
export type SupportReport = {kind:'complaint'|'suggestion'|'bug';subject:string;message:string;requestId:string;screenshot:string|null;diagnostics:{view:string;language:'en'|'zh';width:number;height:number;events:Diagnostic[]}|null};
export function validReport(r:SupportReport){
  if(!['complaint','suggestion','bug'].includes(r.kind)||!r.subject.trim()||r.subject.length>120||r.message.trim().length<10||r.message.length>5000||! /^[a-f0-9-]{36}$/.test(r.requestId))return false;
  if(r.kind!=='bug'&&(r.screenshot!==null||r.diagnostics!==null))return false;
  if(r.diagnostics){const d=r.diagnostics;
    if(!['overview','courses','tasks','timetable','resources','calendar','settings','contact'].includes(d.view)||!['en','zh'].includes(d.language)||![d.width,d.height].every(n=>Number.isInteger(n)&&n>0&&n<=10000)||d.events.length>20)return false;
    if(d.events.some(e=>!['CLIENT_ERROR','UNHANDLED_REJECTION','CAPTURE_FAILED'].includes(e.code)||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(e.time)||!Number.isFinite(Date.parse(e.time))))return false;
  }
  if(r.screenshot!==null){
    if(r.screenshot.length>750000||!/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(r.screenshot))return false;
    try{const bytes=atob(r.screenshot.slice(22));
      if(bytes.length<45||bytes.slice(0,8)!=='\x89PNG\r\n\x1a\n'||bytes.slice(12,16)!=='IHDR'||bytes.slice(-8,-4)!=='IEND')return false;
      const n=(i:number)=>((bytes.charCodeAt(i)*0x1000000)+(bytes.charCodeAt(i+1)<<16)+(bytes.charCodeAt(i+2)<<8)+bytes.charCodeAt(i+3));
      if(n(16)<1||n(20)<1||n(16)>1600||n(20)>1600)return false;
    }catch{return false;}
  }
  return true;
}
const events:Diagnostic[]=[];
export function recordDiagnostic(code:Diagnostic['code']){events.push({code,time:new Date().toISOString()});if(events.length>20)events.shift();}
export function diagnosticEvents(){return events.map(e=>({...e}));}
export function startDiagnostics(){
  const error=()=>recordDiagnostic('CLIENT_ERROR'),rejection=()=>recordDiagnostic('UNHANDLED_REJECTION');
  window.addEventListener('error',error);window.addEventListener('unhandledrejection',rejection);
  return()=>{window.removeEventListener('error',error);window.removeEventListener('unhandledrejection',rejection);events.length=0;};
}
