# CCAT Practice Simulator

A browser-based practice simulator that mimics the **Criteria Cognitive Aptitude Test (CCAT)**.
It runs entirely in the browser — no build step, no server, no dependencies.

## What it does

- **10 practice tests** on the home screen. Each one draws a fresh, randomized set of questions from the bank, so no two attempts are identical.
- **Realistic format:** 50 questions in 15 minutes (configurable to 25 or 10 questions with a proportional time limit).
- **Three question categories**, mirroring the real test:
  - **Verbal Reasoning** — synonyms, antonyms, analogies, sentence completion, odd-one-out
  - **Math & Logic** — word problems, percentages, ratios, number series, logical deduction
  - **Spatial Reasoning** — next-in-sequence rotations, odd-one-out, rotated-match, and shape properties (rendered as crisp inline SVG)
- **Live test experience:** countdown timer with auto-submit, a question map (palette), flag-for-review, progress bar, and keyboard shortcuts.
- **Results & full answer review:** raw score out of 50, an approximate percentile band, a per-category breakdown, and every question shown with your answer, the correct answer, and an explanation.
- **Best-score tracking** per test (saved in your browser's local storage).

## How to run it

Just open **`index.html`** in any modern browser — that's it.

To run it through a local web server instead (optional):

```bash
# Python 3
python -m http.server 8000
# then visit http://localhost:8000
```

### Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source: Deploy from a branch**, branch **`main`**, folder **`/ (root)`**, and save.
4. Your simulator will be live at `https://<your-username>.github.io/CCAT_Prep/`.

## Keyboard shortcuts (during a test)

| Key | Action |
| --- | --- |
| `A`–`E` or `1`–`5` | Select an answer |
| `←` / `→` | Previous / next question |
| `F` | Flag the current question for review |

## Project structure

```
index.html        App shell and screens (home / test / results)
css/styles.css    All styling
js/questions.js   Verbal + Math & Logic question bank (with explanations)
js/spatial.js     Spatial questions, generated as SVG (correct by construction)
js/app.js         Quiz engine: session building, timer, scoring, review
```

## Notes

- Scoring matches the real CCAT convention: your **raw score** is the number of correct answers, with **no penalty for wrong answers** — so it always pays to answer every question. The average CCAT score is about **24/50**.
- Percentile figures shown are **approximate** and are meant only to help you gauge progress, not to predict an official result.
- This is an independent study aid and is **not affiliated with or endorsed by Criteria Corp.**, the publisher of the CCAT.
