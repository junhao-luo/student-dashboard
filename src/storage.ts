import { openDB } from "idb";
import type { Course, Task, Meeting, Note, Resource, Folder } from "./domain";
export type Workspace = {
  version: number;
  appName?: string;
  selectedCourse?: string;
  lang: "en" | "zh";
  dark: boolean;
  page: string;
  semester: string;
  semesters: string[];
  courses: Course[];
  tasks: Task[];
  meetings: Meeting[];
  notes: Note[];
  resources: Resource[];
  folders?: Folder[];
  sidebarCollapsed?: boolean;
  folderId?: string;
  courseTab?: string;
};
const database = openDB("fcu-study-workspace", 1, {
  upgrade(db) {
    db.createObjectStore("workspace");
    db.createObjectStore("files");
  },
});
export async function loadWorkspace(): Promise<Workspace | undefined> {
  const value = await (await database).get("workspace", "current");
  if (
    value &&
    (value.version !== 1 || (value.folders !== undefined && !Array.isArray(value.folders)) ||
      ![
        "courses",
        "tasks",
        "meetings",
        "notes",
        "resources",
        "semesters",
      ].every((key) => Array.isArray(value[key])))
  )
    throw new Error("Stored workspace has an unsupported format.");
  return value;
}
export async function saveWorkspace(value: Workspace) {
  return (await database).put("workspace", value, "current");
}
export async function putFile(id: string, file: File) {
  const db = await database;
  const tx = db.transaction("files", "readwrite");
  const files: Blob[] = await tx.store.getAll();
  if (
    files.reduce((size, item) => size + item.size, 0) + file.size >
    100 * 1024 * 1024
  ) {
    tx.abort();
    throw new Error("Storage limit reached (100 MB).");
  }
  await tx.store.put(file, id);
  await tx.done;
}
export async function getFile(id: string): Promise<Blob | undefined> {
  return (await database).get("files", id);
}
export async function removeFile(id: string) {
  return (await database).delete("files", id);
}
export async function removeFiles(ids:string[]) {
  const tx=(await database).transaction('files','readwrite');
  await Promise.all(ids.map(id=>tx.store.delete(id)));
  await tx.done;
}
