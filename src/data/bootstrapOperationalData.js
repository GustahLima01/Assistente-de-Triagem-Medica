const { db } = require("./memoryDb");
const { createAppointment } = require("../services/appointmentService");
const { createPatient } = require("../services/patientService");
const { createTriage } = require("../services/triageService");

const BOOTSTRAP_PATIENTS = [
  {
    name: "Ana Clara Souza",
    document: "11111111111",
    birthDate: "1991-03-14",
    phone: "+5511999000001",
    email: "ana.clara@paciente.local",
    notes: "Paciente recorrente do atendimento clinico."
  },
  {
    name: "Bruno Henrique Lima",
    document: "11111111112",
    birthDate: "1987-08-02",
    phone: "+5511999000002",
    email: "bruno.henrique@paciente.local",
    notes: "Historico de dor toracica recente."
  },
  {
    name: "Camila Ferreira Rocha",
    document: "11111111113",
    birthDate: "1995-01-22",
    phone: "+5511999000003",
    email: "camila.ferreira@paciente.local",
    notes: "Atendimento para triagem dermatologica."
  },
  {
    name: "Daniel Martins Costa",
    document: "11111111114",
    birthDate: "1982-05-17",
    phone: "+5511999000004",
    email: "daniel.martins@paciente.local",
    notes: "Necessita encaminhamento de ortopedia."
  },
  {
    name: "Elisa Nogueira Alves",
    document: "11111111115",
    birthDate: "2001-11-09",
    phone: "+5511999000005",
    email: "elisa.nogueira@paciente.local",
    notes: "Fila de atendimento em neurologia."
  },
  {
    name: "Fabio Pereira Gomes",
    document: "11111111116",
    birthDate: "1979-09-28",
    phone: "+5511999000006",
    email: "fabio.pereira@paciente.local",
    notes: "Cadastro pronto para retorno."
  },
  {
    name: "Gabriela Mendes Silva",
    document: "11111111117",
    birthDate: "1998-06-30",
    phone: "+5511999000007",
    email: "gabriela.mendes@paciente.local",
    notes: "Paciente aguardando validacao inicial."
  },
  {
    name: "Henrique Araujo Pinto",
    document: "11111111118",
    birthDate: "1993-12-11",
    phone: "+5511999000008",
    email: "henrique.araujo@paciente.local",
    notes: "Cadastro criado para simulacao da recepcao."
  },
  {
    name: "Isabela Castro Duarte",
    document: "11111111119",
    birthDate: "1989-04-05",
    phone: "+5511999000009",
    email: "isabela.castro@paciente.local",
    notes: "Paciente com monitoramento clinico."
  },
  {
    name: "Joao Victor Teixeira",
    document: "11111111120",
    birthDate: "1990-10-19",
    phone: "+5511999000010",
    email: "joao.victor@paciente.local",
    notes: "Cadastro criado para validacao de fluxo."
  }
];

const BOOTSTRAP_TRIAGE_PLANS = [
  {
    patientDocument: "11111111111",
    specialty: "Pediatria",
    symptomNames: ["Tosse", "Febre"],
    doctorCrm: "CRM-PED-0001",
    scheduleDayOffset: 0,
    scheduleHour: 9,
    scheduleMinute: 0,
    triageNotes: "Criado automaticamente para demonstracao do fluxo de triagem pediatrica.",
    appointmentNotes: "Consulta inicial automatizada."
  },
  {
    patientDocument: "11111111112",
    specialty: "Cardiologia",
    symptomNames: ["Dor no peito", "Falta de ar"],
    doctorCrm: "CRM-CAR-0001",
    scheduleDayOffset: 0,
    scheduleHour: 10,
    scheduleMinute: 0,
    triageNotes: "Criado automaticamente para demonstracao do fluxo cardiologico.",
    appointmentNotes: "Consulta prioritaria de cardiologia."
  },
  {
    patientDocument: "11111111113",
    specialty: "Dermatologia",
    symptomNames: ["Coceira", "Vermelhidao"],
    doctorCrm: "CRM-DER-0001",
    scheduleDayOffset: 1,
    scheduleHour: 11,
    scheduleMinute: 0,
    triageNotes: "Criado automaticamente para demonstracao do fluxo dermatologico.",
    appointmentNotes: "Consulta de avaliacao dermatologica."
  },
  {
    patientDocument: "11111111114",
    specialty: "Ortopedia e Traumatologia",
    symptomNames: ["Dor intensa", "Dificuldade de movimento"],
    doctorCrm: "CRM-ORT-0001",
    scheduleDayOffset: 2,
    scheduleHour: 14,
    scheduleMinute: 0,
    triageNotes: "Criado automaticamente para demonstracao do fluxo ortopedico.",
    appointmentNotes: "Consulta de avaliacao ortopedica."
  },
  {
    patientDocument: "11111111115",
    specialty: "Neurologia",
    symptomNames: ["Convulsoes", "Confusao"],
    doctorCrm: "CRM-NEU-0001",
    scheduleDayOffset: 3,
    scheduleHour: 15,
    scheduleMinute: 0,
    triageNotes: "Criado automaticamente para demonstracao do fluxo neurologico.",
    appointmentNotes: "Consulta de avaliacao neurologica."
  }
];

function buildBootstrapScheduledAt(dayOffset = 0, hour = 9, minute = 0) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  return date.toISOString();
}

function findSeedAdmin() {
  return db.users.find((user) => user.role === "ADMIN" && user.active);
}

function findPatientByDocument(document) {
  return db.patients.find((patient) => patient.document === document);
}

function findDoctorByCrm(crm) {
  return db.doctors.find((doctor) => doctor.crm === crm);
}

function findSymptomsForPlan(plan) {
  return plan.symptomNames.map((symptomName) => {
    const symptom = db.symptoms.find(
      (item) => item.active && item.specialty === plan.specialty && item.name === symptomName
    );

    if (!symptom) {
      throw new Error(`Sintoma de bootstrap nao encontrado: ${plan.specialty} / ${symptomName}`);
    }

    return symptom;
  });
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

  const adminUser = findSeedAdmin();
  if (!adminUser) {
    throw new Error("Usuario administrador nao encontrado para criar a massa operacional.");
  }

  BOOTSTRAP_PATIENTS.forEach((patientPayload) => {
    createPatient(patientPayload);
  });

  BOOTSTRAP_TRIAGE_PLANS.forEach((plan) => {
    const patient = findPatientByDocument(plan.patientDocument);
    const doctor = findDoctorByCrm(plan.doctorCrm);
    const symptoms = findSymptomsForPlan(plan);

    if (!patient) {
      throw new Error(`Paciente de bootstrap nao encontrado: ${plan.patientDocument}`);
    }

    if (!doctor) {
      throw new Error(`Medico de bootstrap nao encontrado: ${plan.doctorCrm}`);
    }

    const triage = createTriage(
      {
        patientId: patient.id,
        symptomIds: symptoms.map((symptom) => symptom.id),
        notes: plan.triageNotes
      },
      adminUser
    );

    createAppointment(
      {
        patientId: patient.id,
        doctorId: doctor.id,
        triageId: triage.id,
        scheduledAt: buildBootstrapScheduledAt(plan.scheduleDayOffset, plan.scheduleHour, plan.scheduleMinute),
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
