import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { DueInstance, Machine, Rule, ValidationValue } from "@maintenance/shared";
import { api } from "./lib/api";
import { DataValidationView } from "./components/DataValidationView";
import { MachineDialog } from "./components/MachineDialog";
import "./styles.css";

type View = "dashboard" | "machines" | "rules" | "validation";

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [due, setDue] = useState<DueInstance[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [validationValues, setValidationValues] = useState<ValidationValue[]>([]);
  const [error, setError] = useState("");
  const reload = () => Promise.all([api.dashboard(), api.machines(), api.rules(), api.validationValues()]).then(([nextDue, nextMachines, nextRules, nextValidationValues]) => { setDue(nextDue); setMachines(nextMachines); setRules(nextRules); setValidationValues(nextValidationValues); }).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not reach the API."));
  useEffect(() => { void reload(); }, []);
  const counts = { overdue: due.filter((item) => item.status === "overdue").length, soon: due.filter((item) => item.status === "due-soon").length };
  return <div className="app-shell">
    <header className="topbar"><div><p className="eyebrow">PERSONAL WORKSHOP</p><h1>Maintenance ledger</h1></div><span className="sync-dot">● Cloud connected</span></header>
    <nav className="tabs">{([["dashboard", "Dashboard"], ["machines", "Machines"], ["rules", "Rules"], ["validation", "Data Validation"]] as const).map(([key, label]) => <button className={view === key ? "tab active" : "tab"} onClick={() => setView(key)} key={key}>{label}</button>)}</nav>
    {error && <div className="alert">{error} <button onClick={() => { setError(""); void reload(); }}>Retry</button></div>}
    {view === "dashboard" && <main><section className="intro"><div><p className="eyebrow">TODAY'S VIEW</p><h2>Keep every machine ready.</h2><p>Upcoming and overdue work, gathered in one calm place.</p></div><div className="stat-row"><div><strong>{counts.overdue}</strong><span>Overdue</span></div><div><strong>{counts.soon}</strong><span>Due soon</span></div><div><strong>{machines.length}</strong><span>Machines</span></div></div></section><section className="section-heading"><div><p className="eyebrow">ACTION QUEUE</p><h2>Maintenance horizon</h2></div><button className="button subtle" onClick={() => void reload()}>Refresh</button></section><div className="task-grid">{due.length ? due.map((item) => <article className={`task-card ${item.status}`} key={item.task.id}><div className="task-card-top"><span className="badge">{item.status.replace("-", " ")}</span><span className="task-category">{item.task.category}</span></div><h3>{item.task.name}</h3><p>{item.machine.year} {item.machine.make} {item.machine.model ?? ""}</p><div className="task-meta"><span>{item.dueOdometer ? `${item.dueOdometer.toLocaleString()} mi` : "Date based"}</span><span>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "No date"}</span></div></article>) : <div className="empty">No task instances yet. Add machines, rules, and task definitions to build the queue.</div>}</div></main>}
    {view === "machines" && <MachineView machines={machines} validationValues={validationValues} onSaved={reload} />}
    {view === "rules" && <RuleView rules={rules} />}
    {view === "validation" && <DataValidationView values={validationValues} onChanged={reload} />}
  </div>;
}

function MachineView({ machines, validationValues, onSaved }: { machines: Machine[]; validationValues: ValidationValue[]; onSaved: () => Promise<unknown> }) {
  const [editing, setEditing] = useState<Machine | null>(null);
  const [adding, setAdding] = useState(false);
  return <main><section className="section-heading"><div><p className="eyebrow">YOUR FLEET</p><h2>Machines</h2><p>Hard points, service dates, and current odometer readings.</p></div><button className="button primary" onClick={() => setAdding(true)}>+ Add machine</button></section><div className="machine-grid">{machines.map((machine) => <article className="machine-card" key={machine.id}><div className="machine-icon">{machine.type.slice(0, 1)}</div><div><span className="eyebrow">{machine.code}</span><h3>{machine.year} {machine.make} {machine.model}</h3><p>{machine.type} · {machine.status}</p></div><div className="odo"><span>Current odometer</span><strong>{machine.currentOdometer?.toLocaleString() ?? "Not set"}</strong><button className="text-button" onClick={() => setEditing(machine)}>Update reading</button></div></article>)}</div>{adding && <MachineDialog validationValues={validationValues} onClose={() => setAdding(false)} onSaved={async () => { setAdding(false); await onSaved(); }} />}{editing && <OdometerDialog machine={editing} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await onSaved(); }} />}</main>;
}
function OdometerDialog({ machine, onClose, onSaved }: { machine: Machine; onClose: () => void; onSaved: () => Promise<void> }) { const [odometer, setOdometer] = useState(String(machine.currentOdometer ?? "")); return <div className="modal-backdrop"><form className="modal" onSubmit={async (event) => { event.preventDefault(); await api.updateOdometer(machine.id!, Number(odometer), new Date().toISOString()); await onSaved(); }}><div className="section-heading"><h2>Update reading</h2><button type="button" className="icon-button" onClick={onClose}>×</button></div><label>Current odometer<input value={odometer} onChange={(event) => setOdometer(event.target.value)} type="number" min="0" required /></label><button className="button primary" type="submit">Save reading</button></form></div>; }
function RuleView({ rules }: { rules: Rule[] }) { return <main><section className="section-heading"><div><p className="eyebrow">SCHEDULING LOGIC</p><h2>Rules</h2><p>Reusable triggers for every maintenance task.</p></div><button className="button primary">+ New rule</button></section><div className="rule-list">{rules.map((rule) => <article className="rule-row" key={rule.id}><div><span className="badge neutral">{rule.kind}</span><h3>{rule.name}</h3></div><p>{rule.mileageInterval ? `Every ${rule.mileageInterval.toLocaleString()} miles` : ""}{rule.mileageInterval && rule.yearsInterval ? " or " : ""}{rule.yearsInterval ? `every ${rule.yearsInterval} years` : ""}</p><button className="text-button">Edit</button></article>)}</div></main>; }

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
