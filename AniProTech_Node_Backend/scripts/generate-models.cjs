// One-time migration tool. Runtime code does not require Java or the original archive.
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(
  __dirname,
  "../../AniProTech_Backend-main/src/main/java/com/aniprotech",
);
const snake = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .slice(0, 63);
const clean = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\r\n]*/g, "");
const enumText = clean(fs.readFileSync(root + "/utils/Enums.java", "utf8"));
const enums = {};
const parseEnums = (s) => {
  for (const m of s.matchAll(/enum\s+(\w+)\s*\{([^}]+)\}/g))
    if (!enums[m[1]])
      enums[m[1]] = m[2]
        .split(",")
        .map((v) => v.trim())
        .filter((v) => /^\w+$/.test(v));
};
parseEnums(enumText);
const entities = {};
for (const file of fs.readdirSync(root + "/entities")) {
  const s = clean(fs.readFileSync(root + "/entities/" + file, "utf8"));
  parseEnums(s);
  const table = s.match(/@Table\(name\s*=\s*"([^"]+)"/)?.[1];
  if (!table) continue;
  const name = file.replace(".java", "");
  const fields = [];
  let last = s.indexOf("public class");
  for (const m of s.matchAll(
    /private\s+([\w<> ,.?]+)\s+(\w+)\s*(?:=[^;]*)?;/g,
  )) {
    const annotations = s.slice(last, m.index);
    last = m.index + m[0].length;
    const type = m[1].trim();
    const field = m[2];
    if (type.includes("static")) continue;
    const column = annotations.match(
      /@Column\([^)]*?name\s*=\s*"([^"]+)"/,
    )?.[1];
    const join = annotations.match(
      /@JoinColumn\([^)]*?name\s*=\s*"([^"]+)"/,
    )?.[1];
    const collection = annotations.includes("@ElementCollection");
    const relationList = /List<\w+Entity>/.test(type);
    const mappedBy = annotations.match(/mappedBy\s*=\s*"([^"]+)"/)?.[1];
    const inverse = !!mappedBy || relationList;
    const target = type.match(/(?:List<)?(\w+Entity)>?$/)?.[1];
    const scalarType = collection
      ? type
          .replace(/^(List|Map)</, "")
          .replace(/>$/, "")
          .split(",")
          .at(-1)
          .trim()
      : type;
    const enumName = scalarType.replace(/^Enums\./, "");
    fields.push({
      name: field[0].toLowerCase() + field.slice(1),
      javaName: field,
      type,
      column: snake(
        column || join || (target && !inverse ? field + "_id" : field),
      ),
      target,
      inverse,
      mappedBy,
      hidden: /@JsonIgnore|@JsonBackReference/.test(annotations),
      audit: annotations.includes("UserEntityAuditSerializer"),
      json: annotations.includes("SqlTypes.JSON"),
      enumName: enums[enumName] ? enumName : undefined,
      ordinal: !!enums[enumName] && !annotations.includes("EnumType.STRING"),
      required: /nullable\s*=\s*false/.test(annotations),
      unique: /unique\s*=\s*true/.test(annotations),
      where: annotations.match(/@Where\(clause\s*=\s*"([^"]+)"/)?.[1],
      collection: collection
        ? {
            table: snake(
              annotations.match(
                /@CollectionTable\(name\s*=\s*"([^"]+)"/,
              )?.[1] || name + "_" + field,
            ),
            owner: snake(join || name + "_id"),
            value: snake(column || field),
            key: type.startsWith("Map<")
              ? snake(
                  annotations.match(
                    /@MapKeyColumn\(name\s*=\s*"([^"]+)"/,
                  )?.[1] || field + "_key",
                )
              : undefined,
          }
        : undefined,
    });
  }
  entities[name] = { table: snake(table), fields };
}
// Entity-local enum Action is collected before type resolution on a second pass.
for (const model of Object.values(entities))
  for (const f of model.fields)
    if (enums[f.type]) {
      f.enumName = f.type;
      f.ordinal = false;
    }
fs.mkdirSync(path.resolve(__dirname, "../src/models"), { recursive: true });
fs.writeFileSync(
  path.resolve(__dirname, "../src/models/schema.json"),
  JSON.stringify({ entities, enums }, null, 2),
);
console.log("Generated " + Object.keys(entities).length + " entity mappings");
