export type StudentProfileInput = {name:string;studentId:string;department:string;className:string;phone:string};
export type StudentProfile = StudentProfileInput & {schoolEmail:string};

export function normalizeStudentProfile(input:StudentProfileInput):StudentProfile|null {
  const clean=Object.fromEntries(Object.entries(input).map(([key,value])=>[key,value.trim()])) as StudentProfileInput;
  if(Object.values(clean).some(value=>!value||value.length>120)||!/^\w{1,30}$/.test(clean.studentId)||!/[A-Za-z0-9]/.test(clean.studentId))return null;
  if(!/^(09\d{8}|\+8869\d{8})$/.test(clean.phone))return null;
  return {...clean,phone:clean.phone.replace(/^\+886/,'0'),schoolEmail:`${clean.studentId.toLowerCase()}@o365.fcu.edu.tw`};
}
