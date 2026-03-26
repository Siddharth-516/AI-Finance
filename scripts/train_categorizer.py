#!/usr/bin/env python3
"""Purpose: train TF-IDF + LogisticRegression categorizer."""
# CODE OWNERSHIP: ML Team
import re
import joblib
import pandas as pd
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline


def preprocess(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?", " ", text)
    text = re.sub(r"\d+(?:\.\d+)?", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def main() -> None:
    df = pd.read_csv('seed/transactions_seed.csv')
    df['clean'] = df['raw_text'].astype(str).apply(preprocess)
    X_train, X_test, y_train, y_test = train_test_split(df['clean'], df['category'], test_size=0.3, random_state=42, stratify=df['category'])
    pipe = Pipeline([('tfidf', TfidfVectorizer(ngram_range=(1, 2))), ('clf', LogisticRegression(max_iter=400))])
    pipe.fit(X_train, y_train)
    pred = pipe.predict(X_test)
    report = classification_report(y_test, pred, output_dict=True, zero_division=0)
    print(classification_report(y_test, pred, zero_division=0))
    print(confusion_matrix(y_test, pred))
    print('weighted_f1=', f1_score(y_test, pred, average='weighted'))
    Path('backend/app/ml').mkdir(parents=True, exist_ok=True)
    joblib.dump(pipe, 'backend/app/ml/model.joblib')
    Path('backend/app/ml/metrics.json').write_text(pd.Series(report).to_json())


if __name__ == '__main__':
    main()
