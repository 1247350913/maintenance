import type { DueInstance, Machine, Rule, ValidationValue } from "@maintenance/shared";

const baseUrl = import.meta.env.VITE_API_URL ?? "/api";
async function get<T>(path: string): Promise<T> { const response = await fetch(`${baseUrl}${path}`); if (!response.ok) throw new Error(await response.text()); return response.json(); }
async function post<T>(path: string, body: unknown): Promise<T> { const response = await fetch(`${baseUrl}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); if (!response.ok) throw new Error(await response.text()); return response.json(); }
async function remove(path: string): Promise<void> { const response = await fetch(`${baseUrl}${path}`, { method: "DELETE" }); if (!response.ok) throw new Error(await response.text()); }
export const api = {
  dashboard: () => get<DueInstance[]>("/dashboard"),
  machines: () => get<Machine[]>("/machines"),
  rules: () => get<Rule[]>("/rules"),
  validationValues: () => get<ValidationValue[]>("/validation-values"),
  createValidationValue: (value: Omit<ValidationValue, "id" | "core">) => post<ValidationValue>("/validation-values", value),
  deleteValidationValue: (id: string) => remove(`/validation-values/${id}`),
  createMachine: (machine: Omit<Machine, "id">) => post<Machine>("/machines", machine),
  updateOdometer: (id: string, currentOdometer: number, currentOdometerDate: string) => fetch(`${baseUrl}/machines/${id}/odometer`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentOdometer, currentOdometerDate }) })
};
