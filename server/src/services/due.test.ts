import { describe, expect, it } from "vitest";
import { calculateDueInstance } from "./due.js";
import type { Machine, Rule, TaskDefinition } from "@maintenance/shared";

const machine: Machine = { id: "m1", code: "CAR-1", type: "Auto", make: "Test", startingOdometer: 0, currentOdometer: 1000, status: "active", inServiceDate: "2025-01-01" };
const task: TaskDefinition = { id: "t1", machineId: "m1", name: "Oil change", category: "Engine", ruleId: "r1" };

describe("calculateDueInstance", () => {
  it("marks mileage work overdue after the interval", () => {
    const rule: Rule = { id: "r1", name: "Every 500 miles", kind: "mileage", mileageInterval: 500 };
    expect(calculateDueInstance(task, machine, rule).status).toBe("overdue");
  });
});
