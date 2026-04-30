const { db, nextId } = require("../data/memoryDb");
const { createPatientModel } = require("../models/patientModel");
const HttpError = require("../utils/httpError");
const { normalizeEmail, normalizeNullableString, normalizeString } = require("../utils/normalizers");
const { ensureAllowedFields, ensureDateString, ensureRequiredFields } = require("../utils/validators");

const PATIENT_CREATE_FIELDS = ["name", "document", "birthDate", "phone", "email", "notes", "active"];
const PATIENT_UPDATE_FIELDS = ["name", "document", "birthDate", "phone", "email", "notes", "active"];
const PATIENT_FILTER_FIELDS = ["name", "document", "active"];

function normalizeBooleanFilter(value) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === "true") {
      return true;
    }

    if (normalizedValue === "false") {
      return false;
    }
  }

  throw new HttpError(400, "VALIDATION_ERROR", "Valor invalido para active.", {
    field: "active",
    allowedValues: [true, false]
  });
}

function listPatients(filters = {}) {
  ensureAllowedFields(filters, PATIENT_FILTER_FIELDS);

  const normalizedFilters = {
    name: filters.name !== undefined ? normalizeString(filters.name)?.toLowerCase() : undefined,
    document: filters.document !== undefined ? normalizeString(filters.document) : undefined,
    active: normalizeBooleanFilter(filters.active)
  };

  return db.patients.filter((patient) => {
    if (normalizedFilters.name && !patient.name.toLowerCase().includes(normalizedFilters.name)) {
      return false;
    }

    if (normalizedFilters.document && patient.document !== normalizedFilters.document) {
      return false;
    }

    if (normalizedFilters.active !== undefined && patient.active !== normalizedFilters.active) {
      return false;
    }

    return true;
  });
}

function getPatientEntityById(id) {
  const patient = db.patients.find((item) => item.id === id);
  if (!patient) {
    throw new HttpError(404, "PATIENT_NOT_FOUND", "Paciente nao encontrado.");
  }

  return patient;
}

function findPatientByDocument(document) {
  const normalizedDocument = normalizeString(document);
  return db.patients.find((item) => item.document === normalizedDocument);
}

function createPatient(payload) {
  ensureAllowedFields(payload, PATIENT_CREATE_FIELDS);
  ensureRequiredFields(payload, ["name", "document", "birthDate", "phone"]);
  ensureDateString(payload.birthDate, "birthDate");

  const normalizedPayload = {
    name: normalizeString(payload.name),
    document: normalizeString(payload.document),
    birthDate: payload.birthDate,
    phone: normalizeString(payload.phone),
    email: normalizeNullableString(normalizeEmail(payload.email)),
    notes: normalizeNullableString(payload.notes),
    active: payload.active ?? true
  };

  if (findPatientByDocument(normalizedPayload.document)) {
    throw new HttpError(409, "PATIENT_DOCUMENT_ALREADY_EXISTS", "Ja existe um paciente com este documento.");
  }

  const patient = createPatientModel({
    id: nextId("patients"),
    name: normalizedPayload.name,
    document: normalizedPayload.document,
    birthDate: normalizedPayload.birthDate,
    phone: normalizedPayload.phone,
    email: normalizedPayload.email,
    notes: normalizedPayload.notes,
    active: normalizedPayload.active
  });

  db.patients.push(patient);
  return patient;
}

function updatePatient(id, payload) {
  ensureAllowedFields(payload, PATIENT_UPDATE_FIELDS);

  const patient = getPatientEntityById(id);

  if (payload.birthDate !== undefined) {
    ensureDateString(payload.birthDate, "birthDate");
  }

  if (payload.document !== undefined) {
    const normalizedDocument = normalizeString(payload.document);
    const existingPatient = findPatientByDocument(normalizedDocument);

    if (existingPatient && existingPatient.id !== patient.id) {
      throw new HttpError(409, "PATIENT_DOCUMENT_ALREADY_EXISTS", "Ja existe um paciente com este documento.");
    }

    patient.document = normalizedDocument;
  }

  if (payload.name !== undefined) {
    patient.name = normalizeString(payload.name);
  }

  if (payload.birthDate !== undefined) {
    patient.birthDate = payload.birthDate;
  }

  if (payload.phone !== undefined) {
    patient.phone = normalizeString(payload.phone);
  }

  if (payload.email !== undefined) {
    patient.email = normalizeNullableString(normalizeEmail(payload.email));
  }

  if (payload.notes !== undefined) {
    patient.notes = normalizeNullableString(payload.notes);
  }

  if (typeof payload.active === "boolean") {
    patient.active = payload.active;
  }

  patient.updatedAt = new Date().toISOString();
  return patient;
}

function deletePatient(id) {
  const patient = getPatientEntityById(id);
  patient.active = false;
  patient.updatedAt = new Date().toISOString();
  return patient;
}

module.exports = {
  createPatient,
  deletePatient,
  getPatientEntityById,
  listPatients,
  updatePatient
};
