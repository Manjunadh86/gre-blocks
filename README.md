# GRE Blocks — 30-day GRE prep dashboard

A static, single-page study system for the GRE General Test: 30-day roadmap, daily task checklists with XP and streaks, 300-word vocabulary trainer with quizzes and Anki export, Quant formula sheet, Verbal strategy, Analytical Writing template with a 30-minute essay timer, **two built-in full-length practice tests** (108 original questions with explanations, timed sections, auto-scored to the 130–170 scale), a mock schedule with a score chart, curated resources, exam facts and a test-day checklist. Progress stays in your browser (localStorage) and can be exported/imported as JSON.

Built as a sibling of [AIN Pathways](https://manjunadh86.github.io/ain-pathways/): same building-block aesthetic, light and dark themes.

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

then visit http://localhost:8000.

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "GRE Blocks dashboard"
git branch -M main
git remote add origin https://github.com/<your-user>/gre-blocks.git
git push -u origin main
```

Then in the repository: Settings → Pages → Source: "Deploy from a branch" → Branch `main`, folder `/ (root)`. The site appears at `https://<your-user>.github.io/gre-blocks/` within a minute or two. All asset paths are relative, so no base-path configuration is needed.

## Files

| Path | Purpose |
|---|---|
| `index.html` | App shell: header, nav, views container, quiz dialog |
| `assets/styles.css` | Design tokens (light/dark), components, print and responsive rules |
| `assets/app.js` | State (localStorage), hash router, one render function per view, quiz, essay timer, chart |
| `assets/data.js` | All content: exam facts, 4 phases, 30 days × tasks, 300 vocab words, roots, Verbal/Quant/AWA strategy, 34 resources, mock schedule, test-day checklist |
| `assets/tests.js` | Built-in practice tests: 2 × (Issue prompt + Verbal 12 + Verbal 15 + Quant 12 + Quant 15), answers, explanations, raw-to-scaled conversion |

## Built-in tests

The tests follow the real section order and timing (30 + 18 + 23 + 21 + 26 minutes). They are fixed forms, not section-adaptive, and the scaled scores use an approximate conversion, so treat a result as ±3 points. Every question is original to this project; the official ETS POWERPREP tests remain the best calibration and are scheduled on Days 1 and 21.

## Editing the plan

Everything you might want to change lives in `assets/data.js`. Each day has `tasks` with stable `id`s (keep ids stable so saved progress keeps matching). Resources are referenced from tasks by `res: ["resource-id"]`.

## Sources used for exam facts

- ETS test content and structure: https://www.ets.org/gre/test-takers/general-test/about/content-structure.html
- ETS POWERPREP practice tests: https://www.ets.org/gre/test-takers/general-test/prepare/powerprep.html
- Fee and 2026 price change reported by third-party prep sites; confirm on ETS before registering.
