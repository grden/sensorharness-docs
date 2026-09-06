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

## Rules of thumb for the round

- Start with a small batch (three units, several reviewers each) before opening
  everything. Where two reviewers disagree, the wording is ambiguous — fix the
  wording, not the reviewers.
- Aim for at most seven units per reviewer, with `size:L` spread evenly.
- Reassign anything untouched for ten days rather than waiting on it.
- Nobody reviews a package they wrote.
- Keep questions in Slack and conclusions in the pull request.
