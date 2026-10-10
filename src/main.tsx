import { DataExport } from "./DataExport";
import { TaskViews } from "./TaskViews";
import type { Folder } from "./domain";
import { LegalPages } from "./Legal";
import { Dropdown, Select, LoadingState, ErrorPage, ErrorBoundary } from "./Interface";
import React, { useState, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  Library,
  Settings,
  Plus,
  GraduationCap,
  ArrowUpRight,
  Trash2,
  Menu,
  X,
} from "lucide-react";
import {
  validateCourse,
  validateMeeting,
  safeResourceUrl,
  deleteCourse,
  taiwanDate,
  type Course,
  type Task,
  type Meeting,
  type Note,
  type Resource,
} from "./domain";
import "./style.css";
import "@fontsource-variable/geist";
import "./redesign.css";
import "./productivity.css";
import "./interface.css";
import { loadLegacyPreferences, loadInterfacePreferences, saveInterfacePreferences, type Workspace } from "./storage";
import {useWorkspaceStorage,LegacyImport} from './LocalWorkspace';
import {useAcademicSyncNotice} from './AcademicSync';
const NoteEditor = lazy(() => import("./NoteEditor").then(module=>({default:module.NoteEditor})));
const AccountBoundary=lazy(()=>import('./AccountPanel'));
const AccountPanel=lazy(()=>import('./AccountPanel').then(module=>({default:module.AccountPanel})));
const AccountMenu=lazy(()=>import('./AccountPanel').then(module=>({default:module.AccountMenu})));
const AccountSignOut=lazy(()=>import('./AccountPanel').then(module=>({default:module.AccountSignOut})));
const PdfImport = lazy(() =>
  import("./PdfImport").then((module) => ({ default: module.PdfImport })),
);
import type { ImportedMeeting } from "./pdf-parser";
import { ResourceLibrary } from "./ResourceLibrary";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {useLocation,useNavigate} from 'react-router';

function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

function App({ initial,onPreferences,preferences }: { initial: Workspace | undefined;onPreferences:(lang:'en'|'zh',dark:boolean)=>void;preferences:{lang:'en'|'zh';dark:boolean} }) {
  const {saveWorkspace,removeFiles}=useWorkspaceStorage();
  const syncNotice=useAcademicSyncNotice();
  const [appName,setAppName]=useState(initial?.appName ?? 'CourseDock');
  const [lang, setLang] = useState<"en" | "zh">(initial?.lang ?? preferences.lang);
  const [dark, setDark] = useState(initial?.dark ?? preferences.dark);
  useEffect(()=>onPreferences(lang,dark),[lang,dark,onPreferences]);
  const t = (en: string, zh: string) => (lang === "en" ? en : zh);
  const [page, setPage] = useState(initial?.page ?? "overview");
  const [semester, setSemester] = useState(initial?.semester ?? "115-1");
  const [semesters, setSemesters] = useState<string[]>(
    initial?.semesters ?? ["115-1", "115-2"],
  );
  const [courses, setCourses] = useState<Course[]>(initial?.courses ?? []);
  const [tasks, setTasks] = useState<Task[]>(initial?.tasks ?? []);
  const [meetings, setMeetings] = useState<Meeting[]>(initial?.meetings ?? []);
  const [notes, setNotes] = useState<Note[]>(initial?.notes ?? []);
  const [resources, setResources] = useState<Resource[]>(
    initial?.resources ?? [],
  );
  const [folders,setFolders]=useState<Folder[]>(initial?.folders ?? []);
  const [folderId,setFolderId]=useState(initial?.folderId ?? "");
  const [sidebarCollapsed,setSidebarCollapsed]=useState(initial?.sidebarCollapsed ?? false);
  const [mobileOpen,setMobileOpen]=useState(false);
  const menuButton=React.useRef<HTMLButtonElement>(null);
  const sidebar=React.useRef<HTMLElement>(null);
  useEffect(()=>{
    const screen=matchMedia('(max-width: 800px)');
    const resize=()=>{if(!screen.matches)setMobileOpen(false);};
    screen.addEventListener('change',resize);
    return()=>screen.removeEventListener('change',resize);
  },[]);
  useEffect(()=>{
    if(!mobileOpen)return;
    const originalOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    sidebar.current?.querySelector<HTMLButtonElement>('.mobile-close')?.focus();
    const keyboard=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();setMobileOpen(false);return;}
      if(event.key!=='Tab')return;
      const controls=Array.from(sidebar.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),summary,[tabindex="0"]')??[]).filter(el=>el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden'&&el.getAttribute('aria-hidden')!=='true');
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown',keyboard);
    return()=>{document.body.style.overflow=originalOverflow;document.removeEventListener('keydown',keyboard);menuButton.current?.focus();};
  },[mobileOpen]);
  const [courseTab,setCourseTab]=useState(initial?.courseTab ?? "notes");
  const [selectedCourse, setSelectedCourse] = useState(initial?.selectedCourse ?? "");
  const [quickKind,setQuickKind]=useState("assignment");
  const [editingId,setEditingId]=useState('');
  const editingTask=tasks.find(item=>item.id===editingId);
  const editingMeeting=meetings.find(item=>item.id===editingId);
  function editTask(task:Task){setEditingId(task.id);setQuickKind(task.kind);openForm('edit-task');}
  function editMeeting(meeting:Meeting){setEditingId(meeting.id);openForm('edit-meeting');}
  const [form, setForm] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(true);
  const content=React.useMemo(()=>({appName,semesters,courses,tasks,meetings,notes,resources,folders}),[appName,semesters,courses,tasks,meetings,notes,resources,folders]);
  const persistedContent=React.useRef(content);
  useEffect(() => {
    let current = true;
    setSaved(content===persistedContent.current);
    void saveWorkspace({
      version: 1,
      folders,
      folderId,
      courseTab,
      sidebarCollapsed,
      appName,
      selectedCourse,
      lang,
      dark,
      page,
      semester,
      semesters,
      courses,
      tasks,
      meetings,
      notes,
      resources,
    })
      .then(() => {
        if (current) {
          persistedContent.current=content;
          setSaved(true);
          setSaveError("");
        }
      })
      .catch(() => {
        if (current)
          setSaveError(
            t(
              "Could not finish saving. Check the sync notice and your connection or browser storage. Keep this tab open.",
              "無法完成儲存。請查看同步提示，並檢查連線與瀏覽器儲存空間。請保留此分頁。",
            ),
          );
      });
    return () => {
      current = false;
    };
  }, [
    content,
    folders,
    folderId,
    courseTab,
    sidebarCollapsed,
    appName,
    selectedCourse,
    lang,
    dark,
    page,
    semester,
    semesters,
    courses,
    tasks,
    meetings,
    notes,
    resources,
  ]);
  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.title=appName || 'CourseDock';
  }, [lang, dark,appName]);
  const activeCourses = courses.filter((c) => c.semester === semester);
  const courseFor = (id: string) => courses.find((c) => c.id === id);
  const activeTasks = tasks
    .filter((task) => activeCourses.some((c) => c.id === task.courseId))
    .sort((a, b) => a.due.localeCompare(b.due));
  const activeMeetings = meetings.filter((m) =>
    activeCourses.some((c) => c.id === m.courseId),
  );
  const days =
    lang === "en"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["一", "二", "三", "四", "五", "六", "日"];
  const nav = [
    ["overview", LayoutDashboard, t("Overview", "總覽")],
    ["courses", BookOpen, t("Courses & notes", "課程與筆記")],
    ["tasks", CheckSquare, t("Assignments & exams", "作業與考試")],
    ["timetable", CalendarDays, t("Timetable", "課表")],
    ["resources", Library, t("Resources", "學習資源")],
    ["calendar", CalendarDays, t("School calendar", "學校行事曆")],
    ["settings", Settings, t("Settings", "設定")],
  ] as const;
  function openForm(value: string) {
    setError("");
    setForm(value);
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const id = crypto.randomUUID();
    if (form === "course" || form==='edit-course') {
      const course: Course = {
        id:form==='edit-course'?selectedCourse:id,
        semester,
        name: value("name"),
        code: value("code"),
        instructor: value("instructor"),
        room: value("room"),
        credits: Number(value("credits")),
        color: "blue",
      };
      const problem = validateCourse(course);
      if (problem) {
        setError(problem);
        return;
      }
      setCourses(form==='edit-course'?courses.map(item=>item.id===selectedCourse?course:item):[...courses,course]);
      setSelectedCourse(course.id);
    } else if ((form === "task" || form === "edit-task")) {
      if (
        !activeCourses.some((c) => c.id === value("courseId")) ||
        !value("title") ||
        !value("due")
      ) {
        setError(
          t(
            "Choose a course, title, and due date.",
            "請填寫課程、標題與截止時間。",
          ),
        );
        return;
      }
      const task:Task = {
          id:form==='edit-task'?editingId:id,
          courseId: value("courseId"),
          title: value("title"),
          kind: value("kind") === "exam" ? "exam" : "assignment",
          due: taiwanDate(value("due"))!,
          done: form==='edit-task' ? editingTask?.done ?? false : false,
          reminderDays: form==='edit-task' ? editingTask?.reminderDays ?? null : null,
      };
      const due=taiwanDate(value('due'));
      if(!due){setError(t('Enter a valid due date.','請輸入有效截止日期。'));return;}
      task.due=due;
      setTasks(form==='edit-task'?tasks.map(item=>item.id===editingId?task:item):[...tasks,task]);
    } else if ((form === "meeting" || form === "edit-meeting")) {
      const meeting = {
        id:form==='edit-meeting'?editingId:id,
        courseId: value("courseId"),
        day: Number(value("day")),
        start: value("start"),
        end: value("end"),
        room: value("room"),
      };
      const problem = validateMeeting(meeting);
      if (problem || !activeCourses.some((c) => c.id === meeting.courseId)) {
        setError(problem || t("Choose a course.", "請選擇課程。"));
        return;
      }
      setMeetings(form==='edit-meeting'?meetings.map(item=>item.id===editingId?meeting:item):[...meetings,meeting]);
    } else if (form === "resource") {
      const url = safeResourceUrl(value("url"));
      if (!url) {
        setError(
          t(
            "Enter a valid HTTP or HTTPS link.",
            "請輸入有效的 HTTP 或 HTTPS 連結。",
          ),
        );
        return;
      }
      setResources([
        ...resources,
        {
          id,
          title: value("title"),
          url,
          createdAt: Date.now(),
          courseId: value("courseId"),
          folderId,
        },
      ]);
    } else if (form === "semester") {
      const label = value("label");
      if (!/^\d{3}-[12]$/.test(label) || semesters.includes(label)) {
        setError(
          t(
            "Enter a new semester such as 116-1.",
            "請輸入新的學期，例如 116-1。",
          ),
        );
        return;
      }
      setSemesters([...semesters, label]);
      setSemester(label);
    }
    setForm(null);
    setStatus(form?.startsWith("edit-") ? t("Changes saved.", "已儲存變更。") : t("Added.", "已新增。"));
  }
  function importSchedule(rows: ImportedMeeting[], replace: boolean) {
    const nextCourses = [...courses];
    const nextMeetings = replace
      ? meetings.filter((m) => !activeCourses.some((c) => c.id === m.courseId))
      : [...meetings];
    for (const row of rows) {
      let course = nextCourses.find(
        (c) =>
          c.semester === semester &&
          c.name === row.name &&
          c.instructor === row.instructor,
      );
      if (!course) {
        course = {
          id: crypto.randomUUID(),
          semester,
          name: row.name,
          instructor: row.instructor,
          room: row.room,
          code: "",
          credits: 0,
          color: "blue",
        };
        nextCourses.push(course);
      }
      const meeting = {
        id: crypto.randomUUID(),
        courseId: course.id,
        day: row.day,
        start: row.start,
        end: row.end,
        room: row.room,
      };
      if (
        !nextMeetings.some(
          (m) =>
            m.courseId === meeting.courseId &&
            m.day === meeting.day &&
            m.start === meeting.start &&
            m.end === meeting.end &&
            m.room === meeting.room,
        )
      )
        nextMeetings.push(meeting);
    }
    setCourses(nextCourses);
    setMeetings(nextMeetings);
    setStatus(t("Timetable imported.", "已匯入課表。"));
  }
  async function removeCourse(id: string) {
    if (
      !confirm(
        t(
          "Delete this course and its notes, deadlines, and classes?",
          "刪除此課程及相關筆記、作業與課表？",
        ),
      )
    )
      return;
    try {await removeFiles(notes.filter(n=>n.courseId===id).flatMap(n=>(n.attachments||[]).map(a=>a.fileId)));}
    catch {setStatus(t('Could not delete course attachments. Try again.','無法刪除課程附件，請重試。'));return;}
    const result = deleteCourse(id, { courses, tasks, meetings, notes });
    setCourses(result.courses);
    setTasks(result.tasks);
    setMeetings(result.meetings);
    setNotes(result.notes);
    setResources(resources.map(resource=>resource.courseId===id?{...resource,courseId:''}:resource));
    setSelectedCourse("");
  }
  const courseSelect = (
    <label>
      {t("Course", "課程")}
      <Select
        name="courseId"
        required
        defaultValue={(form==='edit-task'?editingTask?.courseId:form==='edit-meeting'?editingMeeting?.courseId:undefined)||selectedCourse||activeCourses[0]?.id}
      >
        {activeCourses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
    </label>
  );
  const taskList = (items: Task[]) =>
    items.length ? (
      <div className="task-list">
        {items.map((task) => (
          <div className="task-row" key={task.id}>
            <input
              type="checkbox"
              aria-label={`${t("Complete", "完成")} ${task.title}`}
              checked={task.done}
              onChange={() =>
                setTasks(
                  tasks.map((item) =>
                    item.id === task.id ? { ...item, done: !item.done } : item,
                  ),
                )
              }
            />
            <div className={task.done ? "completed" : ""}>
              <strong>{task.title}</strong>
              <small>
                {courseFor(task.courseId)?.name} ·{" "}
                {task.kind === "exam"
                  ? t("Exam", "考試")
                  : t("Assignment", "作業")}
              </small>
            </div>
            <time>
              {new Date(task.due).toLocaleString(
                lang === "zh" ? "zh-TW" : "en-US",
                {
                  timeZone: "Asia/Taipei",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}
            </time>
            <button
              aria-label={t('Edit','編輯')+' '+task.title} onClick={()=>editTask(task)}>{t('Edit','編輯')}</button><button
              className="icon"
              aria-label={`${t("Delete", "刪除")} ${task.title}`}
              onClick={() =>
                setTasks(tasks.filter((item) => item.id !== task.id))
              }
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    ) : (
      <p className="empty">
        {activeTasks.length
          ? t("All deadlines completed.", "所有截止事項已完成。")
          : t(
              "No deadlines yet. Add an assignment or exam to plan your week.",
              "目前沒有截止事項。新增作業或考試，開始規劃本週。",
            )}
      </p>
    );
  function renderFolders(parent:string,visited=new Set<string>()):React.ReactNode {
    return folders.filter(f=>f.parentId===parent&&!visited.has(f.id)).map(f=><details key={f.id}><summary><button onClick={e=>{e.preventDefault();const item=e.currentTarget.closest('details');if(item)item.open=!item.open;setFolderId(f.id);setPage('resources');setMobileOpen(false);}}>📁 {f.name}<span aria-hidden="true" className="menu-chevron">⌄</span></button></summary>{renderFolders(f.id,new Set([...visited,f.id]))}</details>);
  }
  function quick(kind:string){if(!activeCourses.length){setStatus(t('Add a course first.','請先新增課程。'));return;}if(kind==='note'){const id=crypto.randomUUID();const courseId=selectedCourse||activeCourses[0].id;setSelectedCourse(courseId);setNotes([...notes,{id,courseId,title:t('Untitled note','未命名筆記'),body:''}]);setCourseTab('notes');setPage('courses');}else{setQuickKind(kind);openForm('task');}}
  return (
    <div className={`app ${sidebarCollapsed?"sidebar-collapsed":""} ${mobileOpen?"mobile-open":""}`}>
      <a className="skip" href="#main">
        {t("Skip to content", "跳至內容")}
      </a>
      <button ref={menuButton} className="mobile-menu" aria-expanded={mobileOpen} aria-controls="workspace-navigation" onClick={()=>setMobileOpen(true)}><Menu size={20} aria-hidden="true"/>{t("Menu","選單")}</button>
      {mobileOpen&&<button className="mobile-backdrop" tabIndex={-1} aria-label={t('Close navigation','關閉導覽')} onClick={()=>setMobileOpen(false)}/>}
      <aside data-lenis-prevent ref={sidebar} id="workspace-navigation" role={mobileOpen?'dialog':undefined} aria-modal={mobileOpen?true:undefined} aria-label={mobileOpen?t('Main navigation','主要導覽'):undefined}>
      <div className="mobile-drawer-head"><span>{t('Navigation','導覽')}</span><button className="mobile-close" aria-label={t('Close menu','關閉選單')} onClick={()=>setMobileOpen(false)}><X size={20} aria-hidden="true"/></button></div>
      <button className="sidebar-toggle" onClick={()=>setSidebarCollapsed(!sidebarCollapsed)} aria-label={t("Toggle sidebar","展開或收合側欄")}>☰</button>
        <div className="brand">
          <GraduationCap />
          <strong>{appName || 'CourseDock'}</strong>
        </div>
        <p className="school">Feng Chia University</p>
        <Dropdown label={appName || "課間"}>        <label className="semester-label">
          {t("Academic semester", "學期")}
          <Select
            value={semester}
            onChange={(e) => {
              setSemester(e.target.value);
              setSelectedCourse("");
            }}
          >
            {semesters.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </label>
<button onClick={()=>{setPage("settings");setMobileOpen(false);}}>{t("Settings","設定")}</button></Dropdown>
        <nav aria-label={t("Main navigation", "主要導覽")}>
          {nav.map(([key, Icon, label]) => (key==='courses'||key==='resources') ? <Dropdown key={key} label={label} icon={<Icon size={19}/>} active={page===key}><button onClick={()=>{setPage(key);if(key==='courses')setSelectedCourse('');else setFolderId('');setMobileOpen(false);}}>{key==='courses'?t('All courses','所有課程'):t('All resources','所有資源')}</button><div className="nav-children">{key==='courses'?activeCourses.map(c=><details key={c.id}><summary><button onClick={e=>{e.preventDefault();const item=e.currentTarget.closest('details');if(item)item.open=!item.open;setSelectedCourse(c.id);setCourseTab('notes');setPage('courses');setMobileOpen(false);}}>{c.name}<span aria-hidden="true" className="menu-chevron">⌄</span></button></summary>{notes.filter(n=>n.courseId===c.id).map(n=><button className="tree-note" key={n.id} onClick={()=>{setSelectedCourse(c.id);setCourseTab('notes');setPage('courses');setMobileOpen(false);setTimeout(()=>document.getElementById('note-'+n.id)?.scrollIntoView({block:'center'}),0);}}>{n.title}</button>)}</details>):renderFolders('')}</div></Dropdown>:<button key={key} aria-current={page===key?'page':undefined} className={page===key?'active':''} onClick={()=>{setPage(key);setMobileOpen(false);}}><Icon size={19}/>{label}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <Suspense fallback={null}><AccountMenu zh={lang==='zh'} onEdit={()=>{setPage('settings');setMobileOpen(false);setTimeout(()=>document.querySelector('.student-profile input')?.scrollIntoView({block:'center'}),0);}}/></Suspense>
        </div>
      </aside>
      <main id="main" inert={mobileOpen?true:undefined}>
        <header>
          <span>
            {semester} / {t("Academic workspace", "學習工作區")}
          </span>
          <button
            className="calendar-button"
            onClick={() => setPage("calendar")}
          >
            {t("School calendar", "學校行事曆")}
            <CalendarDays size={16} />
          </button>
        </header>
        {syncNotice}
        {saveError && (
          <p role="alert" className="error">
            {saveError}
          </p>
        )}
        <p className="save-status" role="status">
          {saved
            ? t("Saved on this device", "已儲存於此裝置")
            : t("Saving…", "儲存中…")}
        </p>
        <div role="status" className="status">
          {status}
        </div>
        <div className="title-row">
          <div>
            <p className="eyebrow">
              {t("Semester", "學期")} {semester}
            </p>
            <h1>{page==='courses'&&selectedCourse?courseFor(selectedCourse)?.name:nav.find((n) => n[0] === page)?.[2]}</h1>
          </div>
          {page !== "settings" && page !== "calendar" && (
            <button
              className="primary"
              onClick={() =>
                openForm(
                  page === "tasks"
                    ? "task"
                    : page === "timetable"
                      ? "meeting"
                      : page === "resources"
                        ? "resource"
                        : "course",
                )
              }
              disabled={
                (page === "tasks" || page === "timetable") &&
                !activeCourses.length
              }
            >
              <Plus size={18} />
              {page === "tasks"
                ? t("Add deadline", "新增截止事項")
                : page === "timetable"
                  ? t("Add class", "新增上課時段")
                  : page === "resources"
                    ? t("Add resource", "新增資源")
                    : t("Add course", "新增課程")}
            </button>
          )}
        </div>
        {page === "overview" && (
          <><div className="quick-capture"><button onClick={()=>quick('note')}>{t('New note','新增筆記')}</button><button onClick={()=>quick('assignment')}>{t('New assignment','新增作業')}</button><button onClick={()=>quick('exam')}>{t('New exam','新增考試')}</button></div>
            <p className="subtitle">
              {t(
                "Check your courses and upcoming deadlines.",
                "查看課程與即將到期的作業、考試。",
              )}
            </p>
            <div className="stats">
              <div>
                <BookOpen />
                <strong>{activeCourses.length}</strong>
                <span>{t("Courses this semester", "本學期課程")}</span>
              </div>
              <div>
                <CheckSquare />
                <strong>
                  {activeTasks.filter((task) => !task.done).length}
                </strong>
                <span>{t("Open deadlines", "待完成事項")}</span>
              </div>
              <div>
                <CalendarDays />
                <strong>{activeMeetings.length}</strong>
                <span>{t("Weekly class meetings", "每週上課時段")}</span>
              </div>
            </div>
            <div className="overview-grid">
              <section className="panel agenda-panel">
                <div className="section-head">
                  <h2>{t("Today's classes", "今日課程")}</h2>
                  <CalendarDays size={20} />
                </div>
                <p className="agenda-date">
                  {new Intl.DateTimeFormat(lang === "zh" ? "zh-TW" : "en-US", {
                    timeZone: "Asia/Taipei",
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  }).format(new Date())}
                </p>
                {activeMeetings
                  .filter(
                    (m) =>
                      m.day ===
                      (new Date(
                        new Date().toLocaleString("en-US", {
                          timeZone: "Asia/Taipei",
                        }),
                      ).getDay() || 7),
                  )
                  .sort((a, b) => a.start.localeCompare(b.start))
                  .map((m) => (
                    <div className="agenda-meeting" key={m.id}>
                      <time>
                        {m.start}
                        <small>{m.end}</small>
                      </time>
                      <div>
                        <strong>{courseFor(m.courseId)?.name}</strong>
                        <small>
                          {m.room ||
                            courseFor(m.courseId)?.room ||
                            t("Room not set", "尚未填寫教室")}
                        </small>
                      </div>
                    </div>
                  ))}
                {!activeMeetings.some(
                  (m) =>
                    m.day ===
                    (new Date(
                      new Date().toLocaleString("en-US", {
                        timeZone: "Asia/Taipei",
                      }),
                    ).getDay() || 7),
                ) && (
                  <div className="agenda-empty">
                    <CalendarDays size={28} />
                    <p>
                      {t("No classes scheduled today.", "今天沒有安排課程。")}
                    </p>
                  </div>
                )}
                <button
                  className="agenda-link"
                  onClick={() => setPage("timetable")}
                >
                  {t("Open weekly timetable", "查看每週課表")}{" "}
                  <ArrowUpRight size={16} />
                </button>
              </section>
              <section className="panel deadline-panel">
                <div className="section-head">
                  <h2>{t("Up next", "接下來")}</h2>
                  <button onClick={() => setPage("tasks")}>
                    {t("View all", "查看全部")}
                  </button>
                </div>
                {taskList(activeTasks.filter((task) => !task.done).slice(0, 5))}
              </section>
            </div>
            <section className="panel course-panel">
              <h2>{t("Your courses", "你的課程")}</h2>
              {!activeCourses.length ? (
                <div className="welcome">
                  <BookOpen size={32} />
                  <h3>{t("No courses yet", "尚未新增課程")}</h3>
                  <p>
                    {t(
                      "Add your first course, then connect notes, deadlines, and class times.",
                      "新增第一門課，再加入筆記、作業與上課時間。",
                    )}
                  </p>
                  <button
                    className="primary"
                    onClick={() => openForm("course")}
                  >
                    {t("Add your first course", "新增第一門課")}
                  </button>
                </div>
              ) : (
                <div className="course-grid">
                  {activeCourses.map((c) => (
                    <button
                      className="course-card"
                      key={c.id}
                      onClick={() => {
                        setSelectedCourse(c.id);
                        setPage("courses");
                      }}
                    >
                      <small>{c.code || semester}</small>
                      <h3>{c.name}</h3>
                      <p>
                        {c.instructor ||
                          t("Instructor not set", "尚未填寫教師")}
                      </p>
                      <span>
                        {c.credits} {t("credits", "學分")} · {c.room || "—"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
        {page==='overview'&&notes.length>0&&<section className="recent-notes"><h2>{t('Recent notes','最近筆記')}</h2>{notes.slice(-5).reverse().map(n=><button key={n.id} onClick={()=>{setSelectedCourse(n.courseId);setCourseTab('notes');setPage('courses');}}>{n.title}<small>{courseFor(n.courseId)?.name}</small></button>)}</section>}
        {page === "courses" && (
          <>
            {!selectedCourse && <div className="course-grid course-list">
              {activeCourses.map((c) => (
                <button
                  className={`course-card ${selectedCourse === c.id ? "selected" : ""}`}
                  key={c.id}
                  onClick={() => setSelectedCourse(c.id)}
                >
                  <small>{c.code || semester}</small>
                  <h2>{c.name}</h2>
                  <p>
                    {c.instructor} · {c.credits} {t("credits", "學分")}
                  </p>
                </button>
              ))}
            </div>}
            {!activeCourses.length && (
              <p className="empty">
                {t(
                  "Add a course to start taking notes.",
                  "新增課程後即可撰寫筆記。",
                )}
              </p>
            )}
            {courseFor(selectedCourse) && (
              <section className="panel">
                <div className="section-head">
                  <h2>{courseFor(selectedCourse)?.name}</h2>
                  <button onClick={()=>openForm('edit-course')}>{t('Edit course','編輯課程')}</button>
                  <button
                    className="danger"
                    onClick={() => removeCourse(selectedCourse)}
                  >
                    {t("Delete course", "刪除課程")}
                  </button>
                </div>
                <button onClick={()=>setSelectedCourse('')}>{t('All courses','所有課程')}</button>
                <p className="muted">{courseFor(selectedCourse)?.code} · {courseFor(selectedCourse)?.instructor} · {courseFor(selectedCourse)?.credits} {t('credits','學分')} · {courseFor(selectedCourse)?.room}</p>
                <div className="view-tabs">{[['notes',t('Notes','筆記')],['tasks',t('Assignments & exams','作業與考試')],['schedule',t('Schedule','上課時間')],['resources',t('Resources','資源')]].map(([id,label])=><button key={id} aria-pressed={courseTab===id} onClick={()=>setCourseTab(id)}>{label}</button>)}</div>
                {courseTab==='tasks'&&<><button onClick={()=>openForm('task')}>{t('Add deadline','新增期限')}</button><TaskViews tasks={tasks} courses={courses.filter(c=>c.id===selectedCourse)} onChange={setTasks} onEdit={editTask} zh={lang==='zh'}/></>}
                {courseTab==='schedule'&&<><button onClick={()=>openForm('meeting')}>{t('Add class','新增上課時間')}</button>{meetings.filter(m=>m.courseId===selectedCourse).map(m=><p key={m.id}>{days[m.day-1]} {m.start}–{m.end} · {m.room} <button onClick={()=>editMeeting(m)}>{t('Edit class','編輯上課時段')}</button></p>)}</>}
                {courseTab==='resources'&&<><button onClick={()=>openForm('resource')}>{t('Add resource','新增資源')}</button><ResourceLibrary key={selectedCourse} resources={resources} courses={courses} onChange={setResources} zh={lang==='zh'} folders={folders} onFoldersChange={setFolders} folderId={folderId} onFolderChange={setFolderId} initialFilter={selectedCourse}/></>}
                {courseTab==='notes'&&<>
                <div className="section-head">
                  <h3>{t("Course notes", "課程筆記")}</h3>
                  <button
                    onClick={() =>
                      setNotes([
                        ...notes,
                        {
                          id: crypto.randomUUID(),
                          courseId: selectedCourse,
                          title: t("Untitled note", "未命名筆記"),
                          body: "",
                        },
                      ])
                    }
                  >
                    <Plus size={16} />
                    {t("New note", "新增筆記")}
                  </button>
                </div>
                <Suspense fallback={<LoadingState compact zh={lang==='zh'}/>}>
                  {notes.filter(n=>n.courseId===selectedCourse).map(note=><NoteEditor key={note.id+'-'+lang} note={note} zh={lang==='zh'} dark={dark}
                    onChange={patch=>setNotes(current=>current.map(n=>n.id===note.id?{...n,...patch}:n))}
                    onDelete={async()=>{await removeFiles((note.attachments||[]).map(a=>a.fileId));setNotes(current=>current.filter(n=>n.id!==note.id));}}/>) }
                </Suspense>
                </>}
              </section>
            )}
          </>
        )}
        {page === 'tasks' && <TaskViews tasks={tasks} courses={activeCourses} onChange={setTasks} onEdit={editTask} zh={lang==='zh'}/>}
        {page === "timetable" && (
          <section className="panel">
            <div className="section-head">
              <h2>{t("Weekly classes", "每週課程")}</h2>
              <span className="muted">Asia/Taipei</span>
            </div>
            <div className="week">
              {days.map((day, index) => (
                <section className="day" key={day}>
                  <h3>{day}</h3>
                  {activeMeetings
                    .filter((m) => m.day === index + 1)
                    .sort((a, b) => a.start.localeCompare(b.start))
                    .map((m) => (
                      <div className="class-block" key={m.id}>
                        <time>
                          {m.start}–{m.end}
                        </time>
                        <strong>{courseFor(m.courseId)?.name}</strong>
                        <small>{m.room || courseFor(m.courseId)?.room}</small><button aria-label={t('Edit class','編輯上課時段')+' '+courseFor(m.courseId)?.name} onClick={()=>editMeeting(m)}>{t('Edit','編輯')}</button>
                        <button
                          aria-label={`${t("Delete class", "刪除時段")} ${courseFor(m.courseId)?.name}`}
                          onClick={() =>
                            setMeetings(
                              meetings.filter((item) => item.id !== m.id),
                            )
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                </section>
              ))}
            </div>
            <Suspense
              fallback={<LoadingState compact zh={lang === "zh"} />}
            >
              <PdfImport zh={lang === "zh"} onSave={importSchedule} />
            </Suspense>
          </section>
        )}
        {page === "resources" && (
          <ResourceLibrary
            resources={resources}
            courses={courses}
            onChange={setResources}
            zh={lang === "zh"}
            folders={folders} onFoldersChange={setFolders} folderId={folderId} onFolderChange={setFolderId}
          />
        )}
        {page === "calendar" && (
          <section className="panel school-calendar">
            <div className="section-head">
              <h2>逢甲大學－基礎行事曆</h2>
              <span className="muted">Asia/Taipei</span>
            </div>
            <p className="muted">
              {t(
                "Published by the university. Your personal classes and deadlines stay in their own views.",
                "學校公布的行事曆。個人課表與截止事項仍保留於各自頁面。",
              )}
            </p>
            <iframe
              title={t(
                "Feng Chia University school calendar",
                "逢甲大學學校行事曆",
              )}
              src={`https://calendar.google.com/calendar/embed?src=pun6cvita92hpjvgekbjukbhnk%40group.calendar.google.com&ctz=Asia%2FTaipei&hl=${lang === "zh" ? "zh_TW" : "en"}&mode=AGENDA&showPrint=0&showCalendars=0`}
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <p className="muted">
              {t(
                "If the calendar is blank, check your connection. Google must allow this calendar to be viewed publicly.",
                "若行事曆未顯示，請檢查網路連線。此行事曆必須由 Google 允許公開檢視。",
              )}
            </p>
          </section>
        )}
        {page === "settings" && (
          <section className="panel settings">
            <label>{t('Workspace name','工作區名稱')}<input value={appName} maxLength={32} onChange={e=>setAppName(e.target.value)}/></label>
            <h2>{t("Language and appearance", "語言與外觀")}</h2>
            <label>
              {t("Language", "語言")}
              <Select
                value={lang}
                onChange={(e) => setLang(e.target.value as "en" | "zh")}
              >
                <option value="en">English</option>
                <option value="zh">繁體中文</option>
              </Select>
            </label>
            <label>
              {t("Appearance", "外觀")}
              <Select
                value={dark ? "dark" : "light"}
                onChange={(e) => setDark(e.target.value === "dark")}
              >
                <option value="light">{t("Light", "淺色")}</option>
                <option value="dark">{t("Dark", "深色")}</option>
              </Select>
            </label>
            <button onClick={() => openForm("semester")}>
              {t("Add semester", "新增學期")}
            </button>
            <Suspense fallback={<LoadingState compact zh={lang==='zh'}/>}><AccountPanel zh={lang==='zh'} dark={dark}/></Suspense>
            <DataExport zh={lang==='zh'} workspace={{version:1,appName,selectedCourse,lang,dark,page,semester,semesters,courses,tasks,meetings,notes,resources,folders,folderId,courseTab,sidebarCollapsed}}/>
          </section>
        )}
      <LegalPages zh={lang === "zh"} name={appName || "CourseDock"}/></main>
      {form && (
        <Modal
          title={
            form==='edit-task'?t('Edit deadline','編輯期限'):form==='edit-meeting'?t('Edit class','編輯上課時段'):form === 'edit-course' ? t('Edit course','編輯課程') : form === "course"
              ? t("Add course", "新增課程")
              : (form === "task" || form === "edit-task")
                ? t("Add deadline", "新增截止事項")
                : (form === "meeting" || form === "edit-meeting")
                  ? t("Add class", "新增上課時段")
                  : form === "semester"
                    ? t("Add semester", "新增學期")
                    : t("Add resource", "新增資源")
          }
          close={() => setForm(null)}
        >
          <form onSubmit={submit}>
            {(form === "course" || form==='edit-course') && (
              <>
                <label>
                  {t("Course name", "課程名稱")}
                  <input name="name" required maxLength={120} autoFocus defaultValue={form==='edit-course'?courseFor(selectedCourse)?.name:''}/>
                </label>
                <div className="form-grid">
                  <label>
                    {t("Course code", "課程代碼")}
                    <input name="code" maxLength={40} defaultValue={form==='edit-course'?courseFor(selectedCourse)?.code:''}/>
                  </label>
                  <label>
                    {t("Credits", "學分")}
                    <input
                      name="credits"
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      defaultValue={form==='edit-course'?courseFor(selectedCourse)?.credits:3}
                      required
                    />
                  </label>
                  <label>
                    {t("Instructor", "授課教師")}
                    <input name="instructor" maxLength={100} defaultValue={form==='edit-course'?courseFor(selectedCourse)?.instructor:''}/>
                  </label>
                  <label>
                    {t("Classroom", "教室")}
                    <input name="room" maxLength={100} defaultValue={form==='edit-course'?courseFor(selectedCourse)?.room:''}/>
                  </label>
                </div>
              </>
            )}
            {(form === "task" || form === "edit-task") && (
              <>
                {courseSelect}
                <label>
                  {t("Title", "標題")}
                  <input name="title" required maxLength={160} defaultValue={form==='edit-task'?editingTask?.title:''}/> 
                </label>
                <label>
                  {t("Type", "類型")}
                  <Select name="kind" defaultValue={quickKind}>
                    <option value="assignment">
                      {t("Assignment", "作業")}
                    </option>
                    <option value="exam">{t("Exam", "考試")}</option>
                  </Select>
                </label>
                <label>
                  {t("Due date & time (Taiwan)", "截止日期與時間（台灣）")}
                  <input name="due" type="datetime-local" required defaultValue={form==='edit-task'&&editingTask?new Date(new Date(editingTask.due).getTime()+8*60*60*1000).toISOString().slice(0,16):''}/>
                </label>
              </>
            )}
            {(form === "meeting" || form === "edit-meeting") && (
              <>
                {courseSelect}
                <label>
                  {t("Day", "星期")}
                  <Select name="day" defaultValue={form==='edit-meeting'?editingMeeting?.day:1}>
                    {days.map((day, i) => (
                      <option key={day} value={i + 1}>
                        {day}
                      </option>
                    ))}
                  </Select>
                </label>
                <div className="form-grid">
                  <label>
                    {t("Start", "開始")}
                    <input
                      type="time"
                      name="start"
                      required
                      defaultValue={form==='edit-meeting'?editingMeeting?.start:'08:10'}
                    />
                  </label>
                  <label>
                    {t("End", "結束")}
                    <input
                      type="time"
                      name="end"
                      required
                      defaultValue={form==='edit-meeting'?editingMeeting?.end:'09:00'}
                    />
                  </label>
                </div>
                <label>
                  {t("Classroom", "教室")}
                  <input name="room" maxLength={100} defaultValue={form==='edit-meeting'?editingMeeting?.room:''}/>
                </label>
              </>
            )}
            {form === "resource" && (
              <>
                <label>
                  {t("Course", "課程")}
                  <Select name="courseId" defaultValue={selectedCourse}>
                    <option value="">{t("General", "一般資源")}</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </label>
                <label>
                  {t("Title", "標題")}
                  <input name="title" required maxLength={120} />
                </label>
                <label>
                  {t("Link", "連結")}
                  <input name="url" type="url" required maxLength={2000} />
                </label>
              </>
            )}
            {form === "semester" && (
              <label>
                {t("Taiwan academic year-semester", "學年度－學期")}
                <input
                  name="label"
                  placeholder="116-1"
                  required
                  pattern="[0-9]{3}-[12]"
                />
              </label>
            )}
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <div className="form-actions">
              <button type="button" onClick={() => setForm(null)}>
                {t("Cancel", "取消")}
              </button>
              <button className="primary" type="submit">
                {form?.startsWith('edit-') ? t('Save changes', '儲存變更') : t("Add", "新增")}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog ref={ref} onCancel={close} aria-labelledby="dialog-title">
      <div className="section-head">
        <h2 id="dialog-title">{title}</h2>
        <button onClick={close} aria-label="Close">
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SmoothScroll>
      <ErrorBoundary><AccountRoot /></ErrorBoundary>
    </SmoothScroll>
  </React.StrictMode>,
);
function AccountRoot(){
  const [preferences,setPreferences]=useState({lang:'en' as 'en'|'zh',dark:false});
  const [ready,setReady]=useState(false);
  useEffect(()=>{document.documentElement.dataset.theme=preferences.dark?'dark':'light';document.documentElement.lang=preferences.lang==='zh'?'zh-Hant':'en';},[preferences]);
  const onPreferences=React.useCallback((lang:'en'|'zh',dark:boolean)=>{setPreferences(previous=>previous.lang===lang&&previous.dark===dark?previous:{lang,dark});void saveInterfacePreferences({lang,dark}).catch(()=>{});},[]);
  useEffect(()=>{let active=true;void Promise.all([loadInterfacePreferences(),loadLegacyPreferences()]).then(([saved,value])=>{if(active){const settings=saved??value;if(settings)setPreferences({lang:settings.lang,dark:settings.dark});setReady(true);}}).catch(()=>{if(active)setReady(true);});return()=>{active=false;};},[]);
  if(!ready)return <LoadingState/>;
  const changeLandingLanguage=(lang:'en'|'zh')=>{
    if(location.pathname.startsWith(`${import.meta.env.BASE_URL}sign-`)){
      // Initialize the managed auth UI with one locale; dynamic locale/theme updates can race.
      void saveInterfacePreferences({lang,dark:preferences.dark}).then(()=>location.reload()).catch(()=>onPreferences(lang,preferences.dark));
    }else onPreferences(lang,preferences.dark);
  };
  return <Suspense fallback={<LoadingState/>}><AccountBoundary zh={preferences.lang==='zh'} dark={preferences.dark} onLanguageChange={changeLandingLanguage} onAppearanceChange={dark=>onPreferences(preferences.lang,dark)}><WorkspaceLoader onPreferences={onPreferences} preferences={preferences}/></AccountBoundary></Suspense>;
}
function WorkspaceLoader({onPreferences,preferences}:{onPreferences:(lang:'en'|'zh',dark:boolean)=>void;preferences:{lang:'en'|'zh';dark:boolean}}) {
  const storage=useWorkspaceStorage();
  const {pathname}=useLocation();
  const navigate=useNavigate();
  const [initial, setInitial] = useState<Workspace | undefined>();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [review,setReview]=useState(false);
  const [attempt,setAttempt]=useState(0);
  useEffect(() => {
    let active=true;
    void Promise.all([storage.loadWorkspace(),storage.legacySummary()])
      .then(([value,legacy]) => {
        if(!active)return;
        if(!value&&legacy){setReview(true);return;}
        setInitial(pathname==='/dashboard'&&value?{...value,page:'overview'}:value);
        setReady(true);
        if(pathname==='/dashboard')navigate('/',{replace:true});
      })
      .catch(() => {if(active)setFailed(true);});
    return()=>{active=false;};
  }, [storage,attempt]);
  if (failed) return <><ErrorPage storage/><LegalPages/></>;
  if(review&&!ready)return <main id="main" className="local-import-page"><h1>{preferences.lang==='zh'?'選擇此帳號的工作區':'Choose this account’s workspace'}</h1><LegacyImport zh={preferences.lang==='zh'} onImported={()=>{setReview(false);setAttempt(value=>value+1);}} onSkip={()=>{setReview(false);setReady(true);if(pathname==='/dashboard')navigate('/',{replace:true});}}/><Suspense fallback={null}><AccountSignOut zh={preferences.lang==='zh'}/></Suspense><LegalPages zh={preferences.lang==='zh'}/></main>;
  if (!ready) return <LoadingState/>;
  return <App initial={initial} onPreferences={onPreferences} preferences={preferences}/>;
}
