const configs = {
  bronze: {
    price: 10,
    target: 82,
    distribution: [
      { payout: 10, probability: 0.2 },
      { payout: 20, probability: 0.08 },
      { payout: 50, probability: 0.038 },
      { payout: 100, probability: 0.01 },
      { payout: 200, probability: 0.006 },
      { payout: 500, probability: 0.001 },
      { payout: 0, probability: 0.665 },
    ],
  },
  silver: {
    price: 20,
    target: 83.5,
    distribution: [
      { payout: 20, probability: 0.18 },
      { payout: 40, probability: 0.08 },
      { payout: 100, probability: 0.031 },
      { payout: 200, probability: 0.015 },
      { payout: 500, probability: 0.0056 },
      { payout: 1000, probability: 0.0008 },
      { payout: 2000, probability: 0.0001 },
      { payout: 0, probability: 0.6875 },
    ],
  },
  gold: {
    price: 50,
    target: 86,
    distribution: [
      { payout: 50, probability: 0.18 },
      { payout: 100, probability: 0.1 },
      { payout: 200, probability: 0.06 },
      { payout: 500, probability: 0.018 },
      { payout: 1000, probability: 0.002 },
      { payout: 2000, probability: 0.0004 },
      { payout: 5000, probability: 0.00004 },
      { payout: 0, probability: 0.63956 },
    ],
  },
  diamond: {
    price: 100,
    target: 88,
    distribution: [
      { payout: 100, probability: 0.2 },
      { payout: 200, probability: 0.11 },
      { payout: 500, probability: 0.055 },
      { payout: 1000, probability: 0.012 },
      { payout: 2000, probability: 0.002 },
      { payout: 5000, probability: 0.0003 },
      { payout: 10000, probability: 0.00008 },
      { payout: 50000, probability: 0.000004 },
      { payout: 0, probability: 0.620616 },
    ],
  },
};

function pick(distribution) {
  const r = Math.random();
  let c = 0;
  for (const x of distribution) {
    c += x.probability;
    if (r <= c) return x.payout;
  }
  return distribution[distribution.length - 1].payout;
}

function theoretical(cfg) {
  const expected = cfg.distribution.reduce((s, x) => s + x.payout * x.probability, 0);
  return (expected / cfg.price) * 100;
}

function simulate(cfg, rounds = 100000) {
  let spent = 0;
  let won = 0;
  for (let i = 0; i < rounds; i += 1) {
    spent += cfg.price;
    won += pick(cfg.distribution);
  }
  return (won / spent) * 100;
}

const rounds = 100000;
let failed = false;
console.log(`Scratch RTP simulation rounds: ${rounds}`);
for (const [name, cfg] of Object.entries(configs)) {
  const theo = theoretical(cfg);
  const sim = simulate(cfg, rounds);
  const diff = Math.abs(sim - cfg.target);
  const pass = diff <= 1.0;
  if (!pass) failed = true;
  console.log(`${name.padEnd(7)} target=${cfg.target.toFixed(2)}% theo=${theo.toFixed(3)}% sim=${sim.toFixed(3)}% |diff|=${diff.toFixed(3)} ${pass ? "PASS" : "FAIL"}`);
}
if (failed) process.exitCode = 1;
