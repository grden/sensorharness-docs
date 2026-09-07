# Reviewing a Harness

A harness review checks whether an implementation faithfully reproduces the
procedure described in its source paper. It is a **paper-to-code fidelity
review**, not a code-style review.

The implementation is an AI-generated draft. The paper is the authority. Your
job is to compare the two and record what you found. You do not need to know
the paper beforehand: the checklist is ordered so that each step tells you what
to open, what to read, and what to compare.

## What you review

Your GitHub Issue names the package. Four files matter, from most abstract to
most concrete:

| File | What it is | Steps |
| --- | --- | --- |
| `harnesses/<interface_id>/card.yaml` | One paragraph and a few mechanism labels describing the reusable algorithm | 1 |
| `harnesses/<interface_id>/references/<reference_id>/reference.yaml` | The paper this reference reproduces, and the modalities and tasks it demonstrated | 1 |
| `harnesses/<interface_id>/interface.py` | The shared algorithm — inputs, preprocessing, prompt construction, model calls, output handling | 2 – 4 |
| `harnesses/<interface_id>/references/<reference_id>/harness.py` | The paper-specific hooks and constants | 2 – 4 |

Do not assume that the shorter `harness.py` is the only code under review. The
reference inherits behavior from the interface, so most of what the paper
describes is implemented in `interface.py`.

## The checklist

Go top-down: cards first, code last. Tick a box after you have compared the
paper and the file it names. Stopping after step 3 still produces a useful
partial review; say so in the record.

### 1. Cards

Open `card.yaml` and `reference.yaml`. Read the paper's abstract and the
overview of its method.

The card describes the **general** algorithm — the reusable information and
control flow — independently of any one sensor or task. It will not mention
this paper's ECG or accelerometer, and that is correct. What to check is that
the paper's method is an instance of it:

- every `mechanisms` label is something the paper's method does (a label the
  paper does not support is invented);
- no major step of the paper's inference path is missing from the card.

The reference card is about this paper only: the title and link are right, its
`description` states what this paper demonstrated, and `modalities` and `tasks`
list exactly what the paper demonstrated — no extra modality the paper never
used, no task it never evaluated.

### 2. Inputs

**Sensor data.** Find the paper's data and setup description: what sensor
signals or representations are used, how they are collected or prepared, and
any required format, resolution, sampling rate, or window length. Check that
`reference.yaml` describes the modality correctly. Then trace how
`interface.py` and the reference `harness.py` receive the data — through
`SensorInput.sensor_data` (streams, features, images) or through a constructor
resource (a query tool, a retriever). Assuming the paper's expected input is
supplied, check that the implemented logic processes it correctly. Loading
datasets, segmenting recordings, and assigning labels may happen outside the
harness and should not be flagged unless the paper requires them inside the
inference flow.

**Task.** Identify the problem the paper asks the LLM to solve and check that
`reference.yaml.tasks` describes it accurately. `SensorInput.task` carries the
runtime task — the clinical context, the question, the answer options. Check
that the interface preserves and uses it rather than replacing it with an
unrelated hard-coded task. Paper-specific fixed wording may remain in the
reference harness when the paper requires it.

### 3. Answer

Check that the inherited `run()` returns a `HarnessOutput`. Verify that the
answer form requested from the model — free text, bare label, JSON, number, or
sequence — matches the paper. Any paper-specific role text, answer options,
output rules, and parsing behavior should also match. If the paper does not
define an exact parser or schema, record the implementation choice as an
**adaptation** rather than presenting it as paper-specified.

### 4. Mechanisms in code

For every `mechanisms` label from step 1, find the corresponding logic in
`interface.py`: representation or preprocessing → context and prompt
construction → model call(s) → output handling. Check the same major steps,
order, number of calls, and fixed values stated by the paper. Anything required
from outside — a model, an image provider, an example pool, a retriever, a
knowledge base, a checkpoint, a tool — must be a constructor resource rather
than secretly loaded or hard-coded. If the flow differs materially, record it;
the reference may require another interface.

### 5. Wrap up

Fix clear mismatches, or document why a difference is an intentional
adaptation. Add the record, state the conclusion clearly in the pull request
with `Closes #<issue>`, and after it merges move the issue's Project card to
**Done**.

An **adaptation** is a deliberate difference from the paper: something the
paper leaves unspecified (a parser, an output schema, a tie-break), or
something the runtime cannot do as published. Written down in the record with
its reason, it is not a defect. Left unwritten, it is.

## When you are not sure

Not sure about a paper detail, or whether a paper step belongs in a runtime
harness at all? **Ask in Slack.** Then record the uncertainty in the review and
the pull request so the next person can find it.

## The review record

One free-form Markdown file per reference, at the repository root:

```text
reviews/<interface_id>/<reference_id>.md
```

Not beside `harness.py` — a reference directory holds exactly `harness.py` and
`reference.yaml`, and the protocol allows no other file there.

Scaffold it, then edit the Notes section freely:

```bash
python scripts/review/new_review.py <interface_id>/<reference_id> \
    --reviewer <your github handle> --issue <N>
```

The scaffold has three header lines (reviewer, date, issue), a Notes section, and an invisible comment holding the hashes of the two files you read.
The exact shape is in the code repository at
[`docs/REVIEWING.md`](https://github.com/diamond264/sensorharness/blob/main/docs/REVIEWING.md).

## Pull request, second review, Done

Open one pull request per issue containing the record and any code change.
Put this line in the description so the issue closes on merge:

```text
Closes #<issue-number>
```

A second person approves before merge. They read your record and your diff —
not the paper again — and check that every difference you found has either a
fix or a reason. One approval is enough.

After the merge, move the issue's card on the Project board to **Done**
(Project → find your issue → Status). If the board's workflows are on, closing
the issue does this automatically; check either way.

## Where information belongs

| Information | Home |
| --- | --- |
| Reviewer assignment and project-wide status | Project spreadsheet and the Project board |
| How to review | This documentation |
| Paper, files, and checklist for one assignment | GitHub Issue |
| Per-reference review record | `reviews/<interface_id>/<reference_id>.md` |
| Record format | [`docs/REVIEWING.md`](https://github.com/diamond264/sensorharness/blob/main/docs/REVIEWING.md) in the code repository |
| Corrections, discussion, and approval | Pull request |
| Questions and quick coordination | Slack |

When a Slack discussion changes the interpretation of the paper or the code,
record the conclusion in the issue or pull request so future contributors can
find it.
