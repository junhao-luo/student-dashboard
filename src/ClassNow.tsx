import {useEffect,useState} from 'react';
import {Clock3} from 'lucide-react';
import {currentClasses} from './class-now';
import type {Course,Meeting} from './domain';
export function ClassNow({courses,meetings,zh}:{courses:Course[];meetings:Meeting[];zh:boolean}){
  const [now,setNow]=useState(()=>new Date());
  useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(timer);},[]);
  const classes=currentClasses(meetings,now),locale=zh?'zh-TW':'en-GB';
  return <section className="class-now" aria-label={zh?'現在的時間與課程':'Current time and class'}><div className="live-clock"><Clock3 size={18} aria-hidden="true"/><div><time dateTime={now.toISOString()}>{new Intl.DateTimeFormat(locale,{timeZone:'Asia/Taipei',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(now)}</time><small>{new Intl.DateTimeFormat(locale,{timeZone:'Asia/Taipei',weekday:'short',month:'short',day:'numeric'}).format(now)} · Asia/Taipei</small></div></div>
    <div className="current-class"><small>{zh?'依每週課表 · 目前課程':'Weekly timetable · In class now'}</small>{classes.length?classes.map(meeting=><div key={meeting.id}><strong>{courses.find(course=>course.id===meeting.courseId)?.name??(zh?'課程':'Class')}</strong><span>{meeting.start}–{meeting.end} · {meeting.room||courses.find(course=>course.id===meeting.courseId)?.room||(zh?'教室未設定':'Room not set')}</span></div>):<strong>{zh?'目前沒有安排課程':'No class scheduled right now'}</strong>}</div>
  </section>;
}
