import { check, fail } from "k6";
import { Trend } from "k6/metrics";
import { DEFAULT_ADMIN_CREDENTIALS, createOptions, createScenario } from "./lib/config.js";
import { postJson } from "./lib/http.js";
import { recordCheckResult } from "./lib/metrics.js";
import { createSummaryReport } from "./lib/report.js";

const SCRIPT_NAME = "auth-login";
const authLoginDuration = new Trend("auth_login_duration");

export const options = createOptions(
  {
    auth_login: createScenario("default", "auth-login", Number(__ENV.AUTH_LOGIN_VUS || 10))
  },
  {
    auth_login_duration: ["p(95)<400", "p(99)<800"]
  }
);

export default function () {
  const response = postJson("/api/auth/login", DEFAULT_ADMIN_CREDENTIALS, null, "auth_login");
  authLoginDuration.add(response.timings.duration);

  const ok = check(response, {
    "login retorna 200": (res) => res.status === 200,
    "login retorna token": (res) => Boolean(res.json("data.token")),
    "login retorna usuario admin": (res) => res.json("data.user.email") === DEFAULT_ADMIN_CREDENTIALS.email
  });

  recordCheckResult(ok);

  if (!ok) {
    fail(`Falha no endpoint de login: status ${response.status}`);
  }
}

export function handleSummary(data) {
  return createSummaryReport(SCRIPT_NAME, data);
}
