import type { ValidationCategory } from "@maintenance/shared";
import type { Db } from "mongodb";

const values: Record<ValidationCategory, string[]> = {
  type: ["Auto", "Moto", "Cycle", "UV"],
  make: ["Chevrolet", "GMC", "Porsche", "Subaru", "Toyota", "Lexus", "Audi", "BMW", "KIA", "Yamaha", "Honda", "Suzuki", "Ducati", "Keiser", "Triumph", "Marin", "Specialized", "Trek"],
  model: ["Corvette", "Suburban", "Bolt", "Volt", "Malibu", "Yukon", "Yukon XL", "Blazer", "Cayman", "Forester", "Rav4", "Sequoia", "Camry", "Corolla", "M3", "M3i", "Speed 400", "Allez", "DSX", "DSX2"],
  spec1: ["3.5L V6"],
  status: ["Active", "Pending", "Sold"]
};

export async function ensureCoreValidationValues(db: Db): Promise<void> {
  const operations = Object.entries(values).flatMap(([category, categoryValues]) => categoryValues.map((value) => ({
    updateOne: {
      filter: { category, value },
      update: { $set: { core: true } },
      upsert: true
    }
  })));
  await db.collection("validationValues").bulkWrite(operations);
}
