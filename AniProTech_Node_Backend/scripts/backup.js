import "dotenv/config";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

if(!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const root=path.resolve(process.env.BACKUP_DIR||"./backups"),stamp=new Date().toISOString().replaceAll(":","-").replace(".","-");
const dir=path.join(root,stamp),database=path.join(dir,"database.dump"),uploads=path.resolve(process.env.UPLOAD_DIR||"./uploads");
fs.mkdirSync(dir,{recursive:true});
const result=spawnSync(process.env.PG_DUMP_BIN||"pg_dump",["--format=custom","--no-owner","--no-acl","--file",database,process.env.DATABASE_URL],{stdio:"inherit"});
if(result.status!==0)throw new Error("pg_dump failed; no successful backup was recorded");
if(fs.existsSync(uploads))fs.cpSync(uploads,path.join(dir,"uploads"),{recursive:true,errorOnExist:true});
const digest=createHash("sha256").update(fs.readFileSync(database)).digest("hex");
fs.writeFileSync(path.join(dir,"manifest.json"),JSON.stringify({createdAt:new Date().toISOString(),databaseFile:"database.dump",databaseSha256:digest,uploadsIncluded:fs.existsSync(uploads)},null,2),{mode:0o600});
console.log(`Backup completed: ${dir}`);
