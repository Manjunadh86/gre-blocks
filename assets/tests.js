/* GRE Blocks — built-in full-length practice tests.
   Original questions written for this dashboard (not ETS material).
   Exposed as window.GRE_TESTS.

   Question kinds
     tc   Text Completion   { text with ___(i)___ markers, blanks: [[3 choices]...] (5 choices if single blank), answer: [index per blank] }
     se   Sentence Equivalence { text with ______, choices: [6], answer: [i, j] }
     rc   Reading Comprehension / Paragraph Argument { passage: id, text (question), choices, answer: [..], multi: bool }
     qc   Quantitative Comparison { given?, a, b, answer: 0..3 (A greater, B greater, Equal, Cannot be determined) }
     mc   Multiple choice, one answer { text, choices, answer: [i] }
     mcm  Multiple choice, one or more answers { text, choices, answer: [i, j, ...] }
     ne   Numeric entry { text, answer: number, tol?: absolute tolerance (default 0.01), unit? }
     Any quant question may carry data: id → section.data[id] (table or bar chart) for Data Interpretation sets.
   Scaled-score conversion is an approximation of ETS tables for the 27-question sections; treat results as estimates. */
window.GRE_TESTS = (function () {

  const conversion = {
    // index = raw correct out of 27
    verbal: [130, 131, 132, 134, 136, 138, 140, 141, 143, 144, 146, 147, 149, 150, 151, 152, 153, 154, 156, 157, 159, 160, 162, 164, 166, 168, 170, 170],
    quant:  [130, 131, 133, 135, 137, 139, 141, 142, 144, 145, 147, 148, 149, 150, 151, 153, 154, 155, 156, 158, 159, 160, 162, 163, 165, 167, 169, 170]
  };

  const awaInstructionAgree = "Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take. In developing and supporting your position, you should consider ways in which the statement might or might not hold true and explain how these considerations shape your position.";
  const awaInstructionPolicy = "Write a response in which you discuss your views on the policy and explain your reasoning for the position you take. In developing and supporting your position, you should consider the possible consequences of implementing the policy and explain how these consequences shape your position.";

  const awaSelfScore = [
    { id: "pos", text: "Takes a clear, qualified position that answers the specific instruction (not just the statement)." },
    { id: "ex", text: "Uses at least two specific, concrete examples (names, events, details), each explained back to the thesis." },
    { id: "con", text: "Addresses the strongest counter-argument or the circumstances in which the claim fails." },
    { id: "org", text: "Clear paragraph structure with an introduction, body paragraphs and a conclusion; transitions between ideas." },
    { id: "len", text: "At least 450 words, ideally 500–650." },
    { id: "lang", text: "Varied sentence structure and precise vocabulary; few grammar or spelling errors." }
  ];
  // checked count → suggested band
  const awaBands = { 6: "5.5–6", 5: "5", 4: "4–4.5", 3: "3.5", 2: "3", 1: "2", 0: "1–2" };

  /* ================================================================== */
  /* TEST 1 */
  /* ================================================================== */
  const test1 = {
    id: "t1", name: "Full-Length Test 1", blurb: "Medium difficulty, mirrors the real section order and timing.",
    sections: [
      { id: "t1-awa", type: "awa", title: "Analytical Writing — Analyze an Issue", time: 30,
        prompt: "The most effective leaders are those who are willing to change their positions when presented with new evidence, even at the cost of appearing inconsistent.",
        instruction: awaInstructionAgree },

      /* ---------------- Verbal 1: 12 questions / 18 min ---------------- */
      { id: "t1-v1", type: "verbal", n: 1, title: "Verbal Reasoning — Section 1", time: 18,
        passages: {
          p1: "The conventional explanation for the decline of the North Atlantic cod fishery in the early 1990s emphasizes overfishing by industrial trawlers. Yet this account, while not wrong, is incomplete. Water temperatures off Newfoundland fell sharply in the late 1980s, slowing cod growth and pushing spawning stocks into areas where they were more easily caught. Moreover, fisheries managers relied on catch-per-unit-effort data that remained high even as the population collapsed, because the remaining fish were concentrated in ever-smaller areas. The collapse, then, was the product of an ecological shift that masked the effects of fishing pressure until it was too late to respond.",
          p2: "A city council member argues that the new bike-lane network has failed because the number of cyclists counted on the three busiest downtown streets has not increased since the lanes were installed. The member recommends removing the lanes to restore parking.",
          p3: "It was long assumed that silent reading was virtually unknown in antiquity, a view resting heavily on a famous passage in which Augustine expresses surprise at seeing Ambrose read without moving his lips. Recent scholarship has challenged this inference. References to silent reading appear in Greek drama of the fifth century BCE, and ancient medical writers recommend it as a gentler exercise than reading aloud. What Augustine likely found remarkable was not the practice itself but Ambrose's choice to read silently in the presence of visitors, when the social convention called for reading aloud as a shared activity. The older view, then, mistook a comment about etiquette for a comment about cognition. The episode illustrates a broader hazard in intellectual history: a single vivid anecdote, repeated often enough, can come to stand in for evidence it never actually provided."
        },
        questions: [
          { id: "t1v1q1", kind: "tc", text: "Far from being the ___(i)___ figure portrayed in popular biographies, the composer was by all contemporary accounts gregarious and quick to laugh.",
            blanks: [["reclusive", "celebrated", "prolific", "mercurial", "erudite"]], answer: [0],
            expl: "'Far from being' signals contrast with 'gregarious and quick to laugh', so the blank must mean the opposite of sociable: reclusive." },
          { id: "t1v1q2", kind: "tc", text: "The committee's report was ___(i)___ in its praise of the new curriculum, yet its recommendations were so ___(ii)___ that administrators were unsure what, if anything, they were expected to change.",
            blanks: [["grudging", "effusive", "measured"], ["nebulous", "draconian", "specific"]], answer: [1, 0],
            expl: "'Yet' contrasts strong praise with unhelpful recommendations. Praise that is 'effusive' (lavish) contrasts with recommendations so 'nebulous' (vague) that no one knows what to do." },
          { id: "t1v1q3", kind: "tc", text: "Because the manuscript had been ___(i)___ by generations of copyists, each of whom introduced small errors, scholars regard even the earliest surviving version as ___(ii)___ reflection of the original.",
            blanks: [["transcribed", "authenticated", "suppressed"], ["an imperfect", "a faithful", "an authoritative"]], answer: [0, 0],
            expl: "Copyists transcribe; accumulated errors make the surviving text an imperfect reflection of the original." },
          { id: "t1v1q4", kind: "tc", text: "The historian's ___(i)___ for archival detail is admirable, but it occasionally ___(ii)___ her argument: readers must wade through pages of ___(iii)___ before the significance of any single document becomes clear.",
            blanks: [["disdain", "appetite", "substitute"], ["clarifies", "buttresses", "obscures"], ["minutiae", "synthesis", "polemic"]], answer: [1, 2, 0],
            expl: "'Admirable, but' sets up a downside. An 'appetite' for detail that readers must 'wade through' 'obscures' the argument; what they wade through is 'minutiae' (trivial details)." },
          { id: "t1v1q5", kind: "se", text: "Although the two economists reached the same conclusion, their methods were so ______ that neither could fully evaluate the other's work.",
            choices: ["disparate", "rigorous", "divergent", "conventional", "meticulous", "flawed"], answer: [0, 2],
            expl: "Same conclusion 'although' methods were very different: disparate / divergent. 'Rigorous' and 'meticulous' are a pair but don't explain why neither could evaluate the other." },
          { id: "t1v1q6", kind: "se", text: "The senator's response to the scandal was studiously ______: she neither denied the allegations nor confirmed them.",
            choices: ["forthright", "equivocal", "indignant", "noncommittal", "candid", "belligerent"], answer: [1, 3],
            expl: "Neither denying nor confirming is deliberately ambiguous: equivocal / noncommittal. 'Forthright' and 'candid' are the opposite." },
          { id: "t1v1q7", kind: "se", text: "Critics who dismissed the early experiments as mere curiosities failed to anticipate how ______ their consequences would prove.",
            choices: ["trivial", "far-reaching", "ephemeral", "profound", "controversial", "predictable"], answer: [1, 3],
            expl: "'Mere curiosities' versus what they 'failed to anticipate' — consequences that were far-reaching / profound." },
          { id: "t1v1q8", kind: "rc", passage: "p1", text: "The primary purpose of the passage is to",
            choices: ["refute the claim that overfishing contributed to the collapse of the cod fishery", "argue that a widely accepted explanation omits important factors", "propose a new method for estimating fish populations", "criticize fisheries managers for ignoring temperature data", "compare the cod fishery with other collapsed fisheries"], answer: [1],
            expl: "The passage calls the conventional account 'not wrong, [but] incomplete' and supplies the missing ecological factors. (A) is too strong — the author accepts that overfishing mattered." },
          { id: "t1v1q9", kind: "rc", passage: "p1", text: "According to the passage, catch-per-unit-effort data were misleading because",
            choices: ["trawlers underreported their catches", "the remaining fish were concentrated in smaller areas, keeping catch rates high", "cold water increased cod growth rates", "managers used outdated equipment", "spawning stocks moved into deeper water"], answer: [1],
            expl: "Directly stated: the data 'remained high… because the remaining fish were concentrated in ever-smaller areas'." },
          { id: "t1v1q10", kind: "rc", passage: "p2", text: "Which of the following, if true, most seriously weakens the council member's argument?",
            choices: ["Bike lanes cost less to maintain than parking spaces.", "The three busiest streets were deliberately excluded from the new network, which routed lanes along quieter parallel streets.", "Surveys show that most residents support the bike lanes.", "Cyclist counts were taken during the same month each year.", "Parking revenue has declined since the lanes were installed."], answer: [1],
            expl: "The argument measures success on streets that have no lanes. If the lanes are elsewhere, counts on those three streets say nothing about the network. (D) strengthens the data's reliability; (A), (C), (E) don't address the inference." },
          { id: "t1v1q11", kind: "rc", passage: "p3", text: "The author mentions Greek drama and ancient medical writers primarily in order to",
            choices: ["show that silent reading was considered unhealthy", "provide evidence that silent reading was practiced well before Augustine", "explain why Ambrose preferred reading silently", "suggest that Augustine was unfamiliar with Greek literature", "contrast literary and medical attitudes toward reading"], answer: [1],
            expl: "Both references are offered as 'recent scholarship' challenging the inference that silent reading was unknown — i.e., evidence it existed earlier." },
          { id: "t1v1q12", kind: "rc", passage: "p3", text: "It can be inferred that the author regards the 'older view' as",
            choices: ["a deliberate distortion by later scholars", "correct about cognition but wrong about etiquette", "an overgeneralization drawn from a misread anecdote", "supported by evidence from Greek drama", "unverifiable given the available sources"], answer: [2],
            expl: "The older view 'mistook a comment about etiquette for a comment about cognition' and rested on 'a single vivid anecdote' — a misread anecdote generalized too far. Nothing suggests deliberate distortion." }
        ] },

      /* ---------------- Verbal 2: 15 questions / 23 min ---------------- */
      { id: "t1-v2", type: "verbal", n: 2, title: "Verbal Reasoning — Section 2", time: 23,
        passages: {
          p1: "For decades, reports that plants respond to chemical signals emitted by damaged neighbors were greeted with skepticism, in part because early studies were conducted in sealed chambers where concentrations of airborne compounds far exceeded anything found in the field. Critics argued that the phenomenon, even if real in the laboratory, was ecologically irrelevant. Field experiments over the past twenty years have narrowed this objection considerably. Sagebrush clipped to simulate herbivore damage releases volatile compounds that induce chemical defenses in neighboring sagebrush and even in unrelated species such as wild tobacco, and plants exposed to these cues suffer measurably less leaf damage over a growing season than unexposed controls.\n\nWhat remains contested is how to interpret such findings. Describing the exchange as 'communication' implies that emitting plants benefit from being overheard, yet the emitter gains nothing obvious from warning a competitor. Some researchers therefore propose that the volatiles function primarily as internal signals—a way for a damaged plant to alert its own distant branches—and that neighbors merely eavesdrop. Others note that neighboring plants are often close relatives, so that a warning which benefits them indirectly benefits the emitter's genes. The debate matters beyond semantics: if eavesdropping is the rule, agricultural applications might focus on engineering crops to be better listeners rather than louder talkers.",
          p2: "Museum labels routinely describe medieval sculpture as having been 'originally painted,' as though polychromy were a finishing touch applied to a completed work. Surviving contracts suggest otherwise. Sculptors and painters were frequently paid comparable sums, and in some cases the painter's fee exceeded the carver's. Documents also show that the painter was sometimes commissioned first and selected the sculptor. These arrangements imply that patrons conceived of the finished object as a painted one from the outset, and that the bare stone or wood we now admire would have struck its first viewers as unfinished.",
          p3: "Over the past five years, the proportion of the town's households that compost food waste has doubled, yet the total weight of food waste collected by the municipal landfill has not decreased. Therefore, the composting program has had no effect on the amount of food waste sent to landfill."
        },
        questions: [
          { id: "t1v2q1", kind: "tc", text: "The documentary's refusal to ___(i)___ its subject—presenting his cruelties alongside his achievements—struck some viewers as evenhanded and others as evasive.",
            blanks: [["humanize", "lionize", "scrutinize", "contextualize", "chronicle"]], answer: [1],
            expl: "Presenting cruelties alongside achievements is a refusal to glorify: lionize." },
          { id: "t1v2q2", kind: "tc", text: "Although the novel's plot is ___(i)___, its sentences are so finely wrought that many readers forgive the lack of incident.",
            blanks: [["labyrinthine", "slight", "harrowing", "derivative", "implausible"]], answer: [1],
            expl: "'Lack of incident' tells you the plot is thin: slight. 'Labyrinthine' would mean the opposite." },
          { id: "t1v2q3", kind: "tc", text: "The theory enjoyed ___(i)___ popularity in the 1970s, but as its predictions repeatedly failed to materialize, even its early champions became ___(ii)___.",
            blanks: [["considerable", "negligible", "belated"], ["skeptics", "apologists", "zealots"]], answer: [0, 0],
            expl: "'But' contrasts early popularity with later failure: considerable popularity, then even champions became skeptics." },
          { id: "t1v2q4", kind: "tc", text: "Unlike many reformers, who treat tradition as an obstacle to be ___(i)___, she regarded inherited practices as a resource to be ___(ii)___ selectively.",
            blanks: [["venerated", "dismantled", "codified"], ["discarded", "mined", "ignored"]], answer: [1, 1],
            expl: "An obstacle is 'dismantled'; a resource is 'mined' (drawn upon) selectively. The 'unlike' sets up the contrast." },
          { id: "t1v2q5", kind: "tc", text: "The paradox of the expedition's journals is that their very ___(i)___—the daily record of temperatures, rations, and distances—makes them ___(ii)___ to read, even as it renders them ___(iii)___ to historians reconstructing the final weeks.",
            blanks: [["brevity", "thoroughness", "eloquence"], ["tedious", "thrilling", "impossible"], ["invaluable", "irrelevant", "suspect"]], answer: [1, 0, 0],
            expl: "The dash defines blank (i): a daily record of everything = thoroughness. The paradox: the same quality makes them tedious to read yet invaluable to historians." },
          { id: "t1v2q6", kind: "se", text: "The engineer's proposal was ______ by colleagues who considered it too ambitious to be completed on schedule.",
            choices: ["endorsed", "dismissed", "rejected", "scrutinized", "amended", "lauded"], answer: [1, 2],
            expl: "Colleagues who thought it unachievable would dismiss / reject it." },
          { id: "t1v2q7", kind: "se", text: "Her prose is so ______ that a reader can finish a chapter without noticing a single stylistic flourish.",
            choices: ["ornate", "unobtrusive", "turgid", "self-effacing", "pedantic", "florid"], answer: [1, 3],
            expl: "Prose that goes unnoticed is unobtrusive / self-effacing. 'Ornate' and 'florid' are a decoy pair meaning the opposite." },
          { id: "t1v2q8", kind: "se", text: "The treaty, hailed at its signing as a permanent settlement, proved ______; within a decade the border was again contested.",
            choices: ["durable", "transitory", "equitable", "ephemeral", "contentious", "binding"], answer: [1, 3],
            expl: "Hailed as permanent but contested within a decade: transitory / ephemeral." },
          { id: "t1v2q9", kind: "se", text: "Rather than ______ the objections of the review board, the director addressed each one in a detailed written response.",
            choices: ["anticipating", "brushing aside", "cataloguing", "dismissing", "conceding", "soliciting"], answer: [1, 3],
            expl: "'Rather than' contrasts with addressing each in detail: brushing aside / dismissing." },
          { id: "t1v2q10", kind: "rc", passage: "p1", text: "The primary purpose of the passage is to",
            choices: ["argue that plant communication is a laboratory artifact", "trace how evidence for a phenomenon accumulated and outline a remaining interpretive dispute", "advocate engineering crops that emit stronger chemical signals", "explain why sagebrush and wild tobacco share defensive chemistry", "criticize field researchers for neglecting laboratory controls"], answer: [1],
            expl: "Paragraph 1 describes evidence overcoming skepticism; paragraph 2 lays out the unresolved interpretation. (C) reverses the passage's suggestion (better listeners, not louder talkers)." },
          { id: "t1v2q11", kind: "rc", passage: "p1", text: "The author mentions wild tobacco primarily in order to",
            choices: ["show that the response is not limited to plants of the same species", "illustrate the limits of laboratory studies", "identify the crop most likely to benefit from agricultural applications", "suggest that unrelated species compete for the same herbivores", "question whether sagebrush volatiles are ecologically relevant"], answer: [0],
            expl: "'And even in unrelated species such as wild tobacco' — the point is that the effect crosses species." },
          { id: "t1v2q12", kind: "rc", passage: "p1", multi: true, text: "The passage suggests which of the following about the 'eavesdropping' interpretation? Indicate all that apply.",
            choices: ["It does not require that the emitting plant benefit from a neighbor's response.", "It is incompatible with the observation that neighboring plants are often close relatives.", "It has implications for how agricultural research might be directed."], answer: [0, 2],
            expl: "Eavesdropping treats volatiles as internal signals, so no benefit to the emitter is needed (A). The last sentence draws an agricultural implication (C). The kin observation is presented as an alternative view, not as incompatible with eavesdropping (B is unsupported)." },
          { id: "t1v2q13", kind: "rc", passage: "p2", text: "The author cites the relative fees paid to painters and sculptors in order to",
            choices: ["show that painters were more highly skilled than sculptors", "challenge the assumption that painting was a secondary step", "explain why so little medieval polychromy survives", "argue that museums should repaint medieval sculpture", "demonstrate that medieval contracts were rarely honored"], answer: [1],
            expl: "The fees are evidence against treating paint as 'a finishing touch' — i.e., against the assumption that painting was secondary." },
          { id: "t1v2q14", kind: "rc", passage: "p2", text: "The passage implies that modern viewers of unpainted medieval sculpture",
            choices: ["generally prefer it to the painted original", "are seeing the object in a state its makers did not intend as final", "are unaware that painters were involved in its production", "value it chiefly as documentary evidence", "often misattribute it to the wrong sculptor"], answer: [1],
            expl: "The bare stone 'would have struck its first viewers as unfinished' — not the intended final state." },
          { id: "t1v2q15", kind: "rc", passage: "p3", text: "Which of the following, if true, most seriously weakens the argument?",
            choices: ["The town's population has grown substantially over the past five years.", "Households that compost also recycle more paper than other households.", "The landfill weighs food waste separately from other kinds of waste.", "Participation in the composting program is voluntary.", "Some composted material is later sold as fertilizer."], answer: [0],
            expl: "If the population grew, total food waste would have risen without the program; a flat total therefore means the program did reduce waste per household. The conclusion ('no effect') is undermined." }
        ] },

      /* ---------------- Quant 1: 12 questions / 21 min ---------------- */
      { id: "t1-q1", type: "quant", n: 1, title: "Quantitative Reasoning — Section 1", time: 21,
        data: {
          d1: { kind: "table", title: "Monthly sales (units) at Store P and Store Q, January–May",
                head: ["Month", "Store P", "Store Q"],
                rows: [["Jan", 120, 100], ["Feb", 150, 100], ["Mar", 90, 150], ["Apr", 180, 120], ["May", 210, 180]] }
        },
        questions: [
          { id: "t1q1q1", kind: "qc", given: "x > 0", a: "x²", b: "x", answer: 3,
            expl: "If x = 2, x² = 4 > x. If x = ½, x² = ¼ < x. Different outcomes, so the relationship cannot be determined." },
          { id: "t1q1q2", kind: "qc", a: "15% of 80", b: "80% of 15", answer: 2,
            expl: "Both equal 12 (a% of b = b% of a)." },
          { id: "t1q1q3", kind: "qc", given: "The average (arithmetic mean) of 3, 7 and k is 9.", a: "k", b: "16", answer: 0,
            expl: "Sum = 27, so k = 27 − 10 = 17 > 16." },
          { id: "t1q1q4", kind: "qc", given: "A triangle has sides of length 5, 12 and x, where x is an integer.", a: "x", b: "8", answer: 3,
            expl: "Triangle inequality: 7 < x < 17, so x can be 8 (equal) or 9–16 (greater). Cannot be determined." },
          { id: "t1q1q5", kind: "qc", given: "n is a positive integer.", a: "The remainder when 7n + 3 is divided by 7", b: "2", answer: 0,
            expl: "7n is divisible by 7, so the remainder is always 3 > 2." },
          { id: "t1q1q6", kind: "mc", text: "If 3x − 7 = 2x + 5, what is the value of x + 4?", choices: ["12", "14", "16", "18", "20"], answer: [2],
            expl: "3x − 7 = 2x + 5 ⇒ x = 12 ⇒ x + 4 = 16. (Trap: answering x itself.)" },
          { id: "t1q1q7", kind: "mc", text: "A shirt is discounted by 20%, and the sale price is then reduced by a further 25%. The final price is what percent of the original price?", choices: ["45%", "55%", "60%", "65%", "70%"], answer: [2],
            expl: "0.80 × 0.75 = 0.60 → 60%. Successive percents multiply; they don't add to 45%." },
          { id: "t1q1q8", kind: "mc", text: "If the median of five consecutive even integers is 12, what is their sum?", choices: ["48", "56", "60", "64", "72"], answer: [2],
            expl: "The integers are 8, 10, 12, 14, 16; sum = 5 × median = 60." },
          { id: "t1q1q9", kind: "mcm", text: "Which of the following integers are divisible by both 4 and 6? Indicate all such integers.", choices: ["12", "18", "24", "30", "36", "44"], answer: [0, 2, 4],
            expl: "Divisible by both 4 and 6 means divisible by LCM(4, 6) = 12: 12, 24, 36." },
          { id: "t1q1q10", kind: "ne", text: "A rectangle has a perimeter of 30 and a length of 9. What is its area?", answer: 54,
            expl: "2(9 + w) = 30 ⇒ w = 6 ⇒ area = 9 × 6 = 54." },
          { id: "t1q1q11", kind: "mc", data: "d1", text: "For how many of the five months were Store Q's sales greater than Store P's sales?", choices: ["0", "1", "2", "3", "4"], answer: [1],
            expl: "Only March (150 > 90)." },
          { id: "t1q1q12", kind: "mc", data: "d1", text: "Store P's total sales for the five months are approximately what percent greater than Store Q's total sales?", choices: ["13.3%", "15.4%", "18.2%", "20%", "25%"], answer: [1],
            expl: "P total = 750, Q total = 650. (750 − 650)/650 ≈ 15.4%. (13.3% is the percent *less* computed on P's base — the classic base trap.)" }
        ] },

      /* ---------------- Quant 2: 15 questions / 26 min ---------------- */
      { id: "t1-q2", type: "quant", n: 2, title: "Quantitative Reasoning — Section 2", time: 26,
        data: {
          d1: { kind: "bar", title: "Number of employees by department, Company X, 2024", unit: "employees",
                bars: [["Sales", 60], ["Engineering", 90], ["Support", 45], ["Marketing", 30], ["Finance", 25]] }
        },
        questions: [
          { id: "t1q2q1", kind: "qc", given: "x < 0 < y", a: "x − y", b: "y − x", answer: 1,
            expl: "x − y is negative (negative minus positive); y − x is positive. B is greater." },
          { id: "t1q2q2", kind: "qc", given: "A circle has area 36π.", a: "The circumference of the circle", b: "12π", answer: 2,
            expl: "πr² = 36π ⇒ r = 6 ⇒ circumference = 2π(6) = 12π. Equal." },
          { id: "t1q2q3", kind: "qc", given: "a and b are positive integers and ab = 36.", a: "a + b", b: "13", answer: 3,
            expl: "(4, 9) gives 13; (6, 6) gives 12; (1, 36) gives 37. Cannot be determined." },
          { id: "t1q2q4", kind: "qc", given: "0 < p < 1", a: "p³", b: "p²", answer: 1,
            expl: "For a fraction between 0 and 1, higher powers are smaller: p³ < p². B is greater." },
          { id: "t1q2q5", kind: "qc", given: "A number is chosen at random from the set {1, 2, 3, 4, 5, 6, 7}.", a: "The probability that the number is prime", b: "1/2", answer: 0,
            expl: "Primes in the set: 2, 3, 5, 7 → 4/7 > 1/2. (1 is not prime.)" },
          { id: "t1q2q6", kind: "qc", given: "A rectangular box has dimensions 3, 4 and 12.", a: "The length of the longest diagonal of the box", b: "13", answer: 2,
            expl: "√(3² + 4² + 12²) = √169 = 13. Equal." },
          { id: "t1q2q7", kind: "mc", text: "If x² − 5x + 6 = 0, what is the sum of all possible values of x?", choices: ["−5", "−1", "1", "5", "6"], answer: [3],
            expl: "(x − 2)(x − 3) = 0 ⇒ x = 2 or 3; sum = 5 (= −b/a)." },
          { id: "t1q2q8", kind: "mc", text: "A train travels 120 miles from town A to town B at 40 miles per hour and returns along the same route at 60 miles per hour. What is the train's average speed, in miles per hour, for the round trip?", choices: ["45", "48", "50", "52", "55"], answer: [1],
            expl: "Time out = 3 h, back = 2 h; 240 miles / 5 h = 48 mph. Never average the speeds." },
          { id: "t1q2q9", kind: "mc", text: "In a class, the ratio of boys to girls is 3 to 5. If there are 25 girls, how many students are in the class?", choices: ["32", "36", "40", "45", "48"], answer: [2],
            expl: "5k = 25 ⇒ k = 5 ⇒ boys = 15 ⇒ total = 40." },
          { id: "t1q2q10", kind: "mc", text: "Working alone, machine A fills a tank in 6 hours and machine B fills the same tank in 3 hours. Working together at their constant rates, how many hours do they take to fill the tank?", choices: ["1.5", "2", "2.5", "3", "4.5"], answer: [1],
            expl: "Rates: 1/6 + 1/3 = 1/2 tank per hour ⇒ 2 hours." },
          { id: "t1q2q11", kind: "mcm", text: "Which of the following values of x satisfy |2x − 3| ≤ 5? Indicate all such values.", choices: ["−1", "0", "2", "4", "5"], answer: [0, 1, 2, 3],
            expl: "−5 ≤ 2x − 3 ≤ 5 ⇒ −1 ≤ x ≤ 4. So −1, 0, 2 and 4 work; 5 does not." },
          { id: "t1q2q12", kind: "ne", text: "Five people are to be seated in a row of five chairs. In how many different arrangements are two particular people, R and S, seated next to each other?", answer: 48,
            expl: "Treat R and S as one unit: 4! = 24 arrangements of the units, × 2 for the order of R and S = 48." },
          { id: "t1q2q13", kind: "mc", data: "d1", text: "Engineering employees are what percent of the total number of employees at Company X?", choices: ["30%", "32%", "36%", "40%", "45%"], answer: [2],
            expl: "Total = 60 + 90 + 45 + 30 + 25 = 250; 90/250 = 36%." },
          { id: "t1q2q14", kind: "mc", data: "d1", text: "If 20% of the Sales employees and 10% of the Engineering employees are managers, how many managers are there in these two departments combined?", choices: ["15", "18", "21", "24", "27"], answer: [2],
            expl: "0.20 × 60 = 12; 0.10 × 90 = 9; total 21." },
          { id: "t1q2q15", kind: "mc", data: "d1", text: "What is the ratio of the number of Support employees to the number of Marketing employees?", choices: ["2 : 3", "3 : 2", "4 : 3", "5 : 3", "9 : 5"], answer: [1],
            expl: "45 : 30 = 3 : 2." }
        ] }
    ]
  };

  /* ================================================================== */
  /* TEST 2 */
  /* ================================================================== */
  const test2 = {
    id: "t2", name: "Full-Length Test 2", blurb: "Slightly harder second section in each measure. Take it under exam-day conditions.",
    sections: [
      { id: "t2-awa", type: "awa", title: "Analytical Writing — Analyze an Issue", time: 30,
        prompt: "Cities should devote public funds to preserving historic buildings rather than constructing new ones.",
        instruction: awaInstructionPolicy },

      /* ---------------- Verbal 1: 12 / 18 ---------------- */
      { id: "t2-v1", type: "verbal", n: 1, title: "Verbal Reasoning — Section 1", time: 18,
        passages: {
          p1: "Roman marine concrete has survived two millennia of pounding seawater, outlasting modern formulations that crumble within decades. Analysis of harbor structures reveals why: seawater percolating through the material dissolves components of the volcanic ash the Romans used, and the resulting solution crystallizes into rare, interlocking minerals that fill cracks as they form. In other words, the concrete grows stronger precisely because of the exposure that degrades its modern counterparts. Reproducing the effect, however, has proved difficult. The Romans relied on a specific ash from the Bay of Naples, and the chemistry that strengthens their concrete also makes it slow to cure—a property incompatible with construction schedules that measure delays in days.",
          p2: "A study found that employees who take a brief walk at lunchtime report higher afternoon productivity than those who do not. The company therefore plans to require all employees to walk at lunch, expecting productivity to rise.",
          p3: "Linguists estimate that roughly half of the world's languages will cease to be spoken by the end of the century. Efforts to document them have expanded accordingly, but documentation and revitalization are distinct goals that can pull in different directions. A grammar and dictionary compiled by outside researchers preserves a language for scholarship; it does not, by itself, produce new speakers. Communities seeking to revive a language often need something else entirely—teaching materials pitched at children, recordings of ordinary conversation rather than elicited word lists, and above all the time of fluent elders, whose availability is the scarcest resource of all. When a documentation project monopolizes those elders for the benefit of an archive, it may hasten the very loss it was meant to forestall."
        },
        questions: [
          { id: "t2v1q1", kind: "tc", text: "The lecturer's habit of ___(i)___ on tangential matters left students struggling to identify the central argument.",
            blanks: [["dwelling", "economizing", "capitulating", "reneging", "improvising"]], answer: [0],
            expl: "Spending too long on side issues: dwelling on them." },
          { id: "t2v1q2", kind: "tc", text: "The reviewer found the memoir ___(i)___: its candor about the author's failures was refreshing, but its account of her successes seemed ___(ii)___ by comparison.",
            blanks: [["uneven", "tedious", "unconvincing"], ["understated", "inflated", "reticent"]], answer: [0, 1],
            expl: "Refreshing candor about failures 'but' exaggerated ('inflated') successes makes the book uneven. The colon tells you blank (i) summarizes the mixed verdict." },
          { id: "t2v1q3", kind: "tc", text: "Far from ___(i)___ the controversy, the museum's statement ___(ii)___ it, raising questions the curators had hoped to avoid.",
            blanks: [["quelling", "igniting", "acknowledging"], ["prolonged", "settled", "anticipated"]], answer: [0, 0],
            expl: "'Far from X, it did the opposite': far from quelling the controversy, the statement prolonged it." },
          { id: "t2v1q4", kind: "tc", text: "The biography is ___(i)___ in its research yet ___(ii)___ in its judgments: the author assembles every available fact about her subject but declines to ___(iii)___ what any of it means.",
            blanks: [["cursory", "exhaustive", "selective"], ["reckless", "timid", "severe"], ["obscure", "dispute", "venture"]], answer: [1, 1, 2],
            expl: "'Assembles every available fact' = exhaustive research; 'declines to venture what it means' = timid judgments. The 'yet' and 'but' both signal the same contrast." },
          { id: "t2v1q5", kind: "se", text: "The negotiations collapsed when one delegation made demands so ______ that the other walked out.",
            choices: ["modest", "exorbitant", "reasonable", "outrageous", "belated", "tentative"], answer: [1, 3],
            expl: "Demands that make the other side walk out are exorbitant / outrageous." },
          { id: "t2v1q6", kind: "se", text: "Despite its reputation for ______, the firm has quietly funded several high-risk ventures over the past decade.",
            choices: ["innovation", "prudence", "caution", "generosity", "secrecy", "profligacy"], answer: [1, 2],
            expl: "'Despite' contrasts the reputation with high-risk funding: a reputation for prudence / caution." },
          { id: "t2v1q7", kind: "se", text: "The playwright's early works were dismissed as ______, mere imitations of the fashionable dramas of the day.",
            choices: ["derivative", "seminal", "unoriginal", "provocative", "polished", "obscure"], answer: [0, 2],
            expl: "'Mere imitations' defines the blank: derivative / unoriginal." },
          { id: "t2v1q8", kind: "rc", passage: "p1", text: "The primary purpose of the passage is to",
            choices: ["explain why modern concrete is superior for most purposes", "describe the mechanism behind an ancient material's durability and a barrier to reproducing it", "argue that Roman engineers understood mineral chemistry", "recommend that modern builders use volcanic ash", "compare the curing times of ancient and modern concrete"], answer: [1],
            expl: "First half: the mechanism (seawater forms interlocking minerals). Second half: why it is hard to reproduce (specific ash, slow curing)." },
          { id: "t2v1q9", kind: "rc", passage: "p1", text: "According to the passage, exposure to seawater affects Roman concrete and modern concrete in which of the following ways?",
            choices: ["It degrades both, but degrades Roman concrete more slowly.", "It strengthens Roman concrete while degrading modern concrete.", "It has no measurable effect on either.", "It slows the curing of both.", "It dissolves the volcanic ash in modern concrete."], answer: [1],
            expl: "'The concrete grows stronger precisely because of the exposure that degrades its modern counterparts.'" },
          { id: "t2v1q10", kind: "rc", passage: "p2", text: "Which of the following would be most useful to know in evaluating the company's plan?",
            choices: ["Whether employees who already choose to walk differ from other employees in ways that independently affect productivity", "How long the average lunchtime walk lasts", "Whether the company's competitors have similar policies", "How productivity was measured in the morning", "Whether employees typically eat lunch at their desks"], answer: [0],
            expl: "The study is correlational. If walkers are already more energetic or less overloaded, forcing everyone to walk won't reproduce the effect. (A) tests the causal assumption." },
          { id: "t2v1q11", kind: "rc", passage: "p3", text: "The author's main point is that",
            choices: ["language documentation is a waste of scarce resources", "revitalization efforts have been more successful than documentation projects", "documentation and revitalization, though related, can compete for the same limited resources", "outside researchers should not study endangered languages", "children learn languages more easily from recordings than from elders"], answer: [2],
            expl: "'Distinct goals that can pull in different directions', competing above all for the elders' time. (A) and (D) are too extreme." },
          { id: "t2v1q12", kind: "rc", passage: "p3", text: "The author mentions 'recordings of ordinary conversation' as an example of",
            choices: ["material that documentation projects routinely produce", "a resource more useful for revitalization than elicited word lists", "the scarcest resource in language revival", "a method that elders find burdensome", "a scholarly product of limited value"], answer: [1],
            expl: "Listed among what communities 'need… rather than elicited word lists' — i.e., more useful for revival. The scarcest resource is the elders' time, not recordings." }
        ] },

      /* ---------------- Verbal 2: 15 / 23 ---------------- */
      { id: "t2-v2", type: "verbal", n: 2, title: "Verbal Reasoning — Section 2", time: 23,
        passages: {
          p1: "The lighthouse has long served economists as the textbook example of a public good—one that private enterprise will not supply because ships can benefit from the light without paying for it. The example's pedigree is distinguished: John Stuart Mill invoked it, and generations of introductory courses have followed. Yet the historical record complicates the lesson. In seventeenth- and eighteenth-century England, most lighthouses were built and operated by private individuals who held patents from the Crown, financed by tolls collected from ships at nearby ports. The system was hardly a free market—the right to collect tolls was a government-granted privilege, enforced by customs officials—but neither was it the state provision that the textbook account implies.\n\nWhat should be concluded from this history is less clear than either side of the resulting debate has allowed. Critics of the public-good framing have cited the English lighthouses as proof that private provision was feasible all along. Defenders reply that a tolling system backed by government coercion is not private provision in any meaningful sense, and that the arrangement in fact confirms the underlying problem: without the state's help in collecting payment, the lights would not have been built. Perhaps the most defensible lesson is methodological. The lighthouse was adopted as an example not because anyone had studied lighthouses but because the case seemed self-evident, and self-evidence, in economics as elsewhere, is a poor substitute for evidence.",
          p2: "Studies of patent data consistently find that inventive output per capita rises with city size: double a city's population and patents per resident increase by roughly fifteen percent. The usual explanation appeals to the density of face-to-face interaction, which speeds the circulation of ideas. A rival account holds that the effect is one of sorting rather than synergy—that inventive people simply move to large cities, which would then appear more innovative without making anyone more inventive. Distinguishing the two is difficult, but recent work tracking individual inventors who relocate finds that their patenting rates rise after moving to larger cities and fall after moving to smaller ones, a pattern hard to reconcile with sorting alone.",
          p3: "Sales of the magazine's print edition fell 30 percent after it launched a free online edition. The publisher concludes that the online edition caused the decline and plans to discontinue it."
        },
        questions: [
          { id: "t2v2q1", kind: "tc", text: "Because the evidence was largely ___(i)___, the jury had to infer the defendant's whereabouts from phone records and witness recollections.",
            blanks: [["conclusive", "circumstantial", "fabricated", "corroborated", "inadmissible"]], answer: [1],
            expl: "Evidence that requires inference rather than direct proof is circumstantial." },
          { id: "t2v2q2", kind: "tc", text: "The architect's designs are admired for their ___(i)___: nothing is included that does not serve a structural or practical purpose.",
            blanks: [["grandeur", "austerity", "novelty", "symmetry", "durability"]], answer: [1],
            expl: "The colon defines the blank: nothing unnecessary = austerity." },
          { id: "t2v2q3", kind: "tc", text: "The critic's ___(i)___ review was all the more surprising given her well-known ___(ii)___ for the director's earlier films.",
            blanks: [["glowing", "scathing", "perfunctory"], ["enthusiasm", "disdain", "indifference"]], answer: [1, 0],
            expl: "Surprise requires contrast: a scathing review from someone known for enthusiasm." },
          { id: "t2v2q4", kind: "tc", text: "Though often ___(i)___ as a mere popularizer, the author in fact made several ___(ii)___ contributions to the field, two of which are still cited in specialist journals.",
            blanks: [["celebrated", "dismissed", "recruited"], ["negligible", "derivative", "original"]], answer: [1, 2],
            expl: "'Mere popularizer' is dismissive; 'in fact' reverses it: original contributions still cited by specialists." },
          { id: "t2v2q5", kind: "tc", text: "Early reviewers were ___(i)___ by the novel's structure—six narrators, none reliable—and many concluded that the author had simply ___(ii)___ control of her material; only later did critics recognize the apparent chaos as ___(iii)___.",
            blanks: [["enchanted", "bewildered", "reassured"], ["seized", "relinquished", "asserted"], ["accidental", "deliberate", "conventional"]], answer: [1, 1, 1],
            expl: "Six unreliable narrators bewilder; reviewers thought the author had relinquished (lost) control; 'only later' recognized the chaos as deliberate." },
          { id: "t2v2q6", kind: "se", text: "The explorer's account of the journey was so ______ that later travelers who followed his route found it almost useless.",
            choices: ["vivid", "vague", "meticulous", "imprecise", "lengthy", "tedious"], answer: [1, 3],
            expl: "Useless for navigation: vague / imprecise." },
          { id: "t2v2q7", kind: "se", text: "Having spent years cultivating an image of ______, the executive surprised everyone with an impassioned, unscripted speech.",
            choices: ["detachment", "warmth", "impulsiveness", "reserve", "eloquence", "candor"], answer: [0, 3],
            expl: "An impassioned speech surprises from someone known for detachment / reserve." },
          { id: "t2v2q8", kind: "se", text: "The committee's findings ______ the earlier report rather than overturning it, adding detail without altering the central conclusions.",
            choices: ["contradicted", "supplemented", "refined", "undermined", "summarized", "superseded"], answer: [1, 2],
            expl: "Adding detail without changing conclusions: supplemented / refined." },
          { id: "t2v2q9", kind: "se", text: "The population of the island has remained remarkably ______ for three centuries, neither growing nor shrinking by more than a few hundred.",
            choices: ["insular", "stable", "constant", "prosperous", "isolated", "diverse"], answer: [1, 2],
            expl: "Neither growing nor shrinking: stable / constant. 'Insular' and 'isolated' are a decoy pair that fits 'island' but not the clue." },
          { id: "t2v2q10", kind: "rc", passage: "p1", text: "The primary purpose of the passage is to",
            choices: ["argue that lighthouses should be privately operated", "show that a canonical example rests on weaker historical foundations than usually assumed and draw a lesson from this", "defend Mill's account of public goods against modern critics", "explain how tolls were collected in early modern England", "demonstrate that government intervention is always necessary for public goods"], answer: [1],
            expl: "The passage complicates the textbook example, presents both sides, and ends with a methodological lesson about self-evidence." },
          { id: "t2v2q11", kind: "rc", passage: "p1", text: "According to the passage, defenders of the public-good framing argue that the English lighthouse system",
            choices: ["was less efficient than direct state provision", "depended on government coercion and therefore illustrates rather than refutes the free-rider problem", "was never actually implemented on a large scale", "proves that Mill was unfamiliar with English history", "collected tolls that were too low to cover costs"], answer: [1],
            expl: "'A tolling system backed by government coercion is not private provision… the arrangement in fact confirms the underlying problem.'" },
          { id: "t2v2q12", kind: "rc", passage: "p1", multi: true, text: "The author would most likely agree with which of the following? Indicate all that apply.",
            choices: ["The lighthouse example was initially adopted on the basis of careful historical study.", "The English system combined private operation with government-backed enforcement.", "The debate over the example has produced conclusions more confident than the evidence warrants."], answer: [1, 2],
            expl: "(B) matches 'private individuals… patents from the Crown… enforced by customs officials'. (C) matches 'less clear than either side… has allowed'. (A) contradicts 'not because anyone had studied lighthouses'." },
          { id: "t2v2q13", kind: "rc", passage: "p2", text: "The passage mentions research tracking relocating inventors primarily in order to",
            choices: ["show that inventive people prefer to live in large cities", "provide evidence bearing on the choice between two competing explanations", "question the reliability of patent data as a measure of invention", "explain why patents per resident rise with city size", "argue that small cities actively discourage invention"], answer: [1],
            expl: "The tracking study is introduced right after 'distinguishing the two is difficult' — it is evidence that helps distinguish synergy from sorting." },
          { id: "t2v2q14", kind: "rc", passage: "p2", text: "The 'sorting' account, as described in the passage, holds that",
            choices: ["large cities make their residents more inventive", "the apparent innovation advantage of large cities reflects who lives there rather than what the city does to them", "patents are more often granted to urban applicants", "face-to-face interaction is less important than commonly believed", "inventors relocate more frequently than other workers"], answer: [1],
            expl: "'Inventive people simply move to large cities, which would then appear more innovative without making anyone more inventive.'" },
          { id: "t2v2q15", kind: "rc", passage: "p3", text: "Which of the following, if true, most strengthens the publisher's reasoning?",
            choices: ["Print sales of comparable magazines without free online editions remained stable over the same period.", "The online edition attracts readers in countries where the print edition is not sold.", "Advertising revenue from the online edition has grown steadily.", "The magazine raised its print price by 5 percent during the period.", "Most readers of the online edition are under 30."], answer: [0],
            expl: "A control group: if similar magazines without online editions didn't decline, the online edition is a more plausible cause. (D) offers an alternative cause and weakens." }
        ] },

      /* ---------------- Quant 1: 12 / 21 ---------------- */
      { id: "t2-q1", type: "quant", n: 1, title: "Quantitative Reasoning — Section 1", time: 21,
        data: {
          d1: { kind: "table", title: "Annual rainfall (centimeters) in City R, 2019–2023",
                head: ["Year", "Rainfall (cm)"],
                rows: [["2019", 80], ["2020", 100], ["2021", 70], ["2022", 90], ["2023", 110]] }
        },
        questions: [
          { id: "t2q1q1", kind: "qc", a: "(−3)²", b: "−3²", answer: 0,
            expl: "(−3)² = 9; −3² = −(3²) = −9. A is greater." },
          { id: "t2q1q2", kind: "qc", given: "2x + 3 = 11", a: "x", b: "4", answer: 2,
            expl: "x = 4. Equal." },
          { id: "t2q1q3", kind: "qc", a: "The number of distinct prime factors of 72", b: "The number of distinct prime factors of 30", answer: 1,
            expl: "72 = 2³ · 3² → 2 distinct primes. 30 = 2 · 3 · 5 → 3. B is greater. 'Distinct' matters." },
          { id: "t2q1q4", kind: "qc", given: "In triangle PQR, angle P = 50° and angle Q = 60°.", a: "The length of side PQ", b: "The length of side QR", answer: 0,
            expl: "Angle R = 70°, the largest angle, and PQ is opposite R; QR is opposite the smallest angle P. Larger angle ⇒ longer opposite side, so A is greater." },
          { id: "t2q1q5", kind: "qc", given: "The average (arithmetic mean) of x and y is 10.", a: "xy", b: "100", answer: 3,
            expl: "x = y = 10 gives 100 (equal); x = 0, y = 20 gives 0 (less). Cannot be determined." },
          { id: "t2q1q6", kind: "mc", text: "If 4ˣ = 64, what is the value of 2ˣ?", choices: ["4", "6", "8", "16", "32"], answer: [2],
            expl: "4ˣ = 64 ⇒ x = 3 ⇒ 2³ = 8." },
          { id: "t2q1q7", kind: "mc", text: "A jar contains 4 red marbles and 6 blue marbles. Two marbles are drawn at random without replacement. What is the probability that both are blue?", choices: ["1/5", "1/4", "1/3", "2/5", "3/5"], answer: [2],
            expl: "(6/10) × (5/9) = 30/90 = 1/3." },
          { id: "t2q1q8", kind: "mc", text: "The price of an item rose from $80 to $100 and later fell back to $80. By what percent did the price decrease from $100 to $80?", choices: ["15%", "20%", "25%", "30%", "40%"], answer: [1],
            expl: "20/100 = 20%. (The increase was 25% because its base was 80 — different bases, different percents.)" },
          { id: "t2q1q9", kind: "mcm", text: "Which of the following are factors of 84? Indicate all such numbers.", choices: ["6", "8", "12", "14", "21", "24"], answer: [0, 2, 3, 4],
            expl: "84 = 2² · 3 · 7. 6, 12, 14 and 21 divide 84; 8 (needs 2³) and 24 (needs 2³) do not." },
          { id: "t2q1q10", kind: "ne", text: "In the xy-plane, a line passes through the points (1, 2) and (3, 8). What is the slope of the line?", answer: 3,
            expl: "(8 − 2)/(3 − 1) = 6/2 = 3." },
          { id: "t2q1q11", kind: "mc", data: "d1", text: "The rainfall in 2023 was approximately what percent greater than the rainfall in 2021?", choices: ["36.4%", "40%", "50%", "57.1%", "62.5%"], answer: [3],
            expl: "(110 − 70)/70 = 40/70 ≈ 57.1%. (36.4% uses 110 as the base.)" },
          { id: "t2q1q12", kind: "mc", data: "d1", text: "What was the average (arithmetic mean) annual rainfall, in centimeters, over the five years shown?", choices: ["85", "88", "90", "92", "95"], answer: [2],
            expl: "(80 + 100 + 70 + 90 + 110)/5 = 450/5 = 90." }
        ] },

      /* ---------------- Quant 2: 15 / 26 ---------------- */
      { id: "t2-q2", type: "quant", n: 2, title: "Quantitative Reasoning — Section 2", time: 26,
        data: {
          d1: { kind: "bar", title: "Books borrowed from a library in March, by category", unit: "books",
                bars: [["Fiction", 240], ["Non-fiction", 160], ["Children's", 200], ["Reference", 40], ["Periodicals", 60]] }
        },
        questions: [
          { id: "t2q2q1", kind: "qc", given: "x is an integer and 2 < x < 5.", a: "x² − 9", b: "0", answer: 3,
            expl: "x = 3 gives 0 (equal); x = 4 gives 7 (greater). Cannot be determined." },
          { id: "t2q2q2", kind: "qc", a: "1/3 + 1/4", b: "7/12", answer: 2,
            expl: "4/12 + 3/12 = 7/12. Equal." },
          { id: "t2q2q3", kind: "qc", given: "A square has perimeter 20.", a: "The area of the square", b: "The area of a circle with radius 3", answer: 1,
            expl: "Side = 5, area = 25. Circle: 9π ≈ 28.3. B is greater." },
          { id: "t2q2q4", kind: "qc", given: "n is a positive integer.", a: "(n + 1)! / n!", b: "n", answer: 0,
            expl: "(n + 1)!/n! = n + 1, which is always greater than n." },
          { id: "t2q2q5", kind: "qc", a: "The standard deviation of {2, 4, 6, 8}", b: "The standard deviation of {12, 14, 16, 18}", answer: 2,
            expl: "Adding 10 to every value shifts the set without changing its spread. Equal." },
          { id: "t2q2q6", kind: "qc", given: "m and n are integers, m > n > 0, and m + n = 10.", a: "m − n", b: "2", answer: 3,
            expl: "(6, 4) gives 2 (equal); (7, 3) gives 4 (greater). Cannot be determined." },
          { id: "t2q2q7", kind: "mc", text: "If f(x) = x² − 4x + 7, what is the value of f(3)?", choices: ["2", "4", "6", "10", "28"], answer: [1],
            expl: "9 − 12 + 7 = 4." },
          { id: "t2q2q8", kind: "mc", text: "How many positive three-digit integers are divisible by 7?", choices: ["126", "127", "128", "129", "130"], answer: [2],
            expl: "Smallest: 105 = 7 × 15; largest: 994 = 7 × 142. Count = 142 − 15 + 1 = 128." },
          { id: "t2q2q9", kind: "mc", text: "A 20-liter solution is 30% acid. How many liters of pure acid must be added so that the resulting solution is 50% acid?", choices: ["4", "5", "6", "8", "10"], answer: [3],
            expl: "(6 + x)/(20 + x) = 1/2 ⇒ 12 + 2x = 20 + x ⇒ x = 8." },
          { id: "t2q2q10", kind: "mc", text: "A circle is inscribed in a square with side length 10. What is the area of the region inside the square but outside the circle?", choices: ["100 − 10π", "100 − 25π", "100 − 100π", "25 − 25π", "50 − 25π"], answer: [1],
            expl: "Circle radius = 5, area 25π; square area 100; difference 100 − 25π." },
          { id: "t2q2q11", kind: "mcm", text: "If x and y are integers and xy = 12, which of the following could be the value of x + y? Indicate all such values.", choices: ["−13", "−8", "−7", "4", "7", "13"], answer: [0, 1, 2, 4, 5],
            expl: "Factor pairs: (1,12) → 13, (2,6) → 8, (3,4) → 7, and their negatives → −13, −8, −7. 4 is impossible. Don't forget negative pairs." },
          { id: "t2q2q12", kind: "ne", text: "An account earns simple interest at 6 percent per year. How many dollars of interest does a $2,000 deposit earn in 18 months?", answer: 180, unit: "$",
            expl: "2000 × 0.06 × 1.5 = 180." },
          { id: "t2q2q13", kind: "mc", data: "d1", text: "Fiction and Children's books combined account for what fraction of all books borrowed in March?", choices: ["1/2", "11/18", "22/35", "2/3", "4/5"], answer: [2],
            expl: "Total = 700; (240 + 200)/700 = 440/700 = 22/35." },
          { id: "t2q2q14", kind: "mc", data: "d1", text: "If Non-fiction borrowing in April is 25% greater than in March and borrowing in every other category is unchanged, how many books in total are borrowed in April?", choices: ["720", "735", "740", "750", "875"], answer: [2],
            expl: "Non-fiction: 160 × 1.25 = 200, an increase of 40. Total: 700 + 40 = 740." },
          { id: "t2q2q15", kind: "mc", data: "d1", text: "What is the ratio of Fiction books borrowed to Reference books borrowed?", choices: ["4 : 1", "5 : 1", "6 : 1", "8 : 1", "12 : 1"], answer: [2],
            expl: "240 : 40 = 6 : 1." }
        ] }
    ]
  };

  return { conversion, awaSelfScore, awaBands, tests: [test1, test2] };
})();
