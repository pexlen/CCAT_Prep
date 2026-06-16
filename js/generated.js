/* ============================================================
   CCAT Practice — programmatically generated questions
   (number series, letter series, attention-to-detail error
   checking, and templated arithmetic). All correct by
   construction, each tagged with a difficulty (1=easy … 3=hard).
   ============================================================ */
(function () {
  const V = "Verbal Reasoning";
  const M = "Math & Logic";

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffleSeed(arr, seed) {
    const rng = mulberry32(seed), a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  // Build a 5-option set from an answer + candidate distractors, dedup by string.
  function buildOptions(answer, candidates, seed) {
    const opts = [answer];
    for (const c of candidates) {
      if (opts.length >= 5) break;
      if (!opts.some((o) => String(o) === String(c))) opts.push(c);
    }
    let pad = 1;
    while (opts.length < 5) {
      const cand = typeof answer === "number" ? answer + pad : answer + "·" + pad;
      if (!opts.some((o) => String(o) === String(cand))) opts.push(cand);
      pad++;
    }
    const ordered = shuffleSeed(opts, seed);
    return { options: ordered.map(String), answer: ordered.findIndex((o) => String(o) === String(answer)) };
  }

  const OUT = [];

  /* =========================================================
     NUMBER SERIES  (Math & Logic)
     ========================================================= */
  let nSer = 0;
  function series(terms, ans, rule, diff) {
    nSer++;
    const cands = [ans + 1, ans - 1, ans + 2, ans - 2, ans + 3, ans - 3, ans + 5, ans - 5, ans + 10, ans - 10]
      .filter((v) => v !== ans);
    const built = buildOptions(ans, cands, 9000 + nSer);
    OUT.push({
      id: `g-ser-${nSer}`, category: M, type: "Number Series", difficulty: diff,
      stem: `What number comes next in the sequence?<br><strong>${terms.join(", ")}, ?</strong>`,
      options: built.options, answer: built.answer, explanation: rule
    });
  }
  series([5, 9, 13, 17, 21], 25, "Add 4 to each term: 21 + 4 = 25.", 1);
  series([3, 9, 15, 21, 27], 33, "Add 6 to each term: 27 + 6 = 33.", 1);
  series([100, 93, 86, 79], 72, "Subtract 7 from each term: 79 − 7 = 72.", 1);
  series([48, 24, 12, 6], 3, "Each term is halved: 6 ÷ 2 = 3.", 1);
  series([7, 14, 28, 56, 112], 224, "Each term doubles: 112 × 2 = 224.", 1);
  series([81, 72, 63, 54], 45, "Subtract 9 from each term: 54 − 9 = 45.", 1);
  series([2, 6, 18, 54], 162, "Multiply each term by 3: 54 × 3 = 162.", 2);
  series([625, 125, 25, 5], 1, "Divide each term by 5: 5 ÷ 5 = 1.", 2);
  series([1, 2, 4, 7, 11, 16], 22, "The gaps grow by 1 (+1, +2, +3, +4, +5): 16 + 6 = 22.", 2);
  series([2, 3, 5, 8, 13], 21, "Each term is the sum of the previous two: 8 + 13 = 21.", 2);
  series([1, 4, 5, 9, 14], 23, "Each term is the sum of the previous two: 9 + 14 = 23.", 2);
  series([1, 3, 7, 15, 31], 63, "Each term is doubled then plus 1: 31 × 2 + 1 = 63.", 2);
  series([5, 11, 23, 47], 95, "Each term is doubled then plus 1: 47 × 2 + 1 = 95.", 2);
  series([1, 4, 9, 16, 25], 36, "These are perfect squares; the next is 6² = 36.", 2);
  series([2, 5, 10, 17, 26], 37, "The gaps are the odd numbers (+3, +5, +7, +9, +11): 26 + 11 = 37.", 2);
  series([2, 4, 8, 14, 22], 32, "The gaps grow by 2 (+2, +4, +6, +8, +10): 22 + 10 = 32.", 3);
  series([3, 6, 4, 8, 6, 12], 10, "The pattern alternates ×2 then −2: 12 − 2 = 10.", 3);
  series([4, 7, 14, 17, 34], 37, "The pattern alternates +3 then ×2: 34 + 3 = 37.", 3);
  series([2, 7, 22, 67], 202, "Each term is ×3 then plus 1: 67 × 3 + 1 = 202.", 3);
  series([1, 8, 27, 64], 125, "These are perfect cubes; the next is 5³ = 125.", 3);

  /* =========================================================
     LETTER SERIES  (Verbal Reasoning)
     ========================================================= */
  const A = "A".charCodeAt(0);
  const L = (i) => String.fromCharCode(A + (((i % 26) + 26) % 26));
  const IDX = (ch) => ch.charCodeAt(0) - A;
  let nLet = 0;
  function letters(seq, ansIdx, rule, diff) {
    nLet++;
    const ans = L(ansIdx);
    const cands = [L(ansIdx + 1), L(ansIdx - 1), L(ansIdx + 2), L(ansIdx - 2), L(ansIdx + 3)];
    const built = buildOptions(ans, cands, 7000 + nLet);
    OUT.push({
      id: `g-let-${nLet}`, category: V, type: "Letter Series", difficulty: diff,
      stem: `Which letter comes next?<br><strong>${seq.join(", ")}, ?</strong>`,
      options: built.options, answer: built.answer, explanation: rule
    });
  }
  letters(["F", "H", "J", "L"], IDX("L") + 2, "Skip one letter each time (+2): after L comes N.", 1);
  letters(["C", "E", "G", "I"], IDX("I") + 2, "Skip one letter each time (+2): after I comes K.", 1);
  letters(["B", "D", "F", "H"], IDX("H") + 2, "Every second letter (+2): after H comes J.", 1);
  letters(["A", "D", "G", "J"], IDX("J") + 3, "Move forward three each time (+3): after J comes M.", 2);
  letters(["Z", "X", "V", "T"], IDX("T") - 2, "Move back two each time (−2): after T comes R.", 2);
  letters(["M", "K", "I", "G"], IDX("G") - 2, "Move back two each time (−2): after G comes E.", 2);
  letters(["Y", "W", "U", "S"], IDX("S") - 2, "Move back two each time (−2): after S comes Q.", 2);
  letters(["A", "C", "F", "J"], IDX("J") + 5, "The gaps grow by one (+2, +3, +4, +5): after J comes O.", 3);
  letters(["A", "B", "D", "G", "K"], IDX("K") + 5, "The gaps grow by one (+1, +2, +3, +4, +5): after K comes P.", 3);
  letters(["B", "E", "I", "N"], IDX("N") + 6, "The gaps grow by one (+3, +4, +5, +6): after N comes T.", 3);

  /* =========================================================
     ATTENTION TO DETAIL — error checking  (Verbal Reasoning)
     ========================================================= */
  let nEC = 0;
  function digitString(rng, len) {
    let s = "";
    for (let i = 0; i < len; i++) s += Math.floor(rng() * 10);
    return s;
  }
  function alterString(rng, s) {
    const arr = s.split("");
    const pos = Math.floor(rng() * arr.length);
    let d = String(Math.floor(rng() * 10));
    while (d === arr[pos]) d = String((parseInt(arr[pos], 10) + 1) % 10);
    arr[pos] = d;
    return arr.join("");
  }
  const NAMES_L = ["Harrington", "Stephenson", "McCallister", "Fitzgerald", "Whitfield", "Abernathy", "Castellano", "Donaldson"];
  const NAMES_F = ["A. R.", "M. J.", "T. L.", "C. P.", "R. K.", "J. B.", "D. M.", "S. G."];
  function altName(rng, name) {
    // change one letter of the surname portion
    const m = name.match(/^(.*?,\s*)(.*)$/);
    return name; // (names use digit-style alteration below instead)
  }
  function errorCheck(seed, nPairs, nIdentical, kind, diff) {
    nEC++;
    const rng = mulberry32(seed);
    const rows = [];
    // decide which rows are identical
    const flags = shuffleSeed(
      Array.from({ length: nPairs }, (_, i) => i < nIdentical), seed + 1
    );
    for (let i = 0; i < nPairs; i++) {
      let left, right;
      if (kind === "name") {
        const sur = NAMES_L[Math.floor(rng() * NAMES_L.length)];
        const fi = NAMES_F[Math.floor(rng() * NAMES_F.length)];
        left = `${sur}, ${fi}`;
        if (flags[i]) right = left;
        else {
          // swap to a different surname OR initials
          let sur2 = NAMES_L[Math.floor(rng() * NAMES_L.length)];
          let fi2 = NAMES_F[Math.floor(rng() * NAMES_F.length)];
          while (sur2 === sur && fi2 === fi) { sur2 = NAMES_L[Math.floor(rng() * NAMES_L.length)]; }
          right = `${sur2}, ${rng() < 0.5 ? fi : fi2}`;
          if (right === left) right = `${sur}, ${fi2}`;
        }
      } else {
        left = digitString(rng, 8);
        right = flags[i] ? left : alterString(rng, left);
      }
      rows.push(`<tr><td>${i + 1}</td><td>${left}</td><td>${right}</td></tr>`);
    }
    const table =
      `<table class="pairs-table"><thead><tr><th>#</th><th>Item&nbsp;A</th><th>Item&nbsp;B</th></tr></thead>` +
      `<tbody>${rows.join("")}</tbody></table>`;
    const built = buildOptions(String(nIdentical), ["0", "1", "2", "3", "4"].filter((x) => x !== String(nIdentical)), seed + 2);
    OUT.push({
      id: `g-ec-${nEC}`, category: V, type: "Attention to Detail", difficulty: diff,
      stem: `How many of the following pairs are <strong>exactly identical</strong>?${table}`,
      options: built.options, answer: built.answer,
      explanation: `Comparing each pair character by character, exactly ${nIdentical} of the ${nPairs} pairs match perfectly.`
    });
  }
  errorCheck(1101, 4, 2, "num", 2);
  errorCheck(1102, 4, 3, "num", 2);
  errorCheck(1103, 4, 1, "num", 2);
  errorCheck(1104, 4, 4, "num", 3);
  errorCheck(1105, 4, 2, "name", 2);
  errorCheck(1106, 4, 3, "name", 2);
  errorCheck(1107, 4, 1, "num", 3);
  errorCheck(1108, 4, 3, "num", 2);
  errorCheck(1109, 4, 2, "num", 2);
  errorCheck(1110, 4, 4, "name", 3);

  /* =========================================================
     TEMPLATED ARITHMETIC / WORD PROBLEMS  (Math & Logic)
     ========================================================= */
  let nMath = 0;
  function math(stem, ans, cands, rule, diff) {
    nMath++;
    const built = buildOptions(ans, cands, 5000 + nMath);
    OUT.push({
      id: `g-math-${nMath}`, category: M, type: "Word Problem", difficulty: diff,
      stem, options: built.options, answer: built.answer, explanation: rule
    });
  }
  // Discounts
  math("A $60 jacket is marked <strong>20% off</strong>. What is the sale price?",
    "$48", ["$12", "$40", "$50", "$72"], "20% of $60 is $12, so the price is $60 − $12 = $48.", 1);
  math("A $250 television is <strong>15% off</strong>. What is the sale price?",
    "$212.50", ["$37.50", "$235", "$200", "$225"], "15% of $250 is $37.50, so $250 − $37.50 = $212.50.", 2);
  math("A laptop costs $50. It is marked up <strong>40%</strong>, then put on sale at <strong>25% off</strong> the new price. What is the final price?",
    "$52.50", ["$50", "$57.50", "$45", "$65"], "Marked up: $50 × 1.40 = $70. On sale: $70 × 0.75 = $52.50.", 3);
  // Percent of
  math("What is <strong>35% of 80</strong>?", "28", ["24", "32", "35", "45"], "35% of 80 = 0.35 × 80 = 28.", 2);
  math("What is <strong>12% of 150</strong>?", "18", ["15", "20", "12", "30"], "12% of 150 = 0.12 × 150 = 18.", 2);
  math("What is <strong>⅓ of ½ of 90</strong>?", "15", ["30", "45", "10", "18"], "½ of 90 is 45, and ⅓ of 45 is 15.", 2);
  // Speed / distance
  math("A train travels <strong>120 miles in 2 hours</strong>. How far will it travel in <strong>5 hours</strong> at the same speed?",
    "300 miles", ["240 miles", "250 miles", "360 miles", "200 miles"], "Speed = 120 ÷ 2 = 60 mph, so 60 × 5 = 300 miles.", 2);
  math("A cyclist covers <strong>18 miles in 1.5 hours</strong>. At that rate, how far in <strong>4 hours</strong>?",
    "48 miles", ["36 miles", "54 miles", "72 miles", "40 miles"], "Speed = 18 ÷ 1.5 = 12 mph, so 12 × 4 = 48 miles.", 2);
  // Averages
  math("What is the <strong>average</strong> of 12, 15, 18, and 27?", "18", ["17", "19", "20", "21"], "Sum = 72; 72 ÷ 4 = 18.", 2);
  math("The average of 5 numbers is <strong>20</strong>. Four of them are 18, 22, 16, and 24. What is the fifth?",
    "20", ["16", "18", "22", "24"], "The five numbers total 5 × 20 = 100. The four given total 80, so the fifth is 20.", 3);
  // Ratios
  math("Profits are split <strong>2 : 3</strong> between Alex and Bo. If the total profit is $500, what is Bo's share?",
    "$300", ["$200", "$250", "$150", "$350"], "There are 5 parts; each is $100. Bo gets 3 parts = $300.", 2);
  math("A 60-litre mixture has water and juice in the ratio <strong>1 : 5</strong>. How many litres are juice?",
    "50", ["10", "12", "30", "55"], "There are 6 parts of 10 litres each; juice is 5 parts = 50 litres.", 2);
  // Unit rate
  math("If <strong>5 notebooks cost $7.50</strong>, how much do <strong>8 notebooks</strong> cost?",
    "$12", ["$10.50", "$11", "$13.50", "$15"], "Each notebook is $7.50 ÷ 5 = $1.50, so 8 × $1.50 = $12.", 2);
  math("A dozen eggs costs <strong>$3.60</strong>. At that rate, how much do <strong>30 eggs</strong> cost?",
    "$9", ["$7.50", "$8.40", "$10.80", "$12"], "Each egg is $3.60 ÷ 12 = $0.30, so 30 × $0.30 = $9.", 2);
  // Percent change
  math("A salary rises from <strong>$40,000 to $46,000</strong>. What is the percent increase?",
    "15%", ["6%", "12%", "13%", "16%"], "Increase = $6,000 ÷ $40,000 = 0.15 = 15%.", 2);
  math("A price falls from <strong>$80 to $60</strong>. What is the percent decrease?",
    "25%", ["20%", "30%", "33%", "40%"], "Decrease = $20 ÷ $80 = 0.25 = 25%.", 2);
  // Algebra
  math("If <strong>2x − 3 = 11</strong>, what is x?", "7", ["4", "5", "8", "9"], "2x = 14, so x = 7.", 1);
  math("If <strong>3(x + 2) = 21</strong>, what is x?", "5", ["4", "6", "7", "9"], "x + 2 = 7, so x = 5.", 2);
  // Work-rate (hard)
  math("Two pipes can fill a tank in <strong>6 hours</strong> and <strong>12 hours</strong> respectively. How long to fill it <strong>together</strong>?",
    "4 hours", ["9 hours", "18 hours", "3 hours", "8 hours"], "Combined rate = 1/6 + 1/12 = 1/4 tank per hour, so it takes 4 hours.", 3);
  math("Anya paints a fence in <strong>8 hours</strong>; with a helper they finish in <strong>6 hours</strong>. How long would the helper take <strong>alone</strong>?",
    "24 hours", ["14 hours", "18 hours", "12 hours", "48 hours"], "Helper's rate = 1/6 − 1/8 = 1/24, so the helper alone takes 24 hours.", 3);

  window.QUESTION_BANK = (window.QUESTION_BANK || []).concat(OUT);
})();
