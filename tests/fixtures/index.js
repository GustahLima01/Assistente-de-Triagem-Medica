let sequence = 1;

function nextToken(prefix) {
  const token = `${prefix}-${sequence}`;
  sequence += 1;
  return token;
}

function buildUserFixture(overrides = {}) {
  const token = nextToken("user");

  return {
    name: `Usuario ${token}`,
    email: `${token}@clinica.local`,
    password: "Senha@123",
    role: "RECEPTIONIST",
    ...overrides
  };
}

function buildPatientFixture(overrides = {}) {
  const token = nextToken("patient");

  return {
    name: `Paciente ${token}`,
    document: `${sequence}`.padStart(11, "0"),
    birthDate: "1990-05-10",
    phone: "+5511999999999",
    email: `${token}@email.com`,
    notes: `Observacao ${token}`,
    ...overrides
  };
}

function buildDoctorFixture(overrides = {}) {
  const token = nextToken("doctor");

  return {
    name: `Dra. ${token}`,
    crm: `CRM-SP-${String(sequence).padStart(6, "0")}`,
    specialty: "Cardiologia",
    phone: "+5511988888888",
    email: `${token}@clinica.local`,
    ...overrides
  };
}

function buildSymptomFixture(overrides = {}) {
  const token = nextToken("symptom");

  return {
    name: `Sintoma ${token}`,
    description: `Descricao ${token}`,
    severity: "HIGH",
    specialty: "Cardiologia",
    ...overrides
  };
}

function buildTriageFixture(overrides = {}) {
  return {
    notes: "Paciente relata sintomas recorrentes.",
    ...overrides
  };
}

function buildAppointmentFixture(overrides = {}) {
  return {
    scheduledAt: "2026-05-10T10:00:00.000Z",
    notes: "Consulta preferencial pela manha.",
    ...overrides
  };
}

module.exports = {
  buildAppointmentFixture,
  buildDoctorFixture,
  buildPatientFixture,
  buildSymptomFixture,
  buildTriageFixture,
  buildUserFixture
};
