# Maintenance Tracker bootstrap

Single-user maintenance tracker for vehicles, motorcycles, bicycles, equipment, and other machines.

## Frontend

- React + Vite + TypeScript
- Dashboard, machine detail, machines, and rules pages
- Runs at http://localhost:5173

Start the frontend with the root development command after the server and database are configured:

```bash
npm run dev
```

## Server

- Express + TypeScript API
- Zod shared schemas
- No authentication yet by design
- API routes live in `server/src/routes`

Build or run the full application from the repository root:

```bash
npm run build
npm run dev
```

## Database

- MongoDB Atlas document database
- Direct cloud persistence through `MONGODB_URI`
- Seed data is optional and based on the supplied spreadsheet

1. Create a free MongoDB Atlas cluster and database user.
2. Copy `.env.example` to `.env` and fill in `MONGODB_URI`.
3. Install dependencies with `npm install`.
4. Optionally load starter data with `npm run seed`.

### Domain model
- **machines**: hard facts, service start date, current odometer/date, status
- **rules**: reusable scheduling rules (`mileage`, `age`, `either`, `special`)
- **taskDefinitions**: master/hard-copy maintenance tasks assigned to a machine, with a rule + schedule parameters
- **completions**: immutable service history events (what actually happened, date, odometer, note)
- **instances**: derived API/UI objects representing the next/previous occurrence of a task; not a giant table that must stay synchronized

The dashboard derives due/overdue work from the machine's current odometer/date, each task definition, and its latest completion.

### Copilot handoff targets
Good next prompts:
- "Implement add/edit/delete modals for Machines and Rules using the existing REST routes and schemas."
- "Add task-definition CRUD to MachineDetailPage, including rule selection and interval fields."
- "Add completion recording; when completed, append to completions and immediately recompute next due instance."
- "Add special seasonal/custom rules and dashboard filtering/sorting."
- "Add MongoDB backups/export JSON and later add auth without changing domain collections."

### Scheduling semantics
For a recurring task, the next milestone is anchored to the latest completion if one exists; otherwise it is anchored to the machine's in-service date / starting odometer. `either` means the earlier of age or mileage. The engine reports overdue, due-soon, upcoming, or unscheduled.

This skeleton intentionally keeps scheduling logic in `server/src/services/due.ts` so it is easy to test and evolve.
