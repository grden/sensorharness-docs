# Getting Started

SensorHarness is a research codebase for representing, comparing, and
optimizing how language models and agents solve sensing tasks. Its harnesses
capture the inference-time procedure around a model: how sensor evidence is
prepared, what context the model receives, how the model is called, and how its
answer is interpreted.

The current contributor workflow turns AI-generated implementations into
reviewed, paper-backed code:

```text
Source paper
    ↓
AI-generated harness
    ↓
Human review and corrections
    ↓
Review record and pull request
    ↓
Second review and merge
```

An implementation can be both **AI-generated** and **paper-backed**. The first
term describes how its draft was produced; the second describes the evidence it
is expected to reproduce faithfully.

## Start with your assignment

Review assignments are tracked in GitHub Issues. Your issue identifies:

- the paper;
- the interface and reference implementation in scope;
- a seven-box checklist and the path of the review record; and
- the issue number your pull request should close.

Read the [Reviewing a Harness](reviewing/index.md) guide before editing code. If
the paper, scope, or expected deliverable is missing or unclear, ask in Slack so
the assignment can be clarified in GitHub. Important decisions should not live
only in chat.

## How the relevant files fit together

An assigned review commonly spans an interface and one paper-specific
reference:

```text
harnesses/<interface_id>/
├── interface.py
├── card.yaml
└── references/<reference_id>/
    ├── harness.py
    └── reference.yaml

reviews/<interface_id>/
└── <reference_id>.yaml        # added by the reviewer
```

`interface.py`
: Owns reusable behavior such as input checks, preprocessing, prompt assembly,
  model calls, and output handling.

`harness.py`
: Supplies the narrow paper- or task-specific hooks and reported constants for
  one reference.

`reference.yaml`
: Identifies the source paper and the modalities and tasks demonstrated by that
  reference.

`reviews/<interface_id>/<reference_id>.yaml`
: Records the human paper-to-code review: who, when, `confirmed` or `updated`,
  an optional note, and the hashes of the two files read. It lives outside the
  reference directory because the protocol allows only `harness.py` and
  `reference.yaml` there. Generate it with `scripts/review/new_review.py`; the
  fields are documented in
  [`docs/REVIEWING.md`](https://github.com/diamond264/sensorharness/blob/main/docs/REVIEWING.md).

The issue defines the exact scope. Review both files when both the interface and
reference are listed: a paper-fidelity problem can be in shared interface
behavior or in a reference-specific choice.

## Run the documentation locally

From the documentation repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
mkdocs serve
```

Open the local address printed by MkDocs. The development server reloads when a
documentation file changes.

This prototype currently documents the harness-review workflow only. Broader
contribution guidance will be added before the project opens to external
contributors.
