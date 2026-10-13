import {semesterCredits,type Course} from './domain';
export function CreditSummary({courses,semester,zh}:{courses:Course[];semester:string;zh:boolean}){
 const totals=semesterCredits(courses,semester),t=(en:string,cn:string)=>zh?cn:en;
 return <section className="credit-summary" aria-label={t('Semester credit calculator','學期學分計算')}><div><small>{semester} · {t('Total credits','總學分')}</small><strong>{totals.total}</strong></div><div><small>{t('Required','必修')}</small><strong>{totals.required}</strong></div><div><small>{t('Elective','選修')}</small><strong>{totals.elective}</strong></div>{courses.some(c=>c.semester===semester&&!c.courseType)&&<div><small>{t('Unclassified — set each course type','未分類，請設定課程類型')}</small><strong>{totals.unclassified}</strong></div>}</section>;
}
