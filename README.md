# MCL vs WHOP billing dashboard

React dashboard that compares your Master Client List against WHOP payments and surfaces billing mismatches before they become churn.

Mock data ships with the repo so you can click through mismatches without API keys.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build
npm run preview
```

Language toggle (ES / EN) in the footer. Preference sticks in `localStorage`.

## Reconcile states

| State | Meaning |
|-------|---------|
| `matched` | Active client, WHOP id set, amount matches plan |
| `missing_whop_id` | Active MCL row with no `whopMemberId` |
| `missing_payment` | Active client, no paid WHOP charge this cycle |
| `amount_mismatch` | Paid amount ≠ `monthlyUsd` on the MCL row |
| `orphan_payment` | WHOP payment with no matching MCL `memberId` |
| `inactive_but_paid` | Paused/churned client with a recent paid charge |

Only the latest `paid` row per `memberId` counts. `failed` and `refunded` are skipped.

## Logic (short version)

```
for each MCL row:
  no whopMemberId     → missing_whop_id
  active, no payment  → missing_payment
  inactive + payment  → inactive_but_paid
  wrong amount        → amount_mismatch
  else                → matched

unused WHOP payments  → orphan_payment
```

Code: [`src/lib/reconcile.ts`](./src/lib/reconcile.ts)  
Demo data: [`src/data/mock.ts`](./src/data/mock.ts) — 7 MCL clients, 8 WHOP charges, a few intentional bugs.

## UI

- Summary cards: matched count, issue count, MCL size, active MRR
- Filter: all / issues only / matched only
- Table with expected vs received and delta
- CSV export

## Layout

```
src/
  data/mock.ts
  lib/reconcile.ts
  i18n.ts
  App.tsx
```

## Not done yet

- Live WHOP API + MCL import (Sheets/Airtable)
- Scheduled run or post-payment webhook
- Slack/email when `issues > 0`

## Stack

React 19 · TypeScript · Vite

---

**Español:** Tablero que cruza la Master Client List con pagos de WHOP y marca discrepancias (sin id, sin pago, monto distinto, pagos huérfanos). Datos de prueba incluidos.
