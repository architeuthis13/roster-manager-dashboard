# Roster Manager Dashboard

## What This Project Is
A command centre dashboard for Roster Managers at Disability Support and
Aged Care organisations in Australia. Provides operational oversight and
surfaces urgent problems requiring immediate attention.

This is NOT a rostering tool. It does NOT create or edit shifts.
It sits alongside an existing rostering system and shows the manager
what needs attention right now and what will become a problem soon.

## Tech Stack
- React + Vite
- Tailwind CSS for styling
- Recharts for charts
- lucide-react for icons
- Mock JSON data only — no backend, no API calls, no auth

## Commands
- `npm run dev` — start dev server on port 5173
- `npm run build` — production build

## Project Structure
- src/components/     — UI components
- src/data/           — mock JSON data files
- src/context/        — React Context for global state

## Key Domain Concepts
- Care Recipient: vulnerable person receiving support services
- Support Worker: staff member delivering the service
- Shift: scheduled service — has a care recipient, time, location,
  and may or may not have a worker assigned
- Open Shift: shift with no worker assigned — urgent problem
- Compliance: certification a worker must hold to legally work certain
  shifts (e.g. NDIS Worker Screening, Working With Children Check /
  Blue Card, First Aid, Police Check)
- Suitability Match: worker attributes align with care recipient needs
  (language, gender preference, specific support skills)
- Check-in / Check-out: workers confirm arrival and departure —
  missing either is a safety and billing issue
- SCHADS Award: industrial Award governing pay and conditions for this
  workforce in Australia
- Broken Shift: two periods of work same day with a gap — attracts
  an allowance under SCHADS
- Proximity Band: geographic indicator based on worker home suburb vs
  shift suburb — no API, three bands only (see Geographic Proximity)

## Employment Types (SCHADS Award — Australian Law)

Permanent Full-Time
- 38 hrs/week contracted (Fair Work Act)
- Entitled to paid leave (annual, personal/carer's, compassionate)
- Overtime triggered above 38 hrs/week
- PREFERENCE FIRST for shift filling

Permanent Part-Time
- Fixed contracted hours below 38 hrs (e.g. 20 hrs/week)
- Same leave entitlements as FT, pro-rata
- Overtime triggered above contracted hours
- PREFERENCE SECOND for shift filling

Casual
- No guaranteed hours — each shift is a separate engagement
- 25% casual loading in lieu of leave entitlements
- Track hours for casual conversion risk (12-month rule — future feature)
- USE TO FILL GAPS after permanent staff are accommodated

SCHADS minimum shift = 2 hours — flag any shift under 2 hrs.
Broken shifts (two shifts same day with a gap) — flag, attract allowance.

## Open Shift — Two Modes (Critical Distinction)

Mode A — Manager Finds Someone ("Find Me Someone")
Shift is unassigned. Dashboard ranks candidates from full eligible staff
pool. Default priority order:
1. Permanent FT — within contracted hours, compliant, suitable
2. Permanent PT — within contracted hours, compliant, suitable
3. Permanent FT/PT — overtime flagged
4. Casual — compliant and suitable
5. Casual — with warnings
Unsuitable candidates are visually demoted and flagged — NEVER hidden.

Mode B — Manager Reviews Incoming Requests
Shift published to staff. Workers have self-selected. Manager reviews
requestors with full suitability signals. Always show "Best available
(not yet requested)" alongside the request queue.
"Decline All & Find Someone" converts to Mode A with pre-populated list.

Auto-escalation: published shifts with no requests escalate to
"Needs Filling Now" at configurable threshold (default: 4hrs before start).

Shift state labels:
- "Needs Filling" — unassigned, not published (Mode A)
- "X Requests" badge — requests received (Mode B)
- "Published – Awaiting Requests" — published, no requests yet

## Overtime & Leave Rules (Critical)

Hours are ALWAYS a range when pending items exist — never a single number.

Five components:
1. Confirmed/worked shifts — hard count
2. Approved upcoming shifts — hard count
3. Pending shift requests — upper range risk flag
4. Approved leave — deducted from available capacity
5. Pending leave — risk range caveat, always shown on candidate screens

Display format: "22 / 25 hrs · ↑ up to 25 hrs if pending request approved"

Progressive warning thresholds:
- Under 80%: no flag
- 80–90%: amber — "Approaching limit"
- 90–100%: orange — "Near limit"
- 100–110%: red — "Overtime risk"
- 110%+: critical red — "Significant overtime"
- Pending leave overlaps shift: blue info flag (independent of hours)
- Approved leave overlaps shift: red — do not show as available

Workers with PENDING leave must NEVER appear as cleanly available.
Always show: "⚠ Pending leave [dates] — assign with caution"

When leave is APPROVED:
- Vacated shifts auto-reopen as "Originally Filled — Now Vacant"
- Manager shown summary of affected shifts
- Re-evaluate overtime for workers likely to fill those vacated shifts

Cross-shift conflict: if a worker requests overlapping shifts, approving
one must auto-withdraw them from conflicting queues and notify manager.

## Geographic Proximity (No API — Suburb Display Only)

No location API calls. No calculated travel times.
Roster managers know their local geography intuitively.

Display format on candidate cards:
"📍 [Worker suburb] → [Shift suburb] [band label]"
Example: "📍 Chermside → Aspley 🟢 Nearby"

Three proximity bands (pre-assigned in mock data, never calculated):
- 🟢 Nearby — same or adjacent suburb / same postcode group
- 🟡 Moderate travel — same broad region
- 🔴 Significant travel — different region

Proximity is a soft hint only. Manager makes the final call.

## Edge Cases to Handle
EC-01: Published shift nearing start, no requests → auto-escalate with
       countdown at configurable threshold (default 4hrs)
EC-02: All Mode B requestors unsuitable → "Decline All & Find Someone"
       converts to Mode A with pre-populated candidate list
EC-03: Best candidate hasn't requested shift → show in Mode B panel as
       "Best available (not yet requested)"
EC-04: Worker requests overlapping shifts → cross-shift conflict warning;
       auto-withdraw from conflicting queues on approval; notify manager
EC-05: Compliance expires between request and shift date → always validate
       against shift start date; re-check on any document update
EC-06: Care recipient needs change → re-validate all future shifts for
       that recipient; surface affected shifts in warnings panel
EC-07: Assigned worker becomes unavailable → auto-reopen as
       "Originally Filled — Now Vacant"; prompt Mode A or re-publish
EC-08: Overtime creep across approvals → cumulative calc must include
       confirmed + approved + pending shifts AND approved/pending leave
EC-09: Leave approved after shifts filled → auto-reopen vacated shifts;
       re-evaluate overtime for likely cover workers
EC-10: Pending leave = phantom availability → always show caveat on
       every screen where that worker appears as a candidate

## Mock Data Requirements
- 15 support workers: name, employment type, home suburb, qualifications,
  compliance docs with expiry dates, contracted weekly hours, hours worked
  this week, pending shift requests, leave requests (approved + pending)
- 10 care recipients: name, support needs, required worker attributes,
  suburb
- 20 shifts this week including deliberate problem scenarios:
  - 3 open unassigned (Mode A)
  - 2 published with incoming staff requests (Mode B)
  - 2 published with no requests yet
  - 3 with compliance mismatches
  - 2 with overtime risk
  - 2 with late/missed check-ins
  - 1 missed check-out
  - 1 under 2 hours (SCHADS minimum flag)
  - 1 creating a broken shift
  - Suburb data on all shifts and workers with pre-assigned proximity bands
- 5 pending leave requests (some overlapping already-filled shifts)
- 4 compliance documents expiring within 14 days
- 2 compliance documents already expired

## What NOT to Build
- Creating or editing shifts (that is the rostering tool)
- Worker-facing screens
- Real GPS or live check-in (mock statuses only)
- Any location API or travel time calculation
- Payroll or billing
- Login or authentication
- Mobile responsive layout
- Casual conversion tracking (future feature)