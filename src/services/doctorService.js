const { db, nextId } = require("../data/memoryDb");
const { createDoctorModel } = require("../models/doctorModel");
const HttpError = require("../utils/httpError");
const { normalizeEmail, normalizeNullableString, normalizeString } = require("../utils/normalizers");
const { ensureAllowedFields, ensureRequiredFields } = require("../utils/validators");

const DOCTOR_CREATE_FIELDS = ["name", "crm", "specialty", "phone", "email", "active"];
const DOCTOR_UPDATE_FIELDS = ["name", "crm", "specialty", "phone", "email", "active"];
const DOCTOR_FILTER_FIELDS = ["name", "crm", "specialty", "includeInactive"];

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

function listDoctors(filters = {}) {
  ensureAllowedFields(filters, DOCTOR_FILTER_FIELDS);

  const normalizedFilters = {
    name: filters.name !== undefined ? normalizeString(filters.name)?.toLowerCase() : undefined,
    crm: filters.crm !== undefined ? normalizeString(filters.crm) : undefined,
    specialty: filters.specialty !== undefined ? normalizeString(filters.specialty)?.toLowerCase() : undefined,
    includeInactive: normalizeIncludeInactiveFilter(filters.includeInactive)
  };

  return db.doctors.filter((doctor) => {
    if (!normalizedFilters.includeInactive && !doctor.active) {
      return false;
    }

    if (normalizedFilters.name && !doctor.name.toLowerCase().includes(normalizedFilters.name)) {
      return false;
    }

    if (normalizedFilters.crm && doctor.crm !== normalizedFilters.crm) {
      return false;
    }

    if (normalizedFilters.specialty && doctor.specialty.toLowerCase() !== normalizedFilters.specialty) {
      return false;
    }

    return true;
  });
}

function getDoctorEntityById(id) {
  const doctor = db.doctors.find((item) => item.id === id);
  if (!doctor) {
    throw new HttpError(404, "DOCTOR_NOT_FOUND", "Medico nao encontrado.");
  }

  return doctor;
}

function findDoctorByCrm(crm) {
  const normalizedCrm = normalizeString(crm);
  return db.doctors.find((item) => item.crm === normalizedCrm);
}

function createDoctor(payload) {
  ensureAllowedFields(payload, DOCTOR_CREATE_FIELDS);
  ensureRequiredFields(payload, ["name", "crm", "specialty"]);

  const normalizedPayload = {
    name: normalizeString(payload.name),
    crm: normalizeString(payload.crm),
    specialty: normalizeString(payload.specialty),
    phone: normalizeNullableString(payload.phone),
    email: normalizeNullableString(normalizeEmail(payload.email)),
    active: payload.active ?? true
  };

  if (findDoctorByCrm(normalizedPayload.crm)) {
    throw new HttpError(409, "DOCTOR_CRM_ALREADY_EXISTS", "Ja existe um medico com este CRM.");
  }

  const doctor = createDoctorModel({
    id: nextId("doctors"),
    name: normalizedPayload.name,
    crm: normalizedPayload.crm,
    specialty: normalizedPayload.specialty,
    phone: normalizedPayload.phone,
    email: normalizedPayload.email,
    active: normalizedPayload.active
  });

  db.doctors.push(doctor);
  return doctor;
}

function updateDoctor(id, payload) {
  ensureAllowedFields(payload, DOCTOR_UPDATE_FIELDS);

  const doctor = getDoctorEntityById(id);

  if (payload.crm !== undefined) {
    const normalizedCrm = normalizeString(payload.crm);
    const existingDoctor = findDoctorByCrm(normalizedCrm);

    if (existingDoctor && existingDoctor.id !== doctor.id) {
      throw new HttpError(409, "DOCTOR_CRM_ALREADY_EXISTS", "Ja existe um medico com este CRM.");
    }

    doctor.crm = normalizedCrm;
  }

  if (payload.name !== undefined) {
    doctor.name = normalizeString(payload.name);
  }

  if (payload.specialty !== undefined) {
    doctor.specialty = normalizeString(payload.specialty);
  }

  if (payload.phone !== undefined) {
    doctor.phone = normalizeNullableString(payload.phone);
  }

  if (payload.email !== undefined) {
    doctor.email = normalizeNullableString(normalizeEmail(payload.email));
  }

  if (typeof payload.active === "boolean") {
    doctor.active = payload.active;
  }

  doctor.updatedAt = new Date().toISOString();
  return doctor;
}

function deleteDoctor(id) {
  const doctor = getDoctorEntityById(id);
  doctor.active = false;
  doctor.updatedAt = new Date().toISOString();
  return doctor;
}

module.exports = {
  createDoctor,
  deleteDoctor,
  getDoctorEntityById,
  listDoctors,
  updateDoctor
};
