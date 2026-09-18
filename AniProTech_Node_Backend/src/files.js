import multer from "multer";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import jwt from "jsonwebtoken";
import { fail } from "./http.js";
const allowed = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
export function createFiles(config, db) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 12 * 1024 * 1024,
      files: 12,
      fields: 200,
      fieldSize: 2 * 1024 * 1024,
    },
  }).any();
  async function save(file) {
    if (!file?.buffer?.length) fail(400, "A non-empty file is required");
    const type = await fileTypeFromBuffer(file.buffer);
    if (!type || !allowed.has(type.mime))
      fail(400, "Only PDF, PNG, JPEG and Word documents are allowed");
    const filename = `${randomUUID()}.${type.ext}`;
    const resource=`uploads/${filename}`;
    if(config.storageMode==="database")await db.query("INSERT INTO node_private_files(resource,original_name,mime_type,content) VALUES($1,$2,$3,$4)",[resource,path.basename(file.originalname.replaceAll("\\", "/")),type.mime,file.buffer]);
    else {
      await fs.mkdir(config.uploadDir, { recursive: true });
      await fs.writeFile(path.join(config.uploadDir, filename), file.buffer, {flag: "wx",mode: 0o600});
    }
    return {
      url: resource,
      filename: path.basename(file.originalname.replaceAll("\\", "/")),
      mime: type.mime,
    };
  }
  function signTree(value, req) {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string" && /^uploads\/[\w./-]+$/.test(value)) {
      const ticket = jwt.sign(
        { resource: value, sid: req.sessionId },
        config.jwtSecret,
        {
          subject: req.user.id,
          expiresIn: "5m",
          audience: "aniprotech-file",
          algorithm: "HS256",
        },
      );
      return `${value}?ticket=${ticket}`;
    }
    if (Array.isArray(value)) return value.map((v) => signTree(v, req));
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, signTree(v, req)]),
      );
    return value;
  }
  async function download(req, res) {
    let claims;
    try {
      claims = jwt.verify(req.query.ticket, config.jwtSecret, {
        algorithms: ["HS256"],
        audience: "aniprotech-file",
      });
    } catch {
      fail(401, "A valid download ticket is required");
    }
    const resource = req.path.slice(1);
    if (claims.resource !== resource) fail(403, "Invalid file permission");
    const session = (
      await db.query(
        "SELECT s.id FROM node_sessions s JOIN users u ON u.id=s.user_id WHERE s.id=$1 AND s.user_id=$2 AND s.revoked_at IS NULL AND s.expires_at>CURRENT_TIMESTAMP AND s.last_seen_at>CURRENT_TIMESTAMP-interval '5 minutes' AND u.is_active=true",
        [claims.sid, claims.sub],
      )
    ).rows[0];
    if (!session) fail(401, "Session expired");
    res.set("Cache-Control", "private, no-store");
    if(config.storageMode==="database"){
      const stored=(await db.query("SELECT original_name,mime_type,content FROM node_private_files WHERE resource=$1",[resource])).rows[0];
      if(!stored)fail(404,"File not found");
      res.type(stored.mime_type);res.set("Content-Disposition",`inline; filename*=UTF-8''${encodeURIComponent(stored.original_name)}`);return res.send(stored.content);
    }
    const relative = resource.slice("uploads/".length),
      target = path.resolve(config.uploadDir, relative);
    if (!target.startsWith(path.resolve(config.uploadDir) + path.sep))
      fail(403, "Invalid file path");
    try {
      await fs.access(target);
    } catch {
      fail(404, "File not found");
    }
    res.sendFile(target);
  }
  return { upload, save, signTree, download };
}
