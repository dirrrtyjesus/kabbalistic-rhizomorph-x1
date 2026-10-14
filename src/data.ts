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
}

export const SEFIROT: Sefira[] = [
  { id: 0, key: "keter", name: "Keter", hebrew: "כֶּתֶר", meaning: "Crown", x: 509, y: 147, color: "#f4f8ee",
    pillar: "balance", partzuf: "arich", tau: 0.0, w: 1.0, yieldAt: 9, upper: true,
    analogue: "Apical growing tip — high-turgor exploratory front",
    desc: "Supernal Will (Arich Anpin). The apex that projects into the Tehiru cleared by Tzimtzum, focusing the whole network's turgor onto a single cross-section." },
  { id: 1, key: "chokmah", name: "Chokmah", hebrew: "חָכְמָה", meaning: "Wisdom", x: 633, y: 218, color: "#c9c6b2",
    pillar: "mercy", partzuf: "abba", tau: 0.8, w: 0.9, yieldAt: 7, upper: true,
    analogue: "Seminal bioelectric impulse — concentrated potential",
    desc: "Abba. The concentrated, seminal flash of pure potentiality that Binah receives and scaffolds." },
  { id: 2, key: "binah", name: "Binah", hebrew: "בִּינָה", meaning: "Understanding", x: 387, y: 218, color: "#5a5a5e",
    pillar: "severity", partzuf: "imma", tau: 1.4, w: 0.9, yieldAt: 7, upper: true,
    analogue: "Topological womb — matrix that branches the impulse",
    desc: "Imma. The expansive womb receiving Abba's impulse and articulating it into an intricate matrix of channels." },
  { id: 3, key: "chesed", name: "Chesed", hebrew: "חֶסֶד", meaning: "Loving-kindness", x: 631, y: 360, color: "#3fa9f5",
    pillar: "mercy", partzuf: "zeir", tau: 2.4, w: 0.8, yieldAt: 0.62, upper: false,
    analogue: "Expansive medullary vessel hypha",
    desc: "First of the six emotive Sefirot of Ze'ir Anpin — outward, expansive flux into the medullary cord." },
  { id: 4, key: "gevurah", name: "Gevurah", hebrew: "גְּבוּרָה", meaning: "Strength / Judgement", x: 388, y: 361, color: "#e8341c",
    pillar: "severity", partzuf: "zeir", tau: 2.8, w: 0.8, yieldAt: 0.62, upper: false,
    analogue: "Septal constriction — gated, limiting conduit",
    desc: "Restraint and measure. Gevurah's septa meter the flow; without it Chesed floods, with too much of it channels close (setum)." },
  { id: 5, key: "tiferet", name: "Tiferet", hebrew: "תִּפְאֶרֶת", meaning: "Beauty / Harmony", x: 509, y: 432, color: "#ffd21a",
    pillar: "balance", partzuf: "zeir", tau: 3.5, w: 1.0, yieldAt: 0.62, upper: false,
    analogue: "Central anastomosis hub of the medullary core",
    desc: "Heart of Ze'ir Anpin. The great junction where every pillar braids — the rhizomorph's medullary highway." },
  { id: 6, key: "netzach", name: "Netzach", hebrew: "נֶצַח", meaning: "Victory / Endurance", x: 631, y: 500, color: "#0fa37a",
    pillar: "mercy", partzuf: "zeir", tau: 4.4, w: 0.7, yieldAt: 0.62, upper: false,
    analogue: "Persistent cortical extension",
    desc: "Endurance — sustained forward growth through resistant substrate." },
  { id: 7, key: "hod", name: "Hod", hebrew: "הוֹד", meaning: "Splendour", x: 387, y: 501, color: "#f06a1c",
    pillar: "severity", partzuf: "zeir", tau: 4.8, w: 0.7, yieldAt: 0.62, upper: false,
    analogue: "Signal-patterning cortical sheath",
    desc: "Form and articulation — the patterned rind that gives the cord its legible contour." },
  { id: 8, key: "yesod", name: "Yesod", hebrew: "יְסוֹד", meaning: "Foundation", x: 509, y: 570, color: "#a347c9",
    pillar: "balance", partzuf: "zeir", tau: 5.6, w: 0.9, yieldAt: 0.62, upper: false,
    analogue: "Collector node — funnels the braid to the substrate",
    desc: "Foundation. Gathers all upper flows into one conduit and transmits them to Malkhut." },
  { id: 9, key: "malkhut", name: "Malkhut", hebrew: "מַלְכוּת", meaning: "Kingdom", x: 510, y: 716, color: "#7a6a3a",
    pillar: "balance", partzuf: "nukva", tau: 7.0, w: 1.0, yieldAt: 0.62, upper: false,
    analogue: "Terminal receptive interface — the fruiting ground",
    desc: "Nukva. The ground of manifestation where the braid's inner energies anchor into actualised reality (Assiah)." },
];

export type Clade = "mother" | "double" | "simple";
export type Orientation = "horizontal" | "vertical" | "diagonal";

export interface Letter { name: string; glyph: string; clade: Clade; attribution: string }

export const LETTERS: Record<string, Letter> = {
  aleph: { name: "Aleph", glyph: "א", clade: "mother", attribution: "Air" },
  beth: { name: "Beth", glyph: "ב", clade: "double", attribution: "Saturn · Life/Death (Gra) — Moon (GD)" },
  gimel: { name: "Gimel", glyph: "ג", clade: "double", attribution: "Jupiter · Peace/War" },
  daleth: { name: "Daleth", glyph: "ד", clade: "double", attribution: "Mars · Wisdom/Folly" },
  heh: { name: "Heh", glyph: "ה", clade: "simple", attribution: "Aries · Speech" },
  vav: { name: "Vav", glyph: "ו", clade: "simple", attribution: "Taurus · Thought" },
  zayin: { name: "Zayin", glyph: "ז", clade: "simple", attribution: "Gemini · Motion" },
  cheth: { name: "Cheth", glyph: "ח", clade: "simple", attribution: "Cancer · Sight" },
  teth: { name: "Teth", glyph: "ט", clade: "simple", attribution: "Leo · Hearing" },
  yod: { name: "Yod", glyph: "י", clade: "simple", attribution: "Virgo · Action" },
  kaph: { name: "Kaph", glyph: "כ", clade: "double", attribution: "Sun · Wealth/Poverty" },
  lamed: { name: "Lamed", glyph: "ל", clade: "simple", attribution: "Libra · Coition" },
  mem: { name: "Mem", glyph: "מ", clade: "mother", attribution: "Water" },
  nun: { name: "Nun", glyph: "נ", clade: "simple", attribution: "Scorpio · Smell" },
  samekh: { name: "Samekh", glyph: "ס", clade: "simple", attribution: "Sagittarius · Sleep" },
  ayin: { name: "Ayin", glyph: "ע", clade: "simple", attribution: "Capricorn · Anger" },
  peh: { name: "Peh", glyph: "פ", clade: "double", attribution: "Venus · Grace/Ugliness" },
  tzaddi: { name: "Tzaddi", glyph: "צ", clade: "simple", attribution: "Aquarius · Taste" },
  qoph: { name: "Qoph", glyph: "ק", clade: "simple", attribution: "Pisces · Laughter" },
  resh: { name: "Resh", glyph: "ר", clade: "double", attribution: "Mercury · Seed/Desolation" },
  shin: { name: "Shin", glyph: "ש", clade: "mother", attribution: "Fire" },
  tav: { name: "Tav", glyph: "ת", clade: "double", attribution: "Moon · Dominance/Slavery" },
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

/** Lurianic (Ari / Gra) tree — Mothers horizontal, Doubles vertical, Simples diagonal.
 *  Clade geometry is canonical; the individual letter ordering within each clade is illustrative
 *  (commentators differ). */
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

export const PARTZUFIM: Record<PartzufKey, { name: string; hebrew: string; members: number[]; color: string; role: string; zone: string }> = {
  arich: { name: "Arich Anpin / Attik Yomin", hebrew: "אריך אנפין", members: [0], color: "#ffffff",
    role: "Unmanifest sovereign intent; the apically dominant invasive force.", zone: "Apical apex" },
  abba: { name: "Abba", hebrew: "אבא", members: [1], color: "#d8d4bd",
    role: "Concentrated seminal bioelectric impulse of pure potentiality.", zone: "Apical / medullary junction" },
  imma: { name: "Imma", hebrew: "אמא", members: [2], color: "#9a9aa3",
    role: "Topological womb scaffolding the impulse into channels.", zone: "Branching matrix" },
  zeir: { name: "Ze'ir Anpin", hebrew: "זעיר אנפין", members: [3, 4, 5, 6, 7, 8], color: "#ffd21a",
    role: "The dynamic medullary cord bundling six emotive vectors into one conductile column.", zone: "Medullary core" },
  nukva: { name: "Nukva d'Ze'ir Anpin", hebrew: "נוקבא", members: [9], color: "#b38b4d",
    role: "Terminal receptive interface anchoring the braid into reality.", zone: "Fruiting ground" },
};

export const WORLDS: { key: WorldKey; name: string; gloss: string; density: number; op: string }[] = [
  { key: "atzilut", name: "Atzilut", gloss: "Emanation — frictionless Partzufic coherence", density: 0.0, op: "𝓗" },
  { key: "beriah", name: "Beriah", gloss: "Creation — Throne & cosmic ideation", density: 0.12, op: "𝓖" },
  { key: "yetzirah", name: "Yetzirah", gloss: "Formation — the 22 letters configure relational flows", density: 0.22, op: "𝓕" },
  { key: "assiah", name: "Assiah", gloss: "Action — maximal density, inertia, coarse-grained entropy", density: 0.35, op: "·" },
];

export type Phase = "explore" | "akudim" | "nekudim" | "shevirah" | "tikkun" | "atzilut";

export const PHASES: { key: Phase; title: string; hebrew: string; blurb: string }[] = [
  { key: "akudim", title: "Akudim", hebrew: "עקודים", blurb: "The bound world: all ten lights in a single undifferentiated macro-vessel. No pathways, no analysis — only potential." },
  { key: "nekudim", title: "Nekudim", hebrew: "נקודים", blurb: "The World of Points. Ten solitary vessels hang on a single ray (the Kav) and do not gaze upon one another — no transverse conduits. Raise the influx of Or and watch the shear." },
  { key: "shevirah", title: "Shevirat HaKelim", hebrew: "שבירת הכלים", blurb: "The seven lower vessels rupture under unbuffered stress. 288 sparks (Nitzutzot) fall into the shells (Klippot)." },
  { key: "tikkun", title: "Birur & Tikkun", hebrew: "בירור ותיקון", blurb: "Re-weave the 22 Tzinorot and gather the sparks. Each gathered spark is an irreversible ratchet ι(t); Σ never decreases." },
  { key: "atzilut", title: "Atzilut — Partzufim", hebrew: "אצילות", blurb: "Hyphae bundle into apically dominant rhizomorphic cords. Coherence holds above φ⁻¹ and the Tree grows forward." },
  { key: "explore", title: "Free Analysis", hebrew: "ניתוח", blurb: "Open laboratory: sever, constrict, or re-weave any conduit and observe Shefa flow, induced dissonance η and topological coherence." },
];

export const SPARK_TOTAL = 288;
