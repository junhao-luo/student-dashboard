async page => {
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('.dropdown-trigger').first().waitFor();
  for (const button of await page.locator('.dropdown-trigger').all()) {
    const style=await button.evaluate(el=>({border:getComputedStyle(el).borderTopWidth,shadow:getComputedStyle(el).boxShadow}));
    if(style.border!=='0px'||style.shadow!=='none')throw Error('Dropdown still has a card surface');
    await button.click();
    if(await button.getAttribute('aria-expanded')!=='true')throw Error('Did not open');
    const arrow=await button.locator('svg').last().evaluate(el=>getComputedStyle(el).transform);
    if(!arrow.startsWith('matrix(-1'))throw Error('Arrow did not rotate');
    await page.keyboard.press('Escape');
    if(await button.getAttribute('aria-expanded')!=='false')throw Error('Escape did not close');
  }
  const resources=page.locator('aside').getByRole('button',{name:'Resources',exact:true});
  await resources.click();
  await page.getByRole('button',{name:'All resources',exact:true}).click();
  if(await resources.getAttribute('aria-expanded')!=='false')throw Error('Selection did not close');
  await page.screenshot({path:'dropdown-preview.png',fullPage:false});
  await page.setViewportSize({width:390,height:844});
  await page.locator('.mobile-menu').click();
  await resources.click();
  await page.getByRole('button',{name:'All resources',exact:true}).click();
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
  console.log('Dropdown surfaces, arrows, Escape, selection and mobile passed');
}
