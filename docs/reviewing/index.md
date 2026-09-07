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

- The card's `description` and every `mechanisms` label describe what this
  paper actually does. Two failure modes: a label the paper does not support
  (invented), or a major step of the paper that no label covers (missing).
- The reference card's paper title and link are right. Its `modalities` and
  `tasks` are exactly what the paper demonstrated — no extra modality the paper
  never used, no task it never evaluated.

### 2. Inputs

Find the paper's data or experimental-setup section: which signals, in what
units, at what sampling rate, over what window. Then find where `interface.py`
and `harness.py` read the streams — the stream names, any assumed shape
(`[samples]` or `[samples, channels]`), any hard-coded rate or window. Same
signals, rate and window, or a written reason why not.

### 3. Task & answer

The task wording, the label set, and the answer format the model is asked for
match the paper's setup. Check the prompt text the interface builds against the
paper's task description or prompt figure.

### 4. Mechanisms in code

For each `mechanisms` label you confirmed in step 1, find the place in
`interface.py` that does it. Walk the flow the paper describes — preprocessing,
then what context the model sees, then how many model calls in what order, then
how the reply is parsed — and check that the code does the same steps, in the
same order, with the same number of calls, and with the same values wherever
the paper states one (a rate, a threshold, a shot count, a generation setting).

### 5. Wrap up

Anything from steps 1–4 that did not match is either fixed in your pull request
or explained in the record. Then: add the record, open the PR, and after it
merges move the issue's card on the Project board to **Done**.

## When you are not sure

Not sure whether something is a problem, or whether a paper step belongs in a
runtime harness at all? **Ask in Slack.** Then write the conclusion in the pull
request so the next person can find it.

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
