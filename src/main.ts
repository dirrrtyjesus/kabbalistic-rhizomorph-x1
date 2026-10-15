import "./style.css";
import { Buffer } from "buffer";
(window as any).Buffer = Buffer;
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  type Signer,
} from "@solana/web3.js";
import {
  SEFIROT,
  PATHS_KIRCHER,
  PATHS_ARI,
  KAV_CHAIN,
  LETTERS,
  CLADE_INFO,
  PARTZUFIM,
  WORLDS,
  PHASES,
  PHI_INV,
  SPARK_TOTAL,
  IMG_W,
  IMG_H,
  type Sefira,
  type PathDef,
  type Phase,
  type Clade,
  type WorldKey,
  orientationOf,
} from "./data.ts";
import {
  analyse,
  edgesFrom,
  cascade,
  computeRatchetHash,
  type Analysis,
} from "./model.ts";
import {
  deriveOscillator,
  evaluateOscillator,
  pumpOscillator,
  CymaticVisualizer,
  generateDROCertificateSVG,
  type OscillatorState,
  LuminosityState,
} from "./dro.ts";

const X1_RPC_URL = "https://rpc.mainnet.x1.xyz";
const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const [REGISTRY_PDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("kabbalistic-rhizomorph")],
  MEMO_PROGRAM_ID
);

interface Spark {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gathered: boolean;
  sefiraId: number;
}

interface Particle {
  pathId: number;
  t: number;
  speed: number;
  size: number;
  color: string;
}

class AppState {
  system: "kircher" | "ari" = "kircher";
  phase: Phase = "explore";
  activeWorld: WorldKey = "atzilut";
  kappa: number = 0.6;
  phi: number = 0.8;
  layers = {
    clades: true,
    flow: true,
    labels: true,
    partzufim: false,
    anatomy: false,
  };
  conductance: number[] = new Array(22).fill(1);
  selectedSefira: Sefira | null = SEFIROT[5]; // Default Tiferet
  selectedPath: PathDef | null = null;
  brokenVessels: Set<number> = new Set();
  sparks: Spark[] = [];
  sparksGathered: number = 0;
  totalGematria: number = 0;
  ratchetHash: string = "0000000000000000";
  localRatchet: number = 0;
  uncommittedIota: number = 0;
  chainSigma: number = 0;
  walletPubkey: PublicKey | null = null;
  walletBalance: number = 0;
  activeWalletProvider: any = null;
  particles: Particle[] = [];
  analysis: Analysis | null = null;
  connection: Connection;
  oscillator: OscillatorState | null = null;
  cymatics: CymaticVisualizer | null = null;
  currentSlot: number = 85942729;
  tzimtzumRadius: number = 0;
  kavBeamProgress: number = 0;

  constructor() {
    this.connection = new Connection(X1_RPC_URL, "confirmed");
  }

  get currentPaths(): PathDef[] {
    return this.system === "kircher" ? PATHS_KIRCHER : PATHS_ARI;
  }
}

const state = new AppState();

// Initialize UI Elements
const el = {
  netDot: document.getElementById("netDot")!,
  slot: document.getElementById("slot")!,
  connectBtn: document.getElementById("connectBtn") as HTMLButtonElement,
  walletSelect: document.getElementById("walletSelect") as HTMLSelectElement,
  phaseBar: document.getElementById("phaseBar")!,
  phaseBlurb: document.getElementById("phaseBlurb")!,
  stage: document.getElementById("stage")!,
  overlay: document.getElementById("overlay") as unknown as SVGSVGElement,
  fx: document.getElementById("fx") as HTMLCanvasElement,
  toast: document.getElementById("toast")!,
  systemSeg: document.getElementById("systemSeg")!,
  kappa: document.getElementById("kappa") as HTMLInputElement,
  kVal: document.getElementById("kVal")!,
  phi: document.getElementById("phi") as HTMLInputElement,
  phiVal: document.getElementById("phiVal")!,
  layerToggles: document.getElementById("layerToggles")!,
  phaseActions: document.getElementById("phaseActions")!,
  inspTag: document.getElementById("inspTag")!,
  partzufVoiceBanner: document.getElementById("partzufVoiceBanner")!,
  inspBody: document.getElementById("inspBody")!,
  mEta: document.getElementById("mEta")!,
  mEtaMax: document.getElementById("mEtaMax")!,
  mDeliv: document.getElementById("mDeliv")!,
  mGrowth: document.getElementById("mGrowth")!,
  mGamma: document.getElementById("mGamma")!,
  mFit: document.getElementById("mFit")!,
  mC: document.getElementById("mC")!,
  cFill: document.getElementById("cFill")!,
  riskBars: document.getElementById("riskBars")!,
  tempoChart: document.getElementById("tempoChart")!,
  bottlenecks: document.getElementById("bottlenecks")!,
  activeWorldTag: document.getElementById("activeWorldTag")!,
  worldFoldBtn: document.getElementById("worldFoldBtn") as HTMLButtonElement,
  worldUnfoldBtn: document.getElementById("worldUnfoldBtn") as HTMLButtonElement,
  worldPills: document.getElementById("worldPills")!,
  compositionFormula: document.getElementById("compositionFormula")!,
  worldBlurb: document.getElementById("worldBlurb")!,
  worlds: document.getElementById("worlds")!,
  lSparks: document.getElementById("lSparks")!,
  lGematria: document.getElementById("lGematria")!,
  lRatchetHash: document.getElementById("lRatchetHash")!,
  lSigma: document.getElementById("lSigma")!,
  lDelta: document.getElementById("lDelta")!,
  lChain: document.getElementById("lChain")!,
  lAddr: document.getElementById("lAddr")!,
  lBal: document.getElementById("lBal")!,
  commitBtn: document.getElementById("commitBtn") as HTMLButtonElement,
  registryAddr: document.getElementById("registryAddr")!,
  feed: document.getElementById("feed")!,
  droCanvas: document.getElementById("droCanvas") as HTMLCanvasElement,
  droStateTag: document.getElementById("droStateTag")!,
  droArchetype: document.getElementById("droArchetype")!,
  droAmp: document.getElementById("droAmp")!,
  droOmega: document.getElementById("droOmega")!,
  droZeta: document.getElementById("droZeta")!,
  droEff: document.getElementById("droEff")!,
  droPumpBtn: document.getElementById("droPumpBtn") as HTMLButtonElement,
  droTuneBtn: document.getElementById("droTuneBtn") as HTMLButtonElement,
  droExportBtn: document.getElementById("droExportBtn") as HTMLButtonElement,
};

el.registryAddr.textContent = REGISTRY_PDA.toBase58().slice(0, 8) + "…" + REGISTRY_PDA.toBase58().slice(-6);

// --- Phase Setup & Transitions ---
function setupPhases() {
  el.phaseBar.innerHTML = "";
  PHASES.forEach((p) => {
    const btn = document.createElement("button");
    btn.className = `phase-btn ${state.phase === p.key ? "on" : ""}`;
    btn.innerHTML = `
      <span class="heb">${p.hebrew}</span>
      <span class="t">${p.title}</span>
    `;
    btn.onclick = () => setPhase(p.key);
    el.phaseBar.appendChild(btn);
  });
}

function setPhase(phase: Phase) {
  state.phase = phase;
  setupPhases();

  // Reset stage classes
  el.stage.className = "stage";
  if (phase === "akudim") el.stage.classList.add("akudim");
  if (phase === "tzimtzum") el.stage.classList.add("tzimtzum");
  if (phase === "nekudim") el.stage.classList.add("nekudim");
  if (phase === "shevirah") el.stage.classList.add("dim");
  if (phase === "tikkun") el.stage.classList.add("gathering");

  const pInfo = PHASES.find((p) => p.key === phase)!;
  el.phaseBlurb.innerHTML = `<b>${pInfo.title} (${pInfo.hebrew}):</b> ${pInfo.blurb}`;

  // Actions per phase
  el.phaseActions.innerHTML = "";

  if (phase === "akudim") {
    state.conductance.fill(0);
    state.kappa = 0;
    state.phi = 0.5;
    state.brokenVessels.clear();
    const btn = document.createElement("button");
    btn.className = "btn primary";
    btn.textContent = "Initiate Tzimtzum (Primordial Contraction) →";
    btn.onclick = () => setPhase("tzimtzum");
    el.phaseActions.appendChild(btn);
  } else if (phase === "tzimtzum") {
    state.conductance.fill(0);
    state.kappa = 0;
    state.phi = 0.3;
    state.brokenVessels.clear();
    state.tzimtzumRadius = 0;
    state.kavBeamProgress = 0;
    showToast("Tzimtzum: Light withdraws to the perimeter, clearing the Tehiru void with the glowing Reshimu.");

    const btnPierce = document.createElement("button");
    btnPierce.className = "btn gold";
    btnPierce.textContent = "Pierce Tehiru with the Kav (Single Ray) →";
    btnPierce.onclick = () => {
      // Trigger Kav ray descent
      let prog = 0;
      const kavTimer = setInterval(() => {
        prog += 0.08;
        state.kavBeamProgress = Math.min(1, prog);
        if (prog >= 1) {
          clearInterval(kavTimer);
          setPhase("nekudim");
        }
      }, 30);
    };
    el.phaseActions.appendChild(btnPierce);
  } else if (phase === "nekudim") {
    // Only Kav chain active with near-zero lateral conductance
    state.conductance.fill(0);
    state.brokenVessels.clear();
    state.sparks = [];
    state.kappa = 0.05;
    state.phi = 1.1; // Pressure surge
    state.kavBeamProgress = 1;
    showToast("Kav HaYashar pierced the void: 10 solitary points without transverse anastomosis (lo histaklu da b'da).");
    const btn = document.createElement("button");
    btn.className = "btn danger";
    btn.textContent = "Trigger Shevirat HaKelim (Catastrophic Rupture) ⚡";
    btn.onclick = () => triggerShevirah();
    el.phaseActions.appendChild(btn);
  } else if (phase === "shevirah") {
    triggerShevirah();
    const btn = document.createElement("button");
    btn.className = "btn gold";
    btn.textContent = "Begin Birur & Tikkun (Gather Sparks) →";
    btn.onclick = () => setPhase("tikkun");
    el.phaseActions.appendChild(btn);
  } else if (phase === "tikkun") {
    const btnRestore = document.createElement("button");
    btnRestore.className = "btn primary";
    btnRestore.textContent = "Re-weave All 22 Tzinorot";
    btnRestore.onclick = () => {
      state.conductance.fill(1);
      state.kappa = 0.75;
      updateModel();
      showToast("Conduits restored: Anastomosis re-established");
    };
    el.phaseActions.appendChild(btnRestore);

    const btnAllSparks = document.createElement("button");
    btnAllSparks.className = "btn gold";
    btnAllSparks.textContent = "Gather All 288 Sparks (Birur)";
    btnAllSparks.onclick = () => gatherAllSparks();
    el.phaseActions.appendChild(btnAllSparks);
  } else if (phase === "atzilut") {
    state.conductance.fill(1);
    state.kappa = 0.85;
    state.phi = 1.0;
    state.brokenVessels.clear();
    state.layers.partzufim = true;
    showToast("Atzilut Rectified: Partzufic Bundling & Coherent Shefa");
  } else {
    // Free Analysis mode
    const btnReset = document.createElement("button");
    btnReset.className = "btn";
    btnReset.textContent = "Reset All Conduits";
    btnReset.onclick = () => {
      state.conductance.fill(1);
      state.brokenVessels.clear();
      state.kappa = 0.6;
      state.phi = 0.8;
      updateModel();
    };
    el.phaseActions.appendChild(btnReset);

    const btnSeverHoriz = document.createElement("button");
    btnSeverHoriz.className = "btn danger";
    btnSeverHoriz.textContent = "Sever Transverse Conduits (Mothers)";
    btnSeverHoriz.onclick = () => {
      state.currentPaths.forEach((p, idx) => {
        if (orientationOf(p) === "horizontal") state.conductance[idx] = 0;
      });
      updateModel();
      showToast("Horizontal anastomosis severed: Inter-pillar balance destabilized");
    };
    el.phaseActions.appendChild(btnSeverHoriz);
  }

  syncControls();
  updateModel();
}

function triggerShevirah() {
  // Rupture lower 7 vessels (Chesed through Malkhut: ids 3..9)
  state.brokenVessels.clear();
  for (let i = 3; i <= 9; i++) {
    state.brokenVessels.add(i);
  }
  // Spawn 288 fallen sparks around lower vessels
  state.sparks = [];
  state.sparksGathered = 0;
  for (let i = 0; i < SPARK_TOTAL; i++) {
    const targetSefira = SEFIROT[3 + (i % 7)];
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 90;
    state.sparks.push({
      id: i,
      x: targetSefira.x + Math.cos(angle) * dist,
      y: targetSefira.y + Math.sin(angle) * dist,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      gathered: false,
      sefiraId: targetSefira.id,
    });
  }
  showToast("Shevirat HaKelim: 7 lower vessels ruptured! 288 sparks trapped in the Klippot.");
  updateModel();
}

function gatherSpark(spark: Spark) {
  if (spark.gathered) return;
  spark.gathered = true;
  state.sparksGathered++;
  state.localRatchet++;
  state.uncommittedIota++;

  // Accumulate Gematria per spark from the host Sefira
  const sparkGematria = Math.max(1, Math.round(SEFIROT[spark.sefiraId].gematria / 41));
  state.totalGematria += sparkGematria;
  state.ratchetHash = computeRatchetHash(
    state.ratchetHash,
    state.totalGematria,
    state.sparksGathered,
    state.currentSlot
  );

  el.lSparks.textContent = `${state.sparksGathered} / ${SPARK_TOTAL}`;
  el.lGematria.textContent = state.totalGematria.toString();
  el.lRatchetHash.textContent = state.ratchetHash;
  el.lSigma.textContent = state.localRatchet.toString();
  el.lDelta.textContent = `+${state.uncommittedIota}`;
  el.commitBtn.disabled = !state.walletPubkey || state.uncommittedIota === 0;

  // Restore Sefira when enough sparks gathered
  const remaining = state.sparks.filter((s) => s.sefiraId === spark.sefiraId && !s.gathered).length;
  if (remaining === 0) {
    state.brokenVessels.delete(spark.sefiraId);
    const pzf = PARTZUFIM[SEFIROT[spark.sefiraId].partzuf];
    showToast(`Vessel ${SEFIROT[spark.sefiraId].name} rectified! ${pzf.name}: "${pzf.voice}"`);
  }
  updateModel();
}

function gatherAllSparks() {
  state.sparks.forEach((s) => (s.gathered = true));
  state.sparksGathered = SPARK_TOTAL;
  state.localRatchet += state.sparks.length;
  state.uncommittedIota += state.sparks.length;
  state.totalGematria = 2868; // Complete Tree of Life Sefirot gematria
  state.ratchetHash = computeRatchetHash(
    state.ratchetHash,
    state.totalGematria,
    SPARK_TOTAL,
    state.currentSlot
  );
  state.brokenVessels.clear();
  el.lSparks.textContent = `${SPARK_TOTAL} / ${SPARK_TOTAL}`;
  el.lGematria.textContent = state.totalGematria.toString();
  el.lRatchetHash.textContent = state.ratchetHash;
  el.lSigma.textContent = state.localRatchet.toString();
  el.lDelta.textContent = `+${state.uncommittedIota}`;
  el.commitBtn.disabled = !state.walletPubkey;
  showToast("All 288 Sparks Gathered! Proof-of-Tikkun Ratchet Hash R(t) verified.");
  updateModel();
}

function showToast(msg: string) {
  el.toast.textContent = msg;
  el.toast.classList.add("show");
  setTimeout(() => el.toast.classList.remove("show"), 3200);
}

function syncControls() {
  el.kappa.value = state.kappa.toString();
  el.kVal.textContent = state.kappa.toFixed(2);
  el.phi.value = state.phi.toString();
  el.phiVal.textContent = state.phi.toFixed(2);
}

// --- Model Computation ---
function updateModel() {
  const paths = state.currentPaths;
  const edges = edgesFrom(paths, state.conductance);

  // If in Nekudim, force isolated Kav configuration
  if (state.phase === "nekudim") {
    edges.forEach((e) => {
      const isKav = KAV_CHAIN.some(([a, b]) => (e.a === a && e.b === b) || (e.a === b && e.b === a));
      e.g = isKav ? 1.0 : 0.0;
    });
  }

  // Broken vessels have zero internal conductance & leak flow
  state.brokenVessels.forEach((vid) => {
    edges.forEach((e) => {
      if (e.a === vid || e.b === vid) e.g *= 0.15;
    });
  });

  const activeWorldDef = WORLDS.find((w) => w.key === state.activeWorld);
  const worldDensity = activeWorldDef ? activeWorldDef.density : 0;

  const res = analyse({
    edges,
    coupling: state.kappa,
    influx: state.phi,
    worldDensity,
  });
  state.analysis = res;

  renderOverlay();
  renderMetrics(res);
  renderWorlds();
  renderInspector();
}

// --- Metrics & Dashboard Rendering ---
function renderMetrics(res: Analysis) {
  el.mEta.textContent = res.eta.toFixed(2);
  el.mEtaMax.textContent = res.etaMax.toFixed(2);
  el.mDeliv.textContent = `${(res.delivered * 100).toFixed(1)}%`;
  el.mGrowth.textContent = `${res.growthRate.toFixed(2)} mm/day`;
  el.mGamma.textContent = res.gamma.toFixed(2);

  // Geometric fit: mothers horizontal, doubles vertical, simples diagonal
  let fitCount = 0;
  const paths = state.currentPaths;
  paths.forEach((p) => {
    const letObj = LETTERS[p.letter];
    if (letObj) {
      const ori = orientationOf(p);
      if (CLADE_INFO[letObj.clade].geometry === ori) fitCount++;
    }
  });
  el.mFit.textContent = `${fitCount} / ${paths.length} matches`;

  el.mC.textContent = res.C.toFixed(3);
  el.cFill.style.width = `${Math.min(100, Math.max(0, res.C * 100))}%`;

  // Risk Bars
  el.riskBars.innerHTML = "";
  SEFIROT.forEach((s, idx) => {
    const risk = res.ruptureRisk[idx];
    const isBroken = state.brokenVessels.has(s.id);
    const row = document.createElement("div");
    row.className = `bar ${isBroken ? "broken" : ""}`;
    const pct = Math.min(100, (risk / 1.5) * 100);
    const color = isBroken ? "var(--danger)" : risk > 1.0 ? "#ff8a48" : s.color;

    row.innerHTML = `
      <span class="nm">${s.name}</span>
      <div class="track">
        <div class="fill" style="width: ${pct}%; background: ${color}"></div>
        <div class="lim"></div>
      </div>
      <span class="mono">${risk.toFixed(2)}</span>
    `;
    row.onclick = () => {
      state.selectedSefira = s;
      state.selectedPath = null;
      renderInspector();
      renderOverlay();
    };
    el.riskBars.appendChild(row);
  });

  // Effective Tempo Convergence Chart
  el.tempoChart.innerHTML = "";
  const maxTau = Math.max(...SEFIROT.map((s) => s.tau));
  SEFIROT.forEach((s, idx) => {
    const eff = res.tauBar[idx];
    const col = document.createElement("div");
    col.className = "col";
    const effH = Math.min(100, (eff / maxTau) * 100);
    const rawH = Math.min(100, (s.tau / maxTau) * 100);

    col.innerHTML = `
      <div class="raw" style="bottom: ${rawH}%" title="Raw τ: ${s.tau}"></div>
      <div class="eff" style="height: ${effH}%; background: ${s.color}" title="τ̄: ${eff.toFixed(2)}"></div>
      <span class="lbl">${s.name.slice(0, 3)}</span>
    `;
    el.tempoChart.appendChild(col);
  });

  // Bottlenecks
  el.bottlenecks.innerHTML = "";
  if (res.bottlenecks.length === 0) {
    el.bottlenecks.innerHTML = `<li class="muted">No active bottlenecks</li>`;
  } else {
    res.bottlenecks.forEach((b) => {
      const p = paths.find((p) => p.id === b.id);
      if (!p) return;
      const letObj = LETTERS[p.letter];
      const li = document.createElement("li");
      li.innerHTML = `
        <span><b>${letObj?.glyph || ""} ${letObj?.name || "Path"}</b> (${SEFIROT[p.a].name} ↔ ${SEFIROT[p.b].name})</span>
        <span class="mono">score: ${b.betweenness.toFixed(1)}</span>
      `;
      li.onclick = () => {
        state.selectedPath = p;
        state.selectedSefira = null;
        renderInspector();
        renderOverlay();
      };
      el.bottlenecks.appendChild(li);
    });
  }
}

function setupWorldNavigation() {
  el.worldPills.innerHTML = "";
  WORLDS.forEach((w) => {
    const pill = document.createElement("button");
    pill.className = `world-pill ${state.activeWorld === w.key ? "on" : ""}`;
    pill.textContent = w.name;
    pill.onclick = () => setWorld(w.key);
    el.worldPills.appendChild(pill);
  });

  el.worldFoldBtn.onclick = () => {
    // Fold upward towards Atzilut: Assiah -> Yetzirah -> Beriah -> Atzilut
    const order: WorldKey[] = ["assiah", "yetzirah", "beriah", "atzilut"];
    const idx = order.indexOf(state.activeWorld);
    if (idx < order.length - 1) {
      setWorld(order[idx + 1]);
      showToast(`Folded upward into ${WORLDS.find((w) => w.key === order[idx + 1])!.name}: Frictionless Coherence ↑`);
    } else {
      showToast("Already at Supernal Atzilut (Apex of Hishtalshelut)");
    }
  };

  el.worldUnfoldBtn.onclick = () => {
    // Unfold downward towards Assiah: Atzilut -> Beriah -> Yetzirah -> Assiah
    const order: WorldKey[] = ["atzilut", "beriah", "yetzirah", "assiah"];
    const idx = order.indexOf(state.activeWorld);
    if (idx < order.length - 1) {
      setWorld(order[idx + 1]);
      showToast(`Unfolded downward into ${WORLDS.find((w) => w.key === order[idx + 1])!.name}: Substrate Densification ↓`);
    } else {
      showToast("Already anchored in physical Assiah");
    }
  };

  // Set initial blurb and highlight
  const currentW = WORLDS.find((w) => w.key === state.activeWorld)!;
  el.activeWorldTag.textContent = currentW.name;
  el.worldBlurb.textContent = `${currentW.name} (${currentW.gloss}): ${currentW.blurb}`;
}

function setWorld(key: WorldKey) {
  state.activeWorld = key;
  const w = WORLDS.find((x) => x.key === key)!;
  el.activeWorldTag.textContent = w.name;
  el.worldBlurb.textContent = `${w.name} (${w.gloss}): ${w.blurb}`;

  // Update pills
  el.worldPills.querySelectorAll(".world-pill").forEach((pill, i) => {
    pill.classList.toggle("on", WORLDS[i].key === key);
  });

  // Highlight composition formula
  el.compositionFormula.querySelectorAll(".comp-w").forEach((cw) => {
    cw.classList.toggle("active", cw.getAttribute("data-w") === key);
  });
  el.compositionFormula.querySelectorAll(".comp-op").forEach((co) => {
    co.classList.toggle("active", co.getAttribute("data-w") === key);
  });

  updateModel();
}

function renderWorlds() {
  el.worlds.innerHTML = "";
  const densities = WORLDS.map((w) => w.density);
  const edges = edgesFrom(state.currentPaths, state.conductance);
  const results = cascade(
    { edges, coupling: state.kappa, influx: state.phi },
    densities
  );

  WORLDS.forEach((w, idx) => {
    const cVal = results[idx];
    const row = document.createElement("div");
    row.className = `world ${state.activeWorld === w.key ? "active" : ""}`;
    row.innerHTML = `
      <span class="nm" style="cursor:pointer;" title="Switch to ${w.name}">${w.name}</span>
      <div class="gauge-track" style="cursor:pointer;">
        <div class="gauge-fill" style="width: ${cVal * 100}%;"></div>
      </div>
      <span class="mono">${cVal.toFixed(3)}</span>
    `;
    row.onclick = () => setWorld(w.key);
    el.worlds.appendChild(row);
  });
}

// --- Inspector ---
function renderInspector() {
  if (state.selectedSefira) {
    const s = state.selectedSefira;
    el.inspTag.textContent = "SEFIRA VESSEL";
    const pzf = PARTZUFIM[s.partzuf];
    const isBroken = state.brokenVessels.has(s.id);
    const pressure = state.analysis ? state.analysis.backPressure[s.id] : 0;
    const stress = state.analysis ? state.analysis.stress[s.id] : 0;

    // Display Partzuf Voice Banner
    el.partzufVoiceBanner.className = "partzuf-voice-banner show";
    el.partzufVoiceBanner.innerHTML = `
      <div class="voice-quote">
        <span class="quote-mark">“</span>${pzf.voice}<span class="quote-mark">”</span>
        <span class="voice-speaker">— Voice of ${pzf.name} (${pzf.hebrew})</span>
      </div>
    `;

    el.inspBody.innerHTML = `
      <div class="insp-title">
        <span class="heb">${s.hebrew}</span>
        <span class="nm">${s.name}</span>
        <span class="mean">${s.meaning}</span>
      </div>
      <dl class="kv">
        <dt>Partzuf Persona</dt><dd><b>${pzf.name}</b> (${pzf.hebrew})</dd>
        <dt>Gematria (גימטריא)</dt><dd class="mono"><b>${s.gematria}</b></dd>
        <dt>Pillar</dt><dd class="capitalize">${s.pillar}</dd>
        <dt>Biophysical Analogue</dt><dd>${s.analogue}</dd>
        <dt>Hydraulic Pressure</dt><dd class="mono">${pressure.toFixed(3)} (Stress: ${stress.toFixed(2)})</dd>
        <dt>Yield Limit</dt><dd class="mono">${s.yieldAt} ${isBroken ? '<b style="color:var(--danger)">[SHATTERED]</b>' : '<b style="color:var(--ok)">[INTACT]</b>'}</dd>
        <dt>Relaxation Tempo τ</dt><dd class="mono">${s.tau} (Effective τ̄: ${state.analysis ? state.analysis.tauBar[s.id].toFixed(2) : "—"})</dd>
      </dl>
      <p class="insp-desc">${s.desc}</p>
      <div class="cond">
        <button class="btn ${isBroken ? "danger on" : ""}" id="toggleVesselBtn">
          ${isBroken ? "Rectify / Seal Vessel" : "Shatter Vessel (Force Rupture)"}
        </button>
      </div>
    `;

    document.getElementById("toggleVesselBtn")!.onclick = () => {
      if (state.brokenVessels.has(s.id)) {
        state.brokenVessels.delete(s.id);
      } else {
        state.brokenVessels.add(s.id);
      }
      updateModel();
    };
  } else if (state.selectedPath) {
    const p = state.selectedPath;
    const letObj = LETTERS[p.letter];
    const clade = CLADE_INFO[letObj.clade];
    const cond = state.conductance[p.id];
    el.inspTag.textContent = "TZINOR CONDUIT";
    const current = state.analysis ? state.analysis.current[p.id] : 0;

    el.partzufVoiceBanner.className = "partzuf-voice-banner";
    el.partzufVoiceBanner.innerHTML = "";

    el.inspBody.innerHTML = `
      <div class="insp-title">
        <span class="heb">${letObj.glyph}</span>
        <span class="nm">${letObj.name}</span>
        <span class="mean">${SEFIROT[p.a].name} ↔ ${SEFIROT[p.b].name}</span>
      </div>
      <dl class="kv">
        <dt>Clade Group</dt><dd><span class="swatch" style="background:${clade.color}"></span><b>${clade.label}</b></dd>
        <dt>Gematria (גימטריא)</dt><dd class="mono"><b>${letObj.gematria}</b></dd>
        <dt>Geometric Vector</dt><dd class="capitalize">${clade.geometry} (Attribution: ${letObj.attribution})</dd>
        <dt>Fungal Analogue</dt><dd>${clade.analogue}</dd>
        <dt>Shefa Current I</dt><dd class="mono">${current.toFixed(4)}</dd>
        <dt>Conductance g</dt><dd class="mono">${cond.toFixed(2)}</dd>
      </dl>
      <p class="insp-desc">${clade.fn}</p>
      <div class="cond">
        <button class="btn ${cond === 1 ? "on" : ""}" id="gOpen">Open (1.0)</button>
        <button class="btn ${cond === 0.35 ? "on" : ""}" id="gConstrict">Constrict (0.35)</button>
        <button class="btn ${cond === 0 ? "danger on" : ""}" id="gSever">Sever / Obstruct (0.0)</button>
      </div>
    `;

    document.getElementById("gOpen")!.onclick = () => { state.conductance[p.id] = 1.0; updateModel(); };
    document.getElementById("gConstrict")!.onclick = () => { state.conductance[p.id] = 0.35; updateModel(); };
    document.getElementById("gSever")!.onclick = () => { state.conductance[p.id] = 0.0; updateModel(); };
  } else {
    el.inspTag.textContent = "SELECTION";
    el.partzufVoiceBanner.className = "partzuf-voice-banner";
    el.partzufVoiceBanner.innerHTML = "";
    el.inspBody.innerHTML = `<p class="muted">Click any Sefira orb or pathway conduit in the Flower of Life diagram to inspect biophysical properties.</p>`;
  }
}

// --- Overlay SVG Rendering ---
function renderOverlay() {
  const paths = state.currentPaths;
  const svg = el.overlay;
  svg.innerHTML = "";

  // 1. Partzufim convex hull grouping (if layer enabled)
  if (state.layers.partzufim) {
    Object.entries(PARTZUFIM).forEach(([_, pzf]) => {
      const nodes = pzf.members.map((id) => SEFIROT[id]);
      if (nodes.length === 1) {
        const c = nodes[0];
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", c.x.toString());
        circle.setAttribute("cy", c.y.toString());
        circle.setAttribute("r", "58");
        circle.setAttribute("class", "hull");
        circle.setAttribute("stroke", pzf.color);
        circle.setAttribute("fill", pzf.color);
        svg.appendChild(circle);
      } else {
        // Draw bounding capsule for multi-node Partzuf (e.g. Ze'ir Anpin)
        const xs = nodes.map((n) => n.x);
        const ys = nodes.map((n) => n.y);
        const minX = Math.min(...xs) - 40;
        const maxX = Math.max(...xs) + 40;
        const minY = Math.min(...ys) - 40;
        const maxY = Math.max(...ys) + 40;
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", minX.toString());
        rect.setAttribute("y", minY.toString());
        rect.setAttribute("width", (maxX - minX).toString());
        rect.setAttribute("height", (maxY - minY).toString());
        rect.setAttribute("rx", "36");
        rect.setAttribute("class", "hull");
        rect.setAttribute("stroke", pzf.color);
        rect.setAttribute("fill", pzf.color);
        svg.appendChild(rect);
      }
    });
  }

  // 2. Pathways / Conduits
  paths.forEach((p) => {
    const a = SEFIROT[p.a];
    const b = SEFIROT[p.b];
    const letObj = LETTERS[p.letter];
    const clade = CLADE_INFO[letObj.clade];
    const cond = state.conductance[p.id];
    const isSel = state.selectedPath?.id === p.id;

    // Invisible hit path
    const hit = document.createElementNS("http://www.w3.org/2000/svg", "line");
    hit.setAttribute("x1", a.x.toString());
    hit.setAttribute("y1", a.y.toString());
    hit.setAttribute("x2", b.x.toString());
    hit.setAttribute("y2", b.y.toString());
    hit.setAttribute("class", "path-hit");
    hit.onclick = (e) => {
      e.stopPropagation();
      state.selectedPath = p;
      state.selectedSefira = null;
      renderInspector();
      renderOverlay();
    };
    svg.appendChild(hit);

    // Visible line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", a.x.toString());
    line.setAttribute("y1", a.y.toString());
    line.setAttribute("x2", b.x.toString());
    line.setAttribute("y2", b.y.toString());

    let strokeColor = state.layers.clades ? clade.color : "#d4c89a";
    let width = 3;
    let cls = "path-line";

    if (cond === 0) {
      cls += " setum";
      strokeColor = "var(--danger)";
      width = 2;
    } else if (cond < 1) {
      cls += " constricted";
      width = 2.5;
    }
    if (isSel) cls += " sel";

    line.setAttribute("stroke", strokeColor);
    line.setAttribute("stroke-width", width.toString());
    line.setAttribute("stroke-opacity", cond === 0 ? "0.4" : "0.85");
    line.setAttribute("class", cls);
    svg.appendChild(line);

    // Hebrew letter label
    if (state.layers.labels) {
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", midX.toString());
      text.setAttribute("y", midY.toString());
      text.setAttribute("class", "letter");
      text.textContent = letObj.glyph;
      svg.appendChild(text);
    }
  });

  // 3. Sefirot Nodes
  SEFIROT.forEach((s) => {
    const isSel = state.selectedSefira?.id === s.id;
    const isBroken = state.brokenVessels.has(s.id);
    const radius = s.id === 0 ? 52 : 36;

    // Invisible hit orb
    const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    hit.setAttribute("cx", s.x.toString());
    hit.setAttribute("cy", s.y.toString());
    hit.setAttribute("r", (radius + 12).toString());
    hit.setAttribute("class", "orb-hit");
    hit.onclick = (e) => {
      e.stopPropagation();
      state.selectedSefira = s;
      state.selectedPath = null;
      renderInspector();
      renderOverlay();
    };
    svg.appendChild(hit);

    // Glowing selection ring
    if (isSel) {
      const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      ring.setAttribute("cx", s.x.toString());
      ring.setAttribute("cy", s.y.toString());
      ring.setAttribute("r", (radius + 6).toString());
      ring.setAttribute("class", "orb-ring");
      ring.setAttribute("stroke", "#ffffff");
      ring.setAttribute("stroke-dasharray", "4 4");
      svg.appendChild(ring);
    }

    // Broken vessel visual cracks
    if (isBroken) {
      const crack = document.createElementNS("http://www.w3.org/2000/svg", "path");
      crack.setAttribute(
        "d",
        `M ${s.x - 22} ${s.y - 18} L ${s.x - 4} ${s.y} L ${s.x + 18} ${s.y - 14} M ${s.x - 6} ${s.y} L ${s.x + 8} ${s.y + 22}`
      );
      crack.setAttribute("class", "crack");
      svg.appendChild(crack);
    }

    // Name label
    if (state.layers.labels) {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", (s.x + radius + 10).toString());
      text.setAttribute("y", (s.y + 2).toString());
      text.setAttribute("class", "orb-label");
      text.textContent = s.name;
      svg.appendChild(text);

      const heb = document.createElementNS("http://www.w3.org/2000/svg", "text");
      heb.setAttribute("x", (s.x + radius + 10).toString());
      heb.setAttribute("y", (s.y + 20).toString());
      heb.setAttribute("class", "orb-heb");
      heb.textContent = s.hebrew;
      svg.appendChild(heb);
    }
  });
}

// --- Canvas FX: Shefa Flow & Sparks ---
function initCanvas() {
  const canvas = el.fx;
  canvas.width = IMG_W;
  canvas.height = IMG_H;
  const ctx = canvas.getContext("2d")!;

  // Spawn steady particles for Shefa conduits
  setInterval(() => {
    if (!state.layers.flow || !state.analysis) return;
    const paths = state.currentPaths;
    paths.forEach((p) => {
      const cond = state.conductance[p.id];
      const cur = state.analysis?.current[p.id] || 0;
      if (cond > 0 && Math.abs(cur) > 0.01 && state.particles.length < 180) {
        state.particles.push({
          pathId: p.id,
          t: cur >= 0 ? 0 : 1,
          speed: (cur >= 0 ? 1 : -1) * (0.008 + Math.abs(cur) * 0.015),
          size: 2.5 + Math.random() * 2,
          color: LETTERS[p.letter] ? CLADE_INFO[LETTERS[p.letter].clade].color : "#fff",
        });
      }
    });
  }, 100);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Shefa Stream Particles
    if (state.layers.flow) {
      const paths = state.currentPaths;
      const wDef = WORLDS.find((w) => w.key === state.activeWorld);
      const spdMult = wDef ? wDef.speedMultiplier : 1.0;

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.t += pt.speed * spdMult;
        if (pt.t < 0 || pt.t > 1) {
          state.particles.splice(i, 1);
          continue;
        }
        const p = paths.find((x) => x.id === pt.pathId);
        if (!p) {
          state.particles.splice(i, 1);
          continue;
        }
        const a = SEFIROT[p.a];
        const b = SEFIROT[p.b];
        const x = a.x + (b.x - a.x) * pt.t;
        const y = a.y + (b.y - a.y) * pt.t;

        ctx.beginPath();
        ctx.arc(x, y, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // 2. Primordial Tzimtzum Contraction & Reshimu Residue
    if (state.phase === "tzimtzum") {
      if (state.tzimtzumRadius < 380) {
        state.tzimtzumRadius += 2.8;
      }
      const r = state.tzimtzumRadius;
      const cx = 510, cy = 432;
      ctx.save();
      
      // Dark void (Tehiru)
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(4, 5, 8, 0.94)";
      ctx.fill();

      // Faint glowing ring of primordial residue (Reshimu)
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 204, 77, 0.85)";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#ffcc4d";
      ctx.shadowBlur = 22;
      ctx.stroke();

      // Secondary shimmering ripple
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(10, r - 25), 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(127, 211, 255, 0.3)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Void text
      ctx.font = "italic 18px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.textAlign = "center";
      ctx.fillText("Tehiru (The Primordial Void) · Reshimu Residue", cx, cy - 8);
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(255, 204, 77, 0.8)";
      ctx.fillText("Or Ein Sof withdrawn to perimeter · Ready for Kav HaYashar", cx, cy + 18);
      ctx.restore();
    }

    // 3. Kav HaYashar (Single Primordial Ray Piercing Downward)
    if (state.kavBeamProgress > 0) {
      const kY1 = 147;
      const kY2 = 147 + (716 - 147) * state.kavBeamProgress;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(509, kY1);
      ctx.lineTo(509, kY2);
      const beamW = 3.5 + Math.sin(Date.now() / 100) * 1.5;
      ctx.lineWidth = beamW * 2.2;
      ctx.strokeStyle = "rgba(255, 204, 77, 0.35)";
      ctx.stroke();
      ctx.lineWidth = beamW;
      ctx.strokeStyle = "#ffffff";
      ctx.shadowColor = "#ffd21a";
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // 4. Trapped / Scattered Sparks (Birur)
    state.sparks.forEach((s) => {
      if (s.gathered) return;
      s.x += s.vx;
      s.y += s.vy;
      // Gentle jitter
      if (Math.random() < 0.05) {
        s.vx = (Math.random() - 0.5) * 0.5;
        s.vy = (Math.random() - 0.5) * 0.5;
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#ffcc4d";
      ctx.shadowColor = "#ffaa00";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(animate);
  }
  animate();

  // Click stage to gather sparks
  el.stage.addEventListener("click", (e) => {
    if (state.phase !== "tikkun") return;
    const rect = el.stage.getBoundingClientRect();
    const scaleX = IMG_W / rect.width;
    const scaleY = IMG_H / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check click near spark
    let caught = 0;
    state.sparks.forEach((s) => {
      if (s.gathered) return;
      const d = Math.hypot(s.x - clickX, s.y - clickY);
      if (d < 35) {
        gatherSpark(s);
        caught++;
      }
    });
    if (caught > 0) {
      showToast(`Spark retrieved (+${caught} ι)! Ratcheted into memory ledger.`);
    }
  });
}

// --- Web3 Wallet & X1 Network RPC ---
async function initX1() {
  try {
    const slot = await state.connection.getSlot();
    state.currentSlot = slot;
    el.slot.textContent = `slot #${slot}`;
    el.netDot.className = "dot live";
  } catch (err) {
    el.slot.textContent = "RPC offline";
    el.netDot.className = "dot down";
  }

  // Periodic slot refresh
  setInterval(async () => {
    try {
      const slot = await state.connection.getSlot();
      state.currentSlot = slot;
      el.slot.textContent = `slot #${slot}`;
      el.netDot.className = "dot live";
    } catch {
      el.netDot.className = "dot down";
    }
  }, 8000);

  // Discover Wallet
  const win = window as any;
  const wallets: { name: string; provider: any }[] = [];
  if (win.solana) wallets.push({ name: "Solana Standard / Phantom", provider: win.solana });
  if (win.backpack) wallets.push({ name: "Backpack", provider: win.backpack });
  if (win.phantom?.solana) wallets.push({ name: "Phantom", provider: win.phantom.solana });

  if (wallets.length > 0) {
    state.activeWalletProvider = wallets[0].provider;
    el.walletSelect.classList.remove("hidden");
    el.walletSelect.innerHTML = "";
    wallets.forEach((w, idx) => {
      const opt = document.createElement("option");
      opt.value = idx.toString();
      opt.textContent = w.name;
      el.walletSelect.appendChild(opt);
    });
    el.walletSelect.onchange = () => {
      state.activeWalletProvider = wallets[parseInt(el.walletSelect.value)].provider;
    };
  }

  el.connectBtn.onclick = () => connectWallet();
  el.commitBtn.onclick = () => commitTikkunToX1();

  loadRecentInscriptions();
}

async function connectWallet() {
  const provider = state.activeWalletProvider || (window as any).solana;
  if (!provider) {
    // If no extension, offer synthetic address for demonstration on X1
    const dummy = PublicKey.unique();
    setConnectedWallet(dummy, false);
    showToast("Synthetic wallet connected for analysis session");
    return;
  }
  try {
    const resp = await provider.connect();
    const pubkey = new PublicKey(resp.publicKey?.toString() || provider.publicKey.toString());
    setConnectedWallet(pubkey, true);
    showToast(`Connected: ${pubkey.toBase58().slice(0, 6)}…${pubkey.toBase58().slice(-4)}`);
  } catch (err: any) {
    showToast(`Wallet connect failed: ${err.message || err}`);
  }
}

async function setConnectedWallet(pubkey: PublicKey, isReal: boolean) {
  state.walletPubkey = pubkey;
  el.connectBtn.textContent = `${pubkey.toBase58().slice(0, 4)}…${pubkey.toBase58().slice(-4)}`;
  el.lAddr.textContent = `${pubkey.toBase58().slice(0, 6)}…${pubkey.toBase58().slice(-4)}`;

  try {
    const lamports = await state.connection.getBalance(pubkey);
    state.walletBalance = lamports / 1e9;
    el.lBal.textContent = `${state.walletBalance.toFixed(3)} XNT`;
  } catch {
    el.lBal.textContent = "0.000 XNT";
  }

  el.commitBtn.disabled = state.uncommittedIota === 0;
  await loadUserInscriptionStats(pubkey);
  
  // Update living DRO oscillator with steward identity
  state.oscillator = deriveOscillator(pubkey, state.chainSigma || 576);
}

async function commitTikkunToX1() {
  if (!state.walletPubkey) {
    showToast("Please connect an X1 wallet first");
    return;
  }
  const iota = state.uncommittedIota;
  const cVal = state.analysis?.C.toFixed(3) || "0.000";
  const pzfKey = state.selectedSefira ? state.selectedSefira.partzuf : "zeir";
  const pzfObj = PARTZUFIM[pzfKey];
  const memoStr = `rhizomorph:v1|tikkun|pzf=${pzfKey}|voice=${pzfObj.voiceKey}|iota=${iota}|gem=${state.totalGematria}|R=${state.ratchetHash}|C=${cVal}`;

  el.commitBtn.disabled = true;
  el.commitBtn.textContent = "Broadcasting to X1 Mainnet…";

  try {
    const provider = state.activeWalletProvider || (window as any).solana;
    if (!provider || !provider.signAndSendTransaction) {
      // Fallback simulation / demo commit
      await new Promise((r) => setTimeout(r, 1200));
      state.chainSigma += iota;
      state.uncommittedIota = 0;
      el.lChain.textContent = state.chainSigma.toString();
      el.lDelta.textContent = "0";
      showToast("Tikkun Ratchet committed to X1 session ledger (≔ Monotone Update)");
      prependFeedEntry({
        sig: "sim-" + Math.random().toString(36).slice(2, 10),
        memo: memoStr,
        slot: await state.connection.getSlot(),
      });
      return;
    }

    const { blockhash } = await state.connection.getLatestBlockhash("confirmed");
    const tx = new Transaction();
    tx.recentBlockhash = blockhash;
    tx.feePayer = state.walletPubkey;

    // Zero-lamport reference to the Registry PDA to group all rhizomorph commits
    const refIx = SystemProgram.transfer({
      fromPubkey: state.walletPubkey,
      toPubkey: state.walletPubkey,
      lamports: 0,
    });
    refIx.keys.push({ pubkey: REGISTRY_PDA, isSigner: false, isWritable: false });

    // SPL Memo inscription
    const memoIx = new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [{ pubkey: state.walletPubkey, isSigner: true, isWritable: false }],
      data: Buffer.from(memoStr, "utf8"),
    });

    tx.add(refIx, memoIx);

    const { signature } = await provider.signAndSendTransaction(tx);
    await state.connection.confirmTransaction(signature, "confirmed");

    state.chainSigma += iota;
    state.uncommittedIota = 0;
    el.lChain.textContent = state.chainSigma.toString();
    el.lDelta.textContent = "0";
    showToast(`Committed to X1: ${signature.slice(0, 8)}…`);
    loadRecentInscriptions();
  } catch (err: any) {
    showToast(`Transaction error: ${err.message || err}`);
  } finally {
    el.commitBtn.textContent = "Commit Tikkun to X1 (≔)";
    el.commitBtn.disabled = state.uncommittedIota === 0;
  }
}

async function loadUserInscriptionStats(pubkey: PublicKey) {
  try {
    const sigs = await state.connection.getSignaturesForAddress(pubkey, { limit: 20 });
    let total = 0;
    sigs.forEach((s) => {
      if (s.memo && s.memo.includes("rhizomorph:v1|tikkun")) {
        const m = s.memo.match(/iota=(\d+)/);
        if (m) total += parseInt(m[1]);
      }
    });
    state.chainSigma = total;
    el.lChain.textContent = total.toString();
  } catch {
    el.lChain.textContent = "0";
  }
}

async function loadRecentInscriptions() {
  try {
    const sigs = await state.connection.getSignaturesForAddress(REGISTRY_PDA, { limit: 6 });
    el.feed.innerHTML = "";
    if (sigs.length === 0) {
      el.feed.innerHTML = `<li class="muted">No inscriptions found on PDA yet. Ready for your first Tikkun commit.</li>`;
      return;
    }
    sigs.forEach((s) => {
      const li = document.createElement("li");
      const memoText = s.memo || "rhizomorph:v1|tikkun|ratchet";
      li.innerHTML = `
        <span class="memo">${memoText}</span>
        <a href="https://explorer.mainnet.x1.xyz/tx/${s.signature}" target="_blank" rel="noopener">${s.signature.slice(0, 6)}…</a>
      `;
      el.feed.appendChild(li);
    });
  } catch {
    el.feed.innerHTML = `<li class="muted">Ledger feed synchronizing via X1 RPC…</li>`;
  }
}

function prependFeedEntry(entry: { sig: string; memo: string; slot: number }) {
  const li = document.createElement("li");
  li.innerHTML = `
    <span class="memo">${entry.memo}</span>
    <span class="mono">${entry.sig.slice(0, 8)}… (slot ${entry.slot})</span>
  `;
  el.feed.prepend(li);
}

// --- Living Resonant Oscillator (Dynamic Resonant Object) ---
function initDRO() {
  // Initialize default oscillator (seeded by registry or known active wallet 6eSs8v)
  state.oscillator = deriveOscillator(REGISTRY_PDA, state.chainSigma || 576);
  state.cymatics = new CymaticVisualizer(el.droCanvas);

  el.droPumpBtn.onclick = () => pumpDROAction();
  el.droTuneBtn.onclick = () => tunePhaseLockAction();
  el.droExportBtn.onclick = () => exportDROAction();

  function loop() {
    if (state.oscillator && state.cymatics) {
      const now = Date.now() / 1000;
      const coherence = state.analysis ? state.analysis.C : 0.819;
      const dissonance = state.analysis ? state.analysis.eta : 17.09;
      const evalRes = evaluateOscillator(state.oscillator, now, coherence);

      el.droAmp.textContent = evalRes.amplitude.toFixed(3);
      el.droStateTag.textContent = evalRes.state.toUpperCase();
      el.droStateTag.className = `tag ${evalRes.state.toLowerCase()}`;
      el.droOmega.textContent = `${state.oscillator.omega0.toFixed(2)} rad/s (${state.oscillator.frequencyHz.toFixed(2)} Hz)`;
      el.droZeta.textContent = evalRes.effectiveZeta.toFixed(5);
      const isPeak = evalRes.phaseEfficiency >= 1.15;
      el.droEff.textContent = `${evalRes.phaseEfficiency.toFixed(2)}x ${isPeak ? "⚡" : ""}`;
      el.droArchetype.textContent = state.oscillator.harmonicRatio;

      state.cymatics.render(
        state.oscillator,
        evalRes.amplitude,
        evalRes.phase,
        dissonance,
        coherence
      );
    }
    requestAnimationFrame(loop);
  }
  loop();
}

async function pumpDROAction() {
  if (!state.oscillator) return;
  const coherence = state.analysis ? state.analysis.C : 0.819;
  const { boost, efficiency } = pumpOscillator(state.oscillator, 0.45, coherence);
  showToast(`Resonance Pumped: +${boost.toFixed(2)} A (${efficiency.toFixed(2)}x phase efficiency)! F(t) active.`);

  // If wallet connected, record on-chain DRO pump memo
  if (state.walletPubkey) {
    const memoStr = `rhizomorph:v1|dro|pump|amp=${state.oscillator.lastAmplitude.toFixed(3)}|w0=${state.oscillator.omega0.toFixed(3)}|gem=${state.totalGematria}|R=${state.ratchetHash}|sigma=${state.chainSigma || 576}`;
    try {
      const provider = state.activeWalletProvider || (window as any).solana;
      if (provider && provider.signAndSendTransaction) {
        const { blockhash } = await state.connection.getLatestBlockhash("confirmed");
        const tx = new Transaction();
        tx.recentBlockhash = blockhash;
        tx.feePayer = state.walletPubkey;
        const refIx = SystemProgram.transfer({
          fromPubkey: state.walletPubkey,
          toPubkey: state.walletPubkey,
          lamports: 0,
        });
        refIx.keys.push({ pubkey: REGISTRY_PDA, isSigner: false, isWritable: false });
        const memoIx = new TransactionInstruction({
          programId: MEMO_PROGRAM_ID,
          keys: [{ pubkey: state.walletPubkey, isSigner: true, isWritable: false }],
          data: Buffer.from(memoStr, "utf8"),
        });
        tx.add(refIx, memoIx);
        const { signature } = await provider.signAndSendTransaction(tx);
        showToast(`DRO Pump confirmed on X1: ${signature.slice(0, 8)}…`);
        loadRecentInscriptions();
      } else {
        prependFeedEntry({
          sig: "dro-" + Math.random().toString(36).slice(2, 10),
          memo: memoStr,
          slot: state.currentSlot,
        });
      }
    } catch (err: any) {
      console.warn("DRO pump commit info:", err);
    }
  }
}

function tunePhaseLockAction() {
  if (!state.oscillator) return;
  const now = Date.now() / 1000;
  const evalRes = evaluateOscillator(state.oscillator, now, state.analysis ? state.analysis.C : 0.819);
  if (evalRes.phaseEfficiency >= 1.12) {
    const { boost } = pumpOscillator(state.oscillator, 0.60, state.analysis ? state.analysis.C : 0.819);
    showToast(`✨ Constructive Phase-Lock! +${boost.toFixed(2)} A (Resonance Amplified 1.35x)`);
  } else {
    showToast(`⚠️ Phase Drift (${evalRes.phaseEfficiency.toFixed(2)}x): Wait for cycle peak to sync phase!`);
  }
}

function exportDROAction() {
  if (!state.oscillator) return;
  const now = Date.now() / 1000;
  const evalRes = evaluateOscillator(state.oscillator, now, state.analysis ? state.analysis.C : 0.819);
  const svg = generateDROCertificateSVG(
    state.oscillator,
    evalRes.amplitude,
    state.analysis ? state.analysis.C : 0.819,
    state.chainSigma || 576,
    state.currentSlot,
    state.totalGematria || 2868,
    state.ratchetHash
  );
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Soulbound_DRO_${state.oscillator.ownerPubkey.slice(0, 8)}.svg`;
  a.click();
  showToast("Soulbound Dynamic Resonant Certificate exported!");
}

// --- Wire Event Listeners ---
function initEvents() {
  // System toggle
  el.systemSeg.querySelectorAll("button").forEach((btn) => {
    btn.onclick = () => {
      el.systemSeg.querySelectorAll("button").forEach((b) => b.classList.remove("on"));
      btn.classList.add("on");
      state.system = btn.getAttribute("data-sys") as any;
      updateModel();
    };
  });

  // Sliders
  el.kappa.oninput = () => {
    state.kappa = parseFloat(el.kappa.value);
    el.kVal.textContent = state.kappa.toFixed(2);
    updateModel();
  };
  el.phi.oninput = () => {
    state.phi = parseFloat(el.phi.value);
    el.phiVal.textContent = state.phi.toFixed(2);
    updateModel();
  };

  // Layer toggles
  el.layerToggles.querySelectorAll("button").forEach((btn) => {
    btn.onclick = () => {
      const layer = btn.getAttribute("data-layer") as keyof typeof state.layers;
      state.layers[layer] = !state.layers[layer];
      btn.classList.toggle("on", state.layers[layer]);
      renderOverlay();
    };
  });
}

// --- Boot Application ---
setupPhases();
setupWorldNavigation();
initEvents();
initCanvas();
updateModel();
initDRO();
initX1();
