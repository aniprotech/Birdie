import fs from 'node:fs/promises';
import path from 'node:path';
import {configuration} from '../src/config.js';
import {openDatabase} from '../src/db.js';
import {Repository} from '../src/repository.js';
import {createAuth} from '../src/auth.js';

const config=configuration(),db=await openDatabase(config),repo=new Repository(db);
try{
  const email='info@aniprotech.com',user=await repo.one('UserEntity',{email});
  if(!user||!['ADMIN','SUPERADMIN'].includes(user.role)||!user.isActive||user.deletedAt)throw new Error('The seeded test administrator is unavailable.');
  let message;
  await createAuth({db,repo,config,mail:{send:async value=>{message=value;}}}).requestLink(email);
  const link=message?.text?.match(/http[^\s]+/)?.[0];
  if(!link)throw new Error('Unable to create the local login link.');
  const escaped=link.replaceAll('&','&amp;').replaceAll('"','&quot;');
  const target=path.resolve('../test-login.html');
  await fs.writeFile(target,`<!doctype html><html><head><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>AniProTech test login</title><style>body{font:18px system-ui;max-width:620px;margin:80px auto;padding:24px;color:#172a45}a{display:inline-block;padding:12px 18px;border-radius:6px;background:#143a6a;color:white;text-decoration:none}</style></head><body><h1>AniProTech test login</h1><p>Administrator: ${email}</p><p>This local link expires after 15 minutes and works once.</p><a href="${escaped}">Open AniProTech</a></body></html>`,{mode:0o600});
  console.log('Created local one-time test-login.html. No email was sent.');
}finally{await db.close();}
