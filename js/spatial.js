/* ============================================================
   CCAT Practice — Spatial Reasoning questions
   Figures are generated as inline SVG so the correct answer is
   guaranteed correct by construction. Appended to QUESTION_BANK.
   ============================================================ */
(function () {
  const CAT = "Spatial Reasoning";
  const BLUE = "#2f6df6";

  /* ---- tiny deterministic shuffle (so generation order is stable) ---- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, seed) {
    const rng = mulberry32(seed);
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ---- SVG figure builders ---- */
  function svgArrow(angle, size) {
    size = size || 78;
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
      <g transform="rotate(${angle} 50 50)" fill="${BLUE}" stroke="${BLUE}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
        <line x1="50" y1="80" x2="50" y2="38"/>
        <polygon points="50,18 34,46 66,46" stroke="none"/>
      </g></svg>`;
  }

  const F_POINTS = "28,20 74,20 74,34 42,34 42,46 64,46 64,60 42,60 42,80 28,80";
  function svgF(angle, mirror, size) {
    size = size || 78;
    const m = mirror ? "translate(100 0) scale(-1 1)" : "";
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
      <g transform="rotate(${angle} 50 50) ${m}"><polygon points="${F_POINTS}" fill="${BLUE}"/></g></svg>`;
  }

  function svgPolygon(sides, size) {
    size = size || 78;
    const r = 36, pts = [];
    for (let i = 0; i < sides; i++) {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
      pts.push(`${(50 + r * Math.cos(ang)).toFixed(1)},${(50 + r * Math.sin(ang)).toFixed(1)}`);
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
      <polygon points="${pts.join(" ")}" fill="none" stroke="${BLUE}" stroke-width="6" stroke-linejoin="round"/></svg>`;
  }

  function figBox(svg) { return `<div class="q-fig">${svg}</div>`; }
  const ALL_DIRS = [0, 45, 90, 135, 180, 225, 270, 315];
  const DIR_NAME = {
    0: "up", 45: "up and to the right", 90: "to the right", 135: "down and to the right",
    180: "down", 225: "down and to the left", 270: "to the left", 315: "up and to the left"
  };

  const Q = [];

  /* ======================================================
     TYPE 1 — Rotation sequence: "What comes next?"
     ====================================================== */
  const seqParams = [
    { start: 0,   step: 45,  dir: 1 },
    { start: 90,  step: 45,  dir: 1 },
    { start: 0,   step: 90,  dir: 1 },
    { start: 315, step: 45,  dir: 1 },
    { start: 180, step: 45,  dir: -1 },
    { start: 90,  step: 90,  dir: -1 },
    { start: 270, step: 45,  dir: 1 },
    { start: 45,  step: 45,  dir: -1 },
    { start: 180, step: 90,  dir: 1 },
    { start: 135, step: 45,  dir: 1 }
  ];
  seqParams.forEach((p, i) => {
    const norm = (a) => ((a % 360) + 360) % 360;
    const frames = [0, 1, 2, 3].map((n) => norm(p.start + p.dir * p.step * n));
    const next = norm(p.start + p.dir * p.step * 4);
    const figuresHTML =
      `<div class="q-figs">${frames.map((a) => figBox(svgArrow(a))).join("")}` +
      `<span class="q-fig-q">?</span></div>`;
    const distractPool = ALL_DIRS.filter((a) => a !== next);
    const distract = shuffle(distractPool, 100 + i).slice(0, 4);
    const optAngles = shuffle([next, ...distract], 200 + i);
    Q.push({
      id: `s-seq-${i + 1}`, category: CAT, type: "Next in Sequence", difficulty: 2,
      stem: "Look at the sequence of arrows. Which option shows what comes <strong>next</strong>?",
      figuresHTML,
      options: optAngles.map((a) => ({ svg: svgArrow(a) })),
      answer: optAngles.indexOf(next),
      explanation: `Each arrow turns ${p.step}° ${p.dir === 1 ? "clockwise" : "counter-clockwise"} from the one before it, so the next arrow points ${DIR_NAME[next]}.`
    });
  });

  /* ======================================================
     TYPE 2 — Odd one out: 4 rotations of a figure + 1 mirror
     ====================================================== */
  const oddParams = [
    { rots: [0, 90, 180, 270], mirAngle: 0 },
    { rots: [45, 135, 225, 315], mirAngle: 90 },
    { rots: [0, 90, 180, 270], mirAngle: 180 },
    { rots: [0, 45, 135, 270], mirAngle: 45 },
    { rots: [90, 180, 270, 0], mirAngle: 135 },
    { rots: [0, 90, 180, 270], mirAngle: 270 },
    { rots: [45, 135, 225, 315], mirAngle: 225 },
    { rots: [0, 135, 225, 315], mirAngle: 0 },
    { rots: [0, 90, 180, 270], mirAngle: 90 }
  ];
  oddParams.forEach((p, i) => {
    const figs = p.rots.map((a) => ({ svg: svgF(a, false), _odd: false }));
    figs.push({ svg: svgF(p.mirAngle, true), _odd: true });
    const ordered = shuffle(figs, 300 + i);
    Q.push({
      id: `s-odd-${i + 1}`, category: CAT, type: "Odd One Out", difficulty: 2,
      stem: "Four of these figures are the <strong>same shape</strong> rotated to different positions. Which one is <strong>different</strong>?",
      options: ordered.map((f) => ({ svg: f.svg })),
      answer: ordered.findIndex((f) => f._odd),
      explanation: "Four of the figures are simple rotations of one shape. The odd one is a mirror image — it is flipped, so no amount of rotation makes it match the others."
    });
  });

  /* ======================================================
     TYPE 3 — Matching: which option is the figure just rotated?
     ====================================================== */
  const matchParams = [
    { ref: 0,   match: 90,  mirs: [0, 90, 180, 270] },
    { ref: 90,  match: 270, mirs: [0, 45, 135, 315] },
    { ref: 45,  match: 180, mirs: [45, 90, 225, 270] },
    { ref: 180, match: 0,   mirs: [90, 135, 270, 315] },
    { ref: 270, match: 45,  mirs: [0, 135, 180, 225] }
  ];
  matchParams.forEach((p, i) => {
    const correct = { svg: svgF(p.match, false), _ok: true };
    const distract = p.mirs.map((a) => ({ svg: svgF(a, true), _ok: false }));
    const ordered = shuffle([correct, ...distract], 400 + i);
    Q.push({
      id: `s-match-${i + 1}`, category: CAT, type: "Rotated Match", difficulty: 3,
      stem: "Which option shows the figure on the left simply <strong>rotated</strong> (not flipped)?",
      figuresHTML: `<div class="q-figs">${figBox(svgF(p.ref, false))}<span class="q-fig-q">=?</span></div>`,
      options: ordered.map((f) => ({ svg: f.svg })),
      answer: ordered.findIndex((f) => f._ok),
      explanation: "Only the correct option keeps the same orientation of the shape (a pure rotation). Every other option is a mirror image — a flipped version that rotation alone cannot produce."
    });
  });

  /* ======================================================
     TYPE 4 — Count sides: most / fewest
     ====================================================== */
  const SIDE_NAME = { 3: "triangle", 4: "square", 5: "pentagon", 6: "hexagon", 7: "heptagon", 8: "octagon" };
  const sideParams = [
    { sides: [3, 4, 5, 6, 8], pick: "most" },
    { sides: [3, 5, 6, 7, 8], pick: "fewest" },
    { sides: [4, 5, 6, 7, 8], pick: "most" },
    { sides: [3, 4, 6, 7, 8], pick: "fewest" }
  ];
  sideParams.forEach((p, i) => {
    const target = p.pick === "most" ? Math.max(...p.sides) : Math.min(...p.sides);
    const figs = p.sides.map((s) => ({ svg: svgPolygon(s), _sides: s }));
    const ordered = shuffle(figs, 500 + i);
    Q.push({
      id: `s-side-${i + 1}`, category: CAT, type: "Shape Properties", difficulty: 1,
      stem: `Which figure has the <strong>${p.pick} sides</strong>?`,
      options: ordered.map((f) => ({ svg: f.svg })),
      answer: ordered.findIndex((f) => f._sides === target),
      explanation: `The ${SIDE_NAME[target]} has the ${p.pick} sides (${target}).`
    });
  });

  /* ======================================================
     TYPE 5 — 3×3 Matrix: "Which figure completes the grid?"
     (the CCAT's signature spatial item)
     ====================================================== */
  // Cell-content renderers (inner SVG markup in a 0..100 box)
  function arrowInner(angle) {
    return `<g transform="rotate(${angle} 50 50)" fill="${BLUE}" stroke="${BLUE}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
      <line x1="50" y1="78" x2="50" y2="36"/><polygon points="50,16 32,46 68,46" stroke="none"/></g>`;
  }
  const DOTPOS = [[28, 28], [50, 28], [72, 28], [28, 50], [50, 50], [72, 50], [28, 72], [50, 72], [72, 72]];
  function dotsInner(n) {
    let s = "";
    for (let i = 0; i < n; i++) s += `<circle cx="${DOTPOS[i][0]}" cy="${DOTPOS[i][1]}" r="8.5" fill="${BLUE}"/>`;
    return s;
  }
  function polyInner(sides) {
    const r = 34, pts = [];
    for (let i = 0; i < sides; i++) {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
      pts.push(`${(50 + r * Math.cos(ang)).toFixed(1)},${(50 + r * Math.sin(ang)).toFixed(1)}`);
    }
    return `<polygon points="${pts.join(" ")}" fill="none" stroke="${BLUE}" stroke-width="6" stroke-linejoin="round"/>`;
  }
  function optSvg(inner) { return `<svg width="84" height="84" viewBox="0 0 100 100" aria-hidden="true">${inner}</svg>`; }

  // Build the 3×3 grid SVG; cellFn(r,c) returns inner markup; bottom-right is "?".
  function matrixGridHTML(cellFn) {
    const cs = 96, gap = 8, pad = 6, dim = pad * 2 + cs * 3 + gap * 2;
    let body = "";
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const x = pad + c * (cs + gap), y = pad + r * (cs + gap);
        body += `<rect x="${x}" y="${y}" width="${cs}" height="${cs}" rx="10" fill="#f6f8fc" stroke="#cdd7ef" stroke-width="2"/>`;
        if (r === 2 && c === 2) {
          body += `<rect x="${x}" y="${y}" width="${cs}" height="${cs}" rx="10" fill="#eef2fa" stroke="#2f6df6" stroke-width="2.5" stroke-dasharray="6 5"/>`;
          body += `<text x="${x + cs / 2}" y="${y + cs / 2 + 2}" text-anchor="middle" dominant-baseline="central" font-size="52" font-weight="800" fill="#8a94a6">?</text>`;
        } else {
          body += `<svg x="${x}" y="${y}" width="${cs}" height="${cs}" viewBox="0 0 100 100">${cellFn(r, c)}</svg>`;
        }
      }
    }
    return `<div class="q-figs"><div class="q-fig q-matrix"><svg width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" aria-hidden="true">${body}</svg></div></div>`;
  }

  function pushMatrix(idn, cellFn, correctInner, distractInners, explanation, seed) {
    const figs = [{ svg: optSvg(correctInner), _ok: true }]
      .concat(distractInners.map((d) => ({ svg: optSvg(d), _ok: false })));
    const ordered = shuffle(figs, seed);
    Q.push({
      id: `s-mat-${idn}`, category: CAT, type: "Matrix Reasoning", difficulty: 3,
      stem: "Study how the figures change across the grid. Which option <strong>completes the pattern</strong> in place of the “?”",
      figuresHTML: matrixGridHTML(cellFn),
      options: ordered.map((f) => ({ svg: f.svg })),
      answer: ordered.findIndex((f) => f._ok),
      explanation
    });
  }

  const norm = (a) => ((a % 360) + 360) % 360;
  let matN = 0;

  // 5 rotation matrices — arrow rotates by a fixed step across the grid
  const rotMats = [
    { base: 0, rStep: 90, cStep: 45 },
    { base: 45, rStep: 45, cStep: 45 },
    { base: 0, rStep: 45, cStep: 90 },
    { base: 90, rStep: 90, cStep: 90 },
    { base: 315, rStep: 45, cStep: 45 }
  ];
  rotMats.forEach((p) => {
    matN++;
    const angle = (r, c) => norm(p.base + r * p.rStep + c * p.cStep);
    const correctAng = angle(2, 2);
    const distract = shuffle(ALL_DIRS.filter((a) => a !== correctAng), 600 + matN).slice(0, 4);
    pushMatrix(matN, (r, c) => arrowInner(angle(r, c)), arrowInner(correctAng),
      distract.map((a) => arrowInner(a)),
      `Across each row the arrow turns ${p.cStep}° and down each column it turns ${p.rStep}°, so the missing arrow points ${DIR_NAME[correctAng]}.`,
      650 + matN);
  });

  // 4 counting matrices — number of dots increases by 1 right and down
  const cntMats = [{ start: 1 }, { start: 2 }, { start: 3 }, { start: 2 }];
  cntMats.forEach((p) => {
    matN++;
    const count = (r, c) => p.start + r + c; // (2,2) = start+4, stays within 1..9
    const correct = count(2, 2);
    const distractVals = [correct - 1, correct + 1, correct - 2, correct + 2].filter((v) => v >= 1 && v <= 9 && v !== correct);
    pushMatrix(matN, (r, c) => dotsInner(count(r, c)), dotsInner(correct),
      distractVals.slice(0, 4).map((v) => dotsInner(v)),
      `The number of dots increases by one across each row and down each column, so the missing cell has ${correct} dots.`,
      670 + matN);
  });

  // 4 shape matrices — number of sides increases by 1 right and down
  const sideMats = [{ base: 3 }, { base: 4 }, { base: 3 }, { base: 4 }];
  const POLYNAME = { 3: "triangle", 4: "square", 5: "pentagon", 6: "hexagon", 7: "heptagon", 8: "octagon" };
  sideMats.forEach((p) => {
    matN++;
    const sides = (r, c) => p.base + r + c; // (2,2) = base+4, kept within 3..8
    const correct = sides(2, 2);
    const distractVals = [correct - 1, correct + 1, correct - 2, correct + 2, correct - 3, correct - 4]
      .filter((v) => v >= 3 && v <= 8 && v !== correct);
    pushMatrix(matN, (r, c) => polyInner(sides(r, c)), polyInner(correct),
      distractVals.slice(0, 4).map((v) => polyInner(v)),
      `Each shape gains one side moving right and one side moving down, so the missing figure is a ${POLYNAME[correct]} (${correct} sides).`,
      690 + matN);
  });

  window.QUESTION_BANK = (window.QUESTION_BANK || []).concat(Q);
})();
