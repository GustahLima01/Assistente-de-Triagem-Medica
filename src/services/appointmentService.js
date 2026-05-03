const { db, nextId } = require("../data/memoryDb");
const { createAppointmentModel } = require("../models/appointmentModel");
const HttpError = require("../utils/httpError");
const { normalizeIsoDateTime, normalizeNullableString } = require("../utils/normalizers");
const { ensureAllowedFields, ensureDateString, ensureRequiredFields } = require("../utils/validators");
const { getDoctorEntityById } = require("./doctorService");
const { getPatientEntityById } = require("./patientService");
const { getTriageEntityById } = require("./triageService");

const APPOINTMENT_CREATE_FIELDS = ["patientId", "doctorId", "triageId", "scheduledAt", "notes"];
const APPOINTMENT_UPDATE_FIELDS = ["doctorId", "scheduledAt", "notes"];
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

function ensureAppointmentIsScheduled(appointment, errorCode, message) {
  if (appointment.status !== "SCHEDULED") {
    throw new HttpError(409, errorCode, message);
  }
}

function ensureDoctorAndTriageCompatibility({ appointment, doctorId, scheduledAt, currentAppointmentId }) {
  const doctor = getDoctorEntityById(doctorId);

  if (!doctor.active) {
    throw new HttpError(409, "DOCTOR_INACTIVE", "Nao e possivel agendar com um medico inativo.");
  }

  if (appointment.triageId) {
    const triage = getTriageEntityById(appointment.triageId);

    if (triage.patientId !== appointment.patientId) {
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
    (item) =>
      item.id !== currentAppointmentId &&
      item.doctorId === doctor.id &&
      item.scheduledAt === scheduledAt &&
      item.status === "SCHEDULED"
  );

  if (alreadyBooked) {
    throw new HttpError(409, "APPOINTMENT_CONFLICT", "Ja existe uma consulta agendada para este medico nesse horario.");
  }

  return doctor;
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

  ensureDoctorAndTriageCompatibility({
    appointment: {
      patientId: patient.id,
      triageId: triage?.id
    },
    doctorId: doctor.id,
    scheduledAt,
    currentAppointmentId: null
  });

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

function updateAppointment(id, payload, currentUser) {
  ensureAllowedFields(payload, APPOINTMENT_UPDATE_FIELDS);

  const appointment = getAppointmentEntityById(id);
  ensureAppointmentIsScheduled(
    appointment,
    "APPOINTMENT_CANNOT_BE_EDITED",
    "Somente consultas agendadas podem ser editadas."
  );

  const nextDoctorId = payload.doctorId !== undefined ? payload.doctorId : appointment.doctorId;
  const nextScheduledAt =
    payload.scheduledAt !== undefined ? normalizeIsoDateTimeWithValidation(payload.scheduledAt) : appointment.scheduledAt;

  if (payload.doctorId !== undefined || payload.scheduledAt !== undefined) {
    ensureDoctorAndTriageCompatibility({
      appointment,
      doctorId: nextDoctorId,
      scheduledAt: nextScheduledAt,
      currentAppointmentId: appointment.id
    });
  }

  if (payload.doctorId !== undefined) {
    appointment.doctorId = nextDoctorId;
  }

  if (payload.scheduledAt !== undefined) {
    appointment.scheduledAt = nextScheduledAt;
  }

  if (payload.notes !== undefined) {
    appointment.notes = normalizeNullableString(payload.notes);
  }

  appointment.updatedAt = new Date().toISOString();
  appointment.updatedByUserId = currentUser.id;

  return appointment;
}

function cancelAppointment(id, currentUser) {
  const appointment = getAppointmentEntityById(id);
  ensureAppointmentIsScheduled(
    appointment,
    "APPOINTMENT_ALREADY_CANCELLED",
    "Nao e possivel cancelar uma consulta que nao esta agendada."
  );

  appointment.status = "CANCELLED";
  appointment.updatedAt = new Date().toISOString();
  appointment.updatedByUserId = currentUser.id;

  return appointment;
}

function normalizeIsoDateTimeWithValidation(value) {
  ensureDateString(value, "scheduledAt");
  return normalizeIsoDateTime(value);
}

module.exports = {
  cancelAppointment,
  createAppointment,
  getAppointmentEntityById,
  listAppointments,
  updateAppointment
};
