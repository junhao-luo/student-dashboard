export type Course = {
  id: string;
  semester: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
  courseType?: 'required' | 'elective';
  room: string;
  color: string;
};
export type Task = {
  id: string;
  courseId: string;
  title: string;
  kind: "assignment" | "exam";
  due: string;
  done: boolean;
  status?: TaskStatus;
  description?: string;
  attachments?: FileAttachment[];
  reminderDays: number | null;
};
export type TaskStatus='not_started'|'in_progress'|'complete';
export type FileAttachment={fileId:string;name:string;size:number};
export const taskStatus=(task:Task):TaskStatus=>task.status??(task.done?'complete':'not_started');
export const withTaskStatus=(task:Task,status:TaskStatus):Task=>({...task,status,done:status==='complete'});
export function semesterCredits(courses:Course[],semester:string){
  const totals={required:0,elective:0,unclassified:0,total:0};
  for(const course of courses.filter(c=>c.semester===semester)){totals[course.courseType??'unclassified']+=course.credits;totals.total+=course.credits;}
  return totals;
}
export type Meeting = {
  id: string;
  courseId: string;
  day: number;
  start: string;
  end: string;
  room: string;
};
export type Note = {
  id: string;
  courseId: string;
  title: string;
  body: string;
  blocks?: string;
  sourceMarkdown?: string;
  attachments?: NoteAttachment[];
};
export type NoteAttachment = {fileId:string; name:string; size:number; kind:'pdf'|'image'};
export type Resource = {
  id: string;
  title: string;
  url: string;
  courseId?: string;
  createdAt?: number;
  fileId?: string;
  originalName?: string;
  size?: number;
  folderId?: string;
};
export type Folder = {id:string; name:string; parentId:string; courseId?:string};
export function folderDescendants(folders:Folder[], id:string):string[] {
  const found=new Set<string>([id]);
  let changed=true;
  while(changed){changed=false;for(const f of folders)if(found.has(f.parentId)&&!found.has(f.id)){found.add(f.id);changed=true;}}
  return [...found];
}
export function taiwanDate(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00+08:00`);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
export function validateCourse(course: Course): string | null {
  if(course.courseType!==undefined&&!['required','elective'].includes(course.courseType))return 'Choose required or elective.';
  if (!course.name.trim() || course.name.length > 120)
    return "Course name must contain 1–120 characters.";
  if (!/^\d{3}-[12]$/.test(course.semester))
    return "Use a semester such as 115-1.";
  if (
    !Number.isFinite(course.credits) ||
    course.credits < 0 ||
    course.credits > 20
  )
    return "Credits must be between 0 and 20.";
  return null;
}
export function validateMeeting(meeting: Meeting): string | null {
  if (!Number.isInteger(meeting.day) || meeting.day < 1 || meeting.day > 7)
    return "Choose a weekday.";
  if (
    ![meeting.start, meeting.end].every((time) =>
      /^([01]\d|2[0-3]):[0-5]\d$/.test(time),
    ) ||
    meeting.start >= meeting.end
  )
    return "End time must be after start time.";
  return null;
}
export function safeResourceUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function deleteCourse(
  courseId: string,
  data: {
    courses: Course[];
    tasks: Task[];
    meetings: Meeting[];
    notes: Note[];
  },
) {
  return {
    courses: data.courses.filter((item) => item.id !== courseId),
    tasks: data.tasks.filter((item) => item.courseId !== courseId),
    meetings: data.meetings.filter((item) => item.courseId !== courseId),
    notes: data.notes.filter((item) => item.courseId !== courseId),
  };
}
