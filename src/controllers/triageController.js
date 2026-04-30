const triageService = require("../services/triageService");
const { success } = require("../utils/apiResponse");
const { writeAuditLog } = require("../utils/auditLogger");

function listTriages(req, res, next) {
  try {
    res.status(200).json(success(triageService.listTriages()));
  } catch (error) {
    next(error);
  }
}

function getTriage(req, res, next) {
  try {
    res.status(200).json(success(triageService.getTriageEntityById(req.params.id)));
  } catch (error) {
    next(error);
  }
}

function consultSpecialty(req, res, next) {
  try {
    const result = triageService.consultSpecialty(req.body);
    writeAuditLog("TRIAGE_SPECIALTY_CONSULTED", {
      userId: req.user.id,
      symptomIds: req.body.symptomIds
    });
    res.status(200).json(success(result, "Especialidade sugerida com sucesso."));
  } catch (error) {
    next(error);
  }
}

function createTriage(req, res, next) {
  try {
    const triage = triageService.createTriage(req.body, req.user);
    writeAuditLog("TRIAGE_CREATED", {
      userId: req.user.id,
      triageId: triage.id,
      patientId: triage.patientId
    });
    res.status(201).json(success(triage, "Triagem registrada com sucesso."));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  consultSpecialty,
  createTriage,
  getTriage,
  listTriages
};
