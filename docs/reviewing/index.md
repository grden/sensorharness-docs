# Reviewing a Harness

The purpose of a harness review is to answer one question:

> Does this code perform the inference procedure described in the source paper?

This is a paper-to-code accuracy review. The paper and its official code or
supplementary material describe the intended behavior. The SensorHarness files
show what was implemented.

## What to review

Start from your assigned GitHub Issue. It names the paper and the files in
scope. A typical assignment covers these four files:

```text
harnesses/<interface_id>/
├── card.yaml
├── interface.py
└── references/<reference_id>/
    ├── reference.yaml
    └── harness.py
```

`interface.py` often contains most of the implementation. It is used by all
references inside that interface folder. The selected reference's `harness.py`
adds only the details specific to the paper or task. Review both Python files,
even when `harness.py` is short.

You do not need to create a branch or fork before reading the paper and checking
the files. What you do afterward depends on whether you find anything to change.

## Review in this order

### 1. Check the cards

Open the following files for the assigned interface and reference:

```text
harnesses/<interface_id>/card.yaml
harnesses/<interface_id>/references/<reference_id>/reference.yaml
```

Then read the paper's abstract and method overview.

The two files describe different things:

- `card.yaml` describes the general algorithm implemented by `interface.py`.
- `reference.yaml` identifies the selected paper and describes what that paper
  demonstrated.

For `card.yaml`, check that the paper uses the stated general algorithm. Every
`mechanisms` label should be supported by the paper, and the card should not
omit a major inference step.

For `reference.yaml`, check that:

- the paper title and link are correct;
- the description accurately summarizes this implementation;
- the modalities match the paper's sensor inputs; and
- the tasks match what the paper asks the model to do.

The YAML files are short descriptions. The Python files contain the behavior
that actually runs. Compare both the descriptions and the executable behavior
with the paper.

### 2. Check the inputs

Check whether the harness receives the same input described in the paper.

#### Sensor data

Identify the sensor data or representation used by the paper. Note how it is
prepared and whether it requires a particular format, sampling rate,
resolution, or window length.

Check that `reference.yaml` describes the modality correctly. Then use
`interface.py` and the selected `harness.py` to trace how the expected data
enters through `SensorInput.sensor_data` or a constructor resource and how it is
processed. Assuming the paper's expected input is supplied, the implemented
processing should match the paper.

Dataset loading, recording segmentation, and label assignment may happen
before the harness runs. Do not treat them as missing unless the paper requires
them during inference.

#### Task

Identify the task that the paper asks the model to perform. Check that
`reference.yaml.tasks` describes it correctly.

Then trace how `SensorInput.task` is used in `interface.py` and `harness.py`.
The code should preserve the runtime question, context, or answer choices rather
than replace them with an unrelated hard-coded task. Fixed wording may remain in
the paper-specific `harness.py` when the paper requires it.

### 3. Check the expected answer

Check whether the harness returns the same kind of answer described in the
paper. The expected answer may be free text, one label, JSON, a number, or a
sequence.

In `interface.py` and `harness.py`, check:

- what answer format the model is asked to produce;
- whether paper-specific role text, answer choices, and output rules are
  preserved;
- how the response is parsed; and
- whether the inherited `run()` returns the result as a `HarnessOutput`.

If the code introduces an exact output format or parser that the paper does not
specify, treat it as an implementation adaptation rather than a paper-defined
step.

### 4. Check the mechanisms in the code

Check whether the steps that turn the input into the answer match the paper.
For every `mechanisms` label in `card.yaml`, find the corresponding logic in
`interface.py`:

```text
sensor representation or preprocessing
    ↓
context and prompt construction
    ↓
model or tool call(s)
    ↓
output parsing and handling
```

Compare the major steps, their order, the number of calls, and important fixed
values with the paper. Use the selected `harness.py` to check paper-specific
hooks and constants.

Models, example pools, retrievers, knowledge bases, checkpoints, and tools are
external resources. If the procedure needs one, the harness should receive it
through its constructor rather than secretly downloading it or replacing it
with an unrelated hard-coded value.

If the inference flow differs substantially from the paper, record the
difference. The reference may need code corrections or may belong to a different
interface.

## After the review

### If no changes are needed

Add a comment to the assigned Issue stating that the review is complete and no changes are
needed.

For example:

```text
Review complete. The implementation matches the paper, looks good to me!
```

### If changes are needed

Fix clear mismatches. If a difference is intentional, leave it unchanged and
briefly explain why by creating a short Markdown review at the path given in the Issue, normally:

```text
reviews/<interface_id>/<reference_id>.md
```

Briefly state:

- the overall conclusion;
- what you changed and why; and
- what you intentionally did not change and why.

Include the code correction and review file in a pull request. Write the PR description and add:

```text
Closes #<issue-number>
```

Replace `<issue-number>` with the assigned Issue number. For example,
`Closes #42` links the PR to Issue 42 and closes it automatically after the PR
is merged.

## Fork, clone, and open a pull request

Follow these steps when the review finds something to change.

### 1. Fork the repository

Open the SensorHarness repository on GitHub and select **Fork**. GitHub creates a
copy under your account.

If the **Fork** button is unavailable, ask the project administrator. Private
repository settings may prevent forking.

### 2. Clone your fork

On your fork's GitHub page, select **Code** and copy its HTTPS URL. In a terminal,
run:

```bash
git clone https://github.com/<your-username>/sensorharness.git
cd sensorharness
```

Replace `<your-username>` with your GitHub username.

### 3. Create a branch

Create a branch for the review changes:

```bash
git switch -c review/<reference-id>
```

Replace `<reference-id>` with the reference named in the Issue.

### 4. Save and push the changes

After editing the files, check what changed:

```bash
git status
git diff
```

Stage and commit the intended files:

```bash
git add <changed-files>
git commit -m "Review <reference-id> against paper"
git push -u origin review/<reference-id>
```

Replace the placeholders with the actual file paths and reference ID.

### 5. Open the pull request

Return to your fork on GitHub. Select **Compare & pull request** for the branch
you pushed. Confirm that the pull request targets the `main` branch of the
original SensorHarness repository.

Briefly describe the result and include `Closes #<issue-number>` in the PR
description. Submit the pull request for review.

If repository access, project policy, or the expected correction is unclear,
ask in the project Slack channel before submitting the change.
