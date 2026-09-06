# Coordinating the Review

This page is for whoever runs the review round. Reviewers do not need it.

## Where the work list comes from

The triage spreadsheet decides *which* papers need a review; the repository
decides *what code exists*. One script reads both:

```bash
python scripts/review/build_review_units.py \
    --sheet-csv "https://docs.google.com/spreadsheets/d/<id>/export?format=csv" \
    --out-dir review_plan
```

It writes four files and touches nothing on GitHub:

| File | What it is |
| --- | --- |
| `units.json` | The work list: one unit per interface package plus its references still marked `ai-generated` |
| `issues_preview.md` | Every issue body, for reading before anything is created |
| `gaps.md` | Rows where the sheet and the tree disagree — each one needs a person to decide |
| `mapping.csv` | For every reference: does the paper the card names match the paper the sheet names |

Only sheet rows with `implemented = ai-generated` **and** a harness key that
exists in the tree become issues. Anything else is excluded and listed in
`gaps.md`. The script never guesses which package a paper became.

## Creating issues

```bash
# dry run: prints the gh commands, sends nothing
python scripts/review/open_issues.py --units review_plan/units.json --repo diamond264/sensorharness

# a trial batch, then the rest
python scripts/review/open_issues.py ... --limit 3 --create
python scripts/review/open_issues.py ... --create
```

Labels are created on first use. Each issue carries four:

- `review` — every issue in the programme
- `wave:N` — which batch it belongs to
- `domain:cardiac | eeg-sleep | imu | physio | ambient | multimodal | triage` —
  from the reference's declared modalities, so one reviewer can take papers in
  one field
- `size:S | M | L` — interface under 200 lines / 200–400 / over 400 or several
  papers

Two more are applied by hand during the round: `stage:blocked` (paper access,
ambiguity, needs escalation) and `finding:major`.

## Assigning

Assign by setting the issue assignee — nothing else. The spreadsheet is
refreshed from GitHub, not the other way round:

```bash
python scripts/review/sync_assignments.py \
    --repo diamond264/sensorharness \
    --units review_plan/units.json \
    --sheet-csv "<export url>" \
    --out review_plan/assignments.csv
```

This writes one row per sheet row, in sheet order, with the columns
`sensor_harnesses, issue, reviewer, second_reader, status, pr, updated_at`.
Paste them into the sheet as new columns to the right of `reviewed`. Because
the rows are in sheet order, it is a single paste.

Status values: `unassigned`, `assigned`, `pr-open`, `merged`, `blocked`,
`closed`. When a row reaches `merged`, set the sheet's own `reviewed` column to
`reviewed` — the work-list script reads that column, so the next run drops the
unit automatically.

Add `--check` to print what moved since the last pull; that is the daily glance.

## The Project board

One GitHub Project holding every review issue. It is created and kept in sync by
a script; the views are set once in the browser.

Until the repository moves to an organization, the board lives under the
coordinator's account: GitHub only lets a user-owned project link to that user's
own repositories, so it does not appear under the code repository's Projects
tab. Share the board URL directly (pin it in Slack and in the issue template).
When an organization exists, re-run the script with `--owner <org>` and the
board is rebuilt there in one pass.

```bash
python scripts/review/setup_project.py --owner <account> --repo diamond264/sensorharness
```

The script is safe to re-run: it finds the project if it exists, adds only the
fields and issues that are missing, and rewrites each item's fields from the
issue's labels.

| Field | Values | Source |
| --- | --- | --- |
| Status | Todo · In Progress · Done | assigned → In Progress; PR merged → Done |
| Wave | 0 · 1 · 2 · 3 | `wave:*` label |
| Domain | cardiac · eeg-sleep · imu · physio · ambient · multimodal · triage | `domain:*` label |
| Size | S · M · L | `size:*` label |
| Second reader | text | filled at approval |
| Minutes | number | optional, from the reviewer |

Views to add once (Project → **+ New view**):

1. **Board** — layout Board, column field Status.
2. **By reviewer** — layout Table, group by Assignees, sort by Wave. This is
   the one-screen answer to "who is holding what".
3. **By domain** — layout Table, group by Domain, show Size and Status.

Workflows to enable once (Project → **⋯ → Workflows**): *Item closed → Done*
and *Pull request merged → Done*. With those on, the only column moved by hand
is Todo → In Progress, and `assign_issues.py` does that through the assignee.

## Rules of thumb for the round

- Start with a small batch (three units, several reviewers each) before opening
  everything. Where two reviewers disagree, the wording is ambiguous — fix the
  wording, not the reviewers.
- Aim for at most seven units per reviewer, with `size:L` spread evenly.
- Reassign anything untouched for ten days rather than waiting on it.
- Nobody reviews a package they wrote.
- Keep questions in Slack and conclusions in the pull request.
