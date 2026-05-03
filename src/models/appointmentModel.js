function createAppointmentModel(data) {
  return {
    id: data.id,
    patientId: data.patientId,
    doctorId: data.doctorId,
    triageId: data.triageId || null,
    scheduledAt: data.scheduledAt,
    status: data.status || "SCHEDULED",
    notes: data.notes || null,
    createdByUserId: data.createdByUserId,
    updatedByUserId: data.updatedByUserId || null,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

module.exports = {
  createAppointmentModel
};
