# Reviewing a Harness

A harness review checks whether an implementation faithfully reproduces the
procedure described in its source paper. It is a **paper-to-code fidelity
review**, not a code-style review.

The implementation is an AI-generated draft. The paper is the authority. Your
job is to compare the two and record what you found.

## What you review

Your GitHub Issue names two files:

- an **interface** (`harnesses/<interface_id>/interface.py`), which owns the
  reusable algorithm — inputs, preprocessing, prompt construction, model calls,
  output handling; and
- a **reference harness** (`harnesses/<interface_id>/references/<reference_id>/harness.py`),
  which supplies the paper-specific hooks and constants.

For example:

```text
harnesses/clinical_context_sensor_image_qa/interface.py                                    (208 lines)
harnesses/clinical_context_sensor_image_qa/references/gunay_2025__ecg_diagnosis/harness.py  (22 lines)
```

Do not assume that the shorter reference file is the only code under review.
The reference inherits behavior from the interface, so most of what the paper
describes is implemented in the interface. Read both.

The issue also lists the interface's **mechanisms** from its `card.yaml` — short
labels such as `representation.visualization` or `context.expert_knowledge`.
They tell you what kind of harness this is before you open the code.

## The checklist

Your issue carries seven checkboxes. Tick each one after you have compared the
paper and the code for that item. Together they walk the inference path from
sensor to answer.

### 1. Inputs

What the code expects to receive: which sensor streams, in what units, at what
sampling rate, over what window. Check these against the paper's data
description. Look for the stream names the interface reads, any assumed shape
(`[samples]` or `[samples, channels]`), and any hard-coded rate or window.

### 2. Preprocessing

Everything the code does to the signal before the model sees it: filtering,
resampling, normalization, feature extraction, rendering to an image,
serialization to text. Check that each step is one the paper describes and that
the order matches. A step the paper does not mention, or one it mentions that is
missing, is a finding.

### 3. Prompt & context

What the model actually sees: the task wording, the label set, worked examples,
expert knowledge, retrieved records, role instructions, output-format
instructions. Compare with the paper's prompt figures or appendix. Check how
examples are chosen if the paper is specific about it.

### 4. Model calls & parsing

How many times the model is called, in what order, with what generation
settings (temperature, max tokens, stop conditions), whether there are loops or
voting, and how the reply is parsed into the final answer. Check each against
the paper's method section.

### 5. Fixed values

Constants the paper states explicitly — sampling rates, thresholds, shot counts,
decimal precision, window lengths, band edges. Find each one in the code and
confirm the value. These are the most common place for a silent mismatch.

### 6. Differences handled

Anything from steps 1–5 that did not match is either **fixed in your pull
request** or **explained in the record's `note`**. A difference is fine when
there is a reason (the resource is unavailable, the step is outside what a
runtime harness can do); it just has to be written down.

### 7. Record + PR

Generate the review record and open the pull request. See below.

## Verdict

Two options:

`confirmed`
: You compared the paper and the code and changed nothing.

`updated`
: You changed something in this pull request. Say what in the `note`, or let
  the diff speak.

Not sure whether something is a problem, or whether a paper step belongs in a
runtime harness at all? **Ask in Slack.** Then write the conclusion in the pull
request so the next person can find it.

Paper anchors (a section, figure, or table) are welcome in the `note` when they
help the next reader. They are not required.

## The review record

One file per reference, at the repository root:

```text
reviews/<interface_id>/<reference_id>.yaml
```

Not beside `harness.py`. A reference directory holds exactly `harness.py` and
`reference.yaml` — the protocol allows no other file there — so review records
mirror the tree from a sibling root.

Generate it; do not type it by hand:

```bash
python scripts/review/new_review.py <interface_id>/<reference_id> \
    --reviewer <your github handle> --verdict confirmed
```

Add `--note "..."` if you have something to say, and `--verdict updated` if you
changed code. The script writes the date and the hashes of the two files you
read, so a later change to either file makes the record visibly stale.

The exact fields are documented in the code repository at
[`docs/REVIEWING.md`](https://github.com/diamond264/sensorharness/blob/main/docs/REVIEWING.md).

## Pull request and second review

Open one pull request per issue containing the record and any code change.
Put this line in the description so the issue closes on merge:

```text
Closes #<issue-number>
```

A second person approves before merge. They read your record and your diff —
not the paper again — and check that every difference you found has either a
fix or a reason. One approval is enough.

## Where information belongs

| Information | Home |
| --- | --- |
| Reviewer assignment and project-wide status | Project spreadsheet |
| How to review | This documentation |
| Paper, files, and checklist for one assignment | GitHub Issue |
| Per-reference review record | `reviews/<interface_id>/<reference_id>.yaml` |
| Record format | [`docs/REVIEWING.md`](https://github.com/diamond264/sensorharness/blob/main/docs/REVIEWING.md) in the code repository |
| Corrections, discussion, and approval | Pull request |
| Questions and quick coordination | Slack |

When a Slack discussion changes the interpretation of the paper or the code,
record the conclusion in the issue or pull request so future contributors can
find it.
