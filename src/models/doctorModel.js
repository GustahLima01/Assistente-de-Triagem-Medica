function createDoctorModel(data) {
  return {
    id: data.id,
    name: data.name,
    crm: data.crm,
    specialty: data.specialty,
    phone: data.phone || null,
    email: data.email || null,
    active: data.active ?? true,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

module.exports = {
  createDoctorModel
};
