#!/usr/bin/env bash
set -euo pipefail
python scripts/train_categorizer.py
python - <<'PY'
import json
from pathlib import Path
m = Path('backend/app/ml/metrics.json')
print('Model metrics updated:', m.exists())
PY
