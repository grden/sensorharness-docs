# Reviewing a Harness

A harness review checks whether an implementation faithfully reproduces the
procedure described in its source paper. It is primarily a **paper-to-code
fidelity review**, not a code-style review.

The implementation is an AI-generated draft. The paper is the authority. Your
review determines which parts of the implementation agree with the paper,
which parts need correction, and which parts require discussion.

## What you review

Use the scope in your assigned GitHub Issue. A typical assignment names both:

- an **interface**, which owns the reusable information and control flow; and
- a **reference harness**, which supplies paper-specific hooks and constants.

For example, the current ECG diagnosis assignment covers:

```text
harnesses/clinical_context_sensor_image_qa/interface.py
harnesses/clinical_context_sensor_image_qa/references/
  gunay_2025__ecg_diagnosis/harness.py
```

The corresponding paper of record is *Comparing DeepSeek and GPT-4o in ECG
interpretation: Is AI improving over time?* Review the exact paper linked in the
issue, including relevant supplementary material when the issue provides it.

Do not assume that the shorter reference file is the only code under review.
The reference inherits behavior from the interface, so inputs, preprocessing,
prompt construction, model calls, and output handling may be implemented in
the interface.

## Review workflow

### 1. Orient from the issue

Before reviewing, identify:

- the paper and any supplementary sources;
- every implementation file in scope;
- the expected `review.yaml` path; and
- the GitHub Issue number.

Ask for clarification when these do not agree. For this prototype, references
to a “machine report” are treated as references to the paper of record; the
team will confirm that terminology separately.

### 2. Map the paper to the implementation

Read the paper sections that describe the implemented procedure. Depending on
the paper, relevant checks may include:

- model inputs and sensor representation;
- prompt or task formulation;
- preprocessing and sampling;
- examples, retrieval, tools, or other context;
- model-call order and generation settings;
- output parsing and validation;
- evaluation procedures and metrics;
- steps omitted from the implementation; and
- behavior or assumptions not supported by the paper.

Separate the paper's inference-time procedure from training, dataset
construction, human evaluation, and study-level analysis. If it is unclear
whether something belongs in a SensorHarness runtime, record the uncertainty
rather than silently inventing behavior.

### 3. Record a verdict and paper anchor

For every material check, record the relevant Section, Figure, or Table and
choose one verdict:

`confirmed`
: The reviewer finds no problem in how the harness implements the cited paper
  behavior.

`refuted`
: The reviewer finds a problem in the harness implementation. The harness needs
  a correction.

`cannot-judge`
: The available evidence is not sufficient for a confident decision, or the
  item requires discussion about terminology, uncertainty, or SensorHarness
  scope.

The anchor should let another reviewer locate the evidence without repeating
your entire search. Add a short explanation connecting that evidence to the
code.

### 4. Make a complete pass

Do not stop after checking an existing list. Review the scoped implementation
for mismatches, missing behavior, and unsupported assumptions that have not yet
been raised.

Record that this pass was completed. If it produces no additional findings,
state that explicitly rather than leaving the section blank.

### 5. Correct problems where possible

Correct `refuted` behavior in the same pull request and add or update focused
tests when the changed behavior can regress.

If an item cannot be corrected, use the classification requested by the issue
and include a reason:

`recorded-deviation`
: Use when a known difference must remain recorded rather than being corrected
  in the current contribution.

`out-of-runtime-scope`
: Use when the paper behavior is outside the inference-time boundary that
  SensorHarness represents.

When neither description clearly fits, use `cannot-judge` and ask the team
instead of forcing a classification.

### 6. Add `review.yaml`

Place `review.yaml` beside the reviewed reference harness, as specified by the
assignment:

```text
harnesses/<interface_id>/references/<reference_id>/review.yaml
```

This file records who performed the review and how the implementation was
checked. The eventual format needs to capture the reviewed scope, verdicts,
paper anchors, code corrections, and reasons for unresolved items.

The schema has not yet been finalized. Do not invent fields or copy an
unapproved example; obtain the current format from the project coordinator.

### 7. Open the pull request

Include the completed review record, code corrections, and relevant tests in
one pull request. Add the issue-closing line to the pull request description:

```text
Closes #<issue-number>
```

A code change is not merged automatically. Complete the assigned checklist and
wait for a second reviewer to confirm the pull request before merge. The exact
second-review checklist and how approval is recorded are still being defined.

## Where information belongs

| Information | Home |
| --- | --- |
| Reviewer assignment and project-wide status | Project spreadsheet |
| Reusable review instructions | This documentation |
| Paper, files, and deliverable for one assignment | GitHub Issue |
| Per-reference review record | `review.yaml` |
| Corrections, discussion, and approval | Pull request |
| Questions and quick coordination | Slack |

When a Slack discussion changes the interpretation of the paper or the code,
record the conclusion in the issue, pull request, or `review.yaml` so future
contributors can find it.
