function buildUniqueSuffix() {
  const vu = typeof __VU === "number" ? __VU : 0;
  const iteration = typeof __ITER === "number" ? __ITER : 0;

  return `${Date.now()}-${vu}-${iteration}`;
}

function buildNumericToken(length = 11) {
  const digits = buildUniqueSuffix().replace(/\D/g, "");
  return digits.slice(-length).padStart(length, "0");
}

function buildClinicUserPayload(role = "RECEPTIONIST") {
  const suffix = buildUniqueSuffix();

  return {
    name: `${role} Performance ${suffix}`,
    email: `${role.toLowerCase()}.${suffix}@clinica.local`,
    password: "Senha@123",
    role
  };
}

function buildPatientPayload() {
  const suffix = buildUniqueSuffix();

  return {
    name: `Paciente Performance ${suffix}`,
    document: buildNumericToken(11),
    birthDate: "1990-05-10",
    phone: "+5511999999999",
    email: `patient.${suffix}@clinica.local`,
    notes: "Paciente criado automaticamente para teste de performance."
  };
}

function buildDoctorPayload(specialty = "Cardiologia") {
  const suffix = buildUniqueSuffix();

  return {
    name: `Dr Performance ${suffix}`,
    crm: `CRM-SP-${buildNumericToken(6)}`,
    specialty,
    phone: "+5511988888888",
    email: `doctor.${suffix}@clinica.local`
  };
}

function buildSymptomPayload(overrides = {}) {
  const suffix = buildUniqueSuffix();

  return {
    name: `Sintoma Performance ${suffix}`,
    description: "Sintoma criado automaticamente para teste de performance.",
    severity: "HIGH",
    specialty: "Cardiologia",
    ...overrides
  };
}

function buildTriagePayload(patientId, symptomIds) {
  return {
    patientId,
    symptomIds,
    notes: "Triagem criada automaticamente para teste de performance."
  };
}

function buildAppointmentPayload(patientId, doctorId, triageId) {
  const baseDate = Date.UTC(2026, 4, 10, 10, 0, 0);
  const vu = typeof __VU === "number" ? __VU : 0;
  const iteration = typeof __ITER === "number" ? __ITER : 0;
  const slotOffsetMs = (iteration * 60000) + (vu * 1000);
  const scheduledAt = new Date(baseDate + slotOffsetMs).toISOString();

  return {
    patientId,
    doctorId,
    triageId,
    scheduledAt,
    notes: "Agendamento criado automaticamente para teste de performance."
  };
}

export {
  buildAppointmentPayload,
  buildClinicUserPayload,
  buildDoctorPayload,
  buildPatientPayload,
  buildSymptomPayload,
  buildTriagePayload
};
