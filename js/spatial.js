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
      id: `s-seq-${i + 1}`, category: CAT, type: "Next in Sequence",
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
      id: `s-odd-${i + 1}`, category: CAT, type: "Odd One Out",
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
      id: `s-match-${i + 1}`, category: CAT, type: "Rotated Match",
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
      id: `s-side-${i + 1}`, category: CAT, type: "Shape Properties",
      stem: `Which figure has the <strong>${p.pick} sides</strong>?`,
      options: ordered.map((f) => ({ svg: f.svg })),
      answer: ordered.findIndex((f) => f._sides === target),
      explanation: `The ${SIDE_NAME[target]} has the ${p.pick} sides (${target}).`
    });
  });

  window.QUESTION_BANK = (window.QUESTION_BANK || []).concat(Q);
})();
