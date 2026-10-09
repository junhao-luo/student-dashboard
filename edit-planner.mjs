import {readFileSync,writeFileSync} from 'node:fs';
let s=readFileSync('src/main.tsx','utf8').replace(/\r\n/g,'\n');
s=s.replace('  const [form, setForm]',`  const [editingId,setEditingId]=useState('');
  const editingTask=tasks.find(item=>item.id===editingId);
  const editingMeeting=meetings.find(item=>item.id===editingId);
  function editTask(task:Task){setEditingId(task.id);setQuickKind(task.kind);openForm('edit-task');}
  function editMeeting(meeting:Meeting){setEditingId(meeting.id);openForm('edit-meeting');}
  const [form, setForm]`);
s=s.replaceAll('form === "task"','(form === "task" || form === "edit-task")');
s=s.replaceAll('form === "meeting"','(form === "meeting" || form === "edit-meeting")');
s=s.replace('      setTasks([\n        ...tasks,\n        {\n          id,',`      const task:Task = {
          id:form==='edit-task'?editingId:id,`);
s=s.replace('          done: false,\n          reminderDays: null,\n        },\n      ]);',`          done: form==='edit-task' ? editingTask?.done ?? false : false,
          reminderDays: form==='edit-task' ? editingTask?.reminderDays ?? null : null,
      };
      const due=taiwanDate(value('due'));
      if(!due){setError(t('Enter a valid due date.','請輸入有效截止日期。'));return;}
      task.due=due;
      setTasks(form==='edit-task'?tasks.map(item=>item.id===editingId?task:item):[...tasks,task]);`);
s=s.replace('      const meeting = {\n        id,',"      const meeting = {\n        id:form==='edit-meeting'?editingId:id,");
s=s.replace('      setMeetings([...meetings, meeting]);',"      setMeetings(form==='edit-meeting'?meetings.map(item=>item.id===editingId?meeting:item):[...meetings,meeting]);");
s=s.replace('setStatus(form === "edit-course" ?', 'setStatus(form?.startsWith("edit-") ?');
s=s.replace('defaultValue={selectedCourse || activeCourses[0]?.id}',"defaultValue={(form==='edit-task'?editingTask?.courseId:form==='edit-meeting'?editingMeeting?.courseId:undefined)||selectedCourse||activeCourses[0]?.id}");
s=s.replace('onChange={setTasks} zh=', 'onChange={setTasks} onEdit={editTask} zh=');
s=s.replaceAll('onChange={setTasks} zh=', 'onChange={setTasks} onEdit={editTask} zh=');
s=s.replace('              className="icon"\n              aria-label={`${t("Delete",',`              aria-label={t('Edit','編輯')+' '+task.title} onClick={()=>editTask(task)}>{t('Edit','編輯')}</button><button
              className="icon"
              aria-label={\x60\x24{t("Delete",`);
s=s.replace('form === \'edit-course\' ? t(\'Edit course\',\'編輯課程\') :',"form==='edit-task'?t('Edit deadline','編輯期限'):form==='edit-meeting'?t('Edit class','編輯上課時段'):form === 'edit-course' ? t('Edit course','編輯課程') :");
s=s.replace('name="title" required maxLength={160} />',"name=\"title\" required maxLength={160} defaultValue={form==='edit-task'?editingTask?.title:''}/> ");
s=s.replace('name="due" type="datetime-local" required />',`name="due" type="datetime-local" required defaultValue={form==='edit-task'&&editingTask?new Date(new Date(editingTask.due).getTime()+8*60*60*1000).toISOString().slice(0,16):''}/>`);
s=s.replace('<Select name="day">',"<Select name=\"day\" defaultValue={form==='edit-meeting'?editingMeeting?.day:1}>");
s=s.replace('defaultValue="08:10"',"defaultValue={form==='edit-meeting'?editingMeeting?.start:'08:10'}");
s=s.replace('defaultValue="09:00"',"defaultValue={form==='edit-meeting'?editingMeeting?.end:'09:00'}");
s=s.replace('<input name="room" maxLength={100} />',"<input name=\"room\" maxLength={100} defaultValue={form==='edit-meeting'?editingMeeting?.room:''}/>");
s=s.replace("form === 'edit-course' ? t('Save changes'", "form?.startsWith('edit-') ? t('Save changes'");
s=s.replace('<small>{m.room || courseFor(m.courseId)?.room}</small>',`<small>{m.room || courseFor(m.courseId)?.room}</small><button aria-label={t('Edit class','編輯上課時段')+' '+courseFor(m.courseId)?.name} onClick={()=>editMeeting(m)}>{t('Edit','編輯')}</button>`);
s=s.replace("{m.start}–{m.end} · {m.room}</p>","{m.start}–{m.end} · {m.room} <button onClick={()=>editMeeting(m)}>{t('Edit class','編輯上課時段')}</button></p>");
writeFileSync('src/main.tsx',s);
let task=readFileSync('src/TaskViews.tsx','utf8');
task=task.replace('onChange,zh}', 'onChange,onEdit,zh}').replace('zh:boolean})', 'onEdit:(task:Task)=>void;zh:boolean})');
task=task.replace('<button aria-label={`${t(\'Delete\'',"<button aria-label={t('Edit','編輯')+' '+task.title} onClick={()=>onEdit(task)}>{t('Edit','編輯')}</button><button aria-label={`${t('Delete'");
writeFileSync('src/TaskViews.tsx',task);
