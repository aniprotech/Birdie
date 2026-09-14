import { randomUUID } from "node:crypto";
import { entities, enums, quote } from "./db.js";
import { fail } from "./http.js";

export class Repository {
  constructor(db) {
    this.db = db;
  }
  model(name) {
    return entities[name] || fail(500, "Unknown model");
  }
  encode(f, value) {
    if (value === undefined || value === null || value === "") return null;
    if (f.target) return typeof value === "object" ? value.id : value;
    if (f.enumName) {
      const values = enums[f.enumName];
      if (!values.includes(value))
        fail(400, `${f.name} must be one of: ${values.join(", ")}`);
      return f.ordinal ? values.indexOf(value) : value;
    }
    if (f.json) {
      if (typeof value !== "object" || Array.isArray(value))
        fail(400, `${f.name} must be an object`);
      return JSON.stringify(value);
    }
    if (/^(boolean|Boolean)$/.test(f.type)) {
      if (value === true || value === "true") return true;
      if (value === false || value === "false") return false;
      fail(400, `${f.name} must be boolean`);
    }
    if (/^(Long|long|Integer|int|Double|double|BigDecimal)$/.test(f.type)) {
      if (!Number.isFinite(Number(value)))
        fail(400, `${f.name} must be numeric`);
      return value;
    }
    if (typeof value === "object")
      fail(400, `${f.name} must be a scalar value`);
    return value;
  }
  decode(f, value) {
    if (value == null) return null;
    if (f.enumName && f.ordinal) return enums[f.enumName][Number(value)];
    if (value instanceof Date)
      return f.type === "LocalDate" || f.type === "List<LocalDate>"
        ? value.toISOString().slice(0, 10)
        : value.toISOString();
    if (["Long", "long", "Integer", "int"].includes(f.type))
      return Number.isSafeInteger(Number(value)) ? Number(value) : value;
    return value;
  }
  async find(name, filters = {}, options = {}) {
    const model = this.model(name),
      params = [],
      conditions = [];
    for (const [key, value] of Object.entries(filters)) {
      const f = model.fields.find(
        (f) => f.name === key && !f.inverse && !f.collection,
      );
      if (!f) throw new Error(`Unknown filter ${name}.${key}`);
      if (value == null) conditions.push(`${quote(f.column)} IS NULL`);
      else {
        params.push(this.encode(f, value));
        conditions.push(`${quote(f.column)} = $${params.length}`);
      }
    }
    const order = model.fields.some((f) => f.name === "createdAt")
      ? " ORDER BY created_at DESC NULLS LAST, id"
      : " ORDER BY id";
    const { rows } = await this.db.query(
      `SELECT * FROM ${quote(model.table)}${conditions.length ? " WHERE " + conditions.join(" AND ") : ""}${order}${options.limit ? " LIMIT " + Math.min(Number(options.limit), 10000) : ""}${options.lock ? " FOR UPDATE" : ""}`,
      params,
    );
    const result = [];
    for (const row of rows) {
      const record = {};
      for (const f of model.fields.filter((f) => !f.inverse && !f.collection))
        record[f.name] = this.decode(f, row[f.column]);
      if (options.collections !== false)
        for (const f of model.fields.filter((f) => f.collection)) {
          const c = f.collection;
          const values = (
            await this.db.query(
              `SELECT * FROM ${quote(c.table)} WHERE ${quote(c.owner)}=$1`,
              [record.id],
            )
          ).rows;
          record[f.name] = c.key
            ? Object.fromEntries(
                values.map((v) => [v[c.key], this.decode(f, v[c.value])]),
              )
            : values.map((v) => this.decode(f, v[c.value]));
        }
      result.push(record);
    }
    return result;
  }
  async get(name, id, options = {}) {
    return (await this.find(name, { id }, { ...options, limit: 1 }))[0] || null;
  }
  async one(name, filter) {
    return (await this.find(name, filter, { limit: 1 }))[0] || null;
  }
  async save(name, data) {
    return this.db.transaction(async () => {
      const model = this.model(name),
        id = data.id || randomUUID();
      const old = data.id
        ? await this.get(name, id, { collections: false })
        : null;
      const input = { ...data, id };
      const now = new Date().toISOString();
      if (!old && model.fields.some((f) => f.name === "createdAt"))
        input.createdAt = input.createdAt || now;
      if (model.fields.some((f) => f.name === "updatedAt"))
        input.updatedAt = now;
      const fields = model.fields.filter(
        (f) => !f.inverse && !f.collection && input[f.name] !== undefined,
      );
      const columns = fields.map((f) => quote(f.column)),
        values = fields.map((f) => this.encode(f, input[f.name]));
      if (old) {
        const changed = fields.filter((f) => f.name !== "id");
        if (changed.length)
          await this.db.query(
            `UPDATE ${quote(model.table)} SET ${changed.map((f, i) => quote(f.column) + "=$" + (i + 1)).join(",")} WHERE id=$${changed.length + 1}`,
            [...changed.map((f) => this.encode(f, input[f.name])), id],
          );
      } else
        await this.db.query(
          `INSERT INTO ${quote(model.table)} (${columns.join(",")}) VALUES (${values.map((_, i) => "$" + (i + 1)).join(",")})`,
          values,
        );
      for (const f of model.fields.filter(
        (f) => f.collection && input[f.name] !== undefined,
      )) {
        const c = f.collection,
          value = input[f.name];
        if (
          value != null &&
          (c.key
            ? typeof value !== "object" || Array.isArray(value)
            : !Array.isArray(value))
        )
          fail(400, `${f.name} has an invalid collection value`);
        await this.db.query(
          `DELETE FROM ${quote(c.table)} WHERE ${quote(c.owner)}=$1`,
          [id],
        );
        for (const [key, item] of Object.entries(value || {})) {
          const params = c.key
            ? [
                id,
                key,
                this.encode(
                  {
                    ...f,
                    target: undefined,
                    json: false,
                    type: f.type
                      .replace(/^(List|Map)</, "")
                      .replace(/>$/, "")
                      .split(",")
                      .at(-1)
                      .trim(),
                  },
                  item,
                ),
              ]
            : [
                id,
                this.encode(
                  {
                    ...f,
                    target: undefined,
                    json: false,
                    type: f.type.replace(/^List</, "").replace(/>$/, ""),
                  },
                  item,
                ),
              ];
          await this.db.query(
            `INSERT INTO ${quote(c.table)} (${[c.owner, ...(c.key ? [c.key] : []), c.value].map(quote).join(",")}) VALUES (${params.map((_, i) => "$" + (i + 1)).join(",")})`,
            params,
          );
        }
      }
      return this.get(name, id);
    });
  }
  async remove(name, id) {
    return this.db.transaction(async () => {
      const model = this.model(name);
      for (const f of model.fields.filter((f) => f.collection))
        await this.db.query(
          `DELETE FROM ${quote(f.collection.table)} WHERE ${quote(f.collection.owner)}=$1`,
          [id],
        );
      for (const f of model.fields.filter(
        (f) => f.inverse && f.mappedBy && f.target,
      ))
        for (const child of await this.find(f.target, { [f.mappedBy]: id }))
          await this.remove(f.target, child.id);
      await this.db.query(`DELETE FROM ${quote(model.table)} WHERE id=$1`, [
        id,
      ]);
    });
  }
  input(name, body, extra = []) {
    const protectedFields = new Set([
      "id",
      "user",
      "agencyId",
      "createdAt",
      "createdBy",
      "updatedAt",
      "updatedBy",
      "deletedAt",
      "deletedBy",
      "submittedAt",
      "submittedBy",
      "reviewedAt",
      "reviewedBy",
      "file",
      "fileName",
      "fileUrl",
      "profileImagePath",
      "skillsFilePath",
      "additionaDocumentFilePath",
      "contractFilePath",
      "idFilePath",
      "drivingLicenceFilePath",
      "bankStatementFilePath",
      "utilityBillFilePath",
      "referencesFilePath",
      "dbsRecordFilePath",
    ]);
    return Object.fromEntries(
      this.model(name)
        .fields.filter(
          (f) =>
            !f.inverse &&
            (!f.target || extra.includes(f.name)) &&
            (!protectedFields.has(f.name) || extra.includes(f.name)) &&
            body[f.name] !== undefined,
        )
        .map((f) => [f.name, body[f.name]]),
    );
  }
  async serialize(name, record, { children = false } = {}) {
    if (!record) return null;
    const out = {};
    for (const f of this.model(name).fields) {
      if (f.hidden || f.inverse) continue;
      if (f.target && record[f.name]) {
        const target = await this.get(f.target, record[f.name], {
          collections: false,
        });
        out[f.name] = target
          ? {
              id: target.id,
              firstName: target.firstName,
              lastName: target.lastName,
            }
          : null;
      } else out[f.name] = record[f.name] ?? null;
    }
    if (children)
      for (const f of this.model(name).fields.filter(
        (f) => f.inverse && f.mappedBy && !f.hidden,
      )) {
        const children = await this.find(f.target, { [f.mappedBy]: record.id });
        out[f.name] = f.type.startsWith("List<")
          ? await Promise.all(children.map((c) => this.serialize(f.target, c)))
          : await this.serialize(f.target, children[0]);
      }
    return out;
  }
}
