# Maintenance Tracker

Maintenance tracker for vehicles, motorcycles, bicycles, houses, equipment, or other machines.

## Frontend

- React + Vite + TypeScript
- Dashboard, machine detail, machines, and rules pages
- Runs at http://localhost:5173

Start the frontend with the root development command after the server and database are configured:

```bash
npm run dev
```

The web app calls `/api` by default. Vite proxies that path to the local server during development; in production, Express serves the frontend and API together from one origin.

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

## Deployment

The included `Dockerfile` builds and serves both the web app and API as one public service. Set these secrets in the deployment provider, not in a tracked `.env` file:

```text
MONGODB_URI=mongodb+srv://camjhirsh_db_user:URL_ENCODED_PASSWORD@cluster0.ejtoobf.mongodb.net/?appName=Cluster0
MONGODB_DB=maintenance
PORT=8787
```

Point `maintenance.lnks.info` at this service using the provider's custom-domain controls. The service listens on `PORT` and exposes both the application and `/api` on that domain. Authentication is intentionally not enabled, so all visitors can edit the fleet.

### Domain model
- **machines**: hard facts, service start date, current odometer/date, status
- **rules**: reusable scheduling rules (`mileage`, `age`, `either`, `special`)
- **taskDefinitions**: master/hard-copy maintenance tasks assigned to a machine, with a rule + schedule parameters
- **completions**: immutable service history events (what actually happened, date, odometer, note)
- **instances**: derived API/UI objects representing the next/previous occurrence of a task; not a giant table that must stay synchronized

The dashboard derives due/overdue work from the machine's current odometer/date, each task definition, and its latest completion.

### Scheduling semantics
For a recurring task, the next milestone is anchored to the latest completion if one exists; otherwise it is anchored to the machine's in-service date / starting odometer. `either` means the earlier of age or mileage. The engine reports overdue, due-soon, upcoming, or unscheduled.

This skeleton intentionally keeps scheduling logic in `server/src/services/due.ts` so it is easy to test and evolve.

# Architecture notes

## Why MongoDB
The data is naturally document-oriented and evolves easily. A machine can gain fields later without migrations, while tasks/rules/completions remain separately queryable collections.

## Collections

### machines
One document per maintained object. `currentOdometer` is a current-state value for dashboard calculation; historical readings can later move into an `odometerReadings` collection if graphs/auditability are desired.

### rules
Reusable scheduling semantics. Initial kinds:
- `mileage`
- `age`
- `either` (first trigger wins)
- `special` (seasonal/custom/manual hook)

### taskDefinitions
The canonical "hard copy" of a maintenance task for a specific machine. It describes what the task is and its schedule parameters. This is the equivalent of the spreadsheet's Unique Tasks table.

### completions
Append-only history. A completion is an actual performed/inspected event with date, odometer, note, and optional cost.

## Instances without instance-table explosion
An instance is a view of a task occurrence, not necessarily a database row. The next instance can be derived from:
1. task definition,
2. machine state,
3. latest completion,
4. selected rule.

For UI history dropdowns, fetch the completion history and represent:
- occurrence 1 = base task / first due milestone
- occurrence 2+ = repeated milestones anchored from prior completion

If later you need explicit deferred/skipped/acknowledged occurrences, add a small `taskOccurrenceOverrides` collection instead of materializing every future recurrence.

## Dashboard calculation
`services/due.ts` owns scheduling. Keep UI dumb: API returns already-calculated `DueInstance` objects. This makes rule semantics testable and prevents React components from becoming the source of truth.

## Future features that fit without redesign
- seasonal rules (`beforeWinter`, `afterWinter`, annual month/window)
- engine-hours instead of or alongside miles
- multiple counters per machine
- attachments/receipts
- service-provider history
- cost reporting
- odometer history
- auth / multiple users (add `ownerId` to collections)
- JSON backup/export
