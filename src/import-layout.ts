export function meetingColumns(rows: {day:number;start:string;end:string}[]) {
  const result = rows.map(() => ({lane:0,count:1}));
  for (let day=1;day<=7;day++) {
    const meetings=rows.map((row,index)=>({...row,index})).filter(row=>row.day===day).sort((a,b)=>a.start.localeCompare(b.start));
    let group: typeof meetings=[];
    let ends: string[]=[];
    let groupEnd='';
    function finish(){for(const item of group)result[item.index].count=ends.length;group=[];ends=[];}
    for(const meeting of meetings){
      if(group.length&&meeting.start>=groupEnd)finish();
      let lane=ends.findIndex(end=>end<=meeting.start);
      if(lane<0)lane=ends.length;
      ends[lane]=meeting.end;
      result[meeting.index].lane=lane;
      group.push(meeting);
      groupEnd=group.length===1?meeting.end:groupEnd>meeting.end?groupEnd:meeting.end;
    }
    finish();
  }
  return result;
}
