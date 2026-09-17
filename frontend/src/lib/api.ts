import type { DueInstance, Machine, Rule } from "@maintenance/shared";

const baseUrl = import.meta.env.VITE_API_URL ?? "/api";
async function get<T>(path: string): Promise<T> { const response = await fetch(`${baseUrl}${path}`); if (!response.ok) throw new Error(await response.text()); return response.json(); }
async function post<T>(path: string, body: unknown): Promise<T> { const response = await fetch(`${baseUrl}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); if (!response.ok) throw new Error(await response.text()); return response.json(); }
export const api = {
  dashboard: () => get<DueInstance[]>("/dashboard"),
  machines: () => get<Machine[]>("/machines"),
  rules: () => get<Rule[]>("/rules"),
  createMachine: (machine: Omit<Machine, "id">) => post<Machine>("/machines", machine),
  updateOdometer: (id: string, currentOdometer: number, currentOdometerDate: string) => fetch(`${baseUrl}/machines/${id}/odometer`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentOdometer, currentOdometerDate }) })
};
