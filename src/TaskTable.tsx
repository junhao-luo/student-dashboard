import {Select} from './Interface';
import {taskStatus,withTaskStatus,type Task,type Course,type TaskStatus} from './domain';
export function TaskStatusSelect({task,zh,onChange}:{task:Task;zh:boolean;onChange:(task:Task)=>void}){
 return <Select aria-label={`${zh?'狀態':'Status'} ${task.title}`} value={taskStatus(task)} onChange={e=>onChange(withTaskStatus(task,e.target.value as TaskStatus))}><option value="not_started">{zh?'未開始':'Not started'}</option><option value="in_progress">{zh?'進行中':'In progress'}</option><option value="complete">{zh?'已完成':'Complete'}</option></Select>;
}
export function TaskTable({tasks,courses,zh,onChange,onOpen,onEdit,onDelete}:{tasks:Task[];courses:Course[];zh:boolean;onChange:(task:Task)=>void;onOpen:(task:Task)=>void;onEdit:(task:Task)=>void;onDelete:(task:Task)=>void}){
 const t=(en:string,cn:string)=>zh?cn:en;
 if(!tasks.length)return <p className="empty">{t('No deadlines in this view.','此檢視尚無作業與考試。')}</p>;
 return <div className="task-table-scroll"><table className="assignment-table"><thead><tr><th>{t('Assignment / exam','作業／考試')}</th><th>{t('Course','課程')}</th><th>{t('Status','狀態')}</th><th>{t('Due','期限')}</th><th>{t('Actions','操作')}</th></tr></thead><tbody>{tasks.map(task=><tr key={task.id}><td><button className={`task-title ${task.done?'completed':''}`} onClick={()=>onOpen(task)}>{task.title}</button><small>{task.kind==='exam'?t('Exam','考試'):t('Assignment','作業')}</small></td><td>{courses.find(c=>c.id===task.courseId)?.name??'—'}</td><td><TaskStatusSelect task={task} zh={zh} onChange={onChange}/></td><td><time dateTime={task.due}>{new Date(task.due).toLocaleString(zh?'zh-TW':'en-GB',{timeZone:'Asia/Taipei',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</time></td><td><button aria-label={t('Edit','編輯')+' '+task.title} onClick={()=>onEdit(task)}>{t('Edit','編輯')}</button><button aria-label={t('Delete','刪除')+' '+task.title} onClick={()=>onDelete(task)}>{t('Delete','刪除')}</button></td></tr>)}</tbody></table></div>;
}
