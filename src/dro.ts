// Dynamic Resonant Object (DRO) Engine — Fractal Harmonic Physics (FHP)
// Implementation of ublox/RESONANT_OSCILLATOR_SPEC.md & programs/resonant_pump
//
// Equation of state: d²x/dt² + 2ζω₀ dx/dt + ω₀² x = F(t)
// Entropy decay:    A(t) = A₀ · exp(-ζ_eff · Δt)
// Coherence shield: ζ_eff = ζ₀ · max(0.08, 1 − C_topo)  (High coherence suppresses entropy)
// Phase advance:    φ(t) = (φ₀ + ω₀ · Δt) mod 2π
// Phase efficiency: 1.0 + 0.2 · cos(φ)

import { PublicKey } from "@solana/web3.js";

export const AMPLITUDE_SCALE = 1_000_000;
export const PHASE_SCALE = 6_283_185;

export enum LuminosityState {
  Luminous = "Luminous",   // A > 0.8
  Radiant = "Radiant",     // A > 0.5
  Dim = "Dim",             // A > 0.2
  Fading = "Fading",       // A > 0.01
  Decoherent = "Decoherent"// A <= 0.01
}

export interface OscillatorState {
  mintPubkey: string;
  ownerPubkey: string;
  name: string;
  omega0: number;          // natural frequency in rad/s (e.g. 0.5 - 5.0)
  frequencyHz: number;     // natural frequency in Hz
  harmonicRatio: string;   // e.g. "3:2 Fifth", "phi:1 Golden", etc.
  zeta0: number;           // base damping ratio (metabolic entropy rate)
  lastAmplitude: number;   // 0.0 to 2.0
  lastPhase: number;       // 0 to 2pi
  lastInteractionSec: number; // timestamp in seconds
  totalPumps: number;
  peakAmplitude: number;
}

export function deriveOscillator(walletPubkey: PublicKey, totalRatchet: number): OscillatorState {
  const bytes = walletPubkey.toBytes();
  const seed = (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0;
  
  // Natural frequency ω₀ in range [1.2, 4.8] rad/s
  const omega0 = 1.2 + ((seed % 360) / 100);
  const frequencyHz = omega0 / (2 * Math.PI);
  
  // Base damping ratio ζ₀: 0.012 per second (~1.2% per sec in raw time, scaled for interactive demo)
  const zeta0 = 0.008 + ((seed % 50) / 10000);

  // Harmonic ratio archetype based on seed
  const ratios = ["φ⁻¹ Golden Ratio (0.618)", "3:2 Supernal Fifth", "7.83 Hz Schumann Fundamental", "369 Hz Tesla Harmonics", "4:3 Tetraktys Fourth"];
  const harmonicRatio = ratios[seed % ratios.length];

  // Initial amplitude boosted by historical on-chain commits
  const baseAmp = Math.min(1.8, 0.85 + (totalRatchet > 0 ? 0.35 : 0.0));

  return {
    mintPubkey: walletPubkey.toBase58().slice(0, 8) + "…DRO",
    ownerPubkey: walletPubkey.toBase58(),
    name: `Resonant Oscillator · ${walletPubkey.toBase58().slice(0, 4)}`,
    omega0,
    frequencyHz,
    harmonicRatio,
    zeta0,
    lastAmplitude: baseAmp,
    lastPhase: 0,
    lastInteractionSec: Date.now() / 1000,
    totalPumps: totalRatchet > 0 ? 2 : 0,
    peakAmplitude: Math.max(baseAmp, 1.2),
  };
}

export function evaluateOscillator(
  osc: OscillatorState,
  nowSec: number,
  coherence: number
): {
  amplitude: number;
  phase: number;
  phaseEfficiency: number;
  state: LuminosityState;
  effectiveZeta: number;
  dt: number;
} {
  const dt = Math.max(0, nowSec - osc.lastInteractionSec);
  
  // High coherence suppresses damping (cooperation reduces entropy)
  // When C_topo = 1, damping drops to minimum 0.08 * zeta0
  const coherenceShield = Math.max(0.08, 1.0 - Math.min(1.0, coherence));
  const effectiveZeta = osc.zeta0 * coherenceShield;

  // Damped exponential decay: A(t) = A_0 * exp(-zeta * dt)
  const amplitude = Math.max(0, osc.lastAmplitude * Math.exp(-effectiveZeta * dt));

  // Phase advances: phi(t) = (phi_0 + omega_0 * dt) mod 2pi
  const phase = (osc.lastPhase + osc.omega0 * dt) % (2 * Math.PI);

  // Phase efficiency: 1.0 + 0.25 * cos(phi)
  const phaseEfficiency = 1.0 + 0.25 * Math.cos(phase);

  let state = LuminosityState.Decoherent;
  if (amplitude > 0.8) state = LuminosityState.Luminous;
  else if (amplitude > 0.5) state = LuminosityState.Radiant;
  else if (amplitude > 0.2) state = LuminosityState.Dim;
  else if (amplitude > 0.01) state = LuminosityState.Fading;

  return {
    amplitude,
    phase,
    phaseEfficiency,
    state,
    effectiveZeta,
    dt,
  };
}

export function pumpOscillator(
  osc: OscillatorState,
  force: number,
  coherence: number
): { boost: number; efficiency: number } {
  const now = Date.now() / 1000;
  const current = evaluateOscillator(osc, now, coherence);
  
  // Boost proportional to force * phaseEfficiency
  const boost = force * current.phaseEfficiency;
  osc.lastAmplitude = Math.min(2.0, current.amplitude + boost);
  osc.lastPhase = current.phase;
  osc.lastInteractionSec = now;
  osc.totalPumps++;
  osc.peakAmplitude = Math.max(osc.peakAmplitude, osc.lastAmplitude);

  return { boost, efficiency: current.phaseEfficiency };
}

// ─────────────────────────────────────────────────────────────────────────────
// CYMATICS & CHLADNI VISUALIZER
// ─────────────────────────────────────────────────────────────────────────────

export class CymaticVisualizer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  animId: number | null = null;
  particles: { x: number; y: number; vx: number; vy: number; origX: number; origY: number }[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.initParticles();
  }

  initParticles() {
    this.particles = [];
    const count = 380;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(w, h) * 0.42;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * maxR;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      this.particles.push({
        x,
        y,
        origX: x,
        origY: y,
        vx: 0,
        vy: 0,
      });
    }
  }

  render(
    osc: OscillatorState,
    amplitude: number,
    phase: number,
    dissonanceEta: number,
    coherenceC: number
  ) {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Soft trail fade
    ctx.fillStyle = "rgba(5, 7, 12, 0.28)";
    ctx.fillRect(0, 0, w, h);

    // 1. Coronal Glow Aura based on Amplitude
    const glowRadius = 40 + amplitude * 90;
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, glowRadius);
    const alpha = Math.min(0.65, amplitude * 0.35);
    
    if (amplitude > 0.8) {
      grad.addColorStop(0, `rgba(255, 230, 130, ${alpha})`);
      grad.addColorStop(0.5, `rgba(127, 211, 255, ${alpha * 0.6})`);
      grad.addColorStop(1, "rgba(5, 7, 12, 0)");
    } else if (amplitude > 0.2) {
      grad.addColorStop(0, `rgba(180, 190, 140, ${alpha * 0.8})`);
      grad.addColorStop(0.6, `rgba(100, 120, 150, ${alpha * 0.4})`);
      grad.addColorStop(1, "rgba(5, 7, 12, 0)");
    } else {
      grad.addColorStop(0, `rgba(80, 80, 90, ${alpha * 0.3})`);
      grad.addColorStop(1, "rgba(5, 7, 12, 0)");
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Chladni / Lissajous Harmonic Nodal Curves
    const n = 3;
    const m = 5;
    const baseR = Math.min(w, h) * 0.34;
    const jitter = Math.max(0, (dissonanceEta / 50)) * (1.0 - coherenceC);

    ctx.beginPath();
    const steps = 180;
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      // Damped harmonic perturbation
      const wave = Math.sin(n * theta + phase) * Math.cos(m * theta - phase * 0.5);
      const r = baseR + wave * (35 * amplitude) + (Math.random() - 0.5) * (jitter * 8);
      const x = cx + Math.cos(theta) * r;
      const y = cy + Math.sin(theta) * r;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.lineWidth = 1.8 + amplitude * 1.5;
    ctx.strokeStyle = amplitude > 0.8 ? "#ffcc4d" : amplitude > 0.2 ? "#7fd3ff" : "#555b66";
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 10 * amplitude;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. Second Interlocking Harmonic Membrane (Abba/Imma polar braid)
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      const wave = Math.cos(m * theta + phase * 0.75) * Math.sin(n * theta + Math.PI / 4);
      const r = (baseR * 0.65) + wave * (24 * amplitude);
      const x = cx + Math.cos(theta) * r;
      const y = cy + Math.sin(theta) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.lineWidth = 1.2 + amplitude;
    ctx.strokeStyle = "rgba(140, 245, 164, " + Math.min(0.9, amplitude * 0.7 + 0.1) + ")";
    ctx.stroke();

    // 4. Acoustic Dust Particles on Nodal Lines
    const pColor = amplitude > 0.8 ? "#fff5cc" : amplitude > 0.2 ? "#b8e2f2" : "#6c727d";
    ctx.fillStyle = pColor;
    
    this.particles.forEach((p) => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const angle = Math.atan2(dy, dx);
      const currentR = Math.hypot(dx, dy);

      // Force particles toward modal nodes
      const targetR = baseR + Math.sin(n * angle + phase) * (30 * amplitude);
      const diff = targetR - currentR;

      p.vx += diff * 0.04 * amplitude;
      p.vy += (Math.random() - 0.5) * jitter * 2;

      // Damping
      p.vx *= 0.88;
      p.vy *= 0.88;

      p.x += Math.cos(angle) * p.vx - Math.sin(angle) * p.vy;
      p.y += Math.sin(angle) * p.vx + Math.cos(angle) * p.vy;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2 + (amplitude * 0.8), 0, Math.PI * 2);
      ctx.fill();
    });

    // 5. Central Singularity / Apical Core
    ctx.beginPath();
    ctx.arc(cx, cy, 5 + amplitude * 8, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 18 * amplitude;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SOULBOUND DYNAMIC CERTIFICATE GENERATOR (SVG / DATA-URI)
// ─────────────────────────────────────────────────────────────────────────────

export function generateDROCertificateSVG(
  osc: OscillatorState,
  amplitude: number,
  coherence: number,
  ratchet: number,
  slot: number | string,
  gematria: number = 2868,
  ratchetHash: string = "0000000000000000"
): string {
  const stateLabel = amplitude > 0.8 ? "LUMINOUS" : amplitude > 0.2 ? "RADIANT" : "DIM";
  const glowColor = amplitude > 0.8 ? "#ffcc4d" : "#7fd3ff";
  const nowStr = new Date().toISOString();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1020" width="100%" height="100%" style="background:#05070c; font-family:'Inter',system-ui,sans-serif;">
  <defs>
    <radialGradient id="halo" cx="50%" cy="38%" r="50%">
      <stop offset="0%" stop-color="${glowColor}" stop-opacity="${Math.min(0.5, amplitude * 0.4)}"/>
      <stop offset="100%" stop-color="#05070c" stop-opacity="0"/>
    </radialGradient>
    <style>
      @keyframes dro-pulse {
        0% { transform: scale(0.97) rotate(0deg); opacity: 0.8; }
        50% { transform: scale(1.03) rotate(${osc.omega0 * 2}deg); opacity: 1; }
        100% { transform: scale(0.97) rotate(0deg); opacity: 0.8; }
      }
      .pulsar { transform-origin: 400px 360px; animation: dro-pulse ${Math.max(1.5, 6 - osc.omega0)}s ease-in-out infinite; }
    </style>
  </defs>

  <!-- Background Border Frame -->
  <rect x="20" y="20" width="760" height="980" rx="20" fill="#080b12" stroke="rgba(255,204,77,0.25)" stroke-width="2"/>
  <rect x="32" y="32" width="736" height="956" rx="14" fill="none" stroke="rgba(127,211,255,0.15)" stroke-width="1" stroke-dasharray="6 4"/>
  
  <!-- Aura Halo -->
  <circle cx="400" cy="360" r="300" fill="url(#halo)"/>

  <!-- Living Cymatic Chladni Resonator Graphic -->
  <g class="pulsar">
    <circle cx="400" cy="360" r="130" fill="none" stroke="${glowColor}" stroke-width="${1.5 + amplitude}" stroke-opacity="0.8"/>
    <circle cx="400" cy="360" r="80" fill="none" stroke="rgba(140,245,164,0.7)" stroke-width="1.5" stroke-dasharray="12 6"/>
    <path d="M 400 230 Q 480 300 400 360 Q 320 420 400 490 Q 480 420 400 360 Q 320 300 400 230 Z" fill="none" stroke="${glowColor}" stroke-width="2"/>
    <path d="M 270 360 Q 340 430 400 360 Q 460 290 530 360 Q 460 430 400 360 Q 340 290 270 360 Z" fill="none" stroke="#7fd3ff" stroke-width="2"/>
    <circle cx="400" cy="360" r="${8 + amplitude * 12}" fill="#ffffff" filter="drop-shadow(0 0 16px ${glowColor})"/>
  </g>

  <!-- Typography & Identity -->
  <text x="400" y="70" text-anchor="middle" fill="#ffcc4d" font-size="13" font-weight="700" letter-spacing="3">FRACTAL HARMONIC PHYSICS · X1 NETWORK</text>
  <text x="400" y="102" text-anchor="middle" fill="#ffffff" font-size="26" font-family="'Cormorant Garamond', Georgia, serif" font-weight="700" letter-spacing="1">SOULBOUND RESONANT OSCILLATOR</text>
  <text x="400" y="126" text-anchor="middle" fill="#8e8c7f" font-size="12" font-family="monospace">d²x/dt² + 2ζω₀ dx/dt + ω₀² x = F(t)</text>

  <!-- Badge -->
  <rect x="330" y="142" width="140" height="26" rx="6" fill="rgba(255,204,77,0.12)" stroke="${glowColor}" stroke-width="1"/>
  <text x="400" y="159" text-anchor="middle" fill="${glowColor}" font-size="11" font-weight="700" letter-spacing="1">${stateLabel}</text>

  <!-- Parameters Table -->
  <g transform="translate(60, 640)">
    <rect width="680" height="280" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
    
    <!-- Row 1 -->
    <text x="30" y="38" fill="#8e8c7f" font-size="12">Steward / Sovereign Owner</text>
    <text x="650" y="38" text-anchor="end" fill="#ffffff" font-size="12" font-family="monospace">${osc.ownerPubkey}</text>

    <!-- Row 2 -->
    <text x="30" y="72" fill="#8e8c7f" font-size="12">Natural Frequency (ω₀)</text>
    <text x="650" y="72" text-anchor="end" fill="#ffcc4d" font-size="12" font-family="monospace">${osc.omega0.toFixed(3)} rad/s (${osc.frequencyHz.toFixed(2)} Hz)</text>

    <!-- Row 3 -->
    <text x="30" y="106" fill="#8e8c7f" font-size="12">Harmonic Archetype</text>
    <text x="650" y="106" text-anchor="end" fill="#7fd3ff" font-size="12">${osc.harmonicRatio}</text>

    <!-- Row 4 -->
    <text x="30" y="140" fill="#8e8c7f" font-size="12">Topological Coherence (C_topo) / Floor</text>
    <text x="650" y="140" text-anchor="end" fill="#8cf5a4" font-size="12" font-family="monospace">${coherence.toFixed(3)} / φ⁻¹ (0.618)</text>

    <!-- Row 5 -->
    <text x="30" y="174" fill="#8e8c7f" font-size="12">Cumulative Tikkun Ratchet (Σ) / X1 Slot</text>
    <text x="650" y="174" text-anchor="end" fill="#ffffff" font-size="12" font-family="monospace">Σ = ${ratchet} · slot #${slot}</text>

    <!-- Row 6: Gematria Tally -->
    <text x="30" y="208" fill="#8e8c7f" font-size="12">Hebrew Gematria Tally (גימטריא)</text>
    <text x="650" y="208" text-anchor="end" fill="#ffd21a" font-size="12" font-family="monospace">${gematria} / 2868</text>

    <!-- Row 7: Proof-of-Tikkun Ratchet Hash -->
    <text x="30" y="242" fill="#8e8c7f" font-size="12">Proof-of-Tikkun Hash R(t+1) = R(t) ⊕_τ ι</text>
    <text x="650" y="242" text-anchor="end" fill="#4be3a4" font-size="12" font-family="monospace">0x${ratchetHash}</text>
  </g>

  <!-- Footer Seal -->
  <text x="400" y="960" text-anchor="middle" fill="#555866" font-size="11" font-family="monospace">DYNAMIC RESONANT OBJECT · IMMUTABLE STEWARDSHIP ON X1 MAINNET · ${nowStr}</text>
</svg>`;
}

