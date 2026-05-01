import { check, fail } from "k6";
import { Trend } from "k6/metrics";
import { DEFAULT_ADMIN_CREDENTIALS, createOptions, createScenario } from "./lib/config.js";
import {
  buildAppointmentPayload,
  buildClinicUserPayload,
  buildDoctorPayload,
  buildPatientPayload,
  buildSymptomPayload,
  buildTriagePayload
} from "./lib/data.js";
import { maybeSleep, postJson } from "./lib/http.js";
import { recordCheckResult } from "./lib/metrics.js";
import { createSummaryReport } from "./lib/report.js";

const SCRIPT_NAME = "reception-journey";
const receptionLoginDuration = new Trend("reception_journey_login_duration");
const receptionPatientDuration = new Trend("reception_journey_patient_create_duration");
const receptionConsultDuration = new Trend("reception_journey_specialty_consult_duration");
const receptionTriageDuration = new Trend("reception_journey_triage_create_duration");
const receptionAppointmentDuration = new Trend("reception_journey_appointment_create_duration");

export const options = createOptions(
  {
    reception_journey: createScenario("default", "reception-journey", Number(__ENV.RECEPTION_JOURNEY_VUS || 4))
  },
  {
    reception_journey_login_duration: ["p(95)<400"],
    reception_journey_patient_create_duration: ["p(95)<700"],
    reception_journey_specialty_consult_duration: ["p(95)<600"],
    reception_journey_triage_create_duration: ["p(95)<800"],
    reception_journey_appointment_create_duration: ["p(95)<900"]
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

  const specialty = __ENV.RECEPTION_SPECIALTY || "Cardiologia";
  const doctorResponse = postJson("/api/doctors", buildDoctorPayload(specialty), adminToken, "setup_create_doctor");
  const symptomResponse = postJson(
    "/api/symptoms",
    buildSymptomPayload({ severity: "HIGH", specialty }),
    adminToken,
    "setup_create_symptom"
  );

  const setupEntitiesOk = check(doctorResponse, {
    "setup cria medico com 201": (res) => res.status === 201,
    "setup cria medico com id": (res) => Boolean(res.json("data.id"))
  }) &&
    check(symptomResponse, {
      "setup cria sintoma com 201": (res) => res.status === 201,
      "setup cria sintoma com id": (res) => Boolean(res.json("data.id"))
    });

  recordCheckResult(setupEntitiesOk);

  if (!setupEntitiesOk) {
    fail(`Falha ao criar medico/sintoma de setup: status ${doctorResponse.status}/${symptomResponse.status}`);
  }

  return {
    receptionistCredentials: {
      email: receptionistPayload.email,
      password: receptionistPayload.password
    },
    doctorId: doctorResponse.json("data.id"),
    specialty,
    symptomIds: [symptomResponse.json("data.id")]
  };
}

export default function (data) {
  const loginResponse = postJson("/api/auth/login", data.receptionistCredentials, null, "reception_journey_login");
  receptionLoginDuration.add(loginResponse.timings.duration);

  const loginOk = check(loginResponse, {
    "journey login retorna 200": (res) => res.status === 200,
    "journey login retorna token": (res) => Boolean(res.json("data.token"))
  });

  recordCheckResult(loginOk);

  if (!loginOk) {
    fail(`Falha no login da jornada de recepcao: status ${loginResponse.status}`);
  }

  const token = loginResponse.json("data.token");
  maybeSleep(0.2);

  const patientResponse = postJson("/api/patients", buildPatientPayload(), token, "reception_journey_create_patient");
  receptionPatientDuration.add(patientResponse.timings.duration);

  const patientOk = check(patientResponse, {
    "journey paciente retorna 201": (res) => res.status === 201,
    "journey paciente retorna id": (res) => Boolean(res.json("data.id"))
  });

  recordCheckResult(patientOk);

  if (!patientOk) {
    fail(`Falha ao criar paciente na jornada de recepcao: status ${patientResponse.status}`);
  }

  const patientId = patientResponse.json("data.id");
  maybeSleep(0.2);

  const consultResponse = postJson(
    "/api/triages/specialty-consult",
    { symptomIds: data.symptomIds },
    token,
    "reception_journey_specialty_consult"
  );
  receptionConsultDuration.add(consultResponse.timings.duration);

  const consultOk = check(consultResponse, {
    "journey consulta retorna 200": (res) => res.status === 200,
    "journey consulta retorna especialidade esperada": (res) => res.json("data.suggestedSpecialty") === data.specialty
  });

  recordCheckResult(consultOk);

  if (!consultOk) {
    fail(`Falha na consulta de especialidade da jornada de recepcao: status ${consultResponse.status}`);
  }

  maybeSleep(0.2);

  const triageResponse = postJson(
    "/api/triages",
    buildTriagePayload(patientId, data.symptomIds),
    token,
    "reception_journey_create_triage"
  );
  receptionTriageDuration.add(triageResponse.timings.duration);

  const triageOk = check(triageResponse, {
    "journey triagem retorna 201": (res) => res.status === 201,
    "journey triagem retorna id": (res) => Boolean(res.json("data.id")),
    "journey triagem retorna especialidade esperada": (res) => res.json("data.suggestedSpecialty") === data.specialty
  });

  recordCheckResult(triageOk);

  if (!triageOk) {
    fail(`Falha ao criar triagem na jornada de recepcao: status ${triageResponse.status}`);
  }

  maybeSleep(0.2);

  const appointmentResponse = postJson(
    "/api/appointments",
    buildAppointmentPayload(patientId, data.doctorId, triageResponse.json("data.id")),
    token,
    "reception_journey_create_appointment"
  );
  receptionAppointmentDuration.add(appointmentResponse.timings.duration);

  const appointmentOk = check(appointmentResponse, {
    "journey agendamento retorna 201": (res) => res.status === 201,
    "journey agendamento retorna id": (res) => Boolean(res.json("data.id")),
    "journey agendamento retorna status scheduled": (res) => res.json("data.status") === "SCHEDULED"
  });

  recordCheckResult(appointmentOk);

  if (!appointmentOk) {
    fail(`Falha ao criar agendamento na jornada de recepcao: status ${appointmentResponse.status}`);
  }
}

export function handleSummary(data) {
  return createSummaryReport(SCRIPT_NAME, data);
}
