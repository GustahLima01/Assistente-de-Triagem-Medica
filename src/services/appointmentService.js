const { db, nextId } = require("../data/memoryDb");
const { createAppointmentModel } = require("../models/appointmentModel");
const HttpError = require("../utils/httpError");
const { normalizeIsoDateTime, normalizeNullableString } = require("../utils/normalizers");
const { ensureAllowedFields, ensureDateString, ensureRequiredFields } = require("../utils/validators");
const { getDoctorEntityById } = require("./doctorService");
const { getPatientEntityById } = require("./patientService");
const { getTriageEntityById } = require("./triageService");

const APPOINTMENT_CREATE_FIELDS = ["patientId", "doctorId", "triageId", "scheduledAt", "notes"];
const APPOINTMENT_FILTER_FIELDS = ["patientId", "doctorId", "triageId", "status", "scheduledFrom", "scheduledTo"];

function listAppointments(filters = {}) {
  ensureAllowedFields(filters, APPOINTMENT_FILTER_FIELDS);

  const normalizedFilters = {
    patientId: filters.patientId,
    doctorId: filters.doctorId,
    triageId: filters.triageId,
    status: filters.status,
    scheduledFrom: filters.scheduledFrom,
    scheduledTo: filters.scheduledTo
  };

  if (normalizedFilters.scheduledFrom !== undefined) {
    ensureDateString(normalizedFilters.scheduledFrom, "scheduledFrom");
    normalizedFilters.scheduledFrom = normalizeIsoDateTime(normalizedFilters.scheduledFrom);
  }

  if (normalizedFilters.scheduledTo !== undefined) {
    ensureDateString(normalizedFilters.scheduledTo, "scheduledTo");
    normalizedFilters.scheduledTo = normalizeIsoDateTime(normalizedFilters.scheduledTo);
  }

  return db.appointments.filter((appointment) => {
    if (normalizedFilters.patientId && appointment.patientId !== normalizedFilters.patientId) {
      return false;
    }

    if (normalizedFilters.doctorId && appointment.doctorId !== normalizedFilters.doctorId) {
      return false;
    }

    if (normalizedFilters.triageId && appointment.triageId !== normalizedFilters.triageId) {
      return false;
    }

    if (normalizedFilters.status && appointment.status !== normalizedFilters.status) {
      return false;
    }

    if (normalizedFilters.scheduledFrom && appointment.scheduledAt < normalizedFilters.scheduledFrom) {
      return false;
    }

    if (normalizedFilters.scheduledTo && appointment.scheduledAt > normalizedFilters.scheduledTo) {
      return false;
    }

    return true;
  });
}

function getAppointmentEntityById(id) {
  const appointment = db.appointments.find((item) => item.id === id);
  if (!appointment) {
    throw new HttpError(404, "APPOINTMENT_NOT_FOUND", "Agendamento nao encontrado.");
  }

  return appointment;
}

function createAppointment(payload, currentUser) {
  ensureAllowedFields(payload, APPOINTMENT_CREATE_FIELDS);
  ensureRequiredFields(payload, ["patientId", "doctorId", "scheduledAt"]);
  ensureDateString(payload.scheduledAt, "scheduledAt");

  const scheduledAt = normalizeIsoDateTime(payload.scheduledAt);
  const patient = getPatientEntityById(payload.patientId);
  const doctor = getDoctorEntityById(payload.doctorId);

  if (!patient.active) {
    throw new HttpError(409, "PATIENT_INACTIVE", "Nao e possivel agendar para um paciente inativo.");
  }

  if (!doctor.active) {
    throw new HttpError(409, "DOCTOR_INACTIVE", "Nao e possivel agendar com um medico inativo.");
  }

  let triage = null;
  if (payload.triageId) {
    triage = getTriageEntityById(payload.triageId);

    if (triage.patientId !== patient.id) {
      throw new HttpError(409, "TRIAGE_PATIENT_MISMATCH", "A triagem informada pertence a outro paciente.");
    }

    if (triage.suggestedSpecialty !== doctor.specialty) {
      throw new HttpError(
        409,
        "DOCTOR_SPECIALTY_MISMATCH",
        "A especialidade do medico nao corresponde a especialidade sugerida pela triagem."
      );
    }
  }

  const alreadyBooked = db.appointments.find(
    (item) => item.doctorId === payload.doctorId && item.scheduledAt === scheduledAt && item.status === "SCHEDULED"
  );

  if (alreadyBooked) {
    throw new HttpError(409, "APPOINTMENT_CONFLICT", "Ja existe uma consulta agendada para este medico nesse horario.");
  }

  const appointment = createAppointmentModel({
    id: nextId("appointments"),
    patientId: patient.id,
    doctorId: doctor.id,
    triageId: triage?.id,
    scheduledAt,
    notes: normalizeNullableString(payload.notes),
    createdByUserId: currentUser.id
  });

  db.appointments.push(appointment);
  return appointment;
}

module.exports = {
  createAppointment,
  getAppointmentEntityById,
  listAppointments
};
