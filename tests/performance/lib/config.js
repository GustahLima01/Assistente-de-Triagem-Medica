const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const THINK_TIME_MS = Number(__ENV.THINK_TIME_MS || 0);
const REPORT_DIR = "reports/performance";

const DEFAULT_ADMIN_CREDENTIALS = {
  email: __ENV.ADMIN_EMAIL || "admin@clinica.local",
  password: __ENV.ADMIN_PASSWORD || "Admin@123"
};

function createStages(defaultTarget) {
  const target = Number(__ENV.TARGET_VUS || defaultTarget);
  const rampUp = __ENV.RAMP_UP_DURATION || "10s";
  const steady = __ENV.STEADY_DURATION || "20s";
  const rampDown = __ENV.RAMP_DOWN_DURATION || "10s";

  return [
    { duration: rampUp, target },
    { duration: steady, target },
    { duration: rampDown, target: 0 }
  ];
}

function createScenario(exec, flow, defaultTarget) {
  return {
    executor: "ramping-vus",
    exec,
    startVUs: 0,
    stages: createStages(defaultTarget),
    gracefulRampDown: "5s",
    tags: { flow }
  };
}

function createOptions(scenarios, thresholds = {}) {
  return {
    scenarios,
    thresholds: {
      http_req_failed: ["rate<0.05"],
      http_req_duration: ["p(95)<1200", "p(99)<2000"],
      business_failure_rate: ["rate<0.02"],
      ...thresholds
    },
    summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"]
  };
}

export { BASE_URL, DEFAULT_ADMIN_CREDENTIALS, REPORT_DIR, THINK_TIME_MS, createOptions, createScenario };
