const { mkdirSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");

const scripts = [
  "tests/performance/auth-login.k6.js",
  "tests/performance/triage-specialty-consult.k6.js",
  "tests/performance/appointments-create.k6.js",
  "tests/performance/reception-journey.k6.js"
];

mkdirSync(join(process.cwd(), "reports", "performance"), { recursive: true });

let exitCode = 0;

for (const script of scripts) {
  const result = spawnSync("k6", ["run", script], {
    stdio: "inherit",
    shell: true
  });

  if (result.status !== 0) {
    exitCode = result.status || 1;
  }
}

process.exit(exitCode);
