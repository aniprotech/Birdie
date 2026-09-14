import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
import {configuration} from '../src/config.js';
import {openDatabase} from '../src/db.js';
import {Repository} from '../src/repository.js';
import {createAuth} from '../src/auth.js';
const {chromium}=createRequire(import.meta.url)('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const db=await openDatabase(configuration()),repo=new Repository(db);let browser,token;
mkdirSync('../roster-checks',{recursive:true});
try{
 let mail;const admin=await repo.one('UserEntity',{email:'info@aniprotech.com'}),client=await repo.one('UserEntity',{email:'dummy.client@example.test'});
 await createAuth({db,repo,config:configuration(),mail:{send:async m=>mail=m}}).requestLink(admin.email);
 browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(mail.text.match(/http[^\s]+/)[0]);await page.waitForURL('**/admin/**');token=await page.evaluate(async()=>{const{decryptData}=await import('/src/utils/cryptoHelpers.js');return decryptData(localStorage.getItem('access_token'));});
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),add=(d,n)=>new Date(Date.parse(d)+n*86400000).toISOString().slice(0,10),week=add(date,-((new Date(date).getUTCDay()+6)%7));
 const live=await fetch('http://127.0.0.1:8080/api/roster/board?from='+week,{headers:{Authorization:'Bearer '+token}});assert.equal(live.status,200);
 const a=randomUUID(),b=randomUUID(),base={clientId:client.id,clientName:'Dummy Client',date,title:'Morning support',notes:'Fixture notes',revision:1};
 let visits=[{...base,id:randomUUID(),staffId:a,staffName:'Alex Fixture',startTime:'07:00',endTime:'08:00',status:'COMPLETED'},{...base,id:randomUUID(),staffId:a,staffName:'Alex Fixture',startTime:'12:00',endTime:'13:00',status:'SCHEDULED'},{...base,id:randomUUID(),staffId:b,staffName:'Taylor Fixture',startTime:'09:00',endTime:'11:00',status:'IN_PROGRESS'},{...base,id:randomUUID(),staffId:null,staffName:null,startTime:'16:00',endTime:'17:00',status:'DRAFT'}];
 let assets=[],applied=false,saved=0;const response=(r,data)=>r.fulfill({json:{results:{data},message:'Fixture success'}});
 await page.route('**/api/roster/**',async r=>{const u=new URL(r.request().url()),p=u.pathname,m=r.request().method(),body=m==='GET'?{}:r.request().postDataJSON();
  if(p.endsWith('/options'))return response(r,{canManage:true,clients:[{id:client.id,name:'Dummy Client'}],staff:[{id:a,name:'Alex Fixture'},{id:b,name:'Taylor Fixture'}]});
  if(p.endsWith('/board'))return response(r,{assets,staff:[{id:a,name:'Alex Fixture',groups:['North'],availabilityRecorded:true,days:Array.from({length:7},(_,i)=>({date:add(week,i),available:[{start:'07:00',end:'18:00'}],absent:[]}))},{id:b,name:'Taylor Fixture',groups:['South'],availabilityRecorded:true,days:Array.from({length:7},(_,i)=>({date:add(week,i),available:[{start:'08:00',end:'20:00'}],absent:[{start:'14:00',end:'18:00'}]}))}]});
  if(p.endsWith('/visits')&&m==='GET')return response(r,{visits});
  if(p.endsWith('/visits')&&m==='POST'){saved++;visits.push({...body,id:randomUUID(),revision:1,clientName:'Dummy Client',staffName:'Alex Fixture'});return response(r,{visits});}
  if(m==='PUT'){saved++;visits=visits.map(v=>v.id===p.split('/').at(-1)?{...v,...body,revision:v.revision+1}:v);return response(r,visits[1]);}
  if(p.endsWith('/assets')&&m==='POST'){assets.push({id:randomUUID(),kind:body.kind,name:body.name,payload:body.kind==='RUN'?{visitIds:body.visitIds}:[]});return response(r,assets.at(-1));}
  if(p.includes('/assets/')&&m==='DELETE'){assets=assets.filter(x=>x.id!==p.split('/').at(-1));return response(r,{});}
  if(p.endsWith('/preview'))return response(r,{id:'fixture-preview',proposed:[{...visits[3],staffId:a,staffName:'Alex Fixture',reason:'Eligible care-team member'}],skipped:[]});
  if(p.endsWith('/apply')){applied=true;return response(r,{count:1});}
  throw Error('Unexpected fixture request '+m+' '+p);
 });
 const url='http://127.0.0.1:5173/admin/rosters';await page.goto(url);await page.locator('.rb-visit').first().waitFor();assert.equal(await page.locator('.rb-visit').count(),4);
 await page.screenshot({path:'../roster-checks/timeline.png'});
 await page.getByLabel('Search roster').fill('Taylor');assert.equal(await page.locator('.rb-visit').count(),1);await page.getByLabel('Search roster').fill('');await page.getByLabel('Group',{exact:true}).selectOption('North');assert.equal(await page.locator('.rb-visit').count(),2);await page.getByLabel('Group',{exact:true}).selectOption('');
 await page.getByLabel('Roster perspective').selectOption('client');assert.equal(await page.locator('.rb-visit').count(),4);await page.getByLabel('Roster perspective').selectOption('carer');
 await page.getByRole('button',{name:'Display options'}).click();await page.getByLabel('Day list',{exact:true}).check();await page.getByRole('button',{name:'Done',exact:true}).click();assert.equal(await page.locator('.rb-day-card').count(),4);await page.getByRole('button',{name:'Display options'}).click();await page.getByLabel('Timeline',{exact:true}).check();await page.keyboard.press('Escape');
 await page.locator('[data-visit-id="'+visits[1].id+'"]').click();const editor=page.getByRole('dialog',{name:'Visit details'});await editor.getByLabel('Visit title',{exact:true}).fill('Updated fixture');await editor.getByRole('button',{name:'Save visit',exact:true}).click();await editor.waitFor({state:'hidden'});assert.equal(saved,1);
 await page.getByRole('button',{name:'Plan rota'}).click();await page.getByRole('button',{name:'Add visit',exact:true}).click();await editor.getByRole('combobox',{name:/^Client/}).selectOption(client.id);await editor.getByLabel('Start time (London)',{exact:true}).fill('18:00');await editor.getByLabel('End time (same day)',{exact:true}).fill('19:00');await editor.getByRole('button',{name:'Save visit',exact:true}).click();await editor.waitFor({state:'hidden'});assert.equal(saved,2);
 await page.getByRole('button',{name:'Plan rota'}).click();await page.getByRole('button',{name:'Save week as template'}).click();let plan=page.getByRole('dialog',{name:'Roster planning'});await plan.getByLabel('Name',{exact:true}).fill('Fixture template');await plan.getByRole('button',{name:'Save template',exact:true}).click();await plan.getByRole('button',{name:'Remove Fixture template'}).waitFor();await plan.getByRole('button',{name:'Close planning'}).click();
 await page.getByRole('button',{name:'Manage runs',exact:true}).click();await plan.getByLabel('Name',{exact:true}).fill('Morning run');await plan.locator('input[type=checkbox]').first().check();await plan.getByRole('button',{name:'Save run',exact:true}).click();await plan.getByRole('button',{name:'Remove Morning run'}).waitFor();await plan.getByRole('button',{name:'Close planning'}).click();await page.getByLabel('Filter run').selectOption({label:'Morning run'});assert.equal(await page.locator('.rb-visit').count(),1);await page.getByLabel('Filter run').selectOption('');
 await page.getByRole('button',{name:'Plan rota'}).click();await page.getByRole('button',{name:'Suggest assignments',exact:true}).click();await plan.getByRole('button',{name:'Preview plan',exact:true}).click();await plan.getByRole('button',{name:'Apply reviewed plan'}).waitFor();assert.equal(applied,false);await page.screenshot({path:'../roster-checks/preview.png'});await plan.getByRole('button',{name:'Apply reviewed plan'}).click();await plan.waitFor({state:'hidden'});assert.equal(applied,true);
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'../roster-checks/mobile.png',fullPage:true});await page.setViewportSize({width:1920,height:1080});
 await page.route('**/api/clients/*/feed*',r=>response(r,{items:[],counts:{ALL:0,VISIT:0,ALERT:0,NOTE:0,ACTION:0},total:0,page:1,pages:1,clientName:'Dummy Client',canManage:true}));
 await page.route('**/api/clients/*/visits/*',r=>response(r,{visit:{...visits[1],client_id:client.id,staff_id:a},entries:[],events:[],addresses:[],careTeam:[],canManage:true}));
 await page.locator('[data-visit-id="'+visits[1].id+'"]').click();await editor.getByRole('link',{name:/Open visit care record/}).click();await page.getByRole('navigation',{name:'Visit tabs'}).waitFor();for(const name of ['Details','Alerts','Activities','Observations','Care team','Timeline'])await page.getByRole('navigation',{name:'Visit tabs'}).getByRole('button',{name,exact:true}).click();assert.deepEqual(errors,[]);
 console.log('PASS: live board read; browser fixtures verify timeline, filters, client/carer views, day list, edit/create, saved template/run, reviewed apply, mobile width and six-tab visit deep link. No real visits were changed.');
}finally{if(token)await fetch('http://127.0.0.1:8080/api/auth/logout',{method:'POST',headers:{Authorization:'Bearer '+token}});await browser?.close();await db.close();}


