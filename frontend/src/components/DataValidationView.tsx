import { useState } from "react";
import type { ValidationCategory, ValidationValue } from "@maintenance/shared";
import { api } from "../lib/api";

const categories: { value: ValidationCategory; label: string }[] = [
  { value: "type", label: "Type" },
  { value: "make", label: "Make" },
  { value: "model", label: "Model" },
  { value: "spec1", label: "Spec 1" },
  { value: "status", label: "Status" }
];

export function DataValidationView({ values, onChanged }: { values: ValidationValue[]; onChanged: () => Promise<unknown> }) {
  const [category, setCategory] = useState<ValidationCategory>("type");
  const [newValue, setNewValue] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const visible = values.filter((item) => !item.core && item.category === category && item.value.toLocaleLowerCase().includes(search.toLocaleLowerCase()));

  return <main><section className="section-heading"><div><p className="eyebrow">CONTROLLED VALUES</p><h2>Data Validation</h2></div></section><div className="validation-toolbar"><label>Category<select value={category} onChange={(event) => setCategory(event.target.value as ValidationCategory)}>{categories.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label><label>Search<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div><form className="validation-add" onSubmit={async (event) => { event.preventDefault(); setError(""); try { await api.createValidationValue({ category, value: newValue }); setNewValue(""); await onChanged(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not add value."); } }}><label>New value<input value={newValue} onChange={(event) => setNewValue(event.target.value)} required /></label><button className="button primary" type="submit">Add</button></form>{error && <div className="alert">{error}</div>}<div className="validation-list">{visible.map((item) => <div className="validation-row" key={item.id}><span>{item.value}</span><button className="text-button danger" type="button" onClick={async () => { if (!item.id) return; setError(""); try { await api.deleteValidationValue(item.id); await onChanged(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not remove value."); } }}>Remove</button></div>)}{!visible.length && <div className="empty">No custom values found.</div>}</div></main>;
}
