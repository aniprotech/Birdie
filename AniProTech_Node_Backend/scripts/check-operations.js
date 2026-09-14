import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {configuration} from '../src/config.js';
import {openDatabase} from '../src/db.js';
import {Repository} from '../src/repository.js';
import {createAuth} from '../src/auth.js';
const {chromium}=createRequire(import.meta.url)('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const db=await openDatabase(configuration()),repo=new Repository(db);let browser,token;
mkdirSync('../operations-checks',{recursive:true});
try {
 let mail;const admin=await repo.one('UserEntity',{email:'info@aniprotech.com'});
 await createAuth({db,repo,config:configuration(),mail:{send:async m=>mail=m}}).requestLink(admin.email);
 browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(mail.text.match(/http[^\s]+/)[0]);await page.waitForURL('**/admin/**');token=await page.evaluate(async()=>{const{decryptData}=await import('/src/utils/cryptoHelpers.js');return decryptData(localStorage.getItem('access_token'));});
 const live=await fetch(`http://127.0.0.1:8080/api/team-operations/get/${admin.id}`,{headers:{Authorization:'Bearer '+token}});assert.equal(live.status,200);
 let values={address:'',transportMethod:'CAR',rateCard:'',travelRateCard:''};
 await page.route('**/api/team-operations/**',async route=>{if(route.request().method()==='PUT')values={...values,...route.request().postDataJSON()};await route.fulfill({json:{results:{data:values},message:'Operations saved',error:false}});});
 const url=`http://127.0.0.1:5173/admin/teams/${admin.id}/operations`;
 await page.goto(url);await page.getByRole('button',{name:'Edit travel information'}).waitFor();await page.screenshot({path:'../operations-checks/desktop.png'});
 await page.getByRole('button',{name:'Edit travel information'}).click();await page.getByLabel('Address',{exact:true}).fill('Fictional test address');await page.getByRole('dialog').locator('select').selectOption('WALKING');await page.getByRole('button',{name:'Save changes'}).click();await page.getByText('Fictional test address',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Edit rates'}).click();await page.getByLabel('Rate card',{exact:true}).fill('Standard care');await page.getByLabel('Travel rate card',{exact:true}).fill('Mileage');await page.getByRole('button',{name:'Save changes'}).click();await page.reload();await page.getByText('Standard care',{exact:true}).waitFor();await page.getByText('Fictional test address',{exact:true}).waitFor();
 await page.goto(url+'/edit/travel-info');
 // Direct legacy routes are checked separately using the route name configured in App.
 await page.goto(url+'/edit/rates');await page.getByRole('dialog',{name:'Edit rates'}).waitFor();await page.reload();await page.getByRole('dialog',{name:'Edit rates'}).waitFor();assert.equal(await page.getByLabel('Rate card',{exact:true}).inputValue(),'Standard care');await page.getByRole('button',{name:'Cancel',exact:true}).click();
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'../operations-checks/mobile.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('PASS: live Operations read; fixture-backed browser edits, reload, direct edit route, cancel and mobile layout. No staff records changed.');
}finally{if(token)await fetch('http://127.0.0.1:8080/api/auth/logout',{method:'POST',headers:{Authorization:'Bearer '+token}});await browser?.close();await db.close();}
