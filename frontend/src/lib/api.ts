import type { DueInstance, Machine, Rule } from "@maintenance/shared";

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8787/api";
async function get<T>(path: string): Promise<T> { const response = await fetch(`${baseUrl}${path}`); if (!response.ok) throw new Error(await response.text()); return response.json(); }
export const api = {
  dashboard: () => get<DueInstance[]>("/dashboard"),
  machines: () => get<Machine[]>("/machines"),
  rules: () => get<Rule[]>("/rules"),
  updateOdometer: (id: string, currentOdometer: number, currentOdometerDate: string) => fetch(`${baseUrl}/machines/${id}/odometer`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentOdometer, currentOdometerDate }) })
};
