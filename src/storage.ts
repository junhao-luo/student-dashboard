import { openDB } from "idb";
import type { Course, Task, Meeting, Note, Resource, Folder } from "./domain";
import type {AcademicData} from './academic';
export type SyncState={mode:'local'|'cloud';pending?:{revision:number;requestId:string;data:AcademicData}};
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
export async function loadInterfacePreferences():Promise<{lang:'en'|'zh';dark:boolean}|undefined>{
  return (await database).get('workspace','interface-preferences');
}
export async function saveInterfacePreferences(value:{lang:'en'|'zh';dark:boolean}){
  await (await database).put('workspace',value,'interface-preferences');
}
function checkedWorkspace(value: Workspace | undefined) {
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
      ].every((key) => Array.isArray(value[key as keyof Workspace])))
  )
    throw new Error("Stored workspace has an unsupported format.");
  return value;
}
export async function loadLegacyPreferences() {
  const value = checkedWorkspace(await (await database).get('workspace','current'));
  return value && {lang:value.lang,dark:value.dark};
}
// This namespace separates normal account use on one device; it is not server authorization or encryption.
export function accountStorage(account: string) {
  if (!account) throw Error('An account is required.');
  const key = ['account',account];
  const fileKey = (id:string) => ['account',account,id];
  return {
    transferSourceUrl(){return `https://eljhon.me/student-dashboard/#transfer=${encodeURIComponent(account)}`;},
    async restoreBackup(value:Workspace,attachments:Map<string,File>){
      const tx=(await database).transaction(['workspace','files'],'readwrite');
      try{
        const records=tx.objectStore('workspace'),files=tx.objectStore('files');
        const existing=await records.get(key);
        if(existing&&(existing.notes?.length||existing.resources?.length||existing.folders?.length||existing.tasks?.some((task:Task)=>task.attachments?.length)))throw Error('Destination contains local records.');
        if((await files.getAllKeys(IDBKeyRange.bound(['account',account],['account',account,[]]))).length)throw Error('Destination contains files.');
        if(existing)await records.put(existing,['before-domain-transfer',account]);
        for(const [id,file] of attachments)await files.put(file,fileKey(id));
        await records.put(value,key);
        await records.put({mode:'local'},['sync',account]);
        await tx.done;
      }catch(error){tx.abort();await tx.done.catch(()=>{});throw error;}
    },
    async syncState():Promise<SyncState|undefined>{return (await database).get('workspace',['sync',account]);},
    async setSyncState(value:SyncState|undefined){const db=await database;if(value)await db.put('workspace',value,['sync',account]);else await db.delete('workspace',['sync',account]);},
    async backupBeforeSync(value:Workspace|undefined){if(value)await (await database).put('workspace',value,['before-cloud-sync',account]);},
    async loadWorkspace(): Promise<Workspace | undefined> {
      const value=checkedWorkspace(await (await database).get('workspace',key));
      const preferences=await loadInterfacePreferences();
      return value&&preferences?{...value,...preferences}:value;
    },
    async saveWorkspace(value:Workspace) { await (await database).put('workspace',value,key); },
    async putFile(id: string, file: File) {
  if(file.size>10*1024*1024)throw Error('File exceeds the 10 MB limit.');
  const db = await database;
  const tx = db.transaction("files", "readwrite");
  const range=IDBKeyRange.bound(['account',account],['account',account,[]]);
  const files: Blob[] = await tx.store.getAll(range);
  const previous:Blob|undefined=await tx.store.get(fileKey(id));
  if (
    files.reduce((size, item) => size + item.size, 0) - (previous?.size??0) + file.size >
    100 * 1024 * 1024
  ) {
    tx.abort();
    throw new Error("Storage limit reached (100 MB).");
  }
  await tx.store.put(file, fileKey(id));
  await tx.done;
    },
    async getFile(id:string):Promise<Blob|undefined> {return (await database).get('files',fileKey(id));},
    async removeFile(id:string) {await (await database).delete('files',fileKey(id));},
    async removeFiles(ids:string[]) {
  const tx=(await database).transaction('files','readwrite');
  await Promise.all(ids.map(id=>tx.store.delete(fileKey(id))));
  await tx.done;
    },
    async legacySummary() {
      const db=await database;
      if(await db.get('workspace','legacy-claimed'))return undefined;
      const value=checkedWorkspace(await db.get('workspace','current'));
      if(!value)return undefined;
      return {courses:value.courses.length,notes:value.notes.length,tasks:value.tasks.length,meetings:value.meetings.length,resources:value.resources.length,folders:value.folders?.length??0};
    },
    async importLegacy() {
      const tx=(await database).transaction(['workspace','files'],'readwrite');
      try {
        const records=tx.objectStore('workspace'),files=tx.objectStore('files');
        if(await records.get('legacy-claimed'))throw Error('This workspace was already imported.');
        const existing=checkedWorkspace(await records.get(key));
        if(existing&&['courses','notes','tasks','meetings','resources','folders'].some(field=>(existing[field as keyof Workspace] as unknown[]|undefined)?.length))throw Error('Import requires an empty account workspace.');
        const value=checkedWorkspace(await records.get('current'));
        if(!value)throw Error('Previous workspace is unavailable.');
        const ids=new Set([...value.resources.flatMap(r=>r.fileId?[r.fileId]:[]),...value.tasks.flatMap(t=>(t.attachments??[]).map(a=>a.fileId)),...value.notes.flatMap(n=>[
          ...(n.attachments??[]).map(a=>a.fileId),
          ...[...(n.body+' '+(n.blocks??'')).matchAll(/local-file:([a-zA-Z0-9-]+)/g)].map(match=>match[1]),
        ])]);
        let total=0;
        for(const id of ids){
          const file:Blob|undefined=await files.get(id);
          if(!file||file.size>10*1024*1024)throw Error('An attachment is missing or exceeds the file limit.');
          total+=file.size;if(total>100*1024*1024)throw Error('Workspace exceeds the storage limit.');
          await files.put(file,fileKey(id));
        }
        await records.put(value,key);
        await records.put(account,'legacy-claimed');
        await tx.done;
      } catch(error) {tx.abort();await tx.done.catch(()=>{});throw error;}
    },
  };
}
