import type {accountStorage,Workspace} from './storage';
import {academicData,type AcademicData,type AcademicSnapshot} from './academic';
export type AcademicTransport={get:()=>Promise<AcademicSnapshot|null>;save:(input:{revision:number;requestId:string;data:AcademicData})=>Promise<AcademicSnapshot>};
export function synchronizedStorage(raw:ReturnType<typeof accountStorage>,transport:AcademicTransport,initial:AcademicSnapshot,onError:()=>void){
 let snapshot=initial,queue=Promise.resolve(),failed=false;
 return {...raw,
  async importLegacy(){await raw.importLegacy();await raw.setSyncState({mode:'local'});},
  async loadWorkspace(){
   const local=await raw.loadWorkspace(),data=snapshot.data;
   const tasks=data.tasks.map(task=>{const attachments=local?.tasks.find(t=>t.id===task.id)?.attachments;return attachments?{...task,attachments}:task;});
   return {...(local??{version:1,lang:'en',dark:false,page:'overview',semester:data.semesters[0],notes:[],resources:[]}),...data,tasks,semester:data.semesters.includes(local?.semester??'')?local!.semester:data.semesters[0]} as Workspace;
  },
  saveWorkspace(value:Workspace){
   const captured=structuredClone(value);
   const result=queue.catch(()=>{}).then(async()=>{
    await raw.saveWorkspace(captured);
    if(failed)throw Error('Synchronization stopped; local draft retained.');
    const data=academicData(captured);
    if(JSON.stringify(data)===JSON.stringify(snapshot.data))return;
    const pending={revision:snapshot.revision,requestId:crypto.randomUUID(),data};
    await raw.setSyncState({mode:'cloud',pending});
    try{snapshot=await transport.save(pending);await raw.setSyncState({mode:'cloud'});}
    catch(error){failed=true;onError();throw error;}
   });
   queue=result;return result;
  },
 };
}
