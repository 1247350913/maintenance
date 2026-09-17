import { z } from "zod";

export const MachineSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1),
  type: z.string().min(1),
  year: z.number().int().min(1800).max(3000).optional(),
  make: z.string().min(1),
  model: z.string().optional(),
  spec: z.string().optional(),
  inServiceDate: z.string().optional(),
  startingOdometer: z.number().nonnegative().default(0),
  currentOdometer: z.number().nonnegative().optional(),
  currentOdometerDate: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  vinOrSerial: z.string().optional(),
  licenseId: z.string().optional()
});

export const RuleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  kind: z.enum(["mileage", "age", "either", "special"]),
  mileageInterval: z.number().positive().optional(),
  yearsInterval: z.number().positive().optional(),
  description: z.string().optional()
});

export const TaskDefinitionSchema = z.object({
  id: z.string().optional(),
  machineId: z.string(),
  name: z.string().min(1),
  category: z.string().default("General"),
  ruleId: z.string(),
  notes: z.string().optional()
});

export const CompletionSchema = z.object({
  id: z.string().optional(),
  taskDefinitionId: z.string(),
  completedAt: z.string(),
  odometer: z.number().nonnegative().optional(),
  note: z.string().optional()
});

export type Machine = z.infer<typeof MachineSchema>;
export type Rule = z.infer<typeof RuleSchema>;
export type TaskDefinition = z.infer<typeof TaskDefinitionSchema>;
export type Completion = z.infer<typeof CompletionSchema>;
export type DueStatus = "overdue" | "due-soon" | "upcoming" | "unscheduled";
export type DueInstance = {
  task: TaskDefinition;
  machine: Machine;
  rule: Rule;
  status: DueStatus;
  dueDate?: string;
  dueOdometer?: number;
  daysUntil?: number;
  milesUntil?: number;
};
