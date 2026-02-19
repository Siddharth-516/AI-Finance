#!/usr/bin/env python3
"""Purpose: export anonymized sample data."""
import pandas as pd
from pathlib import Path

df = pd.read_csv('seed/transactions_seed.csv')
df['merchant'] = 'REDACTED'
Path('exports').mkdir(exist_ok=True)
df.to_csv('exports/anonymized.csv', index=False)
print('exported exports/anonymized.csv')
