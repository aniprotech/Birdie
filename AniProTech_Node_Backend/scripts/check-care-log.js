import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
import {configuration} from '../src/config.js';
import {openDatabase} from '../src/db.js';
import {Repository} from '../src/repository.js';
import {createAuth} from '../src/auth.js';
const {chromium}=createRequire(import.meta.url)('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const db=await openDatabase(configuration()),repo=new Repository(db);let browser,token,page;
mkdirSync('../log-checks',{recursive:true});
try{
 let mail;const admin=await repo.one('UserEntity',{email:'info@aniprotech.com'}),client=await repo.one('UserEntity',{email:'dummy.client@example.test'});
 await createAuth({db,repo,config:configuration(),mail:{send:async m=>mail=m}}).requestLink(admin.email);
 browser=await chromium.launch({channel:'chrome',headless:true});page=await browser.newPage({viewport:{width:1920,height:1080}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(mail.text.match(/http[^\s]+/)[0]);await page.waitForURL('**/admin/**');token=await page.evaluate(async()=>{const{decryptData}=await import('/src/utils/cryptoHelpers.js');return decryptData(localStorage.getItem('access_token'));});

 const live=await fetch('http://127.0.0.1:8080/api/care-log?from=2026-09-03&to=2026-09-09',{headers:{Authorization:'Bearer '+token}});assert.equal(live.status,200,'Live care log endpoint');
 const respond=(r,data)=>r.fulfill({json:{results:{data}}});
 const id=randomUUID(),v={id,clientId:client.id,clientName:'Example Client',staffName:'Example Carer',status:'COMPLETED',date:'2026-09-09',startTime:'07:00',endTime:'08:00',actualMinutes:60,plannedMinutes:60,alerts:0,activities:2,observations:1};
 await page.route('**/api/care-log**',r=>respond(r,{items:new URL(r.request().url()).searchParams.get('search')?[]: [v],counts:{COMPLETED:1},hasMore:false,people:[],groups:[]}));
 await page.route('**/api/clients/*/visits/*',r=>respond(r,{visit:{...v,client_id:client.id,staff_id:admin.id,actual_start:'2026-09-09T06:00:00Z',actual_end:'2026-09-09T07:00:00Z',revision:1},entries:[],events:[],addresses:[],careTeam:[],canManage:true}));
 await page.goto('http://127.0.0.1:5173/admin/logs');await page.locator('.log-card').waitFor();await page.locator('.log-card').click();await page.getByRole('navigation',{name:'Visit tabs'}).waitFor();
 for(const name of ['Details','Alerts','Activities','Observations','Care team','Timeline']){await page.getByRole('navigation',{name:'Visit tabs'}).getByRole('button',{name:new RegExp('^'+name)}).click();}
 await page.getByRole('navigation',{name:'Visit tabs'}).getByRole('button',{name:'Details',exact:true}).click();
 assert.equal(await page.locator('.log-embedded .cf-list').isVisible(),false);await page.screenshot({path:'../log-checks/desktop.png',fullPage:true});
 const popupPromise=page.waitForEvent('popup');await page.getByRole('button',{name:'Print / Save PDF'}).click();const popup=await popupPromise;await popup.getByText('Care log — visit summary',{exact:true}).waitFor();await popup.pdf({path:'../log-checks/visit-summary.pdf',format:'A4'});await popup.close();
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'../log-checks/mobile.png',fullPage:true});assert.deepEqual(errors,[]);console.log('PASS: Logs fixture selection, six tabs, embedded detail and mobile width.');
}finally{if(token)await fetch('http://127.0.0.1:8080/api/auth/logout',{method:'POST',headers:{Authorization:'Bearer '+token}});await browser?.close();await db.close();}
