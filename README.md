# SensorHarness Docs

This repository contains the editable source for the public SensorHarness
documentation prototype.

## Local preview

Create a virtual environment and install the documentation dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
mkdocs serve
```

Then open <http://127.0.0.1:8000/>.

## Publishing

Before publishing, build the documentation locally and deploy the generated
site to the `gh-pages` branch:

```bash
mkdocs build --strict
mkdocs gh-deploy --remote-name origin --force
```

The public site is available at
<https://grden.github.io/sensorharness-docs/>. Deployment is manual for this
prototype; a GitHub Actions workflow can automate it later.

The main SensorHarness repository is currently private. Do not copy private
project code, issues, pull requests, or research data into this public
repository.
