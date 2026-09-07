# Getting Started

## What is SensorHarness?

SensorHarness is a research codebase for representing, comparing, and
optimizing the ways language models and agents solve sensing tasks. It builds on
Stanford IRIS Lab's
[Meta-Harness](https://github.com/stanford-iris-lab/meta-harness) and adds a
sensor-specific domain contract, typed resource resolution, and a
paper-derived harness corpus.

In this project, a **harness** is the inference-time procedure around one or
more language or multimodal models. It controls how sensor observations are
processed or represented, what examples, knowledge, retrieval results, or tools
are provided, how models are called, and how the answer is parsed.

The paper-derived corpus stores reusable interfaces and paper-backed reference
implementations. The optimizer can retrieve these designs and specialize them
for a new sensing task.

## Project structure

The repository separates framework code, paper-backed harnesses, experiments,
and tests:

```text
sensorharness/
├── src/sensor_harness/   # Runtime types, loading, resources, and optimization
├── harnesses/           # Reusable interfaces and paper-backed references
├── experiments/         # Task definitions, configurations, and evaluators
├── tests/               # Automated tests
└── docs/                # Technical documentation in the code repository
```

### Framework

`src/sensor_harness/` provides the common runtime. It defines sensor inputs,
harness outputs, model and resource contracts, file loading, validation, and the
optimization workflow.

### Harness corpus

`harnesses/` contains inference procedures derived from research papers. Each
top-level folder represents one reusable algorithm:

```text
harnesses/<interface_id>/
├── card.yaml
├── interface.py
└── references/<reference_id>/
    ├── reference.yaml
    └── harness.py
```

The four files have different purposes:

`card.yaml`
: Briefly describes the reusable algorithm and names its main mechanisms.

`interface.py`
: Implements the reusable algorithm, including its processing steps, prompt
  construction, model calls, and output handling.

`reference.yaml`
: Identifies one source paper and records the sensor modalities and tasks that
  the paper demonstrated. This is metadata, not executable code.

`harness.py`
: Supplies the paper-specific details required by the interface, such as fixed
  constants or sensor preparation rules.

One interface folder can contain several references. They use the same general
algorithm from `interface.py` but provide different paper- or task-specific
details in their own `harness.py` files.

### Experiments

`experiments/` defines the target tasks used to evaluate and optimize harnesses.
An experiment specifies the available data and resources, evaluation rules, run
configuration, and metrics. These task-specific rules do not belong in the
paper corpus.

## Runtime interface

Every concrete harness follows the same basic API:

```python
output = harness.run(
    SensorInput(
        sensor_data=sensor_record,
        task="Classify the activity.",
    )
)

print(output.status)
print(output.prediction)
```

`SensorInput` contains the sensor data and the task for one example.
`HarnessOutput` contains the prediction and a status describing whether the run
completed or failed during input validation, model execution, or output parsing.

A harness may require models, retrievers, example pools, or other external
resources. These resources are supplied when the harness is constructed rather
than loaded secretly during `run()`.

## Install the project

SensorHarness requires Python 3.11 or newer. From the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e '.[dev]'
```

On Windows PowerShell, activate the environment with:

```powershell
.venv\Scripts\Activate.ps1
```

## Run the tests

Run the full test suite and static checks from the repository root:

```bash
python -m pytest
ruff check .
```

Individual experiments have their own data and model requirements. Read the
README inside the relevant `experiments/<name>/` folder before running one.

To compare a paper with its harness implementation, continue to
[Reviewing a Harness](reviewing/index.md).
