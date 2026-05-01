const { db, nextId } = require("../data/memoryDb");
const { createTriageModel } = require("../models/triageModel");
const HttpError = require("../utils/httpError");
const { normalizeNullableString, normalizeUniqueStringList } = require("../utils/normalizers");
const { ensureAllowedFields, ensureArray, ensureRequiredFields } = require("../utils/validators");
const { getPatientEntityById } = require("./patientService");
const { getSymptomEntityById } = require("./symptomService");

const TRIAGE_CONSULT_FIELDS = ["symptomIds"];
const TRIAGE_CREATE_FIELDS = ["patientId", "symptomIds", "notes"];

const severityScore = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4
};

function ensureActivePatient(patient) {
  if (!patient.active) {
    throw new HttpError(409, "PATIENT_INACTIVE", "Nao e possivel registrar triagem para um paciente inativo.");
  }
}

function getActiveSymptoms(symptomIds) {
  ensureArray(symptomIds, "symptomIds");

  return normalizeUniqueStringList(symptomIds).map((symptomId) => {
    const symptom = getSymptomEntityById(symptomId);
    if (!symptom.active) {
      throw new HttpError(409, "SYMPTOM_INACTIVE", "Nao e possivel usar um sintoma inativo na triagem.", {
        symptomId
      });
    }

    return symptom;
  });
}

function priorityFromSymptoms(symptoms) {
  return symptoms.reduce((highestPriority, symptom) => {
    return severityScore[symptom.severity] > severityScore[highestPriority] ? symptom.severity : highestPriority;
  }, "LOW");
}

function calculateSpecialty(symptomIds) {
  const symptoms = getActiveSymptoms(symptomIds);
  const specialtyWeights = symptoms.reduce((accumulator, symptom) => {
    const currentScore = accumulator[symptom.specialty] || 0;
    accumulator[symptom.specialty] = currentScore + severityScore[symptom.severity];
    return accumulator;
  }, {});

  const suggestedSpecialty = Object.entries(specialtyWeights)
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0]);
    })[0]?.[0];

  if (!suggestedSpecialty) {
    throw new HttpError(400, "TRIAGE_WITHOUT_SPECIALTY", "Nao foi possivel sugerir especialidade.");
  }

  return {
    suggestedSpecialty,
    priority: priorityFromSymptoms(symptoms),
    symptoms
  };
}

function listTriages() {
  return db.triages;
}

function getTriageEntityById(id) {
  const triage = db.triages.find((item) => item.id === id);
  if (!triage) {
    throw new HttpError(404, "TRIAGE_NOT_FOUND", "Triagem nao encontrada.");
  }

  return triage;
}

function consultSpecialty(payload) {
  ensureAllowedFields(payload, TRIAGE_CONSULT_FIELDS);
  ensureRequiredFields(payload, ["symptomIds"]);

  const result = calculateSpecialty(payload.symptomIds);
  return {
    suggestedSpecialty: result.suggestedSpecialty,
    priority: result.priority,
    symptomsConsidered: result.symptoms
  };
}

function createTriage(payload, currentUser) {
  ensureAllowedFields(payload, TRIAGE_CREATE_FIELDS);
  ensureRequiredFields(payload, ["patientId", "symptomIds"]);

  const patient = getPatientEntityById(payload.patientId);
  ensureActivePatient(patient);

  const calculation = calculateSpecialty(payload.symptomIds);
  const triage = createTriageModel({
    id: nextId("triages"),
    patientId: patient.id,
    symptomIds: calculation.symptoms.map((symptom) => symptom.id),
    symptomsSnapshot: calculation.symptoms,
    suggestedSpecialty: calculation.suggestedSpecialty,
    priority: calculation.priority,
    notes: normalizeNullableString(payload.notes),
    createdByUserId: currentUser.id
  });

  db.triages.push(triage);
  return triage;
}

module.exports = {
  consultSpecialty,
  createTriage,
  getTriageEntityById,
  listTriages
};
