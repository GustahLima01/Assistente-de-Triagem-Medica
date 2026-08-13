function uniqueSuffix(prefix = "qa") {
  return `${prefix}-${Date.now()}-${Cypress._.random(1000, 9999)}`;
}

function buildPatient(overrides = {}) {
  const suffix = uniqueSuffix("patient");
  const digits = `${Date.now()}${Cypress._.random(100, 999)}`.slice(-11);

  return {
    name: `Paciente ${suffix}`,
    document: digits,
    birthDate: "1992-04-15",
    phone: "+5511999999999",
    email: `${suffix}@paciente.local`,
    notes: "Paciente criado pela automacao Cypress.",
    ...overrides
  };
}

function buildDoctor(overrides = {}) {
  const suffix = uniqueSuffix("doctor");

  return {
    name: `Medico ${suffix}`,
    crm: `CRM-${Date.now()}${Cypress._.random(10, 99)}`,
    specialty: "Clínica Médica",
    phone: "+5511888888888",
    email: `${suffix}@medico.local`,
    active: true,
    ...overrides
  };
}

function buildSymptom(overrides = {}) {
  const suffix = uniqueSuffix("symptom");

  return {
    name: `Sintoma ${suffix}`,
    description: "Sintoma criado pela automacao Cypress.",
    severity: "HIGH",
    specialty: "Clínica Médica",
    active: true,
    ...overrides
  };
}

function buildUser(overrides = {}) {
  const suffix = uniqueSuffix("user");

  return {
    name: `Usuario ${suffix}`,
    email: `${suffix}@clinica.local`,
    role: "RECEPTIONIST",
    password: "Senha@123",
    active: true,
    ...overrides
  };
}

function nextSameDayAppointmentIso() {
  const appointmentDate = new Date();
  appointmentDate.setMinutes(0, 0, 0);
  appointmentDate.setHours(appointmentDate.getHours() + 2);

  const year = appointmentDate.getFullYear();
  const month = String(appointmentDate.getMonth() + 1).padStart(2, "0");
  const day = String(appointmentDate.getDate()).padStart(2, "0");
  const hours = String(appointmentDate.getHours()).padStart(2, "0");
  const minutes = String(appointmentDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

module.exports = {
  buildDoctor,
  buildPatient,
  buildSymptom,
  buildUser,
  nextSameDayAppointmentIso
};
