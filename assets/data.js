/* GRE 30-Day Dashboard — content layer.
   All plan, vocabulary, formula, strategy and resource data lives here so the UI stays data-driven.
   Exposed as window.GRE_DATA. */
window.GRE_DATA = (function () {

  /* ------------------------------------------------------------------ */
  /* EXAM FACTS (GRE General Test, shorter format in effect since Sept 2023) */
  /* ------------------------------------------------------------------ */
  const exam = {
    name: "GRE General Test",
    totalTime: "1 h 58 min",
    note: "Section-level adaptive: your performance on the first Verbal/Quant section decides the difficulty of the second. No breaks, no unscored section. On-screen calculator in Quant. You can mark, skip and return to questions within a section.",
    fee: "USD 220 worldwide (ETS has announced an increase to USD 249 from 1 Aug 2026). Check ETS for your country.",
    scoreReport: "Verbal 130–170 and Quant 130–170 in 1-point steps; Analytical Writing 0–6 in half-point steps. Official scores arrive in 8–10 days. ScoreSelect lets you choose which test dates to send.",
    sections: [
      { name: "Analytical Writing", detail: "1 task — Analyze an Issue", questions: "1 essay", time: "30 min", color: "pink" },
      { name: "Verbal Reasoning 1", detail: "Text Completion, Sentence Equivalence, Reading Comprehension", questions: "12 Q", time: "18 min", color: "blue" },
      { name: "Verbal Reasoning 2", detail: "Difficulty adapts to Section 1", questions: "15 Q", time: "23 min", color: "blue" },
      { name: "Quantitative Reasoning 1", detail: "Quant Comparison, Multiple Choice, Numeric Entry, Data Interpretation", questions: "12 Q", time: "21 min", color: "green" },
      { name: "Quantitative Reasoning 2", detail: "Difficulty adapts to Section 1", questions: "15 Q", time: "26 min", color: "green" }
    ],
    pacing: [
      { area: "Verbal", perQuestion: "~1.5 min", tip: "TC/SE in ≤ 1 min each; bank time for RC. Never leave a blank — no penalty for guessing." },
      { area: "Quant", perQuestion: "~1.75 min", tip: "QC in ≤ 1 min. If a question hits 2.5 min, pick, mark, move on and return." },
      { area: "Writing", perQuestion: "30 min total", tip: "4 min plan · 22 min write · 4 min proofread." }
    ]
  };

  /* ------------------------------------------------------------------ */
  /* PHASES */
  /* ------------------------------------------------------------------ */
  const phases = [
    { id: 1, title: "Diagnose & Foundations", days: [1, 7], color: "blue",
      goal: "Learn the test inside-out, take a diagnostic, and rebuild arithmetic, algebra and the three Verbal question types from first principles." },
    { id: 2, title: "Build Core Skills", days: [8, 14], color: "green",
      goal: "Geometry, data analysis, word problems, long Reading Comprehension and multi-blank Text Completion. Second full mock on Day 14." },
    { id: 3, title: "Advanced Content & Timing", days: [15, 22], color: "orange",
      goal: "Hard-level content, timed sections every day, Quant Comparison traps, and the official POWERPREP Online Test 2 on Day 21." },
    { id: 4, title: "Full Mocks, Polish & Taper", days: [23, 30], color: "pink",
      goal: "Two more full-length mocks with deep review, weak-area drills from your error log, final formula/vocab sweep, and a rested test day." }
  ];

  /* ------------------------------------------------------------------ */
  /* RESOURCES  (type: official | free | paid | video | book | app | community) */
  /* ------------------------------------------------------------------ */
  const resources = [
    // Built into this dashboard
    { id: "builtin-tests", name: "Built-in full-length tests (Tests tab)", url: "#tests", type: "free", area: "Mock", cost: "Free", priority: 1,
      note: "Two complete GRE-format tests inside this dashboard: Issue essay with timer, two Verbal and two Quant sections, auto-scored to the 130–170 scale with explanations for every question. Any section can also be taken alone as a timed drill." },
    // Official ETS
    { id: "ets-home", name: "ETS GRE official site", url: "https://www.ets.org/gre.html", type: "official", area: "General", cost: "Free", priority: 1,
      note: "Registration, test structure, policies, score reporting. Start here." },
    { id: "ets-structure", name: "ETS — Test content & structure", url: "https://www.ets.org/gre/test-takers/general-test/about/content-structure.html", type: "official", area: "General", cost: "Free", priority: 1,
      note: "Authoritative description of every section, question type and timing." },
    { id: "ets-register", name: "ETS — Register for the GRE", url: "https://www.ets.org/gre/test-takers/general-test/register.html", type: "official", area: "General", cost: "Fee applies", priority: 1,
      note: "Book your test-centre or at-home slot. Book early so your Day 30 is fixed." },
    { id: "powerprep", name: "POWERPREP Online (2 free tests)", url: "https://www.ets.org/gre/test-takers/general-test/prepare/powerprep.html", type: "official", area: "Mock", cost: "Free", priority: 1,
      note: "The only free tests with real ETS questions and the real adaptive algorithm. Use Test 1 as your diagnostic (Day 1) and Test 2 on Day 21." },
    { id: "powerprep-plus", name: "POWERPREP PLUS Online (3 paid tests)", url: "https://www.ets.org/gre/test-takers/general-test/prepare/powerprep.html", type: "official", area: "Mock", cost: "USD 39.95 each", priority: 2,
      note: "Real questions, scored AWA, explanations. Best money you can spend on prep. Use for Days 25 and 27." },
    { id: "ets-math-review", name: "ETS Math Review (PDF)", url: "https://www.ets.org/pdfs/gre/gre-math-review.pdf", type: "official", area: "Quant", cost: "Free", priority: 1,
      note: "Everything Quant can test, written by ETS. Read the chapter before each Quant topic day." },
    { id: "ets-math-conventions", name: "ETS Math Conventions (PDF)", url: "https://www.ets.org/pdfs/gre/gre-math-conventions.pdf", type: "official", area: "Quant", cost: "Free", priority: 2,
      note: "The assumptions the GRE makes (figures not to scale, etc.). Read once on Day 2." },
    { id: "ets-issue-pool", name: "ETS — Analyze an Issue topic pool", url: "https://www.ets.org/pdfs/gre/issue-pool.pdf", type: "official", area: "AWA", cost: "Free", priority: 1,
      note: "Every possible essay prompt is published here. Every practice essay you write should come from this pool." },
    { id: "ets-awa-guide", name: "ETS — Analytical Writing scoring guide & samples", url: "https://www.ets.org/gre/test-takers/general-test/prepare/content/analytical-writing.html", type: "official", area: "AWA", cost: "Free", priority: 1,
      note: "Score-level descriptions and scored sample essays. Read the 6 and the 4 and learn the difference." },
    { id: "ets-khan", name: "Khan Academy videos mapped to the ETS Math Review", url: "https://www.ets.org/gre/test-takers/general-test/prepare/content/quantitative-reasoning.html", type: "official", area: "Quant", cost: "Free", priority: 2,
      note: "ETS links Khan Academy lessons to each Math Review topic. Use when a concept doesn't click." },
    { id: "ets-scores", name: "ETS — Understanding your scores", url: "https://www.ets.org/gre/test-takers/general-test/scores/understand-scores.html", type: "official", area: "General", cost: "Free", priority: 3,
      note: "Percentile tables. Translate your target programme's expectations into section scores." },
    { id: "og-book", name: "The Official Guide to the GRE General Test (book)", url: "https://www.ets.org/gre/test-takers/general-test/prepare.html", type: "book", area: "General", cost: "~USD 40", priority: 2,
      note: "Real questions plus the paper-based practice test. Pair with the Official Verbal and Quant Practice Questions volumes." },

    // Core courses / strategy
    { id: "gregmat", name: "GregMat+", url: "https://www.gregmat.com/", type: "paid", area: "General", cost: "~USD 5/month", priority: 1,
      note: "The best value in GRE prep: structured 1- and 2-month plans, Vocab Mountain, PrepSwift videos, timed sections and a score calculator. This 30-day plan assumes you subscribe." },
    { id: "gregmat-yt", name: "GregMat YouTube", url: "https://www.youtube.com/@GregMat", type: "video", area: "General", cost: "Free", priority: 1,
      note: "Free TC/SE/RC strategy series and Quant walkthroughs. The 'Text Completion strategy' and 'Reading Comprehension' playlists are required viewing in Week 1." },
    { id: "prepswift", name: "PrepSwift (Quant & Verbal micro-lessons)", url: "https://www.prepswift.com/", type: "paid", area: "Quant", cost: "Included in GregMat+", priority: 2,
      note: "Short topic videos with exercises. Use as the Quant 'textbook' for each topic day." },
    { id: "vince", name: "Vince Kotchian GRE (site + YouTube)", url: "https://vincekotchian.com/", type: "video", area: "Verbal", cost: "Free / paid", priority: 2,
      note: "Clear Verbal strategy, RC approach and study-plan sanity. Great second voice when GregMat's method doesn't click." },
    { id: "magoosh", name: "Magoosh GRE", url: "https://gre.magoosh.com/", type: "paid", area: "General", cost: "~USD 150+", priority: 3,
      note: "Large question bank with video explanations and score predictor. Optional alternative to GregMat for practice volume." },
    { id: "magoosh-blog", name: "Magoosh GRE Blog", url: "https://magoosh.com/gre/", type: "free", area: "General", cost: "Free", priority: 3,
      note: "Free articles on every question type, plus the eBooks (Vocab, Math formulas)." },
    { id: "ttp", name: "Target Test Prep GRE", url: "https://gre.targettestprep.com/", type: "paid", area: "Quant", cost: "~USD 100+/month", priority: 3,
      note: "Extremely thorough Quant course. Only if Quant is your weak side and you want 165+." },
    { id: "greenlight", name: "Greenlight Test Prep (free GRE course)", url: "https://www.greenlighttestprep.com/", type: "free", area: "Quant", cost: "Free", priority: 3,
      note: "Free video course covering the full Quant syllabus with practice." },

    // Practice question banks & books
    { id: "5lb", name: "Manhattan Prep 5 lb. Book of GRE Practice Problems", url: "https://www.manhattanprep.com/gre/", type: "book", area: "Practice", cost: "~USD 30", priority: 2,
      note: "1,800+ problems. Harder than the real test in Quant — ideal for Week 3 drills. Skip the easy chapters." },
    { id: "manhattan-free", name: "Manhattan Prep free GRE practice test", url: "https://www.manhattanprep.com/gre/free-gre-practice-test/", type: "free", area: "Mock", cost: "Free", priority: 2,
      note: "Good full-length mock (Quant runs hard). Scheduled on Day 14." },
    { id: "kaplan-free", name: "Kaplan free GRE practice test", url: "https://www.kaptest.com/gre/free/gre-practice-test", type: "free", area: "Mock", cost: "Free", priority: 3,
      note: "Backup mock if you need an extra full-length run." },
    { id: "princeton-free", name: "Princeton Review free GRE practice test", url: "https://www.princetonreview.com/grad/free-gre-practice-test", type: "free", area: "Mock", cost: "Free", priority: 3,
      note: "Another backup mock. Scores run a little generous." },

    // Vocabulary
    { id: "vocab-mountain", name: "GregMat Vocab Mountain", url: "https://www.gregmat.com/", type: "paid", area: "Vocab", cost: "Included in GregMat+", priority: 1,
      note: "~1,000 words in tiers with quizzes. The 300 words in this dashboard mirror the highest-frequency tiers." },
    { id: "magoosh-flash", name: "Magoosh GRE Vocabulary Flashcards", url: "https://gre.magoosh.com/flashcards/vocabulary", type: "app", area: "Vocab", cost: "Free", priority: 1,
      note: "1,000 words with spaced repetition on web/iOS/Android. 15 minutes a day on the commute." },
    { id: "anki", name: "Anki (spaced repetition)", url: "https://apps.ankiweb.net/", type: "app", area: "Vocab", cost: "Free (desktop/Android)", priority: 2,
      note: "Export this dashboard's vocab to CSV (button in the Vocab tab) and import into Anki for daily reviews." },
    { id: "prepscholar-vocab", name: "PrepScholar 357 high-frequency GRE words", url: "https://www.prepscholar.com/gre/blog/gre-vocabulary-list-words/", type: "free", area: "Vocab", cost: "Free", priority: 3,
      note: "Good cross-check list with example sentences." },
    { id: "vocab-com", name: "Vocabulary.com", url: "https://www.vocabulary.com/", type: "app", area: "Vocab", cost: "Free", priority: 3,
      note: "Adaptive vocab games; search for 'GRE' lists." },

    // Reading
    { id: "aldaily", name: "Arts & Letters Daily", url: "https://www.aldaily.com/", type: "free", area: "Verbal", cost: "Free", priority: 3,
      note: "Dense essays in the GRE register. Read one a day; summarise the author's main point in one sentence." },
    { id: "economist", name: "The Economist / The Atlantic / Scientific American", url: "https://www.economist.com/", type: "free", area: "Verbal", cost: "Free-ish", priority: 3,
      note: "GRE passages are adapted from exactly this kind of writing. 15 minutes of active reading daily." },

    // Community
    { id: "reddit", name: "r/GRE", url: "https://www.reddit.com/r/GRE/", type: "community", area: "General", cost: "Free", priority: 3,
      note: "Debriefs, score reports, and honest reviews of prep companies. Search before you ask." },
    { id: "gregmat-discord", name: "GregMat community / Discord", url: "https://www.gregmat.com/", type: "community", area: "General", cost: "Included", priority: 3,
      note: "Ask about any specific question; someone has already explained it." }
  ];

  /* ------------------------------------------------------------------ */
  /* MOCK SCHEDULE */
  /* ------------------------------------------------------------------ */
  const mocks = [
    { n: 1, day: 1, name: "POWERPREP Online — Test 1 (diagnostic)", resource: "powerprep", cost: "Free", note: "Timed, with AWA. Don't study first — this is your baseline." },
    { n: 2, day: 14, name: "Manhattan Prep free test (or GregMat / Magoosh full mock)", resource: "manhattan-free", cost: "Free", note: "Quant here is harder than real; use it for stamina and timing. Free alternative: built-in Test 1 in the Tests tab." },
    { n: 3, day: 21, name: "POWERPREP Online — Test 2", resource: "powerprep", cost: "Free", note: "Your most accurate mid-prep score estimate." },
    { n: 4, day: 25, name: "POWERPREP PLUS — Test 1", resource: "powerprep-plus", cost: "USD 39.95", note: "Scored AWA + explanations. Free alternative: built-in Test 2 in the Tests tab, or the Kaplan / Princeton free tests." },
    { n: 5, day: 27, name: "POWERPREP PLUS — Test 2 (or Official Guide paper test)", resource: "powerprep-plus", cost: "USD 39.95", note: "Final dress rehearsal at the same time of day as your real exam. Free alternative: retake built-in Test 1 or 2 after reviewing it." }
  ];

  /* ------------------------------------------------------------------ */
  /* 30-DAY PLAN  — each task has a stable id for progress tracking */
  /* focus tags: verbal | quant | awa | vocab | mock | review | rest */
  /* ------------------------------------------------------------------ */
  const days = [
    { day: 1, phase: 1, title: "Orientation & diagnostic", hours: 4.5, focus: ["mock", "vocab"],
      why: "You cannot plan a route without a starting point. Today's score is data, not a verdict.",
      tasks: [
        { id: "d1t1", text: "Read the ETS test structure page and the Exam tab here. Know every section, timing and question type.", res: ["ets-structure"], min: 30 },
        { id: "d1t2", text: "Register for your test date (Day 30 or just after) so the deadline is real.", res: ["ets-register"], min: 20 },
        { id: "d1t3", text: "Take POWERPREP Online Test 1, fully timed, including the essay. Quiet room, one sitting, no phone.", res: ["powerprep"], min: 130 },
        { id: "d1t4", text: "Log the score in the Progress tab. Set a target score (reach + safe) and write it on the dashboard.", min: 10 },
        { id: "d1t5", text: "Subscribe to GregMat+ and install Magoosh Vocabulary Flashcards.", res: ["gregmat", "magoosh-flash"], min: 15 },
        { id: "d1t6", text: "Vocab: learn today's 10 words (Vocab tab, Day 1 batch). Make a sentence for each.", min: 25 }
      ] },
    { day: 2, phase: 1, title: "Diagnostic review · Arithmetic I · Text Completion", hours: 4, focus: ["review", "quant", "verbal", "vocab"],
      why: "Reviewing a mock is worth more than taking it. Categorise every miss: content gap, careless, or timing.",
      tasks: [
        { id: "d2t1", text: "Review every wrong AND guessed question from the diagnostic. Start your error log (Progress tab) with the category for each.", min: 60 },
        { id: "d2t2", text: "Quant: integers, divisibility, primes, factors, multiples, remainders. ETS Math Review ch.1 (Arithmetic) + PrepSwift videos.", res: ["ets-math-review", "prepswift"], min: 60 },
        { id: "d2t3", text: "Read the ETS Math Conventions PDF once.", res: ["ets-math-conventions"], min: 15 },
        { id: "d2t4", text: "Verbal: watch GregMat's Text Completion strategy videos (single blank). Learn: find the clue → find the shift/support word → predict → match.", res: ["gregmat-yt"], min: 45 },
        { id: "d2t5", text: "Do 15 single-blank TC questions untimed. Write your prediction before looking at the choices.", res: ["gregmat"], min: 30 },
        { id: "d2t6", text: "Vocab: Day 2 batch (10 words) + review Day 1.", min: 25 }
      ] },
    { day: 3, phase: 1, title: "Arithmetic II · Sentence Equivalence", hours: 4, focus: ["quant", "verbal", "vocab"],
      why: "Fractions, percents and ratios appear in a third of Quant questions, usually disguised inside word problems.",
      tasks: [
        { id: "d3t1", text: "Quant: fractions, decimals, percents, percent change, ratios and proportions. Math Review ch.1 sections 1.2–1.6 + PrepSwift.", res: ["ets-math-review", "prepswift"], min: 60 },
        { id: "d3t2", text: "Do 20 arithmetic problems (GregMat or 5 lb. Fractions/Percents chapters). Time each: target 1.5 min.", res: ["5lb"], min: 40 },
        { id: "d3t3", text: "Verbal: GregMat Sentence Equivalence strategy. Rule: predict first; the two answers must create sentences with the same meaning — synonyms are a hint, not a guarantee.", res: ["gregmat-yt"], min: 40 },
        { id: "d3t4", text: "Do 15 SE questions untimed, then 10 timed at 1 min each.", res: ["gregmat"], min: 35 },
        { id: "d3t5", text: "Read one Arts & Letters Daily essay; write its main point in one sentence.", res: ["aldaily"], min: 15 },
        { id: "d3t6", text: "Vocab: Day 3 batch + review Days 1–2.", min: 25 }
      ] },
    { day: 4, phase: 1, title: "Algebra I · Reading Comprehension foundations", hours: 4, focus: ["quant", "verbal", "vocab"],
      why: "RC is about half of Verbal. The skill is not reading faster — it is reading for structure and the author's purpose.",
      tasks: [
        { id: "d4t1", text: "Quant: linear equations, inequalities, exponents and roots. Math Review ch.2 sections 2.1–2.4.", res: ["ets-math-review", "prepswift"], min: 60 },
        { id: "d4t2", text: "Do 20 algebra problems. Practise the exponent rules from the Quant tab until automatic.", res: ["gregmat", "5lb"], min: 40 },
        { id: "d4t3", text: "Verbal: GregMat Reading Comprehension series (part 1). Learn passage mapping: for each paragraph, note role (claim / evidence / counter / conclusion) and author's attitude.", res: ["gregmat-yt"], min: 45 },
        { id: "d4t4", text: "Do 3 short passages (2–3 questions each) untimed, mapping each before answering.", res: ["gregmat"], min: 35 },
        { id: "d4t5", text: "Vocab: Day 4 batch + review Days 1–3.", min: 25 }
      ] },
    { day: 5, phase: 1, title: "Algebra II · RC question types · Meet the Issue essay", hours: 4.5, focus: ["quant", "verbal", "awa", "vocab"],
      why: "The AWA score is a tiebreaker for many programmes, and 30 minutes of structure practice buys a whole point.",
      tasks: [
        { id: "d5t1", text: "Quant: quadratics, factoring, functions, simultaneous equations, algebraic word problems. Math Review ch.2 sections 2.5–2.9.", res: ["ets-math-review", "prepswift"], min: 60 },
        { id: "d5t2", text: "Do 20 mixed algebra problems, timed.", res: ["gregmat"], min: 35 },
        { id: "d5t3", text: "Verbal: RC question types — main idea, detail, inference, function ('the author mentions X in order to…'), tone. Do 3 passages focusing on identifying the type before answering.", res: ["gregmat"], min: 45 },
        { id: "d5t4", text: "AWA: read the ETS scoring guide and the sample 6 / 4 / 2 essays. Note what the 6 does that the 4 doesn't (specific examples, addressing the other side).", res: ["ets-awa-guide"], min: 40 },
        { id: "d5t5", text: "AWA: read the template in the Writing tab. Pick 3 prompts from the ETS Issue pool and outline each (position + 2 examples + concession) in 5 min.", res: ["ets-issue-pool"], min: 20 },
        { id: "d5t6", text: "Vocab: Day 5 batch + review.", min: 25 }
      ] },
    { day: 6, phase: 1, title: "Quantitative Comparison · First essay · Timed verbal set", hours: 4, focus: ["quant", "verbal", "awa", "vocab"],
      why: "QC is roughly a third of Quant and has its own logic: you're testing a relationship, not solving for a number.",
      tasks: [
        { id: "d6t1", text: "Quant: Quantitative Comparison strategy — plug in 0, 1, −1, fractions, large numbers; simplify both columns the same way; answer D only when you've shown two different outcomes.", res: ["gregmat-yt", "prepswift"], min: 45 },
        { id: "d6t2", text: "Do 25 QC questions. For each wrong answer write which test value would have exposed it.", res: ["gregmat", "5lb"], min: 45 },
        { id: "d6t3", text: "AWA: write Essay #1 from the ETS pool, strictly timed at 30 min. Then self-score with the rubric in the Writing tab.", res: ["ets-issue-pool"], min: 45 },
        { id: "d6t4", text: "Verbal: 20 mixed TC + SE questions, timed, 1 min each.", res: ["gregmat"], min: 25 },
        { id: "d6t5", text: "Vocab: Day 6 batch + review.", min: 25 }
      ] },
    { day: 7, phase: 1, title: "Week 1 review & consolidation", hours: 3, focus: ["review", "vocab"],
      why: "A lighter day. Retrieval beats re-reading: redo misses from memory before checking the solution.",
      tasks: [
        { id: "d7t1", text: "Redo every wrong question from Days 2–6 from scratch. Update the error log with any repeat misses — those are your real weaknesses.", min: 60 },
        { id: "d7t2", text: "Cumulative vocab quiz: all 60 words from Days 1–6. Any word you miss goes into a 'leech' list for extra reps.", min: 30 },
        { id: "d7t3", text: "Quant: 20-question mixed arithmetic + algebra set, timed (35 min).", res: ["gregmat"], min: 45 },
        { id: "d7t4", text: "Write a 5-line reflection in the Progress tab notes: what clicked, what didn't, what to change in Week 2.", min: 10 },
        { id: "d7t5", text: "Vocab: Day 7 batch.", min: 20 }
      ] },

    { day: 8, phase: 2, title: "Geometry I · Multi-blank Text Completion", hours: 4, focus: ["quant", "verbal", "vocab"],
      why: "Two- and three-blank TC is where vocab and logic meet. Attack the easiest blank first; the sentence tells you which.",
      tasks: [
        { id: "d8t1", text: "Quant: lines and angles, triangles (inequality, Pythagorean, special right triangles, similar triangles), area. Math Review ch.3 sections 3.1–3.3.", res: ["ets-math-review", "prepswift"], min: 60 },
        { id: "d8t2", text: "Do 20 geometry problems. Redraw every figure to scale — GRE figures are not drawn to scale.", res: ["gregmat", "5lb"], min: 40 },
        { id: "d8t3", text: "Verbal: GregMat double/triple-blank TC strategy. Practise finding the anchor blank.", res: ["gregmat-yt"], min: 35 },
        { id: "d8t4", text: "Do 15 multi-blank TC untimed then 10 timed (1.5 min each).", res: ["gregmat"], min: 40 },
        { id: "d8t5", text: "Vocab: Day 8 batch + review Days 5–7.", min: 25 }
      ] },
    { day: 9, phase: 2, title: "Geometry II · Long RC passages", hours: 4, focus: ["quant", "verbal", "vocab"],
      why: "Long passages (one per section at most) tempt you to over-invest. Map, answer, move.",
      tasks: [
        { id: "d9t1", text: "Quant: circles (arc, sector, inscribed angles), polygons, coordinate geometry (slope, distance, midpoint, line equations), 3D solids. Math Review ch.3 sections 3.4–3.6.", res: ["ets-math-review", "prepswift"], min: 60 },
        { id: "d9t2", text: "Do 20 geometry problems mixing circles and coordinate geometry.", res: ["gregmat", "5lb"], min: 40 },
        { id: "d9t3", text: "Verbal: GregMat RC series (part 2) — long passages. Technique: read for structure in ~3 min, answer 3–4 questions in ~4 min.", res: ["gregmat-yt"], min: 30 },
        { id: "d9t4", text: "Do 2 long passages timed (7 min each) + 2 short passages.", res: ["gregmat"], min: 40 },
        { id: "d9t5", text: "Read one dense article (Economist / Atlantic). Note the thesis and one counter-point.", res: ["economist"], min: 15 },
        { id: "d9t6", text: "Vocab: Day 9 batch + review.", min: 25 }
      ] },
    { day: 10, phase: 2, title: "Data Analysis I (statistics) · Advanced SE", hours: 4, focus: ["quant", "verbal", "vocab"],
      why: "Standard deviation questions are almost always conceptual. You rarely compute SD; you compare spread.",
      tasks: [
        { id: "d10t1", text: "Quant: mean, median, mode, range, quartiles, interquartile range, standard deviation (conceptually), normal distribution (34–14–2 rule). Math Review ch.4 sections 4.1–4.2.", res: ["ets-math-review", "prepswift"], min: 60 },
        { id: "d10t2", text: "Do 20 statistics problems including 5 QC on standard deviation.", res: ["gregmat", "5lb"], min: 40 },
        { id: "d10t3", text: "Verbal: SE traps — near-synonym pairs that don't fit, antonym decoys, words with secondary meanings (e.g. 'qualify', 'check', 'flag').", res: ["gregmat-yt"], min: 30 },
        { id: "d10t4", text: "Do 20 SE questions timed (1 min each). Review every miss by asking: did I predict?", res: ["gregmat"], min: 30 },
        { id: "d10t5", text: "Vocab: Day 10 batch + review.", min: 25 }
      ] },
    { day: 11, phase: 2, title: "Data Analysis II (counting & probability) · RC inference · Essay #2", hours: 4.5, focus: ["quant", "verbal", "awa", "vocab"],
      why: "Counting problems are few but costly. Learn the three questions: order matters? repetition allowed? restriction first?",
      tasks: [
        { id: "d11t1", text: "Quant: counting principle, permutations, combinations, probability (and/or, independent, complement), overlapping sets. Math Review ch.4 sections 4.3–4.4.", res: ["ets-math-review", "prepswift"], min: 60 },
        { id: "d11t2", text: "Do 20 counting/probability problems. Write the formula used next to each.", res: ["gregmat", "5lb"], min: 40 },
        { id: "d11t3", text: "Verbal: inference questions — the answer must be provable from the text, never 'probably true'. Do 4 passages focusing only on inference and tone items.", res: ["gregmat"], min: 40 },
        { id: "d11t4", text: "AWA: Essay #2, timed 30 min, new pool prompt. Self-score; compare with Essay #1.", res: ["ets-issue-pool"], min: 40 },
        { id: "d11t5", text: "Vocab: Day 11 batch + review.", min: 25 }
      ] },
    { day: 12, phase: 2, title: "Data Interpretation · Numeric Entry · First timed Verbal section", hours: 4, focus: ["quant", "verbal", "vocab"],
      why: "Every Quant section has a 3-question Data Interpretation set. Read the axes, units and footnotes before any question.",
      tasks: [
        { id: "d12t1", text: "Quant: Data Interpretation sets (graphs, tables, percent-of-total). Do 6 sets (18 questions). Then 15 Numeric Entry questions — practise entering fractions and rounding exactly as asked.", res: ["gregmat", "5lb"], min: 70 },
        { id: "d12t2", text: "Verbal: a full timed Verbal section (12 Q / 18 min) — built-in Test 1 Verbal Section 1 (Tests tab → Take a section), or GregMat / Magoosh. Record time per question type.", res: ["builtin-tests", "gregmat"], min: 25 },
        { id: "d12t3", text: "Review the section: for each miss, log category (vocab gap / misread / timing / logic).", min: 35 },
        { id: "d12t4", text: "Verbal: 10 TC + 10 SE drill.", res: ["gregmat"], min: 25 },
        { id: "d12t5", text: "Vocab: Day 12 batch + review Days 9–11.", min: 25 }
      ] },
    { day: 13, phase: 2, title: "Word problems · Argument-style RC", hours: 4, focus: ["quant", "verbal", "vocab"],
      why: "Rate, work and mixture problems are formulaic once you set up a table. Build the habit of writing the table first.",
      tasks: [
        { id: "d13t1", text: "Quant: rates (distance = rate × time), average speed, work problems (combined rates), mixtures, simple and compound interest, sequences.", res: ["prepswift", "ets-math-review"], min: 60 },
        { id: "d13t2", text: "Do 25 word problems, timed at 2 min each.", res: ["gregmat", "5lb"], min: 50 },
        { id: "d13t3", text: "Verbal: paragraph-argument RC (strengthen / weaken / assumption / bolded-statement roles). Learn: find conclusion → find evidence → find the gap.", res: ["gregmat-yt"], min: 30 },
        { id: "d13t4", text: "Do 15 argument questions.", res: ["gregmat"], min: 30 },
        { id: "d13t5", text: "Vocab: Day 13 batch + review.", min: 25 }
      ] },
    { day: 14, phase: 2, title: "Mock #2 — full length", hours: 5, focus: ["mock", "vocab"],
      why: "Stamina is a skill. Two hours of focus with no break must feel normal by test day.",
      tasks: [
        { id: "d14t1", text: "Take Mock #2: built-in Test 1 (Tests tab) or the Manhattan Prep free test. Timed, with the essay, at the same time of day as your real exam.", res: ["builtin-tests", "manhattan-free"], min: 130 },
        { id: "d14t2", text: "Log the score in the Progress tab.", min: 5 },
        { id: "d14t3", text: "Quick review (deep review is tomorrow): list the questions you guessed on, even if correct.", min: 30 },
        { id: "d14t4", text: "Cumulative vocab quiz: Days 7–13 (70 words). Update the leech list.", min: 30 },
        { id: "d14t5", text: "Vocab: Day 14 batch.", min: 20 }
      ] },

    { day: 15, phase: 3, title: "Mock #2 deep review · Advanced number properties", hours: 4, focus: ["review", "quant", "vocab"],
      why: "Units digits, remainders and exponent patterns are the 'hard' arithmetic that separates 160 from 167.",
      tasks: [
        { id: "d15t1", text: "Deep-review Mock #2: every wrong, guessed and slow (>2.5 min) question. Update the error log; identify your top 3 weak topics for the week.", min: 75 },
        { id: "d15t2", text: "Quant: units-digit cycles, remainders with powers, even/odd and positive/negative rules, prime factorisation counting (number of factors), GCD/LCM.", res: ["prepswift", "gregmat"], min: 45 },
        { id: "d15t3", text: "Do 20 hard number-properties problems (5 lb. 'Number Properties' chapter or GregMat hard set).", res: ["5lb", "gregmat"], min: 45 },
        { id: "d15t4", text: "Verbal: 15 mixed TC/SE, timed.", res: ["gregmat"], min: 20 },
        { id: "d15t5", text: "Vocab: Day 15 batch + review Days 12–14.", min: 25 }
      ] },
    { day: 16, phase: 3, title: "Sets, sequences & functions · Hard Text Completion", hours: 4, focus: ["quant", "verbal", "vocab"],
      why: "Hard TC is rarely about obscure words — it's about tracking a sentence that reverses direction twice.",
      tasks: [
        { id: "d16t1", text: "Quant: overlapping sets (2-set formula and the 3-set formula), Venn diagrams, arithmetic & geometric sequences, function notation and composite functions, symbols-as-functions questions.", res: ["prepswift", "ets-math-review"], min: 50 },
        { id: "d16t2", text: "Do 20 problems on these topics, timed.", res: ["gregmat", "5lb"], min: 40 },
        { id: "d16t3", text: "Verbal: GregMat 'hard' TC sets — 15 three-blank questions. Diagram the sentence's logic (continue / contrast / cause) before filling blanks.", res: ["gregmat"], min: 45 },
        { id: "d16t4", text: "Read one dense essay and paraphrase each paragraph in ≤ 10 words.", res: ["aldaily"], min: 15 },
        { id: "d16t5", text: "Vocab: Day 16 batch + review.", min: 25 }
      ] },
    { day: 17, phase: 3, title: "Advanced geometry · Hard RC · Essay #3", hours: 4.5, focus: ["quant", "verbal", "awa", "vocab"],
      why: "By now your template should be automatic so your 30 minutes go into ideas and examples, not structure.",
      tasks: [
        { id: "d17t1", text: "Quant: inscribed/circumscribed figures, shaded regions, 3D (cylinder, box, diagonal of a box), coordinate geometry with circles and parabolas, geometry QC traps.", res: ["prepswift", "gregmat"], min: 50 },
        { id: "d17t2", text: "Do 20 hard geometry problems.", res: ["5lb", "gregmat"], min: 40 },
        { id: "d17t3", text: "Verbal: 4 hard RC passages (science and humanities), timed. Focus on 'select all that apply' and 'select-in-passage' formats.", res: ["gregmat"], min: 45 },
        { id: "d17t4", text: "AWA: Essay #3, timed. Target 500–600 words, 4–5 paragraphs, one concession paragraph.", res: ["ets-issue-pool"], min: 35 },
        { id: "d17t5", text: "Vocab: Day 17 batch + review.", min: 25 }
      ] },
    { day: 18, phase: 3, title: "Advanced counting & probability · Timed Verbal section", hours: 4, focus: ["quant", "verbal", "vocab"],
      why: "Timed sections every other day from here. The goal is a repeatable pacing rhythm, not a perfect score.",
      tasks: [
        { id: "d18t1", text: "Quant: 'at least one' probability (use the complement), arrangements with restrictions, circular arrangements, combinations with groups, probability with dependent events.", res: ["prepswift", "gregmat"], min: 45 },
        { id: "d18t2", text: "Do 20 hard counting/probability problems.", res: ["5lb", "gregmat"], min: 40 },
        { id: "d18t3", text: "Verbal: full timed section (15 Q / 23 min — the longer one): built-in Test 2 Verbal Section 2 or GregMat. Review with the error log.", res: ["builtin-tests", "gregmat"], min: 60 },
        { id: "d18t4", text: "Vocab: Day 18 batch + review Days 15–17.", min: 25 }
      ] },
    { day: 19, phase: 3, title: "Timed Quant section · Verbal speed drills", hours: 4, focus: ["quant", "verbal", "vocab"],
      why: "Speed in TC/SE comes from vocabulary and prediction. If you're re-reading choices, you skipped the prediction.",
      tasks: [
        { id: "d19t1", text: "Quant: full timed section (15 Q / 26 min): built-in Test 2 Quant Section 2 or GregMat. Use the on-screen-style calculator only — no phone calculator.", res: ["builtin-tests", "gregmat"], min: 30 },
        { id: "d19t2", text: "Review the section. For every question over 2 min, write the faster approach (plug in, back-solve, estimate).", min: 40 },
        { id: "d19t3", text: "Verbal: 30 TC/SE in 30 minutes. Then 10 more at 45 sec each.", res: ["gregmat"], min: 45 },
        { id: "d19t4", text: "Quant: 15 QC questions, 1 min each.", res: ["gregmat"], min: 20 },
        { id: "d19t5", text: "Vocab: Day 19 batch + review.", min: 25 }
      ] },
    { day: 20, phase: 3, title: "QC traps masterclass · RC timing strategy", hours: 4, focus: ["quant", "verbal", "vocab"],
      why: "Most QC errors are assumptions: that a variable is positive, an integer, or that the figure is to scale.",
      tasks: [
        { id: "d20t1", text: "Quant: review the QC trap list in the Quant tab. Do 30 QC problems; for each, name the trap it was testing.", res: ["gregmat", "5lb"], min: 60 },
        { id: "d20t2", text: "Verbal: RC timing plan — decide now: long passage first or last? Which question types do you skip-and-return? Write your plan in the Progress notes.", min: 15 },
        { id: "d20t3", text: "Do 5 passages applying the plan, timed.", res: ["gregmat"], min: 50 },
        { id: "d20t4", text: "Review the week's error log. Pick the 2 topics to drill on Day 23.", min: 20 },
        { id: "d20t5", text: "Vocab: Day 20 batch + review.", min: 25 }
      ] },
    { day: 21, phase: 3, title: "Mock #3 — POWERPREP Online Test 2", hours: 5, focus: ["mock", "vocab"],
      why: "This is the most accurate predictor you have. Treat it exactly like test day: same wake-up time, same breakfast.",
      tasks: [
        { id: "d21t1", text: "Take POWERPREP Online Test 2, full length with essay. No pausing.", res: ["powerprep"], min: 130 },
        { id: "d21t2", text: "Log the score. Compare to the diagnostic — the delta is your progress.", min: 5 },
        { id: "d21t3", text: "Note which questions you guessed on (before looking at answers).", min: 20 },
        { id: "d21t4", text: "Cumulative vocab quiz: Days 14–20 (70 words).", min: 30 },
        { id: "d21t5", text: "Vocab: Day 21 batch.", min: 20 }
      ] },
    { day: 22, phase: 3, title: "Mock #3 deep review · Re-plan the final week", hours: 4, focus: ["review", "vocab"],
      why: "The final 8 days should be spent on the 20% of topics causing 80% of your misses.",
      tasks: [
        { id: "d22t1", text: "Deep review of Mock #3: every wrong, guessed or slow question. Redo each from scratch before reading the explanation.", min: 90 },
        { id: "d22t2", text: "Update the error log. Rank topics by (misses × frequency on the GRE). Top 3 become Days 23–24 drills.", min: 30 },
        { id: "d22t3", text: "Verbal: 20 mixed questions, timed.", res: ["gregmat"], min: 30 },
        { id: "d22t4", text: "Quant: 20 mixed questions, timed.", res: ["gregmat"], min: 35 },
        { id: "d22t5", text: "Vocab: Day 22 batch + review.", min: 25 }
      ] },

    { day: 23, phase: 4, title: "Weak-area drill day", hours: 4, focus: ["quant", "verbal", "vocab"],
      why: "Targeted practice on known weaknesses is the highest-yield activity left. Everything else is maintenance.",
      tasks: [
        { id: "d23t1", text: "Quant: 40 problems on your #1 and #2 weakest Quant topics (from the error log). Use 5 lb. chapters or GregMat topic sets.", res: ["5lb", "gregmat"], min: 80 },
        { id: "d23t2", text: "Verbal: 20 questions on your weakest Verbal type.", res: ["gregmat"], min: 35 },
        { id: "d23t3", text: "Rewrite the Quant formula sheet from memory. Check against the Quant tab; drill anything missing.", min: 30 },
        { id: "d23t4", text: "Vocab: Day 23 batch + review Days 20–22.", min: 25 }
      ] },
    { day: 24, phase: 4, title: "Mixed hard sets · Essay #4", hours: 4.5, focus: ["quant", "verbal", "awa", "vocab"],
      why: "Mixed sets train the switch between topics that the real test demands every 90 seconds.",
      tasks: [
        { id: "d24t1", text: "Quant: 27 mixed hard questions in 47 min (simulate both sections back-to-back).", res: ["gregmat", "5lb"], min: 50 },
        { id: "d24t2", text: "Verbal: 27 mixed hard questions in 41 min.", res: ["gregmat"], min: 45 },
        { id: "d24t3", text: "Review both sets with the error log.", min: 50 },
        { id: "d24t4", text: "AWA: Essay #4, timed. Experiment: write the conclusion first in your plan so you always finish.", res: ["ets-issue-pool"], min: 35 },
        { id: "d24t5", text: "Vocab: Day 24 batch + review.", min: 25 }
      ] },
    { day: 25, phase: 4, title: "Mock #4 — POWERPREP PLUS Test 1", hours: 5, focus: ["mock", "vocab"],
      why: "Paid, but it's real questions with a scored essay — the closest thing to the real exam.",
      tasks: [
        { id: "d25t1", text: "Take POWERPREP PLUS Test 1, or built-in Test 2 (Tests tab) if you'd rather not pay. Full length, same time of day as your exam.", res: ["powerprep-plus", "builtin-tests"], min: 130 },
        { id: "d25t2", text: "Log the score in the Progress tab.", min: 5 },
        { id: "d25t3", text: "Light review: guessed questions only. Deep review tomorrow.", min: 30 },
        { id: "d25t4", text: "Vocab: Day 25 batch + leech list review.", min: 30 }
      ] },
    { day: 26, phase: 4, title: "Mock #4 review · Formula & vocab sweep", hours: 4, focus: ["review", "quant", "vocab"],
      why: "Consolidation. No new topics from here — only sharpening what you already know.",
      tasks: [
        { id: "d26t1", text: "Deep review of Mock #4 with the error log.", min: 80 },
        { id: "d26t2", text: "Quant: formula drill — go through every card in the Quant tab and solve one example for each from memory.", min: 45 },
        { id: "d26t3", text: "Verbal: cumulative vocab quiz on all 250 words so far. Then 20 TC/SE timed.", res: ["gregmat"], min: 50 },
        { id: "d26t4", text: "Vocab: Day 26 batch.", min: 20 }
      ] },
    { day: 27, phase: 4, title: "Mock #5 — final dress rehearsal", hours: 5, focus: ["mock", "vocab"],
      why: "Last full-length run. Practise the whole ritual: arrival time, ID, snacks, scratch paper, no break.",
      tasks: [
        { id: "d27t1", text: "Take POWERPREP PLUS Test 2, the Official Guide paper test, or a retake of a built-in test. Full length, exam-day conditions.", res: ["powerprep-plus", "og-book", "builtin-tests"], min: 130 },
        { id: "d27t2", text: "Log the score. Plot the trend in the Progress tab.", min: 5 },
        { id: "d27t3", text: "Light review of guessed questions.", min: 30 },
        { id: "d27t4", text: "Vocab: Day 27 batch + review Days 24–26.", min: 25 }
      ] },
    { day: 28, phase: 4, title: "Final review · Essay #5", hours: 3.5, focus: ["review", "awa", "vocab"],
      why: "Final error-log pass. Anything still missed twice gets a one-line rule written on your cheat sheet.",
      tasks: [
        { id: "d28t1", text: "Deep review of Mock #5.", min: 60 },
        { id: "d28t2", text: "Error log final pass: write a one-sentence rule for each recurring mistake ('Check whether x can be negative in QC').", min: 30 },
        { id: "d28t3", text: "AWA: Essay #5, timed. Make the template effortless.", res: ["ets-issue-pool"], min: 35 },
        { id: "d28t4", text: "Confirm test-day logistics: admission ticket, ID that matches your registration name exactly, route or at-home room check.", res: ["ets-home"], min: 20 },
        { id: "d28t5", text: "Vocab: Day 28 batch + review.", min: 25 }
      ] },
    { day: 29, phase: 4, title: "Taper: light review, logistics, sleep", hours: 2, focus: ["review", "vocab", "rest"],
      why: "You don't gain points on the day before the test; you can only lose them to fatigue.",
      tasks: [
        { id: "d29t1", text: "Read the Quant formula sheet and the Verbal strategy cards once. No new practice sets.", min: 30 },
        { id: "d29t2", text: "Vocab: Day 29 batch + full leech-list review.", min: 30 },
        { id: "d29t3", text: "Do 10 easy-to-medium Quant and 10 Verbal questions just to stay warm. Stop while it feels easy.", res: ["gregmat"], min: 30 },
        { id: "d29t4", text: "Go through the Test-day checklist in the Exam tab. Pack the bag / prepare the room.", min: 15 },
        { id: "d29t5", text: "Early night. Phone out of the bedroom.", min: 0 }
      ] },
    { day: 30, phase: 4, title: "Test day", hours: 1, focus: ["rest", "vocab"],
      why: "You've done the work. Today is execution: pacing, no blanks, and the next question matters more than the last.",
      tasks: [
        { id: "d30t1", text: "Wake at your mock-day time. Breakfast you've eaten before mocks.", min: 0 },
        { id: "d30t2", text: "Vocab: Day 30 batch (10 light words) — just to switch the brain on.", min: 10 },
        { id: "d30t3", text: "Read your one-sentence rules from Day 28 once. Then stop studying.", min: 10 },
        { id: "d30t4", text: "Arrive 30 min early (or log in 15 min early for at-home). Use the scratch paper for the pacing checkpoints from the Exam tab.", min: 0 },
        { id: "d30t5", text: "After the test: record your unofficial scores in the Progress tab, then do nothing GRE-related for a week. 🎉", min: 0 }
      ] }
  ];

  /* ------------------------------------------------------------------ */
  /* VOCABULARY — 300 high-frequency GRE words, 10 per day. Index i → day floor(i/10)+1 */
  /* [word, part, definition, example] */
  /* ------------------------------------------------------------------ */
  const vocabRaw = [
    // Day 1
    ["abate", "v.", "to lessen in intensity or amount", "The storm abated by morning."],
    ["aberrant", "adj.", "deviating from the normal or expected", "His aberrant behaviour worried his friends."],
    ["abstain", "v.", "to deliberately refrain from doing something", "She abstained from voting on the motion."],
    ["admonish", "v.", "to warn or reprimand firmly but gently", "The coach admonished the team for arriving late."],
    ["aesthetic", "adj.", "concerned with beauty or the appreciation of beauty", "The building was praised for its aesthetic appeal."],
    ["aggravate", "v.", "to make worse", "Scratching only aggravates the rash."],
    ["alacrity", "n.", "brisk and cheerful readiness", "He accepted the invitation with alacrity."],
    ["alleviate", "v.", "to make suffering or a problem less severe", "The medicine alleviated her pain."],
    ["ambiguous", "adj.", "open to more than one interpretation", "The contract's wording was ambiguous."],
    ["ambivalent", "adj.", "having mixed or contradictory feelings", "She felt ambivalent about moving abroad."],
    // Day 2
    ["ameliorate", "v.", "to make something bad better", "The reforms ameliorated working conditions."],
    ["anachronism", "n.", "something out of its proper time", "A wristwatch in a Roman film is an anachronism."],
    ["analogous", "adj.", "comparable in certain respects", "The heart is analogous to a pump."],
    ["anomaly", "n.", "something that deviates from what is standard", "The data showed a statistical anomaly."],
    ["antipathy", "n.", "a deep-seated feeling of dislike", "He felt antipathy toward his rival."],
    ["apathy", "n.", "lack of interest or concern", "Voter apathy led to a low turnout."],
    ["appease", "v.", "to pacify by giving in to demands", "They tried to appease the angry crowd."],
    ["arbitrary", "adj.", "based on random choice rather than reason", "The rule seemed completely arbitrary."],
    ["arcane", "adj.", "understood by few; mysterious", "The ritual followed arcane rules."],
    ["archaic", "adj.", "very old or old-fashioned", "The law contains archaic language."],
    // Day 3
    ["arduous", "adj.", "involving great effort; difficult", "The climb was long and arduous."],
    ["articulate", "adj.", "able to express ideas clearly", "She is an articulate speaker."],
    ["ascetic", "adj.", "practising severe self-discipline", "The monk led an ascetic life."],
    ["assuage", "v.", "to make an unpleasant feeling less intense", "His apology assuaged her anger."],
    ["audacious", "adj.", "bold and daring; recklessly brave", "An audacious plan to cross the desert."],
    ["austere", "adj.", "severe or strict; plain and unadorned", "The room was austere, with bare walls."],
    ["banal", "adj.", "boringly ordinary; unoriginal", "The film's plot was banal."],
    ["belie", "v.", "to give a false impression of; to contradict", "Her calm voice belied her nervousness."],
    ["benign", "adj.", "gentle and kind; harmless", "The tumour turned out to be benign."],
    ["bolster", "v.", "to support or strengthen", "New evidence bolstered the argument."],
    // Day 4
    ["bombastic", "adj.", "high-sounding but with little meaning", "The speech was bombastic and empty."],
    ["boorish", "adj.", "rough and bad-mannered", "His boorish jokes offended the guests."],
    ["burgeon", "v.", "to grow or increase rapidly", "The town burgeoned after the railway arrived."],
    ["cacophony", "n.", "a harsh, discordant mixture of sounds", "A cacophony of car horns filled the street."],
    ["candid", "adj.", "truthful and straightforward; frank", "She gave a candid account of the failure."],
    ["capricious", "adj.", "given to sudden changes of mood or behaviour", "The capricious weather ruined our plans."],
    ["castigate", "v.", "to reprimand severely", "The editor castigated the reporter for the error."],
    ["caustic", "adj.", "sarcastic in a scathing way; corrosive", "His caustic remarks hurt her feelings."],
    ["censure", "v.", "to express severe disapproval of", "The senator was censured for misconduct."],
    ["chicanery", "n.", "the use of trickery to achieve a goal", "The deal was won through legal chicanery."],
    // Day 5
    ["circumspect", "adj.", "wary and unwilling to take risks", "Be circumspect when sharing data online."],
    ["cogent", "adj.", "clear, logical and convincing", "She made a cogent case for reform."],
    ["complacent", "adj.", "smugly self-satisfied; uncritical", "Success made the team complacent."],
    ["conciliatory", "adj.", "intended to placate or pacify", "He adopted a conciliatory tone."],
    ["condone", "v.", "to accept or allow behaviour that is wrong", "The school does not condone bullying."],
    ["confound", "v.", "to confuse or surprise; to mix up", "The results confounded the experts."],
    ["conspicuous", "adj.", "clearly visible; attracting notice", "His absence was conspicuous."],
    ["contentious", "adj.", "causing or likely to cause argument", "Immigration is a contentious issue."],
    ["conundrum", "n.", "a confusing and difficult problem", "The budget presents a real conundrum."],
    ["convoluted", "adj.", "extremely complex and hard to follow", "The plot was hopelessly convoluted."],
    // Day 6
    ["copious", "adj.", "abundant in supply", "She took copious notes."],
    ["corroborate", "v.", "to confirm or give support to", "Witnesses corroborated his story."],
    ["credulous", "adj.", "too ready to believe things", "Credulous investors lost their savings."],
    ["cryptic", "adj.", "having a hidden or ambiguous meaning", "He left a cryptic note."],
    ["cursory", "adj.", "hasty and therefore not thorough", "A cursory glance at the report."],
    ["dearth", "n.", "a scarcity or lack of something", "There is a dearth of affordable housing."],
    ["debunk", "v.", "to expose the falseness of an idea", "The study debunked the myth."],
    ["decorum", "n.", "behaviour in keeping with good taste", "The ceremony was conducted with decorum."],
    ["deference", "n.", "humble submission and respect", "He showed deference to his elders."],
    ["deleterious", "adj.", "causing harm or damage", "Smoking has deleterious effects on health."],
    // Day 7
    ["delineate", "v.", "to describe or portray precisely", "The report delineates the risks."],
    ["demur", "v.", "to raise objections or show reluctance", "She demurred at the suggestion."],
    ["denigrate", "v.", "to criticise unfairly; disparage", "He denigrated his opponent's record."],
    ["deride", "v.", "to express contempt for; ridicule", "Critics derided the new design."],
    ["derivative", "adj.", "imitative of someone else's work; unoriginal", "The album sounded derivative."],
    ["desiccate", "v.", "to remove moisture from; dry out", "The desiccated landscape stretched for miles."],
    ["despot", "n.", "a ruler with absolute power", "The despot crushed all opposition."],
    ["diatribe", "n.", "a forceful and bitter verbal attack", "He launched into a diatribe against the media."],
    ["didactic", "adj.", "intended to teach, often excessively so", "The novel is didactic to a fault."],
    ["diffident", "adj.", "modest or shy because of a lack of confidence", "A diffident young researcher."],
    // Day 8
    ["digress", "v.", "to stray from the main subject", "The lecturer digressed into anecdotes."],
    ["dilatory", "adj.", "slow to act; intended to cause delay", "Dilatory tactics stalled the bill."],
    ["dilettante", "n.", "a person with a superficial interest in a subject", "He was a dilettante, never a scholar."],
    ["discerning", "adj.", "having good judgement; perceptive", "A discerning reader will notice the flaw."],
    ["discrepancy", "n.", "a lack of compatibility between facts", "There's a discrepancy in the accounts."],
    ["disingenuous", "adj.", "not candid or sincere; pretending to know less", "It's disingenuous to claim ignorance now."],
    ["disparage", "v.", "to regard or represent as of little worth", "She disparaged his efforts."],
    ["disparate", "adj.", "essentially different in kind", "The two cultures are disparate."],
    ["dissemble", "v.", "to conceal one's true motives or feelings", "He dissembled to avoid blame."],
    ["disseminate", "v.", "to spread widely", "The findings were disseminated online."],
    // Day 9
    ["dogmatic", "adj.", "asserting opinions as if they were facts", "His dogmatic style discouraged debate."],
    ["dubious", "adj.", "hesitating or doubting; of questionable value", "I'm dubious about the plan."],
    ["eclectic", "adj.", "deriving from a broad range of sources", "Her taste in music is eclectic."],
    ["efficacy", "n.", "the ability to produce a desired result", "Trials tested the drug's efficacy."],
    ["egregious", "adj.", "outstandingly bad; shocking", "An egregious violation of the rules."],
    ["elicit", "v.", "to draw out a response or reaction", "The joke elicited laughter."],
    ["eloquent", "adj.", "fluent and persuasive in speaking or writing", "An eloquent plea for peace."],
    ["elucidate", "v.", "to make clear; explain", "The diagram elucidates the process."],
    ["emulate", "v.", "to match or surpass by imitation", "Young players emulate their heroes."],
    ["enervate", "v.", "to weaken or drain of energy", "The heat enervated the hikers."],
    // Day 10
    ["engender", "v.", "to cause or give rise to", "The policy engendered resentment."],
    ["enigmatic", "adj.", "difficult to interpret; mysterious", "She gave an enigmatic smile."],
    ["ephemeral", "adj.", "lasting for a very short time", "Fame can be ephemeral."],
    ["equivocal", "adj.", "ambiguous; open to more than one interpretation", "The test results were equivocal."],
    ["erudite", "adj.", "having or showing great knowledge", "An erudite commentary on Dante."],
    ["esoteric", "adj.", "understood by only a small number of people", "An esoteric branch of mathematics."],
    ["eulogy", "n.", "a speech praising someone, typically at a funeral", "He delivered a moving eulogy."],
    ["evanescent", "adj.", "soon passing out of sight or existence", "An evanescent rainbow."],
    ["exacerbate", "v.", "to make a problem worse", "The drought exacerbated the famine."],
    ["exculpate", "v.", "to show or declare someone not guilty", "New evidence exculpated the defendant."],
    // Day 11
    ["exhaustive", "adj.", "including all elements; thorough", "An exhaustive search of the archives."],
    ["exonerate", "v.", "to clear from blame", "The inquiry exonerated the pilot."],
    ["expedient", "adj.", "convenient and practical, though possibly improper", "An expedient but unethical solution."],
    ["extol", "v.", "to praise enthusiastically", "She extolled the virtues of exercise."],
    ["facetious", "adj.", "treating serious issues with inappropriate humour", "A facetious remark at a funeral."],
    ["fallacious", "adj.", "based on a mistaken belief", "A fallacious argument."],
    ["fastidious", "adj.", "very attentive to accuracy and detail", "A fastidious editor."],
    ["fervent", "adj.", "having intense passion", "A fervent supporter of the cause."],
    ["flagrant", "adj.", "conspicuously offensive", "A flagrant breach of trust."],
    ["florid", "adj.", "elaborately or excessively ornate", "Florid prose full of adjectives."],
    // Day 12
    ["foment", "v.", "to instigate or stir up", "Agitators fomented unrest."],
    ["forestall", "v.", "to prevent by taking action in advance", "They acted to forestall a crisis."],
    ["fortuitous", "adj.", "happening by chance, often luckily", "A fortuitous meeting led to the deal."],
    ["frugal", "adj.", "sparing or economical with money", "A frugal lifestyle."],
    ["furtive", "adj.", "attempting to avoid notice; secretive", "A furtive glance at the clock."],
    ["gainsay", "v.", "to deny or contradict", "No one could gainsay her achievements."],
    ["garrulous", "adj.", "excessively talkative", "A garrulous taxi driver."],
    ["germane", "adj.", "relevant to a subject", "That point is not germane to the discussion."],
    ["glib", "adj.", "fluent but insincere and shallow", "A glib salesman's patter."],
    ["grandiloquent", "adj.", "pompous or extravagant in language", "A grandiloquent speech."],
    // Day 13
    ["gregarious", "adj.", "fond of company; sociable", "A gregarious host."],
    ["guile", "n.", "sly or cunning intelligence", "He used guile to win the contract."],
    ["hackneyed", "adj.", "overused and lacking significance", "A hackneyed phrase."],
    ["harangue", "n.", "a lengthy and aggressive speech", "A harangue about punctuality."],
    ["hegemony", "n.", "dominance of one group over others", "Economic hegemony in the region."],
    ["heretical", "adj.", "holding unorthodox opinions", "A heretical view of the theory."],
    ["hyperbole", "n.", "exaggerated statements not meant literally", "'I've told you a million times' is hyperbole."],
    ["iconoclast", "n.", "a person who attacks cherished beliefs", "An iconoclast in the art world."],
    ["idiosyncrasy", "n.", "a distinctive peculiarity of an individual", "One of his idiosyncrasies is humming while he works."],
    ["ignominious", "adj.", "deserving or causing public disgrace", "An ignominious defeat."],
    // Day 14
    ["immutable", "adj.", "unchanging over time", "The immutable laws of physics."],
    ["impartial", "adj.", "treating all rivals equally; unbiased", "An impartial judge."],
    ["impecunious", "adj.", "having little or no money", "An impecunious student."],
    ["imperturbable", "adj.", "unable to be upset; calm", "An imperturbable negotiator."],
    ["impetuous", "adj.", "acting quickly without thought", "An impetuous decision to quit."],
    ["implacable", "adj.", "unable to be appeased", "An implacable enemy."],
    ["impugn", "v.", "to dispute the truth or honesty of", "She impugned his motives."],
    ["inadvertent", "adj.", "not resulting from deliberate planning", "An inadvertent error."],
    ["incisive", "adj.", "intelligently analytical and clear", "An incisive critique."],
    ["incongruous", "adj.", "not in harmony with surroundings", "A modern tower incongruous among old houses."],
    // Day 15
    ["indefatigable", "adj.", "persisting tirelessly", "An indefatigable campaigner."],
    ["indifferent", "adj.", "having no particular interest; mediocre", "He was indifferent to praise."],
    ["indolent", "adj.", "wanting to avoid activity; lazy", "An indolent summer afternoon."],
    ["ineffable", "adj.", "too great to be expressed in words", "Ineffable joy."],
    ["inexorable", "adj.", "impossible to stop or prevent", "The inexorable rise of sea levels."],
    ["ingenuous", "adj.", "innocent and unsuspecting; naive", "An ingenuous question from a child."],
    ["inimical", "adj.", "tending to obstruct or harm; hostile", "Conditions inimical to growth."],
    ["innocuous", "adj.", "not harmful or offensive", "An innocuous comment."],
    ["insipid", "adj.", "lacking flavour or interest", "An insipid speech."],
    ["intransigent", "adj.", "refusing to change one's views", "Intransigent negotiators."],
    // Day 16
    ["intrepid", "adj.", "fearless; adventurous", "An intrepid explorer."],
    ["inundate", "v.", "to overwhelm with things to deal with; flood", "Inundated with applications."],
    ["inveterate", "adj.", "having a long-standing habit", "An inveterate gambler."],
    ["irascible", "adj.", "easily angered", "An irascible old man."],
    ["itinerant", "adj.", "travelling from place to place", "An itinerant preacher."],
    ["jettison", "v.", "to abandon or discard", "They jettisoned the original plan."],
    ["jocular", "adj.", "fond of or characterised by joking", "A jocular tone."],
    ["juxtapose", "v.", "to place side by side for contrast", "The film juxtaposes wealth and poverty."],
    ["laconic", "adj.", "using very few words", "A laconic reply: 'No.'"],
    ["lament", "v.", "to mourn or express regret", "She lamented the loss of the forest."],
    // Day 17
    ["languid", "adj.", "lacking energy; slow and relaxed", "A languid wave of the hand."],
    ["latent", "adj.", "existing but not yet developed or visible", "Latent talent."],
    ["laudable", "adj.", "deserving praise", "A laudable effort."],
    ["lethargic", "adj.", "sluggish and apathetic", "Feeling lethargic after lunch."],
    ["loquacious", "adj.", "very talkative", "A loquacious guide."],
    ["lucid", "adj.", "expressed clearly; easy to understand", "A lucid explanation."],
    ["magnanimous", "adj.", "generous or forgiving, especially to a rival", "Magnanimous in victory."],
    ["malleable", "adj.", "easily influenced or shaped", "Young minds are malleable."],
    ["maverick", "n.", "an unorthodox or independent-minded person", "A maverick politician."],
    ["mendacious", "adj.", "not telling the truth; lying", "A mendacious witness."],
    // Day 18
    ["mercurial", "adj.", "subject to sudden changes of mood", "A mercurial temperament."],
    ["meticulous", "adj.", "showing great attention to detail", "Meticulous research."],
    ["misanthrope", "n.", "a person who dislikes humankind", "A misanthrope who avoided all company."],
    ["mitigate", "v.", "to make less severe", "Measures to mitigate flood damage."],
    ["mollify", "v.", "to appease the anger of", "A refund mollified the customer."],
    ["mundane", "adj.", "lacking interest; dull; of this world", "Mundane chores."],
    ["munificent", "adj.", "very generous", "A munificent donor."],
    ["myopic", "adj.", "short-sighted; lacking foresight", "A myopic policy."],
    ["nascent", "adj.", "just coming into existence", "A nascent industry."],
    ["nebulous", "adj.", "vague or ill-defined", "Nebulous plans."],
    // Day 19
    ["negate", "v.", "to nullify; make ineffective", "The ruling negated the earlier decision."],
    ["nonchalant", "adj.", "casually calm and relaxed", "A nonchalant shrug."],
    ["novel", "adj.", "new and original", "A novel approach to the problem."],
    ["obdurate", "adj.", "stubbornly refusing to change one's opinion", "An obdurate refusal."],
    ["obfuscate", "v.", "to make obscure or unclear", "Jargon that obfuscates the issue."],
    ["obsequious", "adj.", "excessively eager to please", "An obsequious assistant."],
    ["obstinate", "adj.", "stubbornly adhering to an opinion", "An obstinate child."],
    ["obviate", "v.", "to remove a need or difficulty", "The new road obviates the detour."],
    ["occlude", "v.", "to block or obstruct", "A clot occluded the artery."],
    ["officious", "adj.", "assertive in an annoyingly domineering way", "An officious clerk."],
    // Day 20
    ["onerous", "adj.", "involving a great deal of effort; burdensome", "Onerous duties."],
    ["opaque", "adj.", "not transparent; hard to understand", "An opaque bureaucracy."],
    ["opprobrium", "n.", "harsh criticism or public disgrace", "The scandal brought opprobrium."],
    ["ostentatious", "adj.", "designed to impress; showy", "An ostentatious display of wealth."],
    ["paragon", "n.", "a model of excellence", "A paragon of virtue."],
    ["parsimonious", "adj.", "extremely frugal; stingy", "A parsimonious landlord."],
    ["partisan", "adj.", "prejudiced in favour of a particular cause", "Partisan politics."],
    ["paucity", "n.", "the presence of something in insufficient quantity", "A paucity of evidence."],
    ["pedantic", "adj.", "excessively concerned with minor details or rules", "A pedantic correction."],
    ["pellucid", "adj.", "translucently clear; easily understood", "Pellucid prose."],
    // Day 21
    ["penchant", "n.", "a strong liking for something", "A penchant for puns."],
    ["perfidious", "adj.", "deceitful and untrustworthy", "A perfidious ally."],
    ["perfunctory", "adj.", "carried out with minimum effort", "A perfunctory inspection."],
    ["pernicious", "adj.", "having a harmful effect, especially gradually", "The pernicious effects of rumours."],
    ["petulant", "adj.", "childishly sulky or bad-tempered", "A petulant outburst."],
    ["phlegmatic", "adj.", "having an unemotional, calm disposition", "A phlegmatic response to the crisis."],
    ["pithy", "adj.", "concise and forcefully expressive", "A pithy summary."],
    ["placate", "v.", "to make less angry; pacify", "He tried to placate the critics."],
    ["platitude", "n.", "a trite, overused remark", "Platitudes about hard work."],
    ["plausible", "adj.", "seeming reasonable or probable", "A plausible excuse."],
    // Day 22
    ["polemical", "adj.", "strongly critical or controversial in attack", "A polemical essay."],
    ["pragmatic", "adj.", "dealing with things sensibly and realistically", "A pragmatic approach."],
    ["precarious", "adj.", "not securely held; dangerously likely to fall", "A precarious ledge."],
    ["precipitate", "v.", "to cause to happen suddenly or prematurely", "The crash precipitated a recession."],
    ["preclude", "v.", "to prevent from happening", "Injury precluded his return."],
    ["predilection", "n.", "a preference or special liking", "A predilection for spicy food."],
    ["presumptuous", "adj.", "failing to observe the limits of what is appropriate", "A presumptuous request."],
    ["prevaricate", "v.", "to speak evasively", "Stop prevaricating and answer."],
    ["pristine", "adj.", "in its original condition; unspoiled", "A pristine beach."],
    ["probity", "n.", "complete honesty and integrity", "A judge of unquestioned probity."],
    // Day 23
    ["prodigal", "adj.", "wastefully extravagant", "Prodigal spending."],
    ["profligate", "adj.", "recklessly extravagant or wasteful", "A profligate heir."],
    ["profound", "adj.", "very great or intense; deep", "A profound insight."],
    ["prolific", "adj.", "producing much work or results", "A prolific author."],
    ["propensity", "n.", "an inclination to behave in a particular way", "A propensity for risk."],
    ["propitiate", "v.", "to win or regain favour by pleasing", "Offerings to propitiate the gods."],
    ["prosaic", "adj.", "commonplace; lacking imagination", "A prosaic account of events."],
    ["prudent", "adj.", "acting with care and thought for the future", "A prudent investment."],
    ["puerile", "adj.", "childishly silly", "Puerile humour."],
    ["pugnacious", "adj.", "eager to argue or fight", "A pugnacious debater."],
    // Day 24
    ["quell", "v.", "to put an end to; suppress", "Troops quelled the riot."],
    ["querulous", "adj.", "complaining in a petulant way", "A querulous patient."],
    ["quixotic", "adj.", "exceedingly idealistic; impractical", "A quixotic quest."],
    ["quotidian", "adj.", "ordinary; everyday", "The quotidian routine of office life."],
    ["rancour", "n.", "bitterness or resentment", "He spoke without rancour."],
    ["recalcitrant", "adj.", "stubbornly uncooperative", "A recalcitrant witness."],
    ["recondite", "adj.", "little known; obscure", "Recondite scholarship."],
    ["redundant", "adj.", "not needed; superfluous", "Redundant words clutter the sentence."],
    ["refute", "v.", "to prove to be wrong", "The data refuted the hypothesis."],
    ["relegate", "v.", "to assign to a lower position", "Relegated to a minor role."],
    // Day 25
    ["reproach", "v.", "to express disapproval or disappointment", "She reproached him for his lateness."],
    ["repudiate", "v.", "to refuse to accept; reject", "He repudiated the allegations."],
    ["rescind", "v.", "to revoke or cancel", "The offer was rescinded."],
    ["reticent", "adj.", "not revealing one's thoughts readily", "Reticent about her past."],
    ["reverent", "adj.", "feeling or showing deep respect", "A reverent silence."],
    ["rhetoric", "n.", "persuasive language, sometimes empty", "The speech was all rhetoric."],
    ["sagacious", "adj.", "having keen judgement; wise", "A sagacious adviser."],
    ["salubrious", "adj.", "health-giving; pleasant", "A salubrious climate."],
    ["sanguine", "adj.", "optimistic, especially in a bad situation", "Sanguine about the outcome."],
    ["sardonic", "adj.", "grimly mocking or cynical", "A sardonic smile."],
    // Day 26
    ["scrupulous", "adj.", "diligent and extremely attentive to detail; moral", "Scrupulous honesty."],
    ["soporific", "adj.", "tending to induce sleep", "A soporific lecture."],
    ["specious", "adj.", "superficially plausible but actually wrong", "A specious argument."],
    ["sporadic", "adj.", "occurring at irregular intervals", "Sporadic gunfire."],
    ["spurious", "adj.", "false or fake", "A spurious claim."],
    ["stolid", "adj.", "calm, dependable, showing little emotion", "A stolid guard."],
    ["subversive", "adj.", "seeking to undermine an established system", "Subversive literature."],
    ["succinct", "adj.", "briefly and clearly expressed", "A succinct summary."],
    ["supercilious", "adj.", "behaving as though superior to others", "A supercilious waiter."],
    ["superfluous", "adj.", "unnecessary; more than enough", "Superfluous detail."],
    // Day 27
    ["surreptitious", "adj.", "kept secret, often because improper", "A surreptitious glance."],
    ["sycophant", "n.", "a person who flatters to gain advantage", "Surrounded by sycophants."],
    ["taciturn", "adj.", "reserved; saying little", "A taciturn farmer."],
    ["tenacious", "adj.", "holding firmly; persistent", "A tenacious defender."],
    ["tenuous", "adj.", "very weak or slight", "A tenuous connection."],
    ["timorous", "adj.", "showing nervousness or lack of confidence", "A timorous voice."],
    ["tirade", "n.", "a long angry speech", "A tirade against the referee."],
    ["torpor", "n.", "a state of physical or mental inactivity", "Winter torpor."],
    ["tractable", "adj.", "easy to control or manage", "A tractable problem."],
    ["transient", "adj.", "lasting only a short time", "Transient fame."],
    // Day 28
    ["trenchant", "adj.", "vigorous and incisive in expression", "Trenchant criticism."],
    ["truculent", "adj.", "eager to argue; aggressively defiant", "A truculent teenager."],
    ["ubiquitous", "adj.", "present everywhere", "Smartphones are ubiquitous."],
    ["undermine", "v.", "to weaken gradually", "Rumours undermined his authority."],
    ["unequivocal", "adj.", "leaving no doubt; unambiguous", "An unequivocal yes."],
    ["untenable", "adj.", "not able to be defended", "An untenable position."],
    ["urbane", "adj.", "suave, courteous and refined", "An urbane diplomat."],
    ["vacillate", "v.", "to waver between different opinions", "She vacillated between the two offers."],
    ["venerate", "v.", "to regard with great respect", "Ancestors are venerated."],
    ["veracity", "n.", "conformity to facts; accuracy", "The veracity of the report."],
    // Day 29
    ["verbose", "adj.", "using more words than needed", "A verbose memo."],
    ["vilify", "v.", "to speak or write about in an abusively disparaging way", "The press vilified him."],
    ["vindicate", "v.", "to clear of blame; show to be right", "The verdict vindicated her."],
    ["virulent", "adj.", "extremely severe or harmful; bitterly hostile", "A virulent strain of flu."],
    ["vitiate", "v.", "to spoil or impair the quality of", "Errors vitiated the study."],
    ["vituperate", "v.", "to blame or insult in strong language", "He vituperated against the council."],
    ["volatile", "adj.", "liable to change rapidly and unpredictably", "A volatile market."],
    ["voracious", "adj.", "wanting great quantities; insatiable", "A voracious reader."],
    ["wary", "adj.", "feeling or showing caution", "Wary of strangers."],
    ["whimsical", "adj.", "playfully quaint or fanciful", "A whimsical illustration."],
    // Day 30
    ["zealous", "adj.", "having great energy for a cause", "A zealous reformer."],
    ["abstruse", "adj.", "difficult to understand; obscure", "An abstruse theory."],
    ["acumen", "n.", "the ability to make good judgements quickly", "Business acumen."],
    ["adulterate", "v.", "to make impure by adding inferior substances", "Adulterated milk."],
    ["antithetical", "adj.", "directly opposed", "Views antithetical to ours."],
    ["apocryphal", "adj.", "of doubtful authenticity, though widely circulated", "An apocryphal story."],
    ["blithe", "adj.", "showing a casual and cheerful indifference", "Blithe disregard for the rules."],
    ["calumny", "n.", "the making of false statements to damage a reputation", "Victims of calumny."],
    ["ebullient", "adj.", "cheerful and full of energy", "An ebullient host."],
    ["equanimity", "n.", "calmness and composure under stress", "She faced the news with equanimity."]
  ];
  const vocab = vocabRaw.map((r, i) => ({ id: "v" + (i + 1), word: r[0], pos: r[1], def: r[2], ex: r[3], day: Math.floor(i / 10) + 1 }));

  const roots = [
    { root: "a-, an-", meaning: "without, not", ex: "apathy, anomaly, amoral" },
    { root: "ambi-", meaning: "both", ex: "ambivalent, ambiguous" },
    { root: "ante- / anti-", meaning: "before / against", ex: "antecedent / antipathy" },
    { root: "bene- / mal-", meaning: "good / bad", ex: "benign, benevolent / malleable (exception), malign" },
    { root: "circum-", meaning: "around", ex: "circumspect, circumvent" },
    { root: "cred", meaning: "believe", ex: "credulous, incredible" },
    { root: "dict", meaning: "say", ex: "didactic, edict, contradict" },
    { root: "e-, ex-", meaning: "out", ex: "elicit, exculpate, evanescent" },
    { root: "equi-", meaning: "equal", ex: "equivocal, equanimity" },
    { root: "fid", meaning: "faith", ex: "diffident, perfidious, fidelity" },
    { root: "gen", meaning: "birth, kind", ex: "engender, ingenuous, genre" },
    { root: "gress / grad", meaning: "step", ex: "digress, transgress, gradual" },
    { root: "loqu / locu", meaning: "speak", ex: "loquacious, grandiloquent, eloquent" },
    { root: "luc / lum", meaning: "light", ex: "lucid, elucidate, pellucid" },
    { root: "mis-", meaning: "hate / wrong", ex: "misanthrope, misconstrue" },
    { root: "mut", meaning: "change", ex: "immutable, mutation" },
    { root: "ob-", meaning: "against, in the way", ex: "obdurate, obviate, obstinate" },
    { root: "pac / plac", meaning: "peace / please", ex: "pacify, placate, implacable" },
    { root: "pan-", meaning: "all", ex: "panacea, pandemic" },
    { root: "ped", meaning: "child / foot", ex: "pedantic / impede, expedient" },
    { root: "phil / phob", meaning: "love / fear", ex: "philanthropy / xenophobia" },
    { root: "sanct", meaning: "holy", ex: "sanctimonious, sanction" },
    { root: "spec / spic", meaning: "look", ex: "circumspect, conspicuous, specious" },
    { root: "tac / tic", meaning: "silent", ex: "taciturn, tacit, reticent" },
    { root: "ten", meaning: "hold", ex: "tenacious, untenable, tenuous" },
    { root: "tract", meaning: "pull", ex: "tractable, retract, intractable" },
    { root: "ver", meaning: "true", ex: "veracity, verify, verisimilitude" },
    { root: "vit / viv", meaning: "life", ex: "vitiate (exception), vivacious, revive" },
    { root: "voc / vok", meaning: "call", ex: "equivocal, evoke, vociferous" },
    { root: "vol", meaning: "wish / will", ex: "benevolent, volition, malevolent" }
  ];

  /* ------------------------------------------------------------------ */
  /* VERBAL STRATEGY */
  /* ------------------------------------------------------------------ */
  const verbal = {
    types: [
      { name: "Text Completion", share: "~6 per section", format: "1–3 blanks; 5 choices for one blank, 3 per blank for two or three. No partial credit.",
        steps: [
          "Read the whole sentence before touching the choices.",
          "Find the clue (the phrase the blank must agree with or oppose).",
          "Find the shift or support word: 'although', 'but', 'despite' flip the direction; 'and', 'indeed', ':' keep it.",
          "Predict your own word (even a crude one: 'good', 'bad', 'more').",
          "Match the prediction to the choices. Eliminate, don't shop.",
          "For multi-blank: start with the blank that has the clearest clue, not blank (i)."
        ],
        traps: ["Choices that fit the sentence's topic but not its logic", "Secondary meanings (sanction, qualify, check, flag, want)", "Filling blank (i) first when blank (ii) is the anchor"] },
      { name: "Sentence Equivalence", share: "~4 per section", format: "One blank, six choices; pick exactly two that produce sentences alike in meaning.",
        steps: [
          "Predict a word first, exactly as in Text Completion.",
          "Scan for choices that match the prediction; there are usually 2 — but check both make the sentence mean the same thing.",
          "Verify with the clue: a synonym pair that contradicts the sentence is a decoy.",
          "If stuck, eliminate any choice with no partner, then test remaining pairs."
        ],
        traps: ["Synonym pairs that don't fit the sentence", "Choosing one right word and its antonym", "Spending > 1 min — move on and return"] },
      { name: "Reading Comprehension", share: "~10 per section (short, medium, long, argument)", format: "Multiple choice (one answer), select-all-that-apply, select-in-passage.",
        steps: [
          "Read for structure: what is the author's main point, and what does each paragraph do (claim, evidence, counter, qualification)?",
          "Note the author's attitude toward each idea introduced (approve / skeptical / neutral).",
          "For each question, identify the type: main idea · detail · inference · function · tone · strengthen/weaken.",
          "Go back to the text for detail and inference questions; the right answer is provable, not plausible.",
          "Eliminate extreme answers ('always', 'never', 'completely') unless the passage is extreme.",
          "For select-all: evaluate each option independently; one, two or all three may be correct."
        ],
        traps: ["Answers that are true in the world but not in the passage", "Half-right answers (correct first clause, wrong second)", "Outside knowledge", "Spending 4+ min on one long-passage question"] },
      { name: "Paragraph Argument (Critical Reasoning)", share: "1–2 per section", format: "Short argument + one question: strengthen, weaken, assumption, evaluate, bolded-statement role, paradox.",
        steps: [
          "Find the conclusion (the claim the author wants you to accept).",
          "Find the evidence given.",
          "Name the gap: what must be true for the evidence to support the conclusion?",
          "Strengthen = closes the gap; weaken = widens it; assumption = the gap itself.",
          "Beware answers that address the topic but not the gap."
        ],
        traps: ["Confusing evidence and conclusion", "Answers about the premise's truth instead of the logical link", "Choosing the most dramatic answer"] }
    ],
    pacing: "12 Q in 18 min and 15 Q in 23 min ≈ 1.5 min/question. Target: TC/SE ≤ 1 min, short RC ≤ 2 min/question, long RC ≈ 7 min for the passage + 3–4 questions. Answer everything.",
    reading: "15 minutes a day of dense non-fiction (science, humanities, social science). After each piece, write the author's thesis in one sentence and one thing they'd disagree with."
  };

  /* ------------------------------------------------------------------ */
  /* QUANT CONTENT  — topics, formulas, traps */
  /* ------------------------------------------------------------------ */
  const quant = {
    questionTypes: [
      { name: "Quantitative Comparison", share: "~7–8 per section", how: "Compare Quantity A and B. Answers are always: A greater · B greater · Equal · Cannot be determined. Same four options every time — memorise them.",
        tips: ["Test 0, 1, −1, a fraction, a large number.", "Do the same operation to both quantities (add, subtract, multiply by a positive).", "If quantities are both positive you may square both.", "Figures are NOT to scale unless stated.", "If there are no variables, D is never the answer."] },
      { name: "Multiple Choice (one answer)", share: "~6 per section", how: "Five options, one correct.", tips: ["Back-solve from the answer choices (start with the middle one).", "Plug in easy numbers for variable-heavy problems.", "Estimate when choices are far apart."] },
      { name: "Multiple Choice (one or more answers)", share: "~2 per section", how: "Select all that apply; square check-boxes; no partial credit.", tips: ["Test every option.", "Look for the range the question allows (min/max)."] },
      { name: "Numeric Entry", share: "~2 per section", how: "Type the answer; fractions have two boxes.", tips: ["Round only when told; otherwise enter the exact value.", "Re-read the units and what is asked (x? 2x? percent?).", "Fractions need not be reduced."] },
      { name: "Data Interpretation", share: "3 per section (one set)", how: "Three questions on a graph or table.", tips: ["Read titles, axes, units and footnotes before question 1.", "Percent of total ≠ percent change.", "Estimate from the graph only when the answers are spread out."] }
    ],
    topics: [
      { name: "Arithmetic & Number Properties", color: "blue", weight: "~30%",
        formulas: [
          { k: "Divisibility rules", v: "2: even · 3: digit sum ÷ 3 · 4: last two digits ÷ 4 · 5: ends 0/5 · 6: both 2 and 3 · 8: last three digits ÷ 8 · 9: digit sum ÷ 9 · 10: ends 0" },
          { k: "Primes", v: "2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47. 1 is not prime; 2 is the only even prime." },
          { k: "Number of factors", v: "If n = p^a · q^b · r^c, factors = (a+1)(b+1)(c+1)" },
          { k: "GCD × LCM", v: "GCD(a,b) × LCM(a,b) = a × b" },
          { k: "Remainders", v: "If n = qd + r then 0 ≤ r < d. Remainder of n/d is the same as remainder of (n mod d)." },
          { k: "Units digit cycles", v: "2: 2,4,8,6 · 3: 3,9,7,1 · 4: 4,6 · 7: 7,9,3,1 · 8: 8,4,2,6 · 9: 9,1 · 0,1,5,6: constant" },
          { k: "Even / odd", v: "even ± even = even · odd ± odd = even · even ± odd = odd · even × anything = even · odd × odd = odd" },
          { k: "Percent change", v: "(new − old) / old × 100. Successive +x% then −x% is NOT zero: net = −x²/100 %." },
          { k: "Percent to fraction", v: "12.5% = 1/8 · 16.67% = 1/6 · 33.3% = 1/3 · 37.5% = 3/8 · 62.5% = 5/8 · 83.3% = 5/6" },
          { k: "Ratios", v: "a : b = 3 : 5 means a = 3k, b = 5k. Combine ratios by matching the shared term." },
          { k: "Averages", v: "mean = sum / count, so sum = mean × count (use this to find missing values)" },
          { k: "Absolute value", v: "|x| < a ⇔ −a < x < a · |x| > a ⇔ x < −a or x > a" },
          { k: "Square roots", v: "√x means the non-negative root only. √(x²) = |x|. √2 ≈ 1.41, √3 ≈ 1.73, √5 ≈ 2.24" }
        ] },
      { name: "Algebra", color: "green", weight: "~25%",
        formulas: [
          { k: "Exponent rules", v: "aᵐ·aⁿ = aᵐ⁺ⁿ · aᵐ/aⁿ = aᵐ⁻ⁿ · (aᵐ)ⁿ = aᵐⁿ · a⁰ = 1 · a⁻ⁿ = 1/aⁿ · a^(1/n) = ⁿ√a · (ab)ⁿ = aⁿbⁿ" },
          { k: "Special products", v: "(a+b)² = a² + 2ab + b² · (a−b)² = a² − 2ab + b² · a² − b² = (a+b)(a−b)" },
          { k: "Quadratic formula", v: "x = [−b ± √(b² − 4ac)] / 2a. Sum of roots = −b/a, product = c/a" },
          { k: "Inequalities", v: "Flip the sign when multiplying or dividing by a negative. Never divide by a variable whose sign is unknown." },
          { k: "Linear equation", v: "y = mx + b; slope m = (y₂ − y₁)/(x₂ − x₁). Parallel: same slope. Perpendicular: slopes multiply to −1." },
          { k: "Distance & midpoint", v: "d = √[(x₂−x₁)² + (y₂−y₁)²] · midpoint = ((x₁+x₂)/2, (y₁+y₂)/2)" },
          { k: "Functions", v: "f(g(x)): apply g first. Domain = allowed inputs (no ÷0, no √negative)." },
          { k: "Arithmetic sequence", v: "aₙ = a₁ + (n−1)d · sum = n(a₁ + aₙ)/2" },
          { k: "Geometric sequence", v: "aₙ = a₁ · rⁿ⁻¹" },
          { k: "Sum 1..n", v: "1 + 2 + … + n = n(n+1)/2. Count of integers from a to b inclusive = b − a + 1." },
          { k: "Rate / work", v: "distance = rate × time · work = rate × time · combined rate = 1/a + 1/b (time together = ab/(a+b))" },
          { k: "Average speed", v: "total distance / total time — NEVER the average of the speeds" },
          { k: "Interest", v: "simple: P(1 + rt) · compound: P(1 + r/n)^(nt)" },
          { k: "Mixtures", v: "amount of ingredient before = amount after; set up (concentration × volume) for each part" }
        ] },
      { name: "Geometry", color: "orange", weight: "~15%",
        formulas: [
          { k: "Angles", v: "Straight line 180° · around a point 360° · vertical angles equal · parallel lines: alternate interior angles equal" },
          { k: "Triangle basics", v: "Angles sum 180°. Triangle inequality: |a − b| < c < a + b. Largest side opposite largest angle." },
          { k: "Pythagorean triples", v: "3-4-5, 5-12-13, 8-15-17, 7-24-25 (and multiples)" },
          { k: "Special right triangles", v: "45-45-90: x, x, x√2 · 30-60-90: x, x√3, 2x (short leg opposite 30°)" },
          { k: "Triangle area", v: "½ × base × height · equilateral: (√3/4)s²" },
          { k: "Similar triangles", v: "Corresponding sides in ratio k ⇒ areas in ratio k²" },
          { k: "Quadrilaterals", v: "Rectangle A = lw · square A = s², diagonal = s√2 · parallelogram A = bh · trapezoid A = ½(b₁ + b₂)h" },
          { k: "Polygons", v: "Interior angle sum = (n − 2) × 180° · each interior angle of a regular polygon = that ÷ n · exterior angles sum 360°" },
          { k: "Circle", v: "C = 2πr = πd · A = πr² · arc length = (θ/360) × 2πr · sector area = (θ/360) × πr²" },
          { k: "Circle angles", v: "Inscribed angle = ½ central angle on the same arc. A triangle inscribed in a semicircle is right-angled." },
          { k: "3D solids", v: "Box V = lwh, SA = 2(lw + lh + wh), diagonal = √(l² + w² + h²) · cube V = s³, SA = 6s² · cylinder V = πr²h, SA = 2πr² + 2πrh" },
          { k: "Coordinate circle", v: "(x − h)² + (y − k)² = r²" }
        ] },
      { name: "Data Analysis", color: "purple", weight: "~30%",
        formulas: [
          { k: "Median", v: "Middle value of ordered list (average the two middle values if n is even). Unaffected by outliers." },
          { k: "Mode / range", v: "Mode = most frequent (can be none or several). Range = max − min." },
          { k: "Standard deviation", v: "Measures spread about the mean. Adding a constant to all values: SD unchanged. Multiplying all by k: SD × |k|. Adding values at the mean lowers SD." },
          { k: "Normal distribution", v: "≈ 34% within 1 SD each side of the mean, 14% between 1 and 2 SD, 2% beyond 2 SD. 68–95–99.7 overall." },
          { k: "Quartiles", v: "Q1 = median of lower half, Q3 = median of upper half, IQR = Q3 − Q1. Box plot shows min, Q1, median, Q3, max." },
          { k: "Weighted average", v: "Σ(value × weight) / Σ weight" },
          { k: "Counting principle", v: "If choices are independent, multiply the number of options at each step." },
          { k: "Permutations", v: "Order matters: nPr = n! / (n − r)!. Arrangements of n items = n!" },
          { k: "Combinations", v: "Order doesn't matter: nCr = n! / [r!(n − r)!]. nCr = nC(n−r)." },
          { k: "Arrangements with repeats", v: "n! / (a! b! …) when a items are identical, b identical, etc." },
          { k: "Probability", v: "P = favourable / total · P(A or B) = P(A) + P(B) − P(A and B) · independent: P(A and B) = P(A) × P(B)" },
          { k: "Complement", v: "P(at least one) = 1 − P(none)" },
          { k: "Overlapping sets (2)", v: "Total = A + B − Both + Neither" },
          { k: "Overlapping sets (3)", v: "Total = A + B + C − (exactly-two overlaps) − 2(all three) + Neither" }
        ] }
    ],
    qcTraps: [
      "Assuming a variable is positive — test negatives and zero.",
      "Assuming a variable is an integer — test fractions between 0 and 1.",
      "Trusting the figure — redraw with extreme proportions.",
      "Dividing both quantities by a variable that could be zero or negative.",
      "Picking D because it 'looks complicated' — D needs two different outcomes.",
      "Forgetting that √x² = |x|, not x.",
      "Comparing percent change on different bases (10% of 50 ≠ 10% of 500).",
      "Reading 'x is between 1 and 2' as inclusive when it's not."
    ],
    strategies: [
      "Plug in numbers for variables in the choices; test 2 different sets before committing.",
      "Back-solve from answer choice C (middle) when the question asks for a specific number.",
      "Write a one-line equation before touching the calculator; the calculator is for the last step only.",
      "Estimate aggressively on Data Interpretation when choices differ by >10%.",
      "Mark and move at 2.5 minutes. The last questions in a section are not harder than the first.",
      "Before submitting: re-read the question stem — the GRE loves asking for 2x, x + y, or the percent, not x."
    ]
  };

  /* ------------------------------------------------------------------ */
  /* ANALYTICAL WRITING */
  /* ------------------------------------------------------------------ */
  const awa = {
    format: "One 'Analyze an Issue' task, 30 minutes. You'll see a one- or two-sentence claim and a specific instruction (e.g. 'discuss the extent to which you agree or disagree… and explain how the circumstances in which the statement might or might not hold true shape your position'). Scored 0–6 in half points by a human rater and ETS's e-rater; the two are averaged.",
    scoring: [
      { score: "6 — Outstanding", desc: "Insightful position, compelling and well-chosen examples, logically organised, varied sentences, precise vocabulary, few errors." },
      { score: "5 — Strong", desc: "Clear position, thoughtful development, generally well organised, good control of language with minor flaws." },
      { score: "4 — Adequate", desc: "Competent position, relevant but general examples, adequate organisation, some errors that don't obscure meaning." },
      { score: "3 — Limited", desc: "Vague or weak position, little development, poorly organised, frequent errors." },
      { score: "2 and below", desc: "Seriously flawed: off-topic, no development, or severe errors." }
    ],
    timeline: [
      { t: "0–4 min", step: "Plan: pick a side (a qualified position is fine), list 2–3 specific examples (history, science, business, personal, current events), note one strong counter-point and your response." },
      { t: "4–8 min", step: "Intro: restate the issue in your own words, acknowledge complexity in one sentence, state your thesis with a preview of your reasons." },
      { t: "8–22 min", step: "Body: 2 reason paragraphs (claim → specific example → explain why it supports the claim), then 1 concession paragraph (the strongest objection → why your position still holds or when it doesn't)." },
      { t: "22–26 min", step: "Conclusion: restate thesis in new words; broaden slightly (implications or the condition under which the claim holds)." },
      { t: "26–30 min", step: "Proofread: subject-verb agreement, repeated words, vague pronouns, missing transitions. Fix typos — e-rater notices." }
    ],
    template: [
      { part: "Introduction", text: "The claim that [paraphrase] has obvious appeal: [one sentence conceding what's attractive about it]. However, [thesis: qualified position]. [Preview: Because A and because B, the claim holds only when C.]" },
      { part: "Body 1 — Reason A", text: "First, [claim A]. Consider [specific example with names, dates or details]. In this case, [what happened]. This shows [link example to claim A and to the thesis]." },
      { part: "Body 2 — Reason B", text: "Second, [claim B]. For instance, [second specific example from a different domain]. [Explain]. Taken together with the first case, [why the pattern matters]." },
      { part: "Body 3 — Concession", text: "Admittedly, [strongest counter-argument, stated fairly]. [Example where the claim does hold]. Yet [why that case is limited / the condition under which it holds], so [return to thesis]." },
      { part: "Conclusion", text: "In sum, [thesis restated in fresh words]. While [the claim] may hold when [condition], in most circumstances [your position]; [one sentence on what follows if we accept this]." }
    ],
    tips: [
      "Length correlates with score: aim for 500–650 words in 5 paragraphs.",
      "Specific beats general: 'Kodak's refusal to pivot to digital in the 1990s' beats 'many companies fail to adapt'.",
      "Address the specific instruction (e.g. 'the circumstances in which…'); essays that ignore it cap at 4.",
      "Keep examples ready: pre-build a bank of 8–10 examples (a scientist, an inventor, a company, a historical turning point, a social movement, a personal project) that fit many prompts.",
      "Vary sentence openings; use transitions (moreover, admittedly, by contrast, consequently).",
      "Do not memorise an essay. Memorise a structure and an example bank."
    ],
    practicePrompts: [
      "Governments should place few, if any, restrictions on scientific research and development. — Discuss the extent to which you agree or disagree and explain the circumstances in which the statement might or might not hold true.",
      "The best way to teach is to praise positive actions and ignore negative ones. — Discuss the extent to which you agree or disagree, addressing the most compelling reasons someone might hold the opposite view.",
      "In any field, the most important innovations come from people who are outsiders to that field. — Discuss your view, with reasons and examples.",
      "Universities should require every student to take courses outside the student's field of study. — Discuss the extent to which you agree or disagree and explain your reasoning.",
      "A nation should require all its students to study the same national curriculum until they enter college. — Discuss your position, including the circumstances in which adopting the policy would or would not be advantageous.",
      "Technology, while it makes our lives easier, has reduced our ability to think for ourselves. — Discuss the extent to which you agree or disagree."
    ],
    note: "The real pool is public (ETS Issue pool). All five practice essays in the plan should use real pool prompts; the practice prompts listed here are for warm-up outlining only."
  };

  /* ------------------------------------------------------------------ */
  /* TEST-DAY CHECKLIST & STRATEGY */
  /* ------------------------------------------------------------------ */
  const testDay = {
    checklist: [
      { id: "td1", text: "Valid ID whose name matches your ETS registration exactly (passport for most countries outside the US)." },
      { id: "td2", text: "Admission confirmation email / ticket (printed or on phone for the check-in desk)." },
      { id: "td3", text: "Know the test-centre route, parking and arrival time (30 min early). At-home: room check, whiteboard, webcam, ProctorU/ETS software tested." },
      { id: "td4", text: "Water and a snack for before the test (there is no scheduled break in the shorter GRE)." },
      { id: "td5", text: "Decide your score-send list in advance (4 free recipients at the test centre)." },
      { id: "td6", text: "Sleep 7–8 hours for the two nights before, not just one." },
      { id: "td7", text: "Pacing checkpoints memorised: Verbal 12 Q — by 9 min be at Q6; Verbal 15 Q — by 11 min be at Q8; Quant 12 Q — by 10 min be at Q6; Quant 15 Q — by 13 min be at Q8." },
      { id: "td8", text: "Scratch paper plan: write the four QC options and your pacing checkpoints at the top before the section starts." }
    ],
    mindset: [
      "The first section's difficulty sets the second's — do your best on Section 1, but one hard section doesn't mean you're failing; harder second sections mean you did well.",
      "Never leave a question blank. Mark, guess, move on, return.",
      "A question you don't recognise is a question most people don't recognise. Pick the simplest approach and keep moving.",
      "After the test you can cancel or report scores; with ScoreSelect you choose what schools see, so report unless it's a disaster."
    ]
  };

  return { exam, phases, resources, mocks, days, vocab, roots, verbal, quant, awa, testDay };
})();
