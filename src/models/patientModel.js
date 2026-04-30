function createPatientModel(data) {
  return {
    id: data.id,
    name: data.name,
    document: data.document,
    birthDate: data.birthDate,
    phone: data.phone,
    email: data.email || null,
    notes: data.notes || null,
    active: data.active ?? true,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

module.exports = {
  createPatientModel
};
