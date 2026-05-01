function createClinicUserModel(data) {
  return {
    id: data.id,
    name: data.name,
    email: data.email.toLowerCase(),
    role: data.role,
    active: data.active ?? true,
    passwordHash: data.passwordHash,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

module.exports = {
  createClinicUserModel
};
