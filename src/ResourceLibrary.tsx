import { Select, UploadArea, LoadingState } from "./Interface";
import { useState } from "react";
import {
  FileText,
  ArrowUpRight,
  Download,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import { getFile, putFile, removeFile } from "./storage";
import { folderDescendants, type Folder } from "./domain";
import { Folder as FolderIcon } from "lucide-react";
import type { Course, Resource } from "./domain";
export function ResourceLibrary({
  resources,
  courses,
  onChange,
  zh, folders, onFoldersChange, folderId, onFolderChange, initialFilter,
}: {
  resources: Resource[];
  courses: Course[];
  onChange: (resources: Resource[]) => void;
  zh: boolean;
  folders:Folder[]; onFoldersChange:(folders:Folder[])=>void; folderId:string; onFolderChange:(id:string)=>void; initialFilter?:string;
}) {
  const [sort, setSort] = useState("newest");
  const [filter, setFilter] = useState(initialFilter ?? "all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const t = (en: string, cn: string) => (zh ? cn : en);
  async function upload(file?: File) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (
        !extension ||
        !["pdf", "md", "png", "jpg", "jpeg", "docx", "pptx", "xlsx"].includes(
          extension,
        ) ||
        file.size > 10 * 1024 * 1024
      )
        throw new Error(
          t(
            "Use PDF, Markdown, PNG/JPEG, or DOCX/PPTX/XLSX under 10 MB.",
            "請使用小於 10 MB 的 PDF、Markdown、PNG/JPEG 或 DOCX/PPTX/XLSX。",
          ),
        );
      const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
      if (
        (extension === "pdf" &&
          new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") ||
        (["docx", "pptx", "xlsx"].includes(extension) &&
          (bytes[0] !== 80 || bytes[1] !== 75)) ||
        (extension === "png" && (bytes[0] !== 137 || bytes[1] !== 80)) ||
        (["jpg", "jpeg"].includes(extension) &&
          (bytes[0] !== 255 || bytes[1] !== 216))
      )
        throw new Error(
          t(
            "File contents do not match its extension.",
            "檔案內容與副檔名不符。",
          ),
        );
      const id = crypto.randomUUID();
      await putFile(id, file);
      onChange([
        ...resources,
        {
          id,
          folderId,
          fileId: id,
          title: file.name,
          url: "",
          originalName: file.name,
          size: file.size,
          createdAt: Date.now(),
          courseId: filter === "all" || filter === "general" ? "" : filter,
        },
      ]);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : t("Upload failed.", "上傳失敗。"),
      );
    } finally {
      setBusy(false);
    }
  }
  async function download(resource: Resource) {
    try {
    const blob = await getFile(resource.fileId!);
    if (!blob) {
      setError(t("File is missing from this browser.", "此瀏覽器找不到檔案。"));
      return;
    }
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    const extension = resource.originalName?.split(".").pop();
    anchor.download = resource.title
      .toLowerCase()
      .endsWith(`.${extension?.toLowerCase()}`)
      ? resource.title
      : `${resource.title}.${extension}`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError(t('Could not download this file. Check browser storage and try again.', '無法下載檔案。請檢查瀏覽器儲存設定後重試。'));
    }
  }
  const groups = [
    { id: "", name: t("General", "一般資源") },
    ...courses.map((c) => ({ id: c.id, name: c.name })),
  ];
  function folderPath(id=folderId):Folder[]{const path:Folder[]=[];const seen=new Set<string>();while(id&&!seen.has(id)){seen.add(id);const folder=folders.find(f=>f.id===id);if(!folder)break;path.unshift(folder);id=folder.parentId;}return path;}
  return (
    <section className="library">
      <div className="folder-breadcrumb"><button onClick={()=>onFolderChange('')}>{t('Resources','資源')}</button>{folderPath().map(f=><button key={f.id} onClick={()=>onFolderChange(f.id)}> / {f.name}</button>)}</div>
      <form className="folder-create" onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);const name=String(data.get('folderName')??'').trim();if(!name)return;onFoldersChange([...folders,{id:crypto.randomUUID(),name,parentId:folderId,courseId:filter==='all'||filter==='general'?'':filter}]);e.currentTarget.reset();}}><input aria-label={t('New folder name','新資料夾名稱')} name="folderName" maxLength={120} required placeholder={t('Folder name','資料夾名稱')}/><button>{t('Create folder','建立資料夾')}</button></form>
      <div className="folder-grid">{folders.filter(f=>f.parentId===folderId&&(filter==='all'||(f.courseId||'')===(filter==='general'?'':filter))).map(f=><div className="folder-tile" key={f.id}><button className="folder-open" onClick={()=>onFolderChange(f.id)}><FolderIcon size={44}/>{f.name}</button><input aria-label={t('Rename folder','重新命名資料夾')+' '+f.name} value={f.name} maxLength={120} onChange={e=>onFoldersChange(folders.map(x=>x.id===f.id?{...x,name:e.target.value}:x))} onBlur={()=>{if(!f.name.trim())onFoldersChange(folders.map(x=>x.id===f.id?{...x,name:t('Untitled folder','未命名資料夾')}:x));}}/><label>{t('Move folder to','移動資料夾至')}<Select value={f.parentId} onChange={e=>onFoldersChange(folders.map(x=>x.id===f.id?{...x,parentId:e.target.value}:x))}><option value="">{t('Resources root','資源根目錄')}</option>{folders.filter(x=>!folderDescendants(folders,f.id).includes(x.id)).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</Select></label><button disabled={folders.some(x=>x.parentId===f.id)||resources.some(r=>r.folderId===f.id)} onClick={()=>onFoldersChange(folders.filter(x=>x.id!==f.id))}>{t('Delete empty folder','刪除空資料夾')}</button></div>)}</div>
      <div className="library-toolbar">
        <label>
          {t("Course filter", "篩選課程")}
          <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">{t("All courses", "所有課程")}</option>
            <option value="general">{t("General", "一般資源")}</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </label>
        <label>
          {t("Sort by date", "依日期排序")}
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">{t("Newest first", "最新優先")}</option>
            <option value="oldest">{t("Oldest first", "最舊優先")}</option>
          </Select>
        </label>
      </div>
      <UploadArea label={t("Upload resource file", "上傳資源檔案")} accept=".pdf,.md,.png,.jpg,.jpeg,.docx,.pptx,.xlsx" busy={busy} zh={zh} onFile={file=>void upload(file)}/>
      <p className="muted">
        {t(
          "Files: 10 MB each, 100 MB total. Stored in this browser until account sync is connected.",
          "每個檔案 10 MB，總上限 100 MB。帳號同步完成前，檔案儲存於此瀏覽器。",
        )}
      </p>
      {busy && <LoadingState compact zh={zh} label={t("Saving file…", "正在儲存檔案…")}/>}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {groups
        .filter(
          (group) =>
            filter === "all" ||
            group.id === (filter === "general" ? "" : filter),
        )
        .map((group) => {
          const items = resources
            .filter((r) => (r.courseId || "") === group.id && (r.folderId || "") === folderId)
            .sort(
              (a, b) =>
                (sort === "newest" ? -1 : 1) *
                ((a.createdAt ?? 0) - (b.createdAt ?? 0)),
            );
          return (
            <section className="resource-group" key={group.id}>
              <div className="section-head">
                <h2>{group.name}</h2>
                <span className="muted">
                  {items.length} {t("resources", "項資源")}
                </span>
              </div>
              {!items.length && (
                <p className="empty">
                  {t(
                    "No resources in this group. Add a link or upload a file.",
                    "此分類尚無資源。新增連結或上傳檔案。",
                  )}
                </p>
              )}
              {items.map((r) => (
                <div className="library-row" key={r.id}>
                  {r.fileId ? <FileText size={22} /> : <LinkIcon size={22} />}
                  <div className="resource-info">
                    <input
                      aria-label={`${t("Rename resource", "重新命名資源")} ${r.title}`}
                      value={r.title}
                      maxLength={120}
                      onChange={(e) =>
                        onChange(
                          resources.map((item) =>
                            item.id === r.id
                              ? { ...item, title: e.target.value }
                              : item,
                          ),
                        )
                      }
                      onBlur={() => {
                        if (!r.title.trim())
                          onChange(
                            resources.map((item) =>
                              item.id === r.id
                                ? {
                                    ...item,
                                    title:
                                      r.originalName ||
                                      t("Untitled resource", "未命名資源"),
                                  }
                                : item,
                            ),
                          );
                      }}
                    />
                    <small>
                      {new Date(r.createdAt ?? Date.now()).toLocaleDateString(
                        zh ? "zh-TW" : "en-US",
                        { timeZone: "Asia/Taipei" },
                      )}
                      {r.size !== undefined
                        ? ` · ${(r.size / 1024).toFixed(0)} KB`
                        : ""}
                    </small>
                  </div>
                  <Select
                    aria-label={`${t("Move resource to course", "移動資源至課程")} ${r.title}`}
                    value={r.courseId ?? ""}
                    onChange={(e) =>
                      onChange(
                        resources.map((item) =>
                          item.id === r.id
                            ? { ...item, courseId: e.target.value }
                            : item,
                        ),
                      )
                    }
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </Select>
                  <Select aria-label={t('Move resource to folder','移動資源至資料夾')+' '+r.title} value={r.folderId||''} onChange={e=>onChange(resources.map(x=>x.id===r.id?{...x,folderId:e.target.value}:x))}><option value="">{t('Resources root','資源根目錄')}</option>{folders.map(f=><option key={f.id} value={f.id}>{folderPath(f.id).map(x=>x.name).join(' / ')}</option>)}</Select>
                  {r.fileId ? (
                    <button
                      className="icon"
                      aria-label={`${t("Download", "下載")} ${r.title}`}
                      onClick={() => void download(r)}
                    >
                      <Download size={18} />
                    </button>
                  ) : (
                    <a
                      className="icon"
                      aria-label={`${t("Open", "開啟")} ${r.title}`}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ArrowUpRight size={18} />
                    </a>
                  )}
                  <button
                    className="icon"
                    aria-label={`${t("Delete", "刪除")} ${r.title}`}
                    onClick={async () => {
                      if (
                        !confirm(
                          t(
                            "Delete this resource from this device?",
                            "從此裝置刪除此資源？",
                          ),
                        )
                      )
                        return;
                      try {
                        if (r.fileId) await removeFile(r.fileId);
                        onChange(resources.filter((item) => item.id !== r.id));
                      } catch {
                        setError(t('Could not delete this file. Try again.', '無法刪除檔案，請重試。'));
                      }
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </section>
          );
        })}
    </section>
  );
}
