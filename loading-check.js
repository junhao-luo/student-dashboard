async page => {
  await page.setViewportSize({width:1440,height:1000});
  await page.route('**/src/storage.ts*',async route=>{
    const response=await route.fetch();
    const body=(await response.text()).replace('async function loadWorkspace() {','async function loadWorkspace() { await new Promise(resolve=>setTimeout(resolve,5000));');
    if(!body.includes('setTimeout(resolve,5000)'))throw new Error('Loading test interception failed');
    await route.fulfill({response,body,headers:{...response.headers(),'cache-control':'no-store',etag:''}});
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('.skeleton-workspace').waitFor();
  await page.screenshot({path:'.playwright-cli/loading-skeleton.png'});
  await page.locator('.spinner-state').waitFor();
  if(await page.locator('.skeleton-workspace').count())throw new Error('Skeleton did not transition');
  await page.getByRole('heading',{name:'Overview',exact:true}).waitFor();
  await page.unroute('**/src/storage.ts*');
  await page.route('**/src/storage.ts*',async route=>{
    const response=await route.fetch();
    const body=(await response.text()).replace('async function loadWorkspace() {','async function loadWorkspace() { throw new Error("Simulated storage failure");');
    await route.fulfill({response,body,headers:{...response.headers(),'cache-control':'no-store',etag:''}});
  });
  await page.reload();await page.getByRole('heading',{name:'Could not open your saved workspace'}).waitFor();
  if(await page.getByText('Simulated storage failure').count())throw new Error('Internal error exposed');
  await page.unroute('**/src/storage.ts*');await page.getByRole('button',{name:'Try again / 重試'}).click();await page.getByRole('heading',{name:'Overview',exact:true}).waitFor();
  if(await page.locator('.course-card').count()!==3)throw new Error('Error recovery altered saved data');
  await page.route('**/src/main.tsx*',async route=>{
    const response=await route.fetch();
    const body=(await response.text()).replace('function App({ initial }) {','function App({ initial }) { throw new Error("Simulated render failure");');
    if(!body.includes('Simulated render failure'))throw new Error('Boundary test interception failed');
    await route.fulfill({response,body,headers:{...response.headers(),'cache-control':'no-store',etag:''}});
  });
  await page.reload();await page.getByRole('heading',{name:'Something went wrong',exact:true}).waitFor();
  if(await page.getByText('Simulated render failure').count())throw new Error('Stack exposed in page');
  await page.unroute('**/src/main.tsx*');await page.getByRole('button',{name:'Try again / 重試'}).click();await page.getByRole('heading',{name:'Overview',exact:true}).waitFor();
  await page.screenshot({path:'preview.png',fullPage:true});
}
