async page=>{
  await page.locator('.rich-note input[type=file]').setInputFiles({name:'diagram.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aIJsAAAAASUVORK5CYII=','base64')});
  await page.locator('.note-attachments').getByText('diagram.png',{exact:true}).waitFor();
  await page.locator('.bn-editor img').waitFor();
  await page.reload();await page.locator('.bn-editor img').waitFor();
  if(!await page.locator('.bn-editor img').evaluate(el=>el.complete&&el.naturalWidth===1))throw Error('Image did not recover');
  await page.locator('aside').getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('combobox',{name:'Appearance',exact:true}).click();await page.getByRole('option',{name:'Dark',exact:true}).click();
  await page.getByRole('combobox',{name:'Language',exact:true}).click();await page.getByRole('option',{name:'繁體中文',exact:true}).click();
  await page.locator('aside').getByRole('button',{name:'課程與筆記',exact:true}).click();await page.locator('aside').getByRole('button',{name:'所有課程',exact:true}).click();await page.locator('.course-list button').first().click();
  await page.locator('.bn-editor img').waitFor();
  if(await page.locator('.bn-container').getAttribute('data-color-scheme')!=='dark')throw Error('Editor did not follow theme');
  await page.screenshot({path:'notes-dark-preview.png',fullPage:true});
  page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'刪除筆記',exact:true}).click();
  await page.locator('.rich-note').waitFor({state:'detached'});
  const result=await page.evaluate(async()=>{const {loadWorkspace,getFile}=await import('/src/storage.ts');const w=await loadWorkspace();return {notes:w.notes.length,files:await new Promise((resolve,reject)=>{const request=indexedDB.open('fcu-study-workspace');request.onsuccess=()=>{const db=request.result,tx=db.transaction('files');const req=tx.objectStore('files').count();req.onsuccess=()=>{resolve(req.result);db.close();};};request.onerror=()=>reject(request.error);})};});
  if(result.notes||result.files)throw Error('Deletion left note records or attachments');
  return {passed:'Local image refresh, Traditional Chinese, dark theme, note/file deletion'};
}
