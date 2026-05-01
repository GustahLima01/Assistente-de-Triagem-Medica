import { check, fail } from "k6";
import { Trend } from "k6/metrics";
import { DEFAULT_ADMIN_CREDENTIALS, createOptions, createScenario } from "./lib/config.js";
import {
  buildAppointmentPayload,
  buildClinicUserPayload,
  buildDoctorPayload,
  buildPatientPayload
} from "./lib/data.js";
import { postJson } from "./lib/http.js";
import { recordCheckResult } from "./lib/metrics.js";
import { createSummaryReport } from "./lib/report.js";

const SCRIPT_NAME = "appointments-create";
const appointmentCreateDuration = new Trend("appointments_create_duration");

export const options = createOptions(
  {
    appointments_create: createScenario("default", "appointments-create", Number(__ENV.APPOINTMENTS_CREATE_VUS || 6))
  },
  {
    appointments_create_duration: ["p(95)<700", "p(99)<1100"]
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
    "setup cria receptionist com 201": (res) => res.status === 201
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

  const patientResponse = postJson("/api/patients", buildPatientPayload(), adminToken, "setup_create_patient");
  const doctorResponse = postJson(
    "/api/doctors",
    buildDoctorPayload(__ENV.APPOINTMENT_SPECIALTY || "Cardiologia"),
    adminToken,
    "setup_create_doctor"
  );

  const setupEntitiesOk = check(patientResponse, {
    "setup cria paciente com 201": (res) => res.status === 201,
    "setup cria paciente com id": (res) => Boolean(res.json("data.id"))
  }) &&
    check(doctorResponse, {
      "setup cria medico com 201": (res) => res.status === 201,
      "setup cria medico com id": (res) => Boolean(res.json("data.id"))
    });

  recordCheckResult(setupEntitiesOk);

  if (!setupEntitiesOk) {
    fail(`Falha ao criar paciente/medico de setup: status ${patientResponse.status}/${doctorResponse.status}`);
  }

  return {
    token: receptionistLogin.json("data.token"),
    patientId: patientResponse.json("data.id"),
    doctorId: doctorResponse.json("data.id")
  };
}

export default function (data) {
  const response = postJson(
    "/api/appointments",
    buildAppointmentPayload(data.patientId, data.doctorId),
    data.token,
    "appointments_create"
  );

  appointmentCreateDuration.add(response.timings.duration);

  const ok = check(response, {
    "agendamento retorna 201": (res) => res.status === 201,
    "agendamento retorna id": (res) => Boolean(res.json("data.id")),
    "agendamento retorna status scheduled": (res) => res.json("data.status") === "SCHEDULED"
  });

  recordCheckResult(ok);

  if (!ok) {
    fail(`Falha no endpoint de criacao de agendamento: status ${response.status}`);
  }
}

export function handleSummary(data) {
  return createSummaryReport(SCRIPT_NAME, data);
}
