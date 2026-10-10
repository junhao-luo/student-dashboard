import type {Course,Task,Meeting} from './domain';
import {validateCourse,validateMeeting} from './domain';
export type AcademicData={semesters:string[];courses:Course[];tasks:Task[];meetings:Meeting[]};
export type AcademicSnapshot={revision:number;data:AcademicData};
export const emptyAcademic=():AcademicData=>({semesters:['115-1','115-2'],courses:[],tasks:[],meetings:[]});
export function academicData(value:AcademicData):AcademicData{
  return {semesters:value.semesters,courses:value.courses,tasks:value.tasks,meetings:value.meetings};
}
export function validAcademic(data:AcademicData):boolean {
  if(data.semesters.length>30||data.courses.length>100||data.tasks.length>1000||data.meetings.length>1000||new TextEncoder().encode(JSON.stringify(data)).byteLength>400000)return false;
  if(new Set(data.semesters).size!==data.semesters.length||!data.semesters.length||data.semesters.some(s=>!/^\d{3}-[12]$/.test(s)))return false;
  const validId=(id:string)=>/^[A-Za-z0-9_-]{1,80}$/.test(id);
  for(const items of [data.courses,data.tasks,data.meetings])if(new Set(items.map(i=>i.id)).size!==items.length||items.some(i=>!validId(i.id)))return false;
  const courses=new Set(data.courses.map(c=>c.id));
  if(data.courses.some(c=>validateCourse(c)||!data.semesters.includes(c.semester)||c.name.length>120||c.code.length>40||c.instructor.length>100||c.room.length>100||!['blue','green','amber','violet'].includes(c.color)))return false;
  if(data.meetings.some(m=>!courses.has(m.courseId)||validateMeeting(m)||m.room.length>100))return false;
  if(data.tasks.some(t=>!courses.has(t.courseId)||!t.title.trim()||t.title.length>200||!['assignment','exam'].includes(t.kind)||!Number.isFinite(Date.parse(t.due))||new Date(t.due).toISOString()!==t.due||Date.parse(t.due)<Date.UTC(2000,0,1)||Date.parse(t.due)>=Date.UTC(2100,0,1)||(t.reminderDays!==null&&(!Number.isInteger(t.reminderDays)||t.reminderDays<0||t.reminderDays>365))))return false;
  return true;
}
