import { useEffect, useRef, useState } from 'react';
import { Select } from './Interface';
import type { ImportedMeeting } from './pdf-parser';
import { meetingColumns } from './import-layout';

const minutes = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
const periods = [
  ['08:10','09:00'],['09:10','10:00'],['10:10','11:00'],['11:10','12:00'],
  ['12:10','13:00'],['13:10','14:00'],['14:10','15:00'],['15:10','16:00'],
  ['16:10','17:00'],['17:10','18:00'],['18:30','19:20'],['19:25','20:15'],
  ['20:25','21:15'],['21:20','22:10'],
];

export function ImportedTimetable({ rows, onChange, zh }: {
  rows: ImportedMeeting[]; onChange: (rows: ImportedMeeting[]) => void; zh: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const editor = useRef<HTMLFieldSetElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(()=>{if(selected!==null)editor.current?.querySelector('input')?.focus();},[selected]);
  const t = (en: string, cn: string) => zh ? cn : en;
  const days = zh ? ['一','二','三','四','五','六','日'] : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dayCount = rows.some(row => row.day > 5) ? 7 : 5;
  const first = Math.min(490, ...rows.map(row => minutes(row.start)).filter(Number.isFinite));
  const last = Math.max(1330, ...rows.map(row => minutes(row.end)).filter(Number.isFinite));
  const range = last - first;
  const row = selected === null ? undefined : rows[selected];
  const columns = meetingColumns(rows);
  function update(patch: Partial<ImportedMeeting>) {
    onChange(rows.map((item, index) => index === selected ? {...item, ...patch} : item));
  }
  return <>
    <p className="muted">{t('Select a class to edit it. Changes appear in this preview before saving.', '點選課程即可編輯。修改會即時顯示於預覽，儲存後才會匯入。')}</p>
    <div className="import-timetable-scroll" data-lenis-prevent tabIndex={0} role="region" aria-label={t('Editable imported weekly timetable', '可編輯的匯入每週課表')}>
      <div className="import-timetable" style={{gridTemplateColumns: `64px repeat(${dayCount}, minmax(0, 1fr))`,minWidth:dayCount===7?680:undefined}}>
        <div className="import-time-heading">{t('Period', '節次')}</div>
        {days.slice(0,dayCount).map(day => <strong className="import-day-heading" key={day}>{day}</strong>)}
        <div className="import-time-axis">
          {periods.map(([start,end],index) => <div key={start} style={{top: `${(minutes(start)-first)/range*100}%`}}><strong>{index+1}</strong><small>{start}<br/>{end}</small></div>)}
        </div>
        {days.slice(0,dayCount).map((day,dayIndex) => <div className="import-day-column" key={day}>
          {periods.map(([start]) => <div className="import-period-line" key={start} style={{top:`${(minutes(start)-first)/range*100}%`}}/>)}
          {rows.map((meeting,index) => meeting.day === dayIndex+1 && <button type="button" key={index} ref={node=>{buttons.current[index]=node;}}
            className={`import-meeting ${selected===index?'selected':''}`} aria-pressed={selected===index}
            aria-label={`${meeting.name || t('Unnamed course','未命名課程')}, ${day}, ${meeting.start}–${meeting.end}, ${meeting.room}. ${t('Edit','編輯')}`}
            style={{left:`calc(${columns[index].lane/columns[index].count*100}% + 3px)`,width:`calc(${100/columns[index].count}% - 6px)`,top:`${Math.max(0,(minutes(meeting.start)-first)/range*100)||0}%`,height:`${Math.max(5,(minutes(meeting.end)-minutes(meeting.start))/range*100)||5}%`}}
            onClick={() => setSelected(index)}>
            <strong>{meeting.name || t('Unnamed course','未命名課程')}</strong><span>{meeting.room}</span><time>{meeting.start}<br/>{meeting.end}</time>
          </button>)}
        </div>)}
      </div>
    </div>
    {row && <fieldset ref={editor} className="import-meeting-editor">
      <legend>{t('Edit selected class', '編輯所選課程')}</legend>
      {(['name','instructor','room','start','end'] as const).map(field => <label key={field}>
        {{name:t('Course','課程'),instructor:t('Instructor','教師'),room:t('Room','教室'),start:t('Start','開始'),end:t('End','結束')}[field]}
        <input type={field==='start'||field==='end'?'time':'text'} value={row[field]} maxLength={200} required={field==='name'||field==='start'||field==='end'} onInput={event=>{if(field==='start'||field==='end')update({[field]:event.currentTarget.value});}} onChange={event=>update({[field]:event.target.value})}/>
      </label>)}
      <label>{t('Day','星期')}<Select value={row.day} onChange={event=>update({day:Number(event.target.value)})}>{days.map((day,index)=><option key={day} value={index+1}>{day}</option>)}</Select></label>
      {(!row.name.trim()||!row.start||!row.end||row.start>=row.end)&&<p role="alert" className="error">{t('Enter a course name and an end time after its start.', '請輸入課程名稱，且結束時間須晚於開始時間。')}</p>}
      <div className="import-editor-actions"><button type="button" onClick={()=>{setSelected(null);if(selected!==null)buttons.current[selected]?.focus();}}>{t('Done editing','完成編輯')}</button><button type="button" onClick={()=>{onChange(rows.filter((_,index)=>index!==selected));setSelected(null);}}>{t('Remove class','移除課程')}</button></div>
    </fieldset>}
    <details className="import-meeting-list"><summary>{t('All imported classes','所有匯入課程')} ({rows.length})</summary>{rows.map((meeting,index)=><button type="button" key={index} onClick={()=>setSelected(index)}>{days[meeting.day-1]} · {meeting.start}–{meeting.end} · {meeting.name || t('Unnamed course','未命名課程')} · {meeting.room}</button>)}</details>
  </>;
}
