import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb, closeDb } from "./db/mongo.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const seed = JSON.parse(fs.readFileSync(path.resolve(here, "../../database/seed.json"), "utf8"));

const db = await getDb();
for (const [collectionName, documents] of Object.entries(seed)) {
  if (!Array.isArray(documents)) continue;
  await db.collection(collectionName).deleteMany({});
  if (documents.length) await db.collection(collectionName).insertMany(documents);
}
await closeDb();
console.log("Starter data loaded.");
