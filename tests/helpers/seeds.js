const { db } = require("../../src/data/memoryDb");
const { createUser, updateUser } = require("../../src/services/userService");
const { createPatient, updatePatient } = require("../../src/services/patientService");
const { createDoctor, updateDoctor } = require("../../src/services/doctorService");
const { createSymptom, updateSymptom } = require("../../src/services/symptomService");
const { createTriage } = require("../../src/services/triageService");
const { createAppointment } = require("../../src/services/appointmentService");

function getSeededAdmin() {
  return db.users[0];
}

function seedUser(payload = {}) {
  return createUser({
    name: "Usuario Fixture",
    email: "usuario.fixture@clinica.local",
    password: "Senha@123",
    role: "RECEPTIONIST",
    ...payload
  });
}

function seedInactiveUser(payload = {}) {
  const user = seedUser(payload);
  updateUser(user.id, { active: false });
  return db.users.find((item) => item.id === user.id);
}

function seedPatient(payload = {}) {
  return createPatient({
    name: "Paciente Fixture",
    document: "12345678900",
    birthDate: "1990-05-10",
    phone: "+5511999999999",
    email: "paciente.fixture@email.com",
    notes: "Observacao inicial",
    ...payload
  });
}

function seedInactivePatient(payload = {}) {
  const patient = seedPatient(payload);
  updatePatient(patient.id, { active: false });
  return db.patients.find((item) => item.id === patient.id);
}

function seedDoctor(payload = {}) {
  return createDoctor({
    name: "Dra. Ana Fixture",
    crm: "CRM-SP-123456",
    specialty: "Cardiologia",
    phone: "+5511988888888",
    email: "medica.fixture@clinica.local",
    ...payload
  });
}

function seedInactiveDoctor(payload = {}) {
  const doctor = seedDoctor(payload);
  updateDoctor(doctor.id, { active: false });
  return db.doctors.find((item) => item.id === doctor.id);
}

function seedSymptom(payload = {}) {
  return createSymptom({
    name: "Dor no peito",
    description: "Dor opressiva",
    severity: "HIGH",
    specialty: "Cardiologia",
    ...payload
  });
}

function seedInactiveSymptom(payload = {}) {
  const symptom = seedSymptom(payload);
  updateSymptom(symptom.id, { active: false });
  return db.symptoms.find((item) => item.id === symptom.id);
}

function seedTriage(payload = {}, currentUser = getSeededAdmin()) {
  const patient = payload.patientId ? null : seedPatient();
  const symptom = payload.symptomIds ? null : seedSymptom();

  return createTriage(
    {
      patientId: payload.patientId || patient.id,
      symptomIds: payload.symptomIds || [symptom.id],
      notes: "Triagem fixture",
      ...payload
    },
    currentUser
  );
}

function seedAppointment(payload = {}, currentUser = getSeededAdmin()) {
  const patient = payload.patientId ? null : seedPatient();
  const doctor = payload.doctorId ? null : seedDoctor();

  return createAppointment(
    {
      patientId: payload.patientId || patient.id,
      doctorId: payload.doctorId || doctor.id,
      scheduledAt: payload.scheduledAt || "2026-05-10T10:00:00.000Z",
      notes: "Consulta fixture",
      ...payload
    },
    currentUser
  );
}

module.exports = {
  db,
  getSeededAdmin,
  seedAppointment,
  seedDoctor,
  seedInactiveDoctor,
  seedInactivePatient,
  seedInactiveSymptom,
  seedInactiveUser,
  seedPatient,
  seedSymptom,
  seedTriage,
  seedUser
};
