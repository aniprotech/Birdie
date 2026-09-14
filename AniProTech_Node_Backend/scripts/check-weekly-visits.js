import assert from 'node:assert/strict';
import { mkdirSync,readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { configuration } from '../src/config.js';
import { openDatabase } from '../src/db.js';
import { Repository } from '../src/repository.js';
import { createAuth } from '../src/auth.js';
const {chromium}=createRequire(import.meta.url)('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const config=configuration(),db=await openDatabase(config),repo=new Repository(db);let browser,page,token;
mkdirSync('../visit-screen-checks',{recursive:true});
try{
 let mail;
 const auth=createAuth({db,repo,config,mail:{send:async m=>mail=m}});
 const admin=await repo.one('UserEntity',{email:'info@aniprotech.com'}),dummy=await repo.one('UserEntity',{email:'dummy.client@example.test'});assert.ok(dummy);assert.equal(dummy.agencyId,admin.agencyId);
 await auth.requestLink(admin.email);browser=await chromium.launch({channel:'chrome',headless:true});page=await browser.newPage({viewport:{width:1920,height:1080},acceptDownloads:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(mail.text.match(/http[^\s]+/)[0]);await page.waitForURL('**/admin/**',{timeout:30000});
 token=await page.evaluate(async()=>{const {decryptData}=await import('/src/utils/cryptoHelpers.js');return decryptData(localStorage.getItem('access_token'));});
 await page.goto(`http://127.0.0.1:5173/admin/clients/${dummy.id}/visits`);
 await page.getByRole('button',{name:'Add visit',exact:true}).waitFor();
 await page.locator('.wv-grid').waitFor();
 const name='DUMMY TEST — weekly visits preview';
 const existing=(await db.query('SELECT id FROM node_roster_visits WHERE client_id=$1 AND title=$2',[dummy.id,name])).rows[0];
 if(!existing){
  await page.getByRole('button',{name:'Add visit',exact:true}).click();
  const form=page.getByRole('dialog',{name:'Add visit',exact:true});
  await form.getByLabel('Visit title',{exact:true}).fill(name);
  await form.getByLabel('Date',{exact:true}).fill('2026-09-10');
  await form.getByLabel('Start time',{exact:true}).fill('12:00');await form.getByLabel('End time',{exact:true}).fill('12:30');
  await form.getByLabel('Visit instructions').fill('Fictional draft for checking the Visits screen. Not a scheduled care or billable visit.');
  const saved=page.waitForResponse(r=>r.url().endsWith('/api/roster/visits')&&r.request().method()==='POST');await form.getByRole('button',{name:'Save visit',exact:true}).click();assert.equal((await saved).status(),201);
 }
 await page.getByLabel('Week containing').fill('2026-09-07');
 await page.getByRole('button',{name:new RegExp(name)}).click();
 await page.getByRole('heading',{name:'Visit instructions',exact:true}).waitFor();
 assert.match(await page.getByRole('dialog',{name:'Visit details'}).innerText(),/Fictional draft/);
 await page.getByRole('button',{name:'Edit schedule / carer',exact:true}).click();
 const edit=page.getByRole('dialog',{name:'Edit visit',exact:true});
 await edit.getByLabel('Visit instructions').fill('Fictional draft for checking the Visits screen. Edited and saved successfully; no care has been delivered.');
 const updated=page.waitForResponse(r=>r.url().includes('/api/roster/visits/')&&r.request().method()==='PUT');await edit.getByRole('button',{name:'Save visit',exact:true}).click();assert.equal((await updated).status(),200);
 await page.reload();await page.getByLabel('Week containing').fill('2026-09-07');await page.getByRole('button',{name:new RegExp(name)}).waitFor();
 await page.getByRole('button',{name:'Demo schedule',exact:true}).click();
 assert.equal(await page.locator('.wv-card').count(),21);
 await page.screenshot({path:'../visit-screen-checks/week-desktop.png',fullPage:true});
 await page.locator('.wv-scroll').evaluate(el=>el.scrollTop=500);await page.screenshot({path:'../visit-screen-checks/evening-desktop.png',fullPage:true});
 await page.locator('.wv-scroll').evaluate(el=>el.scrollTop=0);
 for(const [vid,heading] of [['demo-0-0','Morning support'],['demo-2-0','Morning support'],['demo-4-1','Afternoon check-in']]){
  await page.locator(`[data-visit-id="${vid}"]`).click();
  const panel=page.getByRole('dialog',{name:'Visit details'});await panel.getByRole('heading',{name:heading,exact:true}).waitFor();
  for(const tab of ['Details','Alerts','Activities','Observations','Care team','Timeline']){await panel.getByRole('navigation',{name:'Visit tabs'}).getByRole('button',{name:tab,exact:true}).click();await panel.locator('.wv-detail-body').waitFor();}
  await page.screenshot({path:'../visit-screen-checks/visit-detail.png',fullPage:true});
  await page.getByRole('button',{name:'Close visit details',exact:true}).click();
 }
 await page.getByLabel('Filter status').selectOption('COMPLETED');assert.equal(await page.locator('.wv-card').count(),4);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download visits',exact:true}).click();const file=await download;await file.saveAs('../visit-screen-checks/demo-export.csv');const csv=readFileSync('../visit-screen-checks/demo-export.csv','utf8');assert.equal(csv.trim().split('\r\n').length,5);assert.match(csv,/Completed/);
 await page.getByLabel('Filter status').selectOption('');await page.getByRole('button',{name:/visits need reviewing/}).click();assert.equal(await page.locator('.wv-card').count(),2);await page.getByRole('button',{name:'Clear review filter',exact:true}).click();
 await page.getByRole('button',{name:'Next week',exact:true}).click();assert.equal(await page.getByLabel('Week containing').inputValue(),'2026-09-14');await page.getByRole('button',{name:'Previous week',exact:true}).click();
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No mobile page overflow');await page.screenshot({path:'../visit-screen-checks/week-mobile.png',fullPage:true});
 await page.locator('[data-visit-id="demo-0-0"]').click();await page.getByRole('heading',{name:'Visit instructions',exact:true}).waitFor();await page.screenshot({path:'../visit-screen-checks/detail-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS: live dummy draft creation/edit/reload, demo 21 visits, six tabs, review/status filters, CSV contents, week navigation, desktop and mobile.');
}catch(e){await page?.screenshot({path:'../visit-screen-checks/failure.png',fullPage:true}).catch(()=>{});throw e;}
finally{if(token)await fetch('http://127.0.0.1:8080/api/auth/logout',{method:'POST',headers:{Authorization:'Bearer '+token}});await browser?.close();await db.close();}
