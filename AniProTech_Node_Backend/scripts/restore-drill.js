import "dotenv/config";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const source=path.resolve(process.env.RESTORE_BACKUP_DIR||""),target=process.env.RESTORE_DATABASE_URL;
if(!source||!target)throw new Error("RESTORE_BACKUP_DIR and RESTORE_DATABASE_URL are required");
if(target===process.env.DATABASE_URL)throw new Error("Restore drills must never target the source database");
const manifest=JSON.parse(fs.readFileSync(path.join(source,"manifest.json"),"utf8")),database=path.join(source,manifest.databaseFile);
const digest=createHash("sha256").update(fs.readFileSync(database)).digest("hex");if(digest!==manifest.databaseSha256)throw new Error("Backup checksum does not match the manifest");
const result=spawnSync(process.env.PG_RESTORE_BIN||"pg_restore",["--clean","--if-exists","--no-owner","--no-acl","--dbname",target,database],{stdio:"inherit"});
if(result.status!==0)throw new Error("Restore drill failed");
console.log(JSON.stringify({restoredAt:new Date().toISOString(),source,checksumVerified:true,target:"staging database"}));
