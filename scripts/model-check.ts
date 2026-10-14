// Sanity / tuning harness for the rhizomorph model:  npm run test:model
import { analyse, edgesFrom } from "../src/model.ts";
import { PATHS_KIRCHER, PATHS_ARI, KAV_CHAIN, SEFIROT } from "../src/data.ts";

const fmt = (x: number) => x.toFixed(3);
const full = new Array(22).fill(1);

function report(label: string, a: ReturnType<typeof analyse>) {
  const risk = a.ruptureRisk.map((r, i) => `${SEFIROT[i].name.slice(0, 4)}:${r.toFixed(2)}`).join(" ");
  console.log(`${label.padEnd(34)} η=${fmt(a.eta)} C=${fmt(a.C)} floor=${a.aboveFloor ? "✓" : "✗"} deliv=${fmt(a.delivered)} growth=${a.growthRate.toFixed(2)} comps=${a.components}`);
  console.log(`   risk ${risk}`);
}

for (const [name, paths] of [["Kircher", PATHS_KIRCHER], ["Ari", PATHS_ARI]] as const) {
  for (const k of [0, 0.25, 0.5, 0.75, 1]) report(`${name} full κ=${k} Φ=1`, analyse({ edges: edgesFrom(paths, full), coupling: k, influx: 1 }));
  report(`${name} full κ=1 Φ=2`, analyse({ edges: edgesFrom(paths, full), coupling: 1, influx: 2 }));
}

const kav = KAV_CHAIN.map(([a, b], id) => ({ id, a, b, g: 1 }));
for (const phi of [0.3, 0.5, 0.8, 1, 1.5]) report(`Nekudim kav κ=0.15 Φ=${phi}`, analyse({ edges: kav, coupling: 0.15, influx: phi }));

// sever all horizontals in Kircher
const cut = full.map((_, i) => ([3, 8, 16].includes(i) ? 0 : 1));
report("Kircher no horizontals κ=0.8", analyse({ edges: edgesFrom(PATHS_KIRCHER, cut), coupling: 0.8, influx: 1 }));
const half = full.map((_, i) => (i % 2 ? 0 : 1));
report("Kircher half cut κ=0.8", analyse({ edges: edgesFrom(PATHS_KIRCHER, half), coupling: 0.8, influx: 1 }));
const noYesodMal = full.map((_, i) => (i === 21 ? 0 : 1));
report("Kircher Tav severed", analyse({ edges: edgesFrom(PATHS_KIRCHER, noYesodMal), coupling: 0.8, influx: 1 }));
