async page => {
  const failures=[];
  page.on('pageerror',e=>failures.push(e.message));
  const button=name=>page.getByRole('button',{name,exact:true});
  const select=async(name,option)=>{await page.getByRole('combobox',{name,exact:true}).click();await page.getByRole('option',{name:option,exact:true}).click();};
  const saved=()=>page.locator('.save-status').filter({hasText:'Saved on this device'}).waitFor();
  await page.setViewportSize({width:1440,height:1000});
  for(const [name,code,room] of [['Linear algebra','MATH201','Science 302'],['Computer science','CS101','Library 213'],['Academic English','ENG101','Humanities 607']]) {
    await button('Overview').click();await button('Add course').click();await page.getByLabel('Course name').fill(name);await page.getByLabel('Course code').fill(code);await page.getByLabel('Instructor').fill('Sample instructor');await page.getByLabel('Classroom').fill(room);await button('Add').click();
  }
  await button('Courses & notes').click();await button('All courses').click();await page.getByRole('button',{name:/MATH201 Linear algebra/}).click();await button('New note').click();await page.getByLabel('Note title').fill('Week 1 notes');await page.getByLabel('Note content').fill('# Vectors\nReview the practice exercises.');await saved();await page.reload();if(await page.getByLabel('Note content').inputValue()!=='# Vectors\nReview the practice exercises.')throw new Error('Note refresh recovery failed');
  await button('Edit course').click();await page.getByLabel('Credits').fill('4');await button('Save changes').click();
  await button('Assignments & exams').click();await button('Add deadline').click();await page.getByLabel('Title',{exact:true}).fill('Practice exercises');await page.getByLabel('Due date & time (Taiwan)').fill('2026-10-20T10:10');await button('Add').click();
  await button('Timetable').click();await button('Add class').click();await select('Day','Fri');await page.getByLabel('Start',{exact:true}).fill('09:10');await page.getByLabel('End',{exact:true}).fill('10:00');await page.getByLabel('Classroom').fill('Science 302');await button('Add').click();
  const drop=async(selector,name,type,content)=>{const data=await page.evaluateHandle(({name,type,content})=>{const dt=new DataTransfer();dt.items.add(new File([content],name,{type}));return dt;},{name,type,content});await page.locator(selector).dispatchEvent('drop',{dataTransfer:data});await data.dispose();};
  await drop('.upload-area','invalid.pdf','application/pdf','Not a PDF');await page.getByRole('alert').filter({hasText:'not a valid PDF'}).waitFor();
  await button('Resources').first().click();await drop('.upload-area','reading.md','text/markdown','# Sample reading');await page.getByLabel('Rename resource reading.md',{exact:true}).fill('Course reading');await select('Move resource to course Course reading','Linear algebra');await select('Sort by date','Oldest first');await select('Course filter','Linear algebra');await saved();await page.reload();await page.getByLabel('Rename resource Course reading',{exact:true}).waitFor();
  const download=page.waitForEvent('download');await button('Download Course reading').click();if((await download).suggestedFilename()!=='Course reading.md')throw new Error('Rename extension failed');
  await button('Settings').click();await select('Appearance','Dark');await select('Language','繁體中文');await page.locator('.save-status').filter({hasText:'已儲存於此裝置'}).waitFor();await page.reload();await page.getByRole('heading',{name:'設定',exact:true}).waitFor();if(await page.evaluate(()=>document.documentElement.dataset.theme)!=='dark')throw new Error('Appearance refresh recovery failed');await select('語言','English');await select('Appearance','Light');
  const combo=page.getByRole('combobox',{name:'Language',exact:true});await combo.focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');await page.keyboard.press('Escape');if(await combo.getAttribute('aria-expanded')!=='false')throw new Error('Keyboard menu dismissal failed');
  for(const name of ['Privacy policy','Terms and conditions','Your data and privacy']){await page.getByRole('link',{name,exact:true}).click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});}
  for(const width of [320,768,1024,1440]) {await page.setViewportSize({width,height:1000});for(const name of ['Overview','Courses & notes','Assignments & exams','Timetable','Resources','School calendar','Settings']){await button(name).first().click();if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error('Overflow '+name+' '+width);}}
  await button('Overview').click();await page.screenshot({path:'preview.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'mobile-preview.png',fullPage:true});
  if(failures.length)throw new Error(failures.join('\n'));
}
