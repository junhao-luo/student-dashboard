import {test,expect} from 'vitest';
import {synchronizedStorage} from '../src/academic-storage';
import type {accountStorage,Workspace,SyncState} from '../src/storage';
import {emptyAcademic,academicData} from '../src/academic';
function fixture(){
 let local:Workspace={version:1,lang:'en',dark:false,page:'overview',semester:'115-1',...emptyAcademic(),notes:[],resources:[]};
 let state:SyncState|undefined;
 const raw={loadWorkspace:async()=>structuredClone(local),saveWorkspace:async(value:Workspace)=>{local=structuredClone(value);},setSyncState:async(value:SyncState)=>{state=value;},syncState:async()=>state} as unknown as ReturnType<typeof accountStorage>;
 return {raw,local,getState:()=>state};
}
test('client serializes academic saves, skips preference-only requests and loads cloud on another device',async()=>{
 const f=fixture();let cloud={revision:1,data:emptyAcademic()},calls=0;
 const transport={get:async()=>cloud,save:async(input:{revision:number;data:typeof cloud.data})=>{expect(input.revision).toBe(cloud.revision);calls++;await Promise.resolve();cloud={revision:cloud.revision+1,data:input.data};return cloud;}};
 const storage=synchronizedStorage(f.raw,transport,cloud,()=>{});
 await storage.saveWorkspace({...f.local,dark:true});expect(calls).toBe(0);
 const course={id:'kept-local-id',semester:'115-1',name:'Algorithms',code:'CS',instructor:'',credits:3,room:'',color:'blue'};
 await Promise.all([storage.saveWorkspace({...f.local,courses:[course]}),storage.saveWorkspace({...f.local,courses:[{...course,name:'Updated'}]})]);
 expect(calls).toBe(2);expect(cloud.revision).toBe(3);
 const second=fixture(),other=synchronizedStorage(second.raw,transport,cloud,()=>{});
 expect((await other.loadWorkspace()).courses).toEqual([{...course,name:'Updated'}]);
 expect(f.getState()).toEqual({mode:'cloud'});
});
test('connection failure retains a recoverable pending request and the latest local draft without overwriting cloud',async()=>{
 const f=fixture();let alerted=false,calls=0;
 const data={...emptyAcademic(),semesters:['115-1','115-2','116-1']};
 const storage=synchronizedStorage(f.raw,{get:async()=>null,save:async()=>{calls++;throw Error('response lost');}},{revision:4,data:emptyAcademic()},()=>{alerted=true;});
 await expect(storage.saveWorkspace({...f.local,...data})).rejects.toThrow();
 const pending=f.getState()?.pending;expect(pending).toMatchObject({revision:4,data});expect(pending?.requestId).toBeTruthy();expect(alerted).toBe(true);
 const newer={...f.local,...data,semesters:[...data.semesters,'116-2']};
 await expect(storage.saveWorkspace(newer)).rejects.toThrow('Synchronization stopped');
 expect(calls).toBe(1);expect(academicData((await f.raw.loadWorkspace())!)).toEqual(academicData(newer));
 expect(f.getState()?.pending).toEqual(pending);
});
test('cloud reload preserves only matching local task attachments and attachment-only edits stay local',async()=>{
 const f=fixture(),course={id:'course',semester:'115-1',name:'Study',code:'',instructor:'',credits:3,courseType:'required' as const,room:'',color:'blue'};
 const task={id:'task',courseId:'course',title:'Study',kind:'assignment' as const,due:'2026-10-20T00:00:00.000Z',done:false,status:'in_progress' as const,description:'Cloud notes',reminderDays:null};
 const attachment={fileId:'local-file',name:'handout.pdf',size:10};
 await f.raw.saveWorkspace({...f.local,courses:[course],tasks:[{...task,description:'Old notes',attachments:[attachment]},{...task,id:'deleted-task',attachments:[attachment]}]});
 const cloud={revision:2,data:{...emptyAcademic(),courses:[course],tasks:[task,{...task,id:'new-cloud-task'}]}};
 let calls=0;const storage=synchronizedStorage(f.raw,{get:async()=>cloud,save:async()=>{calls++;return cloud;}},cloud,()=>{});
 const loaded=await storage.loadWorkspace();
 expect(loaded.tasks).toHaveLength(2);expect(loaded.tasks[0]).toMatchObject({description:'Cloud notes',attachments:[attachment]});expect(loaded.tasks[1]).not.toHaveProperty('attachments');
 await storage.saveWorkspace({...loaded,tasks:[{...loaded.tasks[0],attachments:[]},loaded.tasks[1]]});
 expect(calls).toBe(0);expect((await f.raw.loadWorkspace())!.tasks[0].attachments).toEqual([]);
});
