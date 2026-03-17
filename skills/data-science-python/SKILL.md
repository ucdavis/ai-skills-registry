---
name: data-science-python
description: Python data science: notebook structure, data validation, reproducibility, and model documentation
---

# Data Science — Python

## Notebook Structure
Organize notebooks in this order:
1. Imports & configuration
2. Data loading
3. Exploratory data analysis (EDA)
4. Feature engineering
5. Modeling
6. Evaluation
7. Conclusions & next steps

Keep notebooks for exploration. Move reusable logic to `src/` Python modules with tests.

## Data Validation
```python
# Always validate after loading
assert df.shape[0] > 0, "DataFrame is empty"
assert df.isnull().sum().sum() == 0, f"Nulls found: {df.isnull().sum()}"
assert df['price'].between(0, 1_000_000).all(), "Price out of expected range"

# For production pipelines: use pandera
import pandera as pa
schema = pa.DataFrameSchema({
    "price": pa.Column(float, pa.Check.ge(0)),
    "category": pa.Column(str, pa.Check.isin(["A", "B", "C"])),
})
schema.validate(df)
```

## Reproducibility
```python
import random
import numpy as np

SEED = 42
random.seed(SEED)
np.random.seed(SEED)
# sklearn: pass random_state=SEED to all estimators
```
- Pin all dependency versions in `requirements.txt` or `pyproject.toml`.
- Track experiments: MLflow, or a simple `experiments/` log with metadata JSON.
- Save models with timestamp + metadata: `model_rf_20260115_v1.pkl`.

## Model Documentation
Document for every model:
- Training data: source, date range, size, preprocessing steps.
- Feature list and engineering decisions.
- Hyperparameters and tuning approach.
- Evaluation metrics on held-out test set.
- Known limitations and failure modes.

## Code Quality
```python
# Extract transforms into sklearn Pipeline
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('classifier', RandomForestClassifier(random_state=SEED)),
])
```
- Write unit tests for data processing functions in `tests/`.
- Use `pathlib.Path` — never hardcode file paths.
- Use `logging` not `print` in production code.
