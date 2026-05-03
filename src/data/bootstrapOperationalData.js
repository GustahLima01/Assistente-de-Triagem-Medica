const { db } = require("./memoryDb");
const { createAppointment } = require("../services/appointmentService");
const { createPatient } = require("../services/patientService");
const { createTriage } = require("../services/triageService");

const BOOTSTRAP_PATIENTS = [
  {
    name: "Mariana Souza",
    document: "10000000001",
    birthDate: "1992-04-12",
    phone: "+5511991000001",
    email: "mariana.souza@paciente.local",
    notes: "Paciente bootstrap 01."
  },
  {
    name: "Carlos Eduardo Lima",
    document: "10000000002",
    birthDate: "1988-09-03",
    phone: "+5511991000002",
    email: "carlos.lima@paciente.local",
    notes: "Paciente bootstrap 02."
  },
  {
    name: "Fernanda Alves",
    document: "10000000003",
    birthDate: "1995-01-21",
    phone: "+5511991000003",
    email: "fernanda.alves@paciente.local",
    notes: "Paciente bootstrap 03."
  },
  {
    name: "Paulo Henrique Melo",
    document: "10000000004",
    birthDate: "1979-11-16",
    phone: "+5511991000004",
    email: "paulo.melo@paciente.local",
    notes: "Paciente bootstrap 04."
  },
  {
    name: "Juliana Castro",
    document: "10000000005",
    birthDate: "1985-06-29",
    phone: "+5511991000005",
    email: "juliana.castro@paciente.local",
    notes: "Paciente bootstrap 05."
  },
  {
    name: "Ricardo Nunes",
    document: "10000000006",
    birthDate: "1990-03-14",
    phone: "+5511991000006",
    email: "ricardo.nunes@paciente.local",
    notes: "Paciente bootstrap 06."
  },
  {
    name: "Aline Moraes",
    document: "10000000007",
    birthDate: "1998-12-08",
    phone: "+5511991000007",
    email: "aline.moraes@paciente.local",
    notes: "Paciente bootstrap 07."
  },
  {
    name: "Bruno Tavares",
    document: "10000000008",
    birthDate: "1983-08-25",
    phone: "+5511991000008",
    email: "bruno.tavares@paciente.local",
    notes: "Paciente bootstrap 08."
  },
  {
    name: "Camila Prado",
    document: "10000000009",
    birthDate: "1991-02-18",
    phone: "+5511991000009",
    email: "camila.prado@paciente.local",
    notes: "Paciente bootstrap 09."
  },
  {
    name: "Diego Fernandes",
    document: "10000000010",
    birthDate: "1987-10-11",
    phone: "+5511991000010",
    email: "diego.fernandes@paciente.local",
    notes: "Paciente bootstrap 10."
  }
];

const BOOTSTRAP_TRIAGE_PLANS = [
  {
    patientDocument: "10000000001",
    symptomRefs: [
      ["Cardiologia", "Dor no peito"],
      ["Cardiologia", "Falta de ar"],
      ["Cardiologia", "Sudorese"]
    ],
    appointmentAt: "2026-06-10T09:00:00.000Z",
    triageNotes: "Paciente com sinais de alerta cardiovascular.",
    appointmentNotes: "Consulta inicial de cardiologia."
  },
  {
    patientDocument: "10000000002",
    symptomRefs: [
      ["Dermatologia", "Placas vermelhas"],
      ["Dermatologia", "Descamacao"],
      ["Dermatologia", "Coceira"]
    ],
    appointmentAt: "2026-06-10T10:00:00.000Z",
    triageNotes: "Lesoes cutaneas persistentes.",
    appointmentNotes: "Consulta dermatologica de avaliacao."
  },
  {
    patientDocument: "10000000003",
    symptomRefs: [
      ["Neurologia", "Tremor"],
      ["Neurologia", "Rigidez muscular"],
      ["Neurologia", "Instabilidade postural"]
    ],
    appointmentAt: "2026-06-10T11:00:00.000Z",
    triageNotes: "Sintomas neurologicos progressivos.",
    appointmentNotes: "Consulta neurologica inicial."
  },
  {
    patientDocument: "10000000004",
    symptomRefs: [
      ["Oftalmologia", "Dor ocular"],
      ["Oftalmologia", "Visao embacada"],
      ["Oftalmologia", "Halos"]
    ],
    appointmentAt: "2026-06-10T13:00:00.000Z",
    triageNotes: "Queixa ocular com impacto funcional.",
    appointmentNotes: "Consulta oftalmologica prioritaria."
  },
  {
    patientDocument: "10000000005",
    symptomRefs: [
      ["Otorrinolaringologista", "Dor de garganta"],
      ["Otorrinolaringologista", "Febre"],
      ["Otorrinolaringologista", "Dificuldade para engolir"]
    ],
    appointmentAt: "2026-06-10T14:00:00.000Z",
    triageNotes: "Quadro infeccioso de vias aereas superiores.",
    appointmentNotes: "Consulta otorrino de avaliacao."
  }
];

function getSeededAdminUser() {
  return db.users.find((user) => user.role === "ADMIN");
}

function findPatientByDocument(document) {
  return db.patients.find((patient) => patient.document === document);
}

function findSymptomByReference(specialty, name) {
  const symptom = db.symptoms.find((item) => item.specialty === specialty && item.name === name && item.active);

  if (!symptom) {
    throw new Error(`Sintoma bootstrap nao encontrado: ${specialty} / ${name}`);
  }

  return symptom;
}

function findAvailableDoctorBySpecialty(specialty, scheduledAt) {
  const scheduledDoctorIds = new Set(
    db.appointments
      .filter((appointment) => appointment.status === "SCHEDULED" && appointment.scheduledAt === scheduledAt)
      .map((appointment) => appointment.doctorId)
  );

  const doctor = db.doctors.find(
    (item) => item.specialty === specialty && item.active && !scheduledDoctorIds.has(item.id)
  );

  if (!doctor) {
    throw new Error(`Medico bootstrap nao encontrado para ${specialty} em ${scheduledAt}`);
  }

  return doctor;
}

function seedBootstrapOperationalData() {
  if (db.patients.length > 0 || db.triages.length > 0 || db.appointments.length > 0) {
    return {
      patientsCreated: 0,
      triagesCreated: 0,
      appointmentsCreated: 0,
      skipped: true
    };
  }

  const adminUser = getSeededAdminUser();

  if (!adminUser) {
    throw new Error("Usuario admin bootstrap nao encontrado.");
  }

  BOOTSTRAP_PATIENTS.forEach((patientPayload) => {
    createPatient(patientPayload);
  });

  BOOTSTRAP_TRIAGE_PLANS.forEach((plan) => {
    const patient = findPatientByDocument(plan.patientDocument);
    const symptomIds = plan.symptomRefs.map(([specialty, name]) => findSymptomByReference(specialty, name).id);
    const triage = createTriage(
      {
        patientId: patient.id,
        symptomIds,
        notes: plan.triageNotes
      },
      adminUser
    );
    const doctor = findAvailableDoctorBySpecialty(triage.suggestedSpecialty, plan.appointmentAt);

    createAppointment(
      {
        patientId: patient.id,
        doctorId: doctor.id,
        triageId: triage.id,
        scheduledAt: plan.appointmentAt,
        notes: plan.appointmentNotes
      },
      adminUser
    );
  });

  return {
    patientsCreated: BOOTSTRAP_PATIENTS.length,
    triagesCreated: BOOTSTRAP_TRIAGE_PLANS.length,
    appointmentsCreated: BOOTSTRAP_TRIAGE_PLANS.length,
    skipped: false
  };
}

module.exports = {
  BOOTSTRAP_PATIENTS,
  BOOTSTRAP_TRIAGE_PLANS,
  seedBootstrapOperationalData
};
