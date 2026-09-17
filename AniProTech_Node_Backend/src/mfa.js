import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export const newMfaSecret=()=>{const bytes=randomBytes(20);let bits="";for(const b of bytes)bits+=b.toString(2).padStart(8,"0");let out="";for(let i=0;i<bits.length;i+=5)out+=alphabet[parseInt(bits.slice(i,i+5).padEnd(5,"0"),2)];return out;};
const decode=(value)=>{let bits="";for(const c of value.replace(/=+$/,"").toUpperCase()){const i=alphabet.indexOf(c);if(i<0)throw new Error("Invalid MFA secret");bits+=i.toString(2).padStart(5,"0");}const bytes=[];for(let i=0;i+8<=bits.length;i+=8)bytes.push(parseInt(bits.slice(i,i+8),2));return Buffer.from(bytes);};
export const totp=(secret,time=Date.now())=>{const counter=Math.floor(time/30000),buffer=Buffer.alloc(8);buffer.writeBigUInt64BE(BigInt(counter));const digest=createHmac("sha1",decode(secret)).update(buffer).digest(),offset=digest.at(-1)&15;return String((digest.readUInt32BE(offset)&0x7fffffff)%1000000).padStart(6,"0");};
export const verifyTotp=(secret,code,now=Date.now())=>{const value=String(code);return /^\d{6}$/.test(value)&&[-1,0,1].some(step=>timingSafeEqual(Buffer.from(totp(secret,now+step*30000)),Buffer.from(value)));};
const key=(value)=>createHmac("sha256",value).update("caremonitor-mfa-v1").digest();
export const encryptSecret=(secret,jwtSecret)=>{const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",key(jwtSecret),iv),body=Buffer.concat([cipher.update(secret,"utf8"),cipher.final()]);return [iv,cipher.getAuthTag(),body].map(x=>x.toString("base64url")).join(".");};
export const decryptSecret=(value,jwtSecret)=>{const [iv,tag,body]=value.split(".").map(x=>Buffer.from(x,"base64url")),cipher=createDecipheriv("aes-256-gcm",key(jwtSecret),iv);cipher.setAuthTag(tag);return Buffer.concat([cipher.update(body),cipher.final()]).toString("utf8");};
