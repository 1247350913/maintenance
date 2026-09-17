import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "../.env") });

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not configured. Add it to the root .env file.");

const seed = JSON.parse(fs.readFileSync(path.join(here, "seed.json"), "utf8"));
if (!Array.isArray(seed.validationValues)) throw new Error("database/seed.json must contain a validationValues array.");

const client = new MongoClient(uri);
try {
  await client.connect();
  const collection = client.db(process.env.MONGODB_DB ?? "maintenance").collection("validationValues");
  if (seed.validationValues.length) {
    await collection.bulkWrite(seed.validationValues.map(({ category, value }) => ({
      updateOne: {
        filter: { category, value },
        update: { $set: { category, value, core: true } },
        upsert: true
      }
    })));
  }
  console.log(`Seeded ${seed.validationValues.length} core validation values without changing user data.`);
} finally {
  await client.close();
}
