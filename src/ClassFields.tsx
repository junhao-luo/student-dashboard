import {useState} from 'react';
import {Select} from './Interface';
import {years,sections,CUSTOM_CLASS,splitClass,joinClass} from './class-options';
export function ClassFields({value,zh}:{value:string;zh:boolean}){
 const initial=splitClass(value);
 const knownYear=years.some(([year])=>year===initial.year);
 const knownSection=initial.section==='無分班'||sections.some(section=>section+'班'===initial.section);
 const [year,setYear]=useState(value?(knownYear?initial.year:CUSTOM_CLASS):'');
 const [section,setSection]=useState(value?(knownSection?initial.section:CUSTOM_CLASS):'');
 const [customYear,setCustomYear]=useState(knownYear?'':initial.year),[customSection,setCustomSection]=useState(knownSection?'':initial.section);
 const t=(en:string,cn:string)=>zh?cn:en;
 return <div className="class-fields"><input type="hidden" name="className" value={joinClass(year===CUSTOM_CLASS?customYear:year,section===CUSTOM_CLASS?customSection:section)}/><div className="class-fields-grid"><label>{t('Year / study status','年級／就學狀態')}<Select aria-label={t('Year / study status','年級／就學狀態')} aria-required="true" value={year} onChange={e=>setYear(e.target.value)}><option value="" disabled>{t('Choose year or status','選擇年級或狀態')}</option>{years.map(([cn,en])=><option key={cn} value={cn}>{t(en,cn)}</option>)}<option value={CUSTOM_CLASS}>{t('Other — specify','其他（自行填寫）')}</option></Select></label><label>{t('Class section','分班')}<Select aria-label={t('Class section','分班')} aria-required="true" value={section} onChange={e=>setSection(e.target.value)}><option value="" disabled>{t('Choose section','選擇分班')}</option>{sections.map(s=><option key={s} value={s+'班'}>{t(`Section ${s}`,s+'班')}</option>)}<option value="無分班">{t('No section','無分班')}</option><option value={CUSTOM_CLASS}>{t('Other — specify','其他（自行填寫）')}</option></Select></label></div>{year===CUSTOM_CLASS&&<label>{t('Custom year / study status','自訂年級／就學狀態')}<input required maxLength={50} value={customYear} onChange={e=>setCustomYear(e.target.value)} autoComplete="off"/></label>}{section===CUSTOM_CLASS&&<label>{t('Custom section','自訂分班')}<input required maxLength={50} value={customSection} onChange={e=>setCustomSection(e.target.value)} autoComplete="off"/></label>}</div>;
}
