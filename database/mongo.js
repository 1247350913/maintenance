"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.closeDb = closeDb;
const mongodb_1 = require("mongodb");
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = __importDefault(require("dotenv"));
const envPath = node_path_1.default.resolve(process.cwd(), "../.env");
dotenv_1.default.config({ path: envPath });
let client;
let database;
let connection;
async function getDb() {
    if (database)
        return database;
    if (connection)
        return connection;
    const uri = process.env.MONGODB_URI;
    if (!uri)
        throw new Error("MONGODB_URI is not configured");
    connection = (async () => {
        client = new mongodb_1.MongoClient(uri);
        await client.connect();
        database = client.db(process.env.MONGODB_DB ?? "maintenance");
        const machines = database.collection("machines");
        await Promise.all([
            machines.updateMany({ spec: { $exists: true }, spec1: { $exists: false } }, { $rename: { spec: "spec1" } }),
            machines.updateMany({ status: "active" }, { $set: { status: "Active" } }),
            machines.updateMany({ status: "pending" }, { $set: { status: "Pending" } }),
            machines.updateMany({ status: "sold" }, { $set: { status: "Sold" } }),
            machines.updateMany({}, { $unset: { startingOdometer: "", legacyCode: "" } })
        ]);
        return database;
    })();
    try {
        return await connection;
    }
    catch (error) {
        connection = undefined;
        throw error;
    }
}
async function closeDb() {
    await client?.close();
    client = undefined;
    database = undefined;
    connection = undefined;
}
