const patientService = require("../services/patientService");
const { success } = require("../utils/apiResponse");

function listPatients(req, res, next) {
  try {
    res.status(200).json(success(patientService.listPatients(req.query)));
  } catch (error) {
    next(error);
  }
}

function getPatient(req, res, next) {
  try {
    res.status(200).json(success(patientService.getPatientEntityById(req.params.id)));
  } catch (error) {
    next(error);
  }
}

function createPatient(req, res, next) {
  try {
    res.status(201).json(success(patientService.createPatient(req.body), "Paciente criado com sucesso."));
  } catch (error) {
    next(error);
  }
}

function updatePatient(req, res, next) {
  try {
    res.status(200).json(success(patientService.updatePatient(req.params.id, req.body), "Paciente atualizado com sucesso."));
  } catch (error) {
    next(error);
  }
}

function deletePatient(req, res, next) {
  try {
    res.status(200).json(success(patientService.deletePatient(req.params.id), "Paciente inativado com sucesso."));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPatient,
  deletePatient,
  getPatient,
  listPatients,
  updatePatient
};
