import express from "express";
import cors from "cors";
import path from "node:path";
import "dotenv/config";
import { crudRouter } from "./routes/crud.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { machinesRouter } from "./routes/machines.js";

const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api", crudRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/machines", machinesRouter);
app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(500).json({ error: error.message }));

const webDist = path.resolve(process.cwd(), "../frontend/dist");
app.use(express.static(webDist));
app.get("/{*path}", (_req, res) => res.sendFile(path.join(webDist, "index.html")));

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => console.log(`Maintenance API listening on http://localhost:${port}`));
