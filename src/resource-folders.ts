import {folderDescendants,type Folder,type Resource} from './domain.ts';
export const courseFolder=(id:string)=>`course:${id}`;
export function folderCourse(id:string,folders:Folder[]):string{
 const seen=new Set<string>();while(id&&!seen.has(id)){if(id.startsWith('course:'))return id.slice(7);seen.add(id);const folder=folders.find(f=>f.id===id);if(!folder)return '';if(!folder.parentId)return folder.courseId??'';id=folder.parentId;}return '';
}
export const folderParent=(folder:Folder)=>folder.parentId||(folder.courseId?courseFolder(folder.courseId):'general');
export function resourceLocation(resource:Resource){return resource.folderId|| (resource.courseId?courseFolder(resource.courseId):'general');}
export function moveResource(resource:Resource,target:string,folders:Folder[]):Resource{return {...resource,folderId:target,courseId:folderCourse(target,folders)};}
export function moveFolder(folders:Folder[],resources:Resource[],id:string,target:string){
 const ids=folderDescendants(folders,id);if(ids.includes(target))throw Error('Folder cannot be moved into itself.');
 const courseId=folderCourse(target,folders);
 return {folders:folders.map(f=>ids.includes(f.id)?{...f,parentId:f.id===id?target:f.parentId,courseId}:f),resources:resources.map(r=>ids.includes(r.folderId??'')?{...r,courseId}:r)};
}
