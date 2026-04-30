function createSymptomModel(data) {
  return {
    id: data.id,
    name: data.name,
    description: data.description || null,
    severity: data.severity,
    specialty: data.specialty,
    active: data.active ?? true,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

module.exports = {
  createSymptomModel
};
