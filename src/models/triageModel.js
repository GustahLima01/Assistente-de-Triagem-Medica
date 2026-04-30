function createTriageModel(data) {
  return {
    id: data.id,
    patientId: data.patientId,
    symptomIds: data.symptomIds,
    symptomsSnapshot: data.symptomsSnapshot,
    suggestedSpecialty: data.suggestedSpecialty,
    priority: data.priority,
    notes: data.notes || null,
    createdByUserId: data.createdByUserId,
    createdAt: data.createdAt || new Date().toISOString()
  };
}

module.exports = {
  createTriageModel
};
