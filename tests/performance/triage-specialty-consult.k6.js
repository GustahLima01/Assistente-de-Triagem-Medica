import { check, fail } from "k6";
import { Trend } from "k6/metrics";
import { DEFAULT_ADMIN_CREDENTIALS, createOptions, createScenario } from "./lib/config.js";
import { buildClinicUserPayload, buildSymptomPayload } from "./lib/data.js";
import { postJson } from "./lib/http.js";
import { recordCheckResult } from "./lib/metrics.js";
import { createSummaryReport } from "./lib/report.js";

const SCRIPT_NAME = "triage-specialty-consult";
const specialtyConsultDuration = new Trend("triage_specialty_consult_duration");

export const options = createOptions(
  {
    triage_specialty_consult: createScenario(
      "default",
      "triage-specialty-consult",
      Number(__ENV.TRIAGE_SPECIALTY_CONSULT_VUS || 8)
    )
  },
  {
    triage_specialty_consult_duration: ["p(95)<600", "p(99)<1000"]
  }
);

export function setup() {
  const adminLogin = postJson("/api/auth/login", DEFAULT_ADMIN_CREDENTIALS, null, "setup_admin_login");
  const adminLoginOk = check(adminLogin, {
    "setup admin login retorna 200": (res) => res.status === 200,
    "setup admin login retorna token": (res) => Boolean(res.json("data.token"))
  });

  recordCheckResult(adminLoginOk);

  if (!adminLoginOk) {
    fail(`Falha no login administrativo do setup: status ${adminLogin.status}`);
  }

  const adminToken = adminLogin.json("data.token");
  const receptionistPayload = buildClinicUserPayload("RECEPTIONIST");

  const createReceptionist = postJson("/api/users", receptionistPayload, adminToken, "setup_create_receptionist");
  const createReceptionistOk = check(createReceptionist, {
    "setup cria receptionist com 201": (res) => res.status === 201,
    "setup cria receptionist com id": (res) => Boolean(res.json("data.id"))
  });

  recordCheckResult(createReceptionistOk);

  if (!createReceptionistOk) {
    fail(`Falha ao criar usuario receptionist: status ${createReceptionist.status}`);
  }

  const receptionistLogin = postJson(
    "/api/auth/login",
    {
      email: receptionistPayload.email,
      password: receptionistPayload.password
    },
    null,
    "setup_receptionist_login"
  );
  const receptionistLoginOk = check(receptionistLogin, {
    "setup receptionist login retorna 200": (res) => res.status === 200,
    "setup receptionist login retorna token": (res) => Boolean(res.json("data.token"))
  });

  recordCheckResult(receptionistLoginOk);

  if (!receptionistLoginOk) {
    fail(`Falha no login do receptionist: status ${receptionistLogin.status}`);
  }

  const symptomAResponse = postJson(
    "/api/symptoms",
    buildSymptomPayload({ severity: "HIGH", specialty: "Cardiologia" }),
    adminToken,
    "setup_create_symptom_a"
  );
  const symptomBResponse = postJson(
    "/api/symptoms",
    buildSymptomPayload({ severity: "MEDIUM", specialty: "Clinico Geral" }),
    adminToken,
    "setup_create_symptom_b"
  );

  const symptomsOk = check(symptomAResponse, {
    "setup cria sintoma A com 201": (res) => res.status === 201,
    "setup cria sintoma A com id": (res) => Boolean(res.json("data.id"))
  }) &&
    check(symptomBResponse, {
      "setup cria sintoma B com 201": (res) => res.status === 201,
      "setup cria sintoma B com id": (res) => Boolean(res.json("data.id"))
    });

  recordCheckResult(symptomsOk);

  if (!symptomsOk) {
    fail(`Falha ao criar sintomas de setup: status ${symptomAResponse.status}/${symptomBResponse.status}`);
  }

  return {
    token: receptionistLogin.json("data.token"),
    expectedSpecialty: "Cardiologia",
    expectedPriority: "HIGH",
    symptomIds: [symptomAResponse.json("data.id"), symptomBResponse.json("data.id")]
  };
}

export default function (data) {
  const response = postJson(
    "/api/triages/specialty-consult",
    { symptomIds: data.symptomIds },
    data.token,
    "triage_specialty_consult"
  );

  specialtyConsultDuration.add(response.timings.duration);

  const ok = check(response, {
    "consulta retorna 200": (res) => res.status === 200,
    "consulta retorna especialidade sugerida": (res) => res.json("data.suggestedSpecialty") === data.expectedSpecialty,
    "consulta retorna prioridade": (res) => res.json("data.priority") === data.expectedPriority
  });

  recordCheckResult(ok);

  if (!ok) {
    fail(`Falha no endpoint de specialty consult: status ${response.status}`);
  }
}

export function handleSummary(data) {
  return createSummaryReport(SCRIPT_NAME, data);
}
