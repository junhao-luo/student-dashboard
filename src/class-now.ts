import type {Meeting} from './domain';
const weekdays=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const taipeiParts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Taipei',weekday:'long',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
export function currentClasses(meetings:Meeting[],now:Date):Meeting[]{
  const parts=taipeiParts.formatToParts(now),part=(type:string)=>parts.find(p=>p.type===type)?.value??'';
  const day=weekdays.indexOf(part('weekday'))+1,time=`${part('hour')}:${part('minute')}`;
  return meetings.filter(meeting=>meeting.day===day&&meeting.start<=time&&time<meeting.end);
}
