let sequence = 0;

function unique(prefix) {
  sequence += 1;
  return `${prefix}-${Date.now()}-${sequence}`;
}

function patient(overrides = {}) {
  const value = unique("patient");
  return {
    name: `Paciente ${value}`,
    document: String(Date.now()).slice(-11).padStart(11, "0"),
    birthDate: "1990-05-10",
    phone: "+5511999999999",
    email: `${value}@email.com`,
    notes: "Observacao de teste Cypress.",
    ...overrides
  };
}

function doctor(overrides = {}) {
  const value = unique("doctor");
  return {
    name: `Dra. ${value}`,
    crm: `CRM-SP-${String(Date.now()).slice(-6)}${sequence}`,
    specialty: "Cardiologia",
    phone: "+5511988888888",
    email: `${value}@clinica.local`,
    ...overrides
  };
}

function symptom(overrides = {}) {
  const value = unique("symptom");
  return {
    name: `Sintoma ${value}`,
    description: `Descricao ${value}`,
    severity: "HIGH",
    specialty: "Cardiologia",
    ...overrides
  };
}

function user(overrides = {}) {
  const value = unique("user");
  return {
    name: `Usuario ${value}`,
    email: `${value}@clinica.local`,
    password: "Senha@123",
    role: "RECEPTIONIST",
    ...overrides
  };
}

function appointment(overrides = {}) {
  return {
    scheduledAt: "2026-05-10T10:00:00.000Z",
    notes: "Consulta de teste Cypress.",
    ...overrides
  };
}

module.exports = { appointment, doctor, patient, symptom, user };
