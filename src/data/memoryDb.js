const { createClinicUserModel } = require("../models/clinicUserModel");
const { hashPassword } = require("../utils/password");

const INITIAL_COUNTERS = {
  users: 1,
  patients: 1,
  doctors: 1,
  symptoms: 1,
  triages: 1,
  appointments: 1
};

const counters = {
  ...INITIAL_COUNTERS
};

const db = {
  users: [],
  patients: [],
  doctors: [],
  symptoms: [],
  triages: [],
  appointments: []
};

function nextId(collection) {
  const nextValue = counters[collection];
  counters[collection] += 1;
  return String(nextValue);
}

function seed() {
  if (db.users.length > 0) {
    return;
  }

  db.users.push(
    createClinicUserModel({
      id: nextId("users"),
      name: "Administrador Padrao",
      email: "admin@clinica.local",
      role: "ADMIN",
      passwordHash: hashPassword("Admin@123")
    }),
    createClinicUserModel({
      id: nextId("users"),
      name: "Recepcao Padrao",
      email: "recepcao@clinica.local",
      role: "RECEPTIONIST",
      passwordHash: hashPassword("Recepcao@123")
    })
  );
}

function resetDatabase() {
  Object.keys(db).forEach((collection) => {
    db[collection].length = 0;
  });

  Object.entries(INITIAL_COUNTERS).forEach(([collection, initialValue]) => {
    counters[collection] = initialValue;
  });

  seed();
}

seed();

module.exports = {
  db,
  nextId,
  resetDatabase,
  seed
};
