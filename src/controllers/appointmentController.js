const appointmentService = require("../services/appointmentService");
const { success } = require("../utils/apiResponse");
const { writeAuditLog } = require("../utils/auditLogger");

function listAppointments(req, res, next) {
  try {
    res.status(200).json(success(appointmentService.listAppointments(req.query)));
  } catch (error) {
    next(error);
  }
}

function getAppointment(req, res, next) {
  try {
    res.status(200).json(success(appointmentService.getAppointmentEntityById(req.params.id)));
  } catch (error) {
    next(error);
  }
}

function createAppointment(req, res, next) {
  try {
    const appointment = appointmentService.createAppointment(req.body, req.user);
    writeAuditLog("APPOINTMENT_CREATED", {
      userId: req.user.id,
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId
    });
    res.status(201).json(success(appointment, "Consulta agendada com sucesso."));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAppointment,
  getAppointment,
  listAppointments
};
