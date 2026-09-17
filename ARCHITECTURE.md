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
