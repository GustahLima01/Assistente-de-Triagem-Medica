const { db, nextId } = require("../data/memoryDb");
const { createSymptomModel } = require("../models/symptomModel");
const HttpError = require("../utils/httpError");
const { normalizeNullableString, normalizeString } = require("../utils/normalizers");
const { ensureAllowedFields, ensureEnum, ensureRequiredFields } = require("../utils/validators");

const SYMPTOM_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const SYMPTOM_CREATE_FIELDS = ["name", "description", "severity", "specialty", "active"];
const SYMPTOM_UPDATE_FIELDS = ["name", "description", "severity", "specialty", "active"];
const SYMPTOM_FILTER_FIELDS = ["name", "severity", "specialty", "includeInactive"];

function normalizeIncludeInactiveFilter(value) {
  if (value === undefined) {
    return false;
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

  throw new HttpError(400, "VALIDATION_ERROR", "Valor invalido para includeInactive.", {
    field: "includeInactive",
    allowedValues: [true, false]
  });
}

function listSymptoms(filters = {}) {
  ensureAllowedFields(filters, SYMPTOM_FILTER_FIELDS);

  const normalizedFilters = {
    name: filters.name !== undefined ? normalizeString(filters.name)?.toLowerCase() : undefined,
    severity: filters.severity,
    specialty: filters.specialty !== undefined ? normalizeString(filters.specialty)?.toLowerCase() : undefined,
    includeInactive: normalizeIncludeInactiveFilter(filters.includeInactive)
  };

  if (normalizedFilters.severity !== undefined) {
    ensureEnum(normalizedFilters.severity, "severity", SYMPTOM_SEVERITIES);
  }

  return db.symptoms.filter((symptom) => {
    if (!normalizedFilters.includeInactive && !symptom.active) {
      return false;
    }

    if (normalizedFilters.name && !symptom.name.toLowerCase().includes(normalizedFilters.name)) {
      return false;
    }

    if (normalizedFilters.severity && symptom.severity !== normalizedFilters.severity) {
      return false;
    }

    if (normalizedFilters.specialty && symptom.specialty.toLowerCase() !== normalizedFilters.specialty) {
      return false;
    }

    return true;
  });
}

function getSymptomEntityById(id) {
  const symptom = db.symptoms.find((item) => item.id === id);
  if (!symptom) {
    throw new HttpError(404, "SYMPTOM_NOT_FOUND", "Sintoma nao encontrado.");
  }

  return symptom;
}

function createSymptom(payload) {
  ensureAllowedFields(payload, SYMPTOM_CREATE_FIELDS);
  ensureRequiredFields(payload, ["name", "severity", "specialty"]);
  ensureEnum(payload.severity, "severity", SYMPTOM_SEVERITIES);

  const symptom = createSymptomModel({
    id: nextId("symptoms"),
    name: normalizeString(payload.name),
    description: normalizeNullableString(payload.description),
    severity: payload.severity,
    specialty: normalizeString(payload.specialty),
    active: payload.active ?? true
  });

  db.symptoms.push(symptom);
  return symptom;
}

function updateSymptom(id, payload) {
  ensureAllowedFields(payload, SYMPTOM_UPDATE_FIELDS);

  const symptom = getSymptomEntityById(id);
  if (payload.severity !== undefined) {
    ensureEnum(payload.severity, "severity", SYMPTOM_SEVERITIES);
  }

  if (payload.name !== undefined) {
    symptom.name = normalizeString(payload.name);
  }

  if (payload.description !== undefined) {
    symptom.description = normalizeNullableString(payload.description);
  }

  if (payload.severity !== undefined) {
    symptom.severity = payload.severity;
  }

  if (payload.specialty !== undefined) {
    symptom.specialty = normalizeString(payload.specialty);
  }

  if (typeof payload.active === "boolean") {
    symptom.active = payload.active;
  }

  symptom.updatedAt = new Date().toISOString();
  return symptom;
}

function deleteSymptom(id) {
  const symptom = getSymptomEntityById(id);
  symptom.active = false;
  symptom.updatedAt = new Date().toISOString();
  return symptom;
}

module.exports = {
  SYMPTOM_SEVERITIES,
  createSymptom,
  deleteSymptom,
  getSymptomEntityById,
  listSymptoms,
  updateSymptom
};
