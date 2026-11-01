export const years=[['一年級','Year 1'],['二年級','Year 2'],['三年級','Year 3'],['四年級','Year 4'],['五年級','Year 5'],['六年級','Year 6'],['七年級以上','Year 7 or above'],['延修／延畢','Extended study'],['碩士班（不分年級）','Master’s — unspecified year'],['博士班（不分年級）','Doctoral — unspecified year'],['不分年級','No year designation']] as const;
export const sections=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'] as const;
export const CUSTOM_CLASS='__custom__';
export function splitClass(value:string){
 const parts=value.split(' / ');
 if(parts.length===2)return {year:parts[0],section:parts[1]};
 const match=value.match(/^([一二三四五六])(?:年級)?\s*([甲乙丙丁戊己庚辛壬癸])(?:班)?$/);
 if(match)return {year:match[1]+'年級',section:match[2]+'班'};
 // Keep ambiguous legacy text verbatim rather than guessing a year or section.
 return {year:value,section:'無分班'};
}
export function joinClass(year:string,section:string){
 if(!year.trim()||!section.trim()||year.trim().length>50||section.trim().length>50)return '';
 return section==='無分班'?year.trim():`${year.trim()} / ${section.trim()}`;
}
