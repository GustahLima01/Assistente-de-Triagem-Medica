const symptomService = require("../services/symptomService");
const { success } = require("../utils/apiResponse");

function listSymptoms(req, res, next) {
  try {
    res.status(200).json(success(symptomService.listSymptoms(req.query)));
  } catch (error) {
    next(error);
  }
}

function getSymptom(req, res, next) {
  try {
    res.status(200).json(success(symptomService.getSymptomEntityById(req.params.id)));
  } catch (error) {
    next(error);
  }
}

function createSymptom(req, res, next) {
  try {
    res.status(201).json(success(symptomService.createSymptom(req.body), "Sintoma criado com sucesso."));
  } catch (error) {
    next(error);
  }
}

function updateSymptom(req, res, next) {
  try {
    res.status(200).json(success(symptomService.updateSymptom(req.params.id, req.body), "Sintoma atualizado com sucesso."));
  } catch (error) {
    next(error);
  }
}

function deleteSymptom(req, res, next) {
  try {
    res.status(200).json(success(symptomService.deleteSymptom(req.params.id), "Sintoma inativado com sucesso."));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createSymptom,
  deleteSymptom,
  getSymptom,
  listSymptoms,
  updateSymptom
};
