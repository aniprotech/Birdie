import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {configuration} from '../src/config.js';
import {openDatabase} from '../src/db.js';
import {Repository} from '../src/repository.js';
import {createAuth} from '../src/auth.js';
const {chromium}=createRequire(import.meta.url)('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const db=await openDatabase(configuration()),repo=new Repository(db);let browser,token;
mkdirSync('../carer-feed-checks',{recursive:true});
try {
 let mail;const admin=await repo.one('UserEntity',{email:'info@aniprotech.com'}),dummy=await repo.one('UserEntity',{email:'dummy.client@example.test'});
 await createAuth({db,repo,config:configuration(),mail:{send:async m=>mail=m}}).requestLink(admin.email);
 browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(mail.text.match(/http[^\s]+/)[0]);await page.waitForURL('**/admin/**');token=await page.evaluate(async()=>{const{decryptData}=await import('/src/utils/cryptoHelpers.js');return decryptData(localStorage.getItem('access_token'));});
 const live=await fetch(`http://127.0.0.1:8080/api/team/${admin.id}/activity-feed`,{headers:{Authorization:'Bearer '+token}});assert.equal(live.status,200);
 const visits=[0,1,2].map(i=>({id:`preview-${i}`,kind:'VISIT',clientId:dummy.id,clientName:'Dummy Client',title:`Preview visit ${i+1}`,body:'Fictional browser fixture only',status:i?'COMPLETED':'IN_PROGRESS',occurred_at:`2026-09-0${8-i}T06:00:00Z`,plannedMinutes:60,actualMinutes:i?61:20,alerts:i?0:1,observations:1,activities:2}));
 const fulfill=(route,data)=>route.fulfill({json:{results:{data}}});
 await page.route('**/api/team/*/activity-feed*',route=>{const p=new URL(route.request().url()).searchParams;fulfill(route,{client:{firstName:'Demo',lastName:'Carer'},counts:{VISIT:3},items:p.get('search')==='no-match'||['NOTE','ALERT','ACTION'].includes(p.get('kind'))?[]:visits,page:1,canManage:true});});
 await page.route('**/api/clients/*/visits/preview-*',route=>{const row=visits.find(v=>route.request().url().endsWith(v.id));fulfill(route,{visit:{...row,date:'2026-09-08',startTime:'07:00',endTime:'08:00',staffName:'Demo Carer',actual_start:'2026-09-08T06:00:00Z',actual_end:row.status==='COMPLETED'?'2026-09-08T07:01:00Z':null,notes:'Fictional demonstration only'},entries:[{id:'example-alert',kind:'ALERT',title:'Example alert',body:'Fictional browser example',status:'OPEN',created_at:'2026-09-08T06:00:00Z',author:'Demo Carer'}],events:[{id:'event',description:'Preview visit created',author:'Demo Carer',created_at:'2026-09-08T06:00:00Z'}],addresses:[{addressLine1:'Dummy address',city:'London'}],careTeam:[],canManage:false});});
 await page.goto(`http://127.0.0.1:5173/admin/teams/${admin.id}/carer-feed`);await page.getByRole('heading',{name:'Preview visit 1',exact:true}).waitFor();
 await page.locator('[data-record-id="preview-1"]').click();await page.getByRole('heading',{name:'Preview visit 2',exact:true}).waitFor();
 for(const tab of ['Details','Alerts','Activities','Observations','Care team','Timeline'])await page.getByRole('navigation',{name:'Visit tabs'}).getByRole('button',{name:tab,exact:true}).click();
 await page.getByRole('navigation',{name:'Visit tabs'}).getByRole('button',{name:'Details',exact:true}).click();await page.screenshot({path:'../carer-feed-checks/desktop.png',fullPage:false});
 await page.getByRole('button',{name:'+ More filters'}).click();await page.getByLabel('Search',{exact:true}).fill('no-match');await page.getByRole('button',{name:'Apply filters'}).click();await page.getByText(/No matching records/).waitFor();await page.getByRole('button',{name:'Clear',exact:true}).click();await page.locator('[data-record-id="preview-0"]').waitFor();
 await page.getByRole('button',{name:'Add new +',exact:true}).click();await page.getByRole('heading',{name:'Add Note',exact:true}).waitFor();await page.getByRole('button',{name:'Cancel',exact:true}).click();
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:"../carer-feed-checks/mobile-debug.png",fullPage:true});console.log(await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll("body *")].filter(e=>e.getBoundingClientRect().right>innerWidth+2).slice(0,8).map(e=>({tag:e.tagName,cls:e.className,width:e.getBoundingClientRect().width}))})));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'../carer-feed-checks/mobile.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('PASS: live feed endpoint; browser fixtures verify visit selection, six tabs, filters, add-entry form and mobile layout. No care records changed.');
}finally{if(token)await fetch('http://127.0.0.1:8080/api/auth/logout',{method:'POST',headers:{Authorization:'Bearer '+token}});await browser?.close();await db.close();}
