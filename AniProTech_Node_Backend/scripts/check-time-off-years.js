import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {configuration} from '../src/config.js';
import {openDatabase} from '../src/db.js';
import {Repository} from '../src/repository.js';
import {createAuth} from '../src/auth.js';
const {chromium}=createRequire(import.meta.url)('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const db=await openDatabase(configuration()),repo=new Repository(db);let browser,token;
mkdirSync('../time-off-checks',{recursive:true});
try {
 let mail;const admin=await repo.one('UserEntity',{email:'info@aniprotech.com'});
 await createAuth({db,repo,config:configuration(),mail:{send:async m=>mail=m}}).requestLink(admin.email);
 browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(mail.text.match(/http[^\s]+/)[0]);await page.waitForURL('**/admin/**');token=await page.evaluate(async()=>{const{decryptData}=await import('/src/utils/cryptoHelpers.js');return decryptData(localStorage.getItem('access_token'));});
 const live=await fetch(`http://127.0.0.1:8080/api/team/${admin.id}/time-off`,{headers:{Authorization:'Bearer '+token}});assert.equal(live.status,200);
 const url=`http://127.0.0.1:5173/admin/teams/${admin.id}/time-off`;
 let entries=[],settings=null;
 await page.route('**/api/team/*/time-off*',r=>r.fulfill({json:{results:{data:{year:2026,start:'2026-01-01',end:'2026-12-31',settings,entries,canManage:true}}}}));
 await page.route('**/api/team/holiday-year',r=>{settings=r.request().postDataJSON();return r.fulfill({json:{results:{data:settings}}});});
 await page.route('**/api/team-absence/create/*',r=>{entries=[{...r.request().postDataJSON(),id:'test-leave',status:'UPCOMING'}];return r.fulfill({json:{results:{data:entries[0]}}});});
 await page.route('**/api/team-absence/delete/*',r=>{entries=entries.map(x=>({...x,status:'CANCELLED',cancelledAt:'2026-09-08T12:00:00Z'}));return r.fulfill({json:{results:{data:{}}}});});
 await page.goto(url);await page.getByRole('heading',{name:'Upcoming time off'}).waitFor();await page.getByRole('button',{name:'Holiday year',exact:true}).click();
const choices=page.getByRole('group',{name:'Choose holiday year'}).getByRole('button');assert.equal(await choices.count(),6);assert.match(await choices.first().innerText(),/2027/);assert.match(await choices.last().innerText(),/2022/);
await page.getByRole('button',{name:'Show older years'}).click();assert.equal(await choices.count(),11);
await choices.filter({hasText:'1 Jan 2025'}).click();await page.getByRole('button',{name:'Holiday year',exact:true}).click();await page.getByRole('button',{name:'Current holiday year',exact:true}).click();
await page.getByRole('button',{name:'Holiday year',exact:true}).click();await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Holiday year',exact:true}).getAttribute('aria-expanded'),'false');
await page.getByRole('button',{name:'Holiday year',exact:true}).click();await page.screenshot({path:'../time-off-checks/year-dropdown.png'});await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Book time off',exact:true}).click();const form=page.getByRole('dialog',{name:'Book time off'});await form.getByLabel('Start date',{exact:true}).fill('2026-12-20');await form.getByLabel('End date',{exact:true}).fill('2026-12-21');await form.getByRole('button',{name:'Book time off',exact:true}).click();await page.getByRole('button',{name:'Cancel time off',exact:true}).waitFor();
 await page.reload();await page.getByRole('button',{name:'Cancel time off',exact:true}).click();await page.getByRole('button',{name:'Confirm cancellation'}).click();await page.getByText('No upcoming time off',{exact:true}).waitFor();assert.equal(entries[0].status,'CANCELLED');
 await page.getByRole('button',{name:'Set holiday year'}).click();await page.getByLabel('Start month',{exact:true}).selectOption('4');await page.getByRole('button',{name:'Save settings'}).click();await page.getByRole('button',{name:'Holiday year settings'}).waitFor();await page.getByRole('button',{name:'Holiday year',exact:true}).click();assert.match(await page.getByRole('group',{name:'Choose holiday year'}).getByRole('button').first().innerText(),/1 Apr 2027.*31 Mar 2028/);await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'../time-off-checks/mobile.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('PASS: date-range dropdown, descending years, older years, current-year shortcut, Escape and custom April ranges; live Time off read; browser fixtures verify booking, cancellation, reload, holiday settings and mobile layout. No real leave or agency settings changed.');
}finally{if(token)await fetch('http://127.0.0.1:8080/api/auth/logout',{method:'POST',headers:{Authorization:'Bearer '+token}});await browser?.close();await db.close();}

