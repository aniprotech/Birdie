import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {configuration} from '../src/config.js';
import {openDatabase} from '../src/db.js';
import {Repository} from '../src/repository.js';
import {createAuth} from '../src/auth.js';
const {chromium}=createRequire(import.meta.url)('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const config=configuration(),db=await openDatabase(config),repo=new Repository(db);let browser,token,dummy,grant;
mkdirSync('../sharing-screen-checks',{recursive:true});
try {
 let mail;const auth=createAuth({db,repo,config,mail:{send:async m=>mail=m}});
 const admin=await repo.one('UserEntity',{email:'info@aniprotech.com'});dummy=await repo.one('UserEntity',{email:'dummy.client@example.test'});assert.ok(dummy);assert.equal(admin.agencyId,dummy.agencyId);
 await auth.requestLink(admin.email);browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(mail.text.match(/http[^\s]+/)[0]);await page.waitForURL('**/admin/**',{timeout:30000});
 token=await page.evaluate(async()=>{const {decryptData}=await import('/src/utils/cryptoHelpers.js');return decryptData(localStorage.getItem('access_token'));});
 await page.goto(`http://127.0.0.1:5173/admin/clients/${dummy.id}/share-access`);
 await page.getByRole('heading',{name:'Share with a third party'}).waitFor();
 await page.getByLabel('Basic information',{exact:true}).check();await page.getByLabel('Care notes, observations and activities',{exact:true}).check();await page.getByLabel('Medical history and allergies',{exact:true}).uncheck();
 await page.getByLabel('I confirm that I am authorised to share the selected sections.').check();
 await page.getByRole('button',{name:/Generate (access|new) code/}).click();
 const generated=page.waitForResponse(r=>r.url().endsWith('/api/client-share-access/generate')&&r.request().method()==='POST');
 await page.getByRole('button',{name:'Generate code',exact:true}).click();const response=await generated;assert.equal(response.status(),200);grant=(await response.json()).results.data;
 await page.getByText('Sharing active',{exact:true}).waitFor();assert.ok(grant.websiteUrl.includes('/access#'));assert.ok(new URL(grant.websiteUrl).hash.length>1);
 assert.equal(await page.getByRole('button',{name:'Send magic link',exact:true}).isDisabled(),true);
 const portal=await browser.newPage({viewport:{width:1280,height:900}});portal.on('pageerror',e=>errors.push(e.message));
 await portal.goto(grant.websiteUrl);await portal.getByLabel('Access code',{exact:true}).fill(grant.accessCode);await portal.getByLabel('Your name').fill('Demo Viewer');await portal.getByLabel('Your email').fill('viewer@example.test');await portal.getByRole('button',{name:'Open care record',exact:true}).click();
 await portal.getByRole('heading',{name:'Dummy Client',exact:true}).waitFor();await portal.getByRole('heading',{name:'Basic information',exact:true}).waitFor();await portal.getByRole('heading',{name:'Care log',exact:true}).waitFor();assert.equal(await portal.getByRole('heading',{name:'Medical history and allergies',exact:true}).count(),0);
 await portal.screenshot({path:'../sharing-screen-checks/portal-desktop.png',fullPage:true});await portal.setViewportSize({width:390,height:844});assert.ok(await portal.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await portal.screenshot({path:'../sharing-screen-checks/portal-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Refresh history'}).click();await page.getByText('Shared record viewed',{exact:true}).first().waitFor();
 await page.getByRole('button',{name:'Revoke all access',exact:true}).click();await page.getByRole('button',{name:'Revoke access',exact:true}).click();await page.getByText('Sharing inactive',{exact:true}).waitFor();
 await portal.reload();await portal.getByRole('heading',{name:'View a shared care record'}).waitFor();assert.equal(await portal.getByRole('heading',{name:'Dummy Client',exact:true}).count(),0);
 await page.screenshot({path:'../sharing-screen-checks/admin-desktop.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('PASS: dummy client sharing, scoped portal, desktop/mobile layout, access history and revocation. No client email sent; dummy sharing left inactive.');
} finally {
 if(token&&dummy){const headers={Authorization:'Bearer '+token,'Content-Type':'application/json'};const r=await fetch(`http://127.0.0.1:8080/api/client-share-access/${dummy.id}`,{headers});const info=(await r.json()).results?.data;if(info?.active)await fetch('http://127.0.0.1:8080/api/client-share-access/revoke',{method:'POST',headers,body:JSON.stringify({clientId:dummy.id,revision:info.revision})});}
 if(token)await fetch('http://127.0.0.1:8080/api/auth/logout',{method:'POST',headers:{Authorization:'Bearer '+token}});await browser?.close();await db.close();
}
