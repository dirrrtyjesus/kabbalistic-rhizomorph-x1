// Static corpus for the Kabbalistic Rhizomorph dApp.
// Coordinates are pixel centres measured directly on public/TreeFlower.png (1017 x 864).

export const IMG_W = 1017;
export const IMG_H = 864;
export const FLOWER = { cx: 510, cy: 432, r: 425 };
export const PHI_INV = 0.6180339887;

export type PartzufKey = "arich" | "abba" | "imma" | "zeir" | "nukva";
export type WorldKey = "atzilut" | "beriah" | "yetzirah" | "assiah";

export interface Sefira {
  id: number;
  key: string;
  name: string;
  hebrew: string;
  meaning: string;
  x: number;
  y: number;
  color: string;
  pillar: "severity" | "balance" | "mercy";
  partzuf: PartzufKey;
  /** log-scale intrinsic relaxation tempo; Keter fastest (near-infinite frequency), Malkhut slowest */
  tau: number;
  /** adoption / capacitive weight w_i */
  w: number;
  /** vessel yield threshold (elastic compliance). Upper three are high-compliance. */
  yieldAt: number;
  upper: boolean;
  analogue: string;
  desc: string;
  /** Traditional Hebrew gematria value */
  gematria: number;
}

export const SEFIROT: Sefira[] = [
  { id: 0, key: "keter", name: "Keter", hebrew: "כֶּתֶר", meaning: "Crown", x: 509, y: 147, color: "#f4f8ee",
    pillar: "balance", partzuf: "arich", tau: 0.0, w: 1.0, yieldAt: 9, upper: true, gematria: 620,
    analogue: "Apical growing tip — high-turgor exploratory front",
    desc: "Supernal Will (Arich Anpin). The apex that projects into the Tehiru cleared by Tzimtzum, focusing the whole network's turgor onto a single cross-section." },
  { id: 1, key: "chokmah", name: "Chokmah", hebrew: "חָכְמָה", meaning: "Wisdom", x: 633, y: 218, color: "#c9c6b2",
    pillar: "mercy", partzuf: "abba", tau: 0.8, w: 0.9, yieldAt: 7, upper: true, gematria: 73,
    analogue: "Seminal bioelectric impulse — concentrated potential",
    desc: "Abba. The concentrated, seminal flash of pure potentiality that Binah receives and scaffolds." },
  { id: 2, key: "binah", name: "Binah", hebrew: "בִּינָה", meaning: "Understanding", x: 387, y: 218, color: "#5a5a5e",
    pillar: "severity", partzuf: "imma", tau: 1.4, w: 0.9, yieldAt: 7, upper: true, gematria: 67,
    analogue: "Topological womb — matrix that branches the impulse",
    desc: "Imma. The expansive womb receiving Abba's impulse and articulating it into an intricate matrix of channels." },
  { id: 3, key: "chesed", name: "Chesed", hebrew: "חֶסֶד", meaning: "Loving-kindness", x: 631, y: 360, color: "#3fa9f5",
    pillar: "mercy", partzuf: "zeir", tau: 2.4, w: 0.8, yieldAt: 0.62, upper: false, gematria: 72,
    analogue: "Expansive medullary vessel hypha",
    desc: "First of the six emotive Sefirot of Ze'ir Anpin — outward, expansive flux into the medullary cord." },
  { id: 4, key: "gevurah", name: "Gevurah", hebrew: "גְּבוּרָה", meaning: "Strength / Judgement", x: 388, y: 361, color: "#e8341c",
    pillar: "severity", partzuf: "zeir", tau: 2.8, w: 0.8, yieldAt: 0.62, upper: false, gematria: 216,
    analogue: "Septal constriction — gated, limiting conduit",
    desc: "Restraint and measure. Gevurah's septa meter the flow; without it Chesed floods, with too much of it channels close (setum)." },
  { id: 5, key: "tiferet", name: "Tiferet", hebrew: "תִּפְאֶרֶת", meaning: "Beauty / Harmony", x: 509, y: 432, color: "#ffd21a",
    pillar: "balance", partzuf: "zeir", tau: 3.5, w: 1.0, yieldAt: 0.62, upper: false, gematria: 1081,
    analogue: "Central anastomosis hub of the medullary core",
    desc: "Heart of Ze'ir Anpin. The great junction where every pillar braids — the rhizomorph's medullary highway." },
  { id: 6, key: "netzach", name: "Netzach", hebrew: "נֶצַח", meaning: "Victory / Endurance", x: 631, y: 500, color: "#0fa37a",
    pillar: "mercy", partzuf: "zeir", tau: 4.4, w: 0.7, yieldAt: 0.62, upper: false, gematria: 148,
    analogue: "Persistent cortical extension",
    desc: "Endurance — sustained forward growth through resistant substrate." },
  { id: 7, key: "hod", name: "Hod", hebrew: "הוֹד", meaning: "Splendour", x: 387, y: 501, color: "#f06a1c",
    pillar: "severity", partzuf: "zeir", tau: 4.8, w: 0.7, yieldAt: 0.62, upper: false, gematria: 15,
    analogue: "Signal-patterning cortical sheath",
    desc: "Form and articulation — the patterned rind that gives the cord its legible contour." },
  { id: 8, key: "yesod", name: "Yesod", hebrew: "יְסוֹד", meaning: "Foundation", x: 509, y: 570, color: "#a347c9",
    pillar: "balance", partzuf: "zeir", tau: 5.6, w: 0.9, yieldAt: 0.62, upper: false, gematria: 80,
    analogue: "Collector node — funnels the braid to the substrate",
    desc: "Foundation. Gathers all upper flows into one conduit and transmits them to Malkhut." },
  { id: 9, key: "malkhut", name: "Malkhut", hebrew: "מַלְכוּת", meaning: "Kingdom", x: 510, y: 716, color: "#7a6a3a",
    pillar: "balance", partzuf: "nukva", tau: 7.0, w: 1.0, yieldAt: 0.62, upper: false, gematria: 496,
    analogue: "Terminal receptive interface — the fruiting ground",
    desc: "Nukva. The ground of manifestation where the braid's inner energies anchor into actualised reality (Assiah)." },
];

export type Clade = "mother" | "double" | "simple";
export type Orientation = "horizontal" | "vertical" | "diagonal";

export interface Letter { name: string; glyph: string; clade: Clade; attribution: string; gematria: number }

export const LETTERS: Record<string, Letter> = {
  aleph: { name: "Aleph", glyph: "א", clade: "mother", attribution: "Air", gematria: 1 },
  beth: { name: "Beth", glyph: "ב", clade: "double", attribution: "Saturn · Life/Death", gematria: 2 },
  gimel: { name: "Gimel", glyph: "ג", clade: "double", attribution: "Jupiter · Peace/War", gematria: 3 },
  daleth: { name: "Daleth", glyph: "ד", clade: "double", attribution: "Mars · Wisdom/Folly", gematria: 4 },
  heh: { name: "Heh", glyph: "ה", clade: "simple", attribution: "Aries · Speech", gematria: 5 },
  vav: { name: "Vav", glyph: "ו", clade: "simple", attribution: "Taurus · Thought", gematria: 6 },
  zayin: { name: "Zayin", glyph: "ז", clade: "simple", attribution: "Gemini · Motion", gematria: 7 },
  cheth: { name: "Cheth", glyph: "ח", clade: "simple", attribution: "Cancer · Sight", gematria: 8 },
  teth: { name: "Teth", glyph: "ט", clade: "simple", attribution: "Leo · Hearing", gematria: 9 },
  yod: { name: "Yod", glyph: "י", clade: "simple", attribution: "Virgo · Action", gematria: 10 },
  kaph: { name: "Kaph", glyph: "כ", clade: "double", attribution: "Sun · Wealth/Poverty", gematria: 20 },
  lamed: { name: "Lamed", glyph: "ל", clade: "simple", attribution: "Libra · Coition", gematria: 30 },
  mem: { name: "Mem", glyph: "מ", clade: "mother", attribution: "Water", gematria: 40 },
  nun: { name: "Nun", glyph: "נ", clade: "simple", attribution: "Scorpio · Smell", gematria: 50 },
  samekh: { name: "Samekh", glyph: "ס", clade: "simple", attribution: "Sagittarius · Sleep", gematria: 60 },
  ayin: { name: "Ayin", glyph: "ע", clade: "simple", attribution: "Capricorn · Anger", gematria: 70 },
  peh: { name: "Peh", glyph: "פ", clade: "double", attribution: "Venus · Grace/Ugliness", gematria: 80 },
  tzaddi: { name: "Tzaddi", glyph: "צ", clade: "simple", attribution: "Aquarius · Taste", gematria: 90 },
  qoph: { name: "Qoph", glyph: "ק", clade: "simple", attribution: "Pisces · Laughter", gematria: 100 },
  resh: { name: "Resh", glyph: "ר", clade: "double", attribution: "Mercury · Seed/Desolation", gematria: 200 },
  shin: { name: "Shin", glyph: "ש", clade: "mother", attribution: "Fire", gematria: 300 },
  tav: { name: "Tav", glyph: "ת", clade: "double", attribution: "Moon · Dominance/Slavery", gematria: 400 },
};

export const CLADE_INFO: Record<Clade, { label: string; color: string; geometry: Orientation; analogue: string; fn: string }> = {
  mother: { label: "Three Mothers", color: "#ffcc4d", geometry: "horizontal",
    analogue: "Inter-hyphal anastomosis bridges",
    fn: "Basal equilibrium, homeostatic balance and lateral field propagation across distinct axes." },
  double: { label: "Seven Doubles", color: "#7fd3ff", geometry: "vertical",
    analogue: "Gated medullary conduits & septal pores",
    fn: "Polarised, bidirectional flux; toggles high/low conductance at phase-locking thresholds." },
  simple: { label: "Twelve Simples", color: "#8cf5a4", geometry: "diagonal",
    analogue: "Cortical structural hyphae & apical exploratory threads",
    fn: "Perimeter volume, directional navigation and exploratory probing of external resistance." },
};

export interface PathDef { id: number; a: number; b: number; letter: string }

const K = { keter: 0, chokmah: 1, binah: 2, chesed: 3, gevurah: 4, tiferet: 5, netzach: 6, hod: 7, yesod: 8, malkhut: 9 };

/** Hermetic / Kircher tree — the topology actually drawn in TreeFlower.png */
export const PATHS_KIRCHER: PathDef[] = ([
  ["keter", "chokmah", "aleph"], ["keter", "binah", "beth"], ["keter", "tiferet", "gimel"],
  ["chokmah", "binah", "daleth"], ["chokmah", "tiferet", "heh"], ["chokmah", "chesed", "vav"],
  ["binah", "tiferet", "zayin"], ["binah", "gevurah", "cheth"], ["chesed", "gevurah", "teth"],
  ["chesed", "tiferet", "yod"], ["chesed", "netzach", "kaph"], ["gevurah", "tiferet", "lamed"],
  ["gevurah", "hod", "mem"], ["tiferet", "netzach", "nun"], ["tiferet", "yesod", "samekh"],
  ["tiferet", "hod", "ayin"], ["netzach", "hod", "peh"], ["netzach", "yesod", "tzaddi"],
  ["netzach", "malkhut", "qoph"], ["hod", "yesod", "resh"], ["hod", "malkhut", "shin"],
  ["yesod", "malkhut", "tav"],
] as const).map(([a, b, l], id) => ({ id, a: K[a], b: K[b], letter: l }));

/** Lurianic (Ari / Gra) tree — Mothers horizontal, Doubles vertical, Simples diagonal. */
export const PATHS_ARI: PathDef[] = ([
  ["chokmah", "binah", "aleph"], ["chesed", "gevurah", "mem"], ["netzach", "hod", "shin"],
  ["chokmah", "chesed", "beth"], ["binah", "gevurah", "gimel"], ["keter", "tiferet", "daleth"],
  ["chesed", "netzach", "kaph"], ["gevurah", "hod", "peh"], ["tiferet", "yesod", "resh"],
  ["yesod", "malkhut", "tav"],
  ["keter", "chokmah", "heh"], ["keter", "binah", "vav"], ["chokmah", "tiferet", "zayin"],
  ["binah", "tiferet", "cheth"], ["chokmah", "gevurah", "teth"], ["binah", "chesed", "yod"],
  ["chesed", "tiferet", "lamed"], ["gevurah", "tiferet", "nun"], ["tiferet", "netzach", "samekh"],
  ["tiferet", "hod", "ayin"], ["netzach", "yesod", "tzaddi"], ["hod", "yesod", "qoph"],
] as const).map(([a, b, l], id) => ({ id, a: K[a], b: K[b], letter: l }));

/** The Kav — the single linear ray (Yosher) along which the Nekudim points hung, one beneath another. */
export const KAV_CHAIN: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9],
];

export function orientationOf(p: PathDef): Orientation {
  const A = SEFIROT[p.a], B = SEFIROT[p.b];
  const dx = Math.abs(A.x - B.x), dy = Math.abs(A.y - B.y);
  if (dy < 20) return "horizontal";
  if (dx < 20) return "vertical";
  return "diagonal";
}

export interface Partzuf {
  name: string;
  hebrew: string;
  members: number[];
  color: string;
  role: string;
  zone: string;
  voice: string;
  voiceKey: string;
}

export const PARTZUFIM: Record<PartzufKey, Partzuf> = {
  arich: {
    name: "Arich Anpin / Attik Yomin",
    hebrew: "אריך אנפין",
    members: [0],
    color: "#ffffff",
    role: "Unmanifest sovereign intent; the apically dominant invasive force.",
    zone: "Apical apex",
    voice: "Will carved the Tehiru; the primordial apex pierces the unmanifest void.",
    voiceKey: "will_carved_tehiru",
  },
  abba: {
    name: "Abba",
    hebrew: "אבא",
    members: [1],
    color: "#d8d4bd",
    role: "Concentrated seminal bioelectric impulse of pure potentiality.",
    zone: "Apical / medullary junction",
    voice: "Seminal flash ignited; primordial wisdom sparks the living braid.",
    voiceKey: "flash_sparks_braid",
  },
  imma: {
    name: "Imma",
    hebrew: "אמא",
    members: [2],
    color: "#9a9aa3",
    role: "Topological womb scaffolding the impulse into channels.",
    zone: "Branching matrix",
    voice: "The matrix articulates; twenty-two conductile pathways woven into form.",
    voiceKey: "womb_weaves_conduits",
  },
  zeir: {
    name: "Ze'ir Anpin",
    hebrew: "זעיר אנפין",
    members: [3, 4, 5, 6, 7, 8],
    color: "#ffd21a",
    role: "The dynamic medullary cord bundling six emotive vectors into one conductile column.",
    zone: "Medullary core",
    voice: "The medullary core endures; six emotive vectors balance the hydraulic shear.",
    voiceKey: "medullary_core_balances",
  },
  nukva: {
    name: "Nukva d'Ze'ir Anpin",
    hebrew: "נוקבא",
    members: [9],
    color: "#b38b4d",
    role: "Terminal receptive interface anchoring the braid into reality.",
    zone: "Fruiting ground",
    voice: "The ground receives; the sovereign crown is anchored into physical reality.",
    voiceKey: "ground_anchors_light",
  },
};

export interface WorldDef {
  key: WorldKey;
  name: string;
  gloss: string;
  density: number;
  op: string;
  speedMultiplier: number;
  hueShift: number;
  blurb: string;
}

export const WORLDS: WorldDef[] = [
  { key: "atzilut", name: "Atzilut", gloss: "Emanation — frictionless Partzufic coherence", density: 0.0, op: "𝓗",
    speedMultiplier: 1.8, hueShift: 45, blurb: "Pure divine influx; lossless superconductor channels before coarse-graining." },
  { key: "beriah", name: "Beriah", gloss: "Creation — Throne & cosmic ideation", density: 0.12, op: "𝓖",
    speedMultiplier: 1.3, hueShift: 200, blurb: "The Divine Throne; pure blueprints begin condensation into functional geometry." },
  { key: "yetzirah", name: "Yetzirah", gloss: "Formation — the 22 letters configure relational flows", density: 0.22, op: "𝓕",
    speedMultiplier: 0.95, hueShift: 150, blurb: "Relational braid; the 22 letters shape the bioelectric currents across pillars." },
  { key: "assiah", name: "Assiah", gloss: "Action — maximal density, inertia, coarse-grained entropy", density: 0.35, op: "·",
    speedMultiplier: 0.65, hueShift: 20, blurb: "Physical reality; maximum substrate resistance where divine light anchors into the earth." },
];

export type Phase = "explore" | "akudim" | "tzimtzum" | "nekudim" | "shevirah" | "tikkun" | "atzilut";

export const PHASES: { key: Phase; title: string; hebrew: string; blurb: string }[] = [
  { key: "akudim", title: "Akudim", hebrew: "עקודים", blurb: "The bound world: all ten lights in a single undifferentiated macro-vessel. Infinite divine potential before differentiation." },
  { key: "tzimtzum", title: "Tzimtzum", hebrew: "צמצום", blurb: "The Primordial Contraction: Infinite Light (Or Ein Sof) withdraws outward, clearing the central void (Tehiru) and leaving the faint glowing residue (Reshimu). Watch the withdrawal before the ray strikes." },
  { key: "nekudim", title: "Nekudim", hebrew: "נקודים", blurb: "The World of Points: The single ray (Kav HaYashar) pierces the dark void. Ten solitary vessels hang on a single vertical axis without lateral conduits (lo histaklu da b'da). Unbuffered pressure begins to mount." },
  { key: "shevirah", title: "Shevirat HaKelim", hebrew: "שבירת הכלים", blurb: "Catastrophic Dissonance: The 7 lower vessels rupture under excessive shear stress. 288 sparks (Nitzutzot) fall into the calcified bark (Klippot)." },
  { key: "tikkun", title: "Birur & Tikkun", hebrew: "בירור ותיקון", blurb: "Gather the fallen sparks and re-weave the 22 Tzinorot. Each spark retrieved accumulates Hebrew Gematria into the cryptographic on-chain ratchet hash R(t+1) = R(t) ⊕_τ ι(t)." },
  { key: "atzilut", title: "Atzilut — Partzufim", hebrew: "אצילות", blurb: "Rectification complete: Solitary hyphae bundle into the multi-layered Partzufic cords. Coherence holds firmly above φ⁻¹ and the Tree of Life grows forward." },
  { key: "explore", title: "Free Analysis", hebrew: "ניתוח", blurb: "Interactive laboratory: Inspect, sever, constrict, or restore any conduit, test Cordoverian back-pressure, and fold/unfold the Four Worlds." },
];

export const SPARK_TOTAL = 288;
