async page=>{
  const assert=(value,message)=>{if(!value)throw Error(message);};
  await page.evaluate(async()=>{
    const {saveWorkspace}=await import('/src/storage.ts');
    await saveWorkspace({version:1,lang:'en',dark:false,page:'courses',selectedCourse:'course-1',semester:'115-1',semesters:['115-1'],courses:[{id:'course-1',semester:'115-1',code:'CS101',name:'Computer Science',instructor:'Instructor',credits:3,room:'A101',color:'blue'}],tasks:[],meetings:[],resources:[],folders:[],notes:[{id:'legacy',courseId:'course-1',title:'Lecture notes',body:'# Week one\n\nExisting notes must survive.'}]});
  });
  await page.reload();await page.setViewportSize({width:1440,height:1000});
  await page.locator('.bn-editor').waitFor();
  assert(await page.getByText('Existing notes must survive.',{exact:true}).isVisible(),'Legacy note did not migrate');
  const upload=page.locator('.rich-note input[type=file]');
  await upload.setInputFiles({name:'chapter.md',mimeType:'text/markdown',buffer:Buffer.from('# Imported chapter\n\n- [ ] Review chapter\n\n| Topic | Status |\n| --- | --- |\n| Lists | Done |\n\n```js\nconst total = 2;\n```\n\n![remote](https://tracking.invalid/image.png)\n\n[unsafe](javascript:alert(1))')});
  await page.getByText('Imported chapter',{exact:true}).waitFor();
  assert(await page.locator('.bn-editor table').count()>0,'Table was not imported');
  assert(await page.locator('.bn-editor input[type=checkbox]').count()>0,'Checklist was not imported');
  await upload.setInputFiles({name:'lecture.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\nSynthetic test attachment')});
  await page.locator('.note-attachments').getByText('lecture.pdf').waitFor();
  await page.locator('.note-title').fill('Study notes');
  await page.reload();await page.locator('.bn-editor').waitFor();
  assert(await page.locator('.note-title').inputValue()==='Study notes','Title did not persist');
  assert(await page.getByText('Imported chapter',{exact:true}).isVisible(),'Imported blocks did not persist');
  assert(await page.locator('.note-attachments').getByText('lecture.pdf').isVisible(),'Attachment did not persist');
  const editor=page.locator('.bn-editor');
  await editor.locator('[data-content-type=paragraph]').first().click();
  await page.getByRole('button',{name:'Move block up',exact:true}).click();
  await page.screenshot({path:'notes-preview.png',fullPage:true});
  await page.locator('aside').getByRole('button',{name:'Settings',exact:true}).click();
  const event=page.waitForEvent('download');await page.getByRole('button',{name:'Export workspace ZIP'}).click();
  const download=await event;await download.saveAs('.playwright-cli/workspace-export.zip');
  assert((await download.failure())===null,'ZIP download failed');
  for(const width of [320,768,1440]){
    await page.setViewportSize({width,height:900});
    if(width<600){await page.locator('.mobile-menu').click();}
    await page.locator('aside').getByRole('button',{name:'Courses & notes',exact:true}).click();
    await page.locator('aside').getByRole('button',{name:'All courses',exact:true}).click();
    await page.locator('.course-list').getByRole('button').first().click();
    await page.locator('.bn-editor').waitFor();
    assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`Overflow at ${width}`);
  }
  await upload.setInputFiles({name:'fake.pdf',mimeType:'application/pdf',buffer:Buffer.from('not a pdf')});
  await page.getByRole('alert').filter({hasText:'File content'}).waitFor();
  console.log('Legacy migration, Markdown blocks, PDF attachment, refresh, reorder, ZIP download and 3 widths passed');
}
