import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {configuration} from '../src/config.js';
import {openDatabase} from '../src/db.js';
import {Repository} from '../src/repository.js';
import {createAuth} from '../src/auth.js';
const {chromium}=createRequire(import.meta.url)('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const config=configuration(),db=await openDatabase(config),repo=new Repository(db);let browser,page,token;
mkdirSync('../calendar-screen-checks',{recursive:true});
try{
 let mail;const auth=createAuth({db,repo,config,mail:{send:async m=>mail=m}});
 const admin=await repo.one('UserEntity',{email:'info@aniprotech.com'}),dummy=await repo.one('UserEntity',{email:'dummy.client@example.test'});assert.ok(dummy);assert.equal(admin.agencyId,dummy.agencyId);
 await auth.requestLink(admin.email);browser=await chromium.launch({channel:'chrome',headless:true});page=await browser.newPage({viewport:{width:1920,height:1080},acceptDownloads:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(mail.text.match(/http[^\s]+/)[0]);await page.waitForURL('**/admin/**',{timeout:30000});
 token=await page.evaluate(async()=>{const {decryptData}=await import('/src/utils/cryptoHelpers.js');return decryptData(localStorage.getItem('access_token'));});
 await page.goto(`http://127.0.0.1:5173/admin/clients/${dummy.id}/calendar`);
 await page.getByLabel('Week containing').fill('2026-09-07');await page.locator('.hc-week').waitFor();
 await page.locator('.hc-event').first().click();await page.getByRole('heading',{name:'Visit instructions',exact:true}).waitFor();await page.getByRole('button',{name:'Close visit details',exact:true}).click();
 await page.getByRole('button',{name:'Add visit',exact:true}).click();await page.getByRole('dialog',{name:'Add visit',exact:true}).waitFor();await page.getByRole('button',{name:'Close visit form',exact:true}).click();
 await page.getByRole('button',{name:'Demo schedule',exact:true}).click();assert.equal(await page.locator('.hc-event').count(),21);
 assert.equal(await page.locator('.hc-event.hc-COMPLETED').count(),4);
 const morning=page.locator('[data-visit-id="demo-0-0"]'),afternoon=page.locator('[data-visit-id="demo-0-1"]');
 assert.equal(await morning.evaluate(el=>parseFloat(el.style.top)),336);
 assert.equal(await afternoon.evaluate(el=>parseFloat(el.style.top)),768);
 assert.equal(await morning.evaluate(el=>parseFloat(el.style.height)),46);
 assert.equal(await afternoon.evaluate(el=>parseFloat(el.style.height)),22);
 await page.locator('.hc-scroll').evaluate(el=>el.scrollTop=288);await page.screenshot({path:'../calendar-screen-checks/calendar-desktop.png',fullPage:true});
 await morning.click();const panel=page.getByRole('dialog',{name:'Visit details'});
 for(const tab of ['Details','Alerts','Activities','Observations','Care team','Timeline'])await panel.getByRole('navigation',{name:'Visit tabs'}).getByRole('button',{name:tab,exact:true}).click();
 await page.getByRole('button',{name:'Close visit details',exact:true}).click();
 await page.getByLabel('Filter status').selectOption('COMPLETED');assert.equal(await page.locator('.hc-event').count(),4);await page.getByLabel('Filter status').selectOption('');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download visits',exact:true}).click();assert.match((await download).suggestedFilename(),/^demo-visits-/);
 await page.getByRole('button',{name:'Next week',exact:true}).click();assert.equal(await page.getByLabel('Week containing').inputValue(),'2026-09-14');await page.getByRole('button',{name:'Previous week',exact:true}).click();
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'../calendar-screen-checks/calendar-mobile.png',fullPage:true});
 await morning.click();await page.getByRole('heading',{name:'Visit instructions',exact:true}).waitFor();await page.screenshot({path:'../calendar-screen-checks/details-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS: live calendar/details, Add visit form, 21 demo blocks, exact event placement/duration, six tabs, status filter, download, week navigation and mobile layout. No data changed.');
}catch(e){await page?.screenshot({path:'../calendar-screen-checks/failure.png',fullPage:true}).catch(()=>{});throw e;}
finally{if(token)await fetch('http://127.0.0.1:8080/api/auth/logout',{method:'POST',headers:{Authorization:'Bearer '+token}});await browser?.close();await db.close();}
