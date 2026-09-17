import { useState } from "react";
import type { Machine, ValidationCategory, ValidationValue } from "@maintenance/shared";
import { api } from "../lib/api";

const labels: Record<ValidationCategory, string> = { type: "Type", make: "Make", model: "Model", spec1: "Spec 1", status: "Status" };

function optional(value: string): string | undefined {
  return value || undefined;
}

function optionalNumber(value: string): number | undefined {
  return value === "" ? undefined : Number(value);
}

export function MachineDialog({ validationValues, onClose, onSaved }: { validationValues: ValidationValue[]; onClose: () => void; onSaved: () => Promise<void> }) {
  const [fields, setFields] = useState({ code: "", type: "Auto", year: "", make: "", model: "", spec1: "", acquiredDate: "", inServiceDate: "", currentOdometer: "", currentOdometerDate: "", status: "Active", vinOrSerial: "", modelId: "", licenseId: "", reminderMiles: "", reminderYears: "" });
  const setField = (name: keyof typeof fields, value: string) => setFields((current) => ({ ...current, [name]: value }));
  const options = (category: ValidationCategory) => validationValues.filter((item) => item.category === category);
  const select = (category: ValidationCategory, required = false) => <label>{labels[category]}<select value={fields[category]} onChange={(event) => setField(category, event.target.value)} required={required}>{!required && <option value="">None</option>}{options(category).map((item) => <option value={item.value} key={item.id}>{item.value}</option>)}</select></label>;

  return <div className="modal-backdrop"><form className="modal machine-modal" onSubmit={async (event) => {
    event.preventDefault();
    const machine: Omit<Machine, "id"> = {
      code: fields.code,
      type: fields.type,
      year: optionalNumber(fields.year),
      make: optional(fields.make),
      model: optional(fields.model),
      spec1: optional(fields.spec1),
      acquiredDate: optional(fields.acquiredDate),
      inServiceDate: optional(fields.inServiceDate),
      currentOdometer: optionalNumber(fields.currentOdometer),
      currentOdometerDate: optional(fields.currentOdometerDate),
      status: fields.status,
      vinOrSerial: optional(fields.vinOrSerial),
      modelId: optional(fields.modelId),
      licenseId: optional(fields.licenseId),
      reminderMiles: optionalNumber(fields.reminderMiles),
      reminderYears: optionalNumber(fields.reminderYears)
    };
    await api.createMachine(machine);
    await onSaved();
  }}><div className="section-heading"><h2>Add machine</h2><button type="button" className="icon-button" aria-label="Close" onClick={onClose}>×</button></div><div className="form-grid"><label>Machine ID<input value={fields.code} onChange={(event) => setField("code", event.target.value)} required /></label>{select("type", true)}<label>Year<input value={fields.year} onChange={(event) => setField("year", event.target.value)} type="number" min="1800" max="3000" /></label>{select("make")}{select("model")}{select("spec1")}<label>Acquired Date<input value={fields.acquiredDate} onChange={(event) => setField("acquiredDate", event.target.value)} type="date" /></label><label>In-Service Date<input value={fields.inServiceDate} onChange={(event) => setField("inServiceDate", event.target.value)} type="date" /></label><label>Current ODO Miles<input value={fields.currentOdometer} onChange={(event) => setField("currentOdometer", event.target.value)} type="number" min="0" /></label><label>Current ODO Miles Date<input value={fields.currentOdometerDate} onChange={(event) => setField("currentOdometerDate", event.target.value)} type="date" /></label>{select("status", true)}<label>VIN / ID / SN /<input value={fields.vinOrSerial} onChange={(event) => setField("vinOrSerial", event.target.value)} /></label><label>Model ID<input value={fields.modelId} onChange={(event) => setField("modelId", event.target.value)} /></label><label>License ID<input value={fields.licenseId} onChange={(event) => setField("licenseId", event.target.value)} /></label><label>Reminder Miles<input value={fields.reminderMiles} onChange={(event) => setField("reminderMiles", event.target.value)} type="number" min="0" /></label><label>Reminder Years<input value={fields.reminderYears} onChange={(event) => setField("reminderYears", event.target.value)} type="number" min="0" step="any" /></label></div><button className="button primary" type="submit">Add machine</button></form></div>;
}
