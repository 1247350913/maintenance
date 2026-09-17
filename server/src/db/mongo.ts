import { MongoClient, type Db } from "mongodb";
import path from "node:path";
import dotenv from "dotenv";

const envPath = path.resolve(process.cwd(), "../.env");
dotenv.config({ path: envPath });

let client: MongoClient | undefined;
let database: Db | undefined;

export async function getDb(): Promise<Db> {
  if (database) return database;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  client = new MongoClient(uri);
  await client.connect();
  database = client.db(process.env.MONGODB_DB ?? "maintenance");
  return database;
}

export async function closeDb(): Promise<void> {
  await client?.close();
  client = undefined;
  database = undefined;
}
