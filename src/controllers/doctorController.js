const doctorService = require("../services/doctorService");
const { success } = require("../utils/apiResponse");

function listDoctors(req, res, next) {
  try {
    res.status(200).json(success(doctorService.listDoctors(req.query)));
  } catch (error) {
    next(error);
  }
}

function getDoctor(req, res, next) {
  try {
    res.status(200).json(success(doctorService.getDoctorEntityById(req.params.id)));
  } catch (error) {
    next(error);
  }
}

function createDoctor(req, res, next) {
  try {
    res.status(201).json(success(doctorService.createDoctor(req.body), "Médico criado com sucesso."));
  } catch (error) {
    next(error);
  }
}

function updateDoctor(req, res, next) {
  try {
    res.status(200).json(success(doctorService.updateDoctor(req.params.id, req.body), "Médico atualizado com sucesso."));
  } catch (error) {
    next(error);
  }
}

function deleteDoctor(req, res, next) {
  try {
    res.status(200).json(success(doctorService.deleteDoctor(req.params.id), "Médico inativado com sucesso."));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDoctor,
  deleteDoctor,
  getDoctor,
  listDoctors,
  updateDoctor
};
