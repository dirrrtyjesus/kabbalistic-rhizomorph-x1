// Rhizomorphic Pathway Analysis — pure, framework-free graph model.
//
//  • Induced dissonance    η  = Σ_{i<j} w_i w_j |τ̄_i − τ̄_j|          (adoption-weighted pair clash)
//  • Topological coherence C  = 1 − η / η_max,  stability floor C ≥ φ⁻¹
//  • Effective tempos      τ̄  = (I + β·L)⁻¹ τ   — anastomosis (graph Laplacian L) metabolises clash;
//                                                with zero coupling τ̄ = τ and η = η_max (Nekudim).
//  • Shefa hydraulics      (L_g + εI + G_sink e_m e_mᵀ) V = Φ e_keter   (Cordovero's Tzinorot as a
//                          conductance network; ε is a small leak so blocked flow shows as back-pressure)
//  • Vessel stress         σ_i = (throughflow_i / active-conduits_i) · (2 − C)
//  • Coherence amplification γ ∝ ρ_gj / λ_decay · Ψ  (gap-junction density ~ mean active conductance)

import { SEFIROT, PHI_INV, type PathDef } from "./data.ts";

export interface Edge { id: number; a: number; b: number; g: number }

export interface Analysis {
  tauBar: number[];
  eta: number;
  etaMax: number;
  C: number;
  aboveFloor: boolean;
  V: number[];
  current: number[];           // signed current per edge id (a → b positive)
  throughflow: number[];
  stress: number[];
  ruptureRisk: number[];       // σ / yield
  delivered: number;           // fraction of influx reaching Malkhut
  backPressure: number[];      // normalised node pressure (0..1+)
  activeDeg: number[];
  components: number;          // connected components among the 10 vessels
  gamma: number;               // coherence amplification
  growthRate: number;          // mm/day — hypha 1.0–1.5 → rhizomorph 7.0–7.4
  bottlenecks: { id: number; betweenness: number }[];
}

const N = 10;
const EPS_LEAK = 2e-3;
const G_SINK = 50;

function solve(A: number[][], b: number[]): number[] {
  // Gaussian elimination with partial pivoting (10×10 — trivial)
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const piv = M[c][c] || 1e-12;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / piv;
      if (f === 0) continue;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((r, i) => r[n] / (r[i] || 1e-12));
}

function laplacian(edges: Edge[]): number[][] {
  const L = Array.from({ length: N }, () => new Array(N).fill(0));
  for (const e of edges) {
    if (e.g <= 0) continue;
    L[e.a][e.a] += e.g; L[e.b][e.b] += e.g;
    L[e.a][e.b] -= e.g; L[e.b][e.a] -= e.g;
  }
  return L;
}

function pairClash(t: number[], w: number[]): number {
  let s = 0;
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) s += w[i] * w[j] * Math.abs(t[i] - t[j]);
  return s;
}

function countComponents(edges: Edge[]): number {
  const parent = [...Array(N).keys()];
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  for (const e of edges) if (e.g > 0) parent[find(e.a)] = find(e.b);
  return new Set([...Array(N).keys()].map(find)).size;
}

/** Edge betweenness on unweighted shortest paths (Brandes) — locates hyphal bottlenecks. */
function edgeBetweenness(edges: Edge[]): Map<number, number> {
  const adj: { to: number; id: number }[][] = Array.from({ length: N }, () => []);
  for (const e of edges) if (e.g > 0) { adj[e.a].push({ to: e.b, id: e.id }); adj[e.b].push({ to: e.a, id: e.id }); }
  const eb = new Map<number, number>();
  for (const e of edges) eb.set(e.id, 0);
  for (let s = 0; s < N; s++) {
    const stack: number[] = [];
    const pred: { v: number; id: number }[][] = Array.from({ length: N }, () => []);
    const sigma = new Array(N).fill(0); sigma[s] = 1;
    const dist = new Array(N).fill(-1); dist[s] = 0;
    const q = [s];
    while (q.length) {
      const v = q.shift()!; stack.push(v);
      for (const { to, id } of adj[v]) {
        if (dist[to] < 0) { dist[to] = dist[v] + 1; q.push(to); }
        if (dist[to] === dist[v] + 1) { sigma[to] += sigma[v]; pred[to].push({ v, id }); }
      }
    }
    const delta = new Array(N).fill(0);
    while (stack.length) {
      const wv = stack.pop()!;
      for (const { v, id } of pred[wv]) {
        const c = (sigma[v] / sigma[wv]) * (1 + delta[wv]);
        eb.set(id, (eb.get(id) || 0) + c);
        delta[v] += c;
      }
    }
  }
  for (const [k, v] of eb) eb.set(k, v / 2);
  return eb;
}

export interface ModelInput {
  edges: Edge[];
  coupling: number;     // κ ∈ [0,1] — anastomosis strength
  influx: number;       // Φ — intensity of Or (light)
  worldDensity?: number;// extra coarse-graining noise for lower worlds
}

export function analyse({ edges, coupling, influx, worldDensity = 0 }: ModelInput): Analysis {
  const tau = SEFIROT.map((s) => s.tau);
  const w = SEFIROT.map((s) => s.w);
  const L = laplacian(edges);

  // ---- dissonance & coherence ------------------------------------------------
  const beta = 4 * coupling;
  const A = L.map((row, i) => row.map((v, j) => (i === j ? 1 : 0) + beta * v));
  let tauBar = solve(A, tau);
  if (worldDensity > 0) {
    // descent through denser worlds re-separates tempos (coarse-graining): τ̄ ← τ̄ + d·(τ − τ̄)
    tauBar = tauBar.map((t, i) => t + worldDensity * (tau[i] - t));
  }
  const etaMax = pairClash(tau, w);
  const eta = pairClash(tauBar, w);
  const C = Math.max(0, Math.min(1, 1 - eta / etaMax));

  // ---- Shefa hydraulics ------------------------------------------------------
  const G = L.map((row, i) => row.map((v, j) => v + (i === j ? EPS_LEAK : 0)));
  G[9][9] += G_SINK;
  const b = new Array(N).fill(0); b[0] = influx;
  const V = solve(G, b);
  const current: number[] = [];
  const throughflow = new Array(N).fill(0);
  const activeDeg = new Array(N).fill(0);
  for (const e of edges) {
    const I = e.g > 0 ? e.g * (V[e.a] - V[e.b]) : 0;
    current[e.id] = I;
    throughflow[e.a] += Math.abs(I) / 2; throughflow[e.b] += Math.abs(I) / 2;
    if (e.g > 0) { activeDeg[e.a]++; activeDeg[e.b]++; }
  }
  throughflow[0] += influx / 2;                 // source injection
  const delivered = influx > 0 ? (V[9] * G_SINK) / influx : 0;
  throughflow[9] += (V[9] * G_SINK) / 2;        // sink discharge into the substrate
  activeDeg[9] += 2;                            // Malkhut roots into the substrate (ground conduits)

  const shear = 2 - C;
  // Setum (obstruction): pressure above the open-network norm becomes destructive back-pressure.
  const pressureStress = V.map((v) => (influx > 0 ? 0.12 * influx * Math.log1p(Math.max(0, v / influx - 2)) : 0));
  const stress = throughflow.map((t, i) => (t / Math.max(1, activeDeg[i]) + pressureStress[i]) * shear);
  const ruptureRisk = stress.map((s, i) => s / SEFIROT[i].yieldAt);
  const vRef = influx > 0 ? influx * 2 : 1;
  const backPressure = V.map((v) => v / vRef);

  // ---- rhizomorph metrics ----------------------------------------------------
  const activeEdges = edges.filter((e) => e.g > 0);
  const rho = activeEdges.reduce((s, e) => s + e.g, 0) / 22;   // gap-junction density proxy
  const components = countComponents(edges);
  const gamma = (rho / (1.05 - C)) * coupling;                   // γ = ρ_gj/λ_decay · Ψ
  const bundled = Math.min(1, Math.max(0, (C - 0.35) / (1 - 0.35)));
  const growthRate = 1.25 + bundled * (7.2 - 1.25);

  const eb = edgeBetweenness(edges);
  const bottlenecks = [...eb.entries()]
    .filter(([id]) => edges.find((e) => e.id === id)!.g > 0)
    .map(([id, betweenness]) => ({ id, betweenness }))
    .sort((x, y) => y.betweenness - x.betweenness)
    .slice(0, 3);

  return {
    tauBar, eta, etaMax, C, aboveFloor: C >= PHI_INV, V, current, throughflow, stress,
    ruptureRisk, delivered, backPressure, activeDeg, components, gamma, growthRate, bottlenecks,
  };
}

export function edgesFrom(paths: PathDef[], conductance: number[]): Edge[] {
  return paths.map((p) => ({ id: p.id, a: p.a, b: p.b, g: conductance[p.id] ?? 1 }));
}

/** Four-Worlds non-commutative cascade: 𝒲_Assiah ≔ 𝓕(𝒲_Yetzirah ≔ 𝓖(𝒲_Beriah ≔ 𝓗(𝒲_Atzilut))).
 *  Each ≔ freezes the upstream coherence as a boundary condition, then coarse-grains. */
export function cascade(base: ModelInput, densities: number[]): number[] {
  const out: number[] = [];
  let committed = 1;
  for (const d of densities) {
    const a = analyse({ ...base, worldDensity: d });
    committed = Math.min(committed, a.C);        // ≔ : downstream can never exceed the committed upstream state
    out.push(committed);
  }
  return out;
}

/** Cryptographic rolling ratchet hash for Proof-of-Tikkun:
 *  R(t+1) = hash(R(t) ⊕ gematria ⊕ sparks ⊕ slot)
 *  Deterministic 16-character hex hash that binds on-chain inscription history to the spark gematria tally.
 */
export function computeRatchetHash(
  prevHash: string,
  gematria: number,
  sparks: number,
  slot: number
): string {
  const input = `${prevHash || "0000000000000000"}:${gematria}:${sparks}:${slot}`;
  let h1 = 0xdeadbeef ^ (slot & 0xffffffff);
  let h2 = 0x41c6ce57 ^ (gematria & 0xffffffff);
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const p1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const p2 = (h2 >>> 0).toString(16).padStart(8, "0");
  return (p1 + p2).slice(0, 16);
}
