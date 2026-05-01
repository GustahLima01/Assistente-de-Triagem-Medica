const { db, nextId } = require("../data/memoryDb");
const { createClinicUserModel } = require("../models/clinicUserModel");
const HttpError = require("../utils/httpError");
const { normalizeEmail, normalizeString } = require("../utils/normalizers");
const { hashPassword } = require("../utils/password");
const { ensureAllowedFields, ensureEnum, ensureRequiredFields } = require("../utils/validators");

const USER_ROLES = ["ADMIN", "RECEPTIONIST", "DOCTOR"];
const USER_CREATE_FIELDS = ["name", "email", "password", "role", "active"];
const USER_UPDATE_FIELDS = ["name", "email", "password", "role", "active"];

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function listUsers() {
  return db.users.map(sanitizeUser);
}

function getUserById(id) {
  const user = db.users.find((item) => item.id === id);
  if (!user) {
    throw new HttpError(404, "USER_NOT_FOUND", "Usuario nao encontrado.");
  }

  return sanitizeUser(user);
}

function findUserEntityByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  return db.users.find((item) => item.email === normalizedEmail);
}

function createUser(payload) {
  ensureAllowedFields(payload, USER_CREATE_FIELDS);
  ensureRequiredFields(payload, ["name", "email", "password", "role"]);

  const normalizedPayload = {
    name: normalizeString(payload.name),
    email: normalizeEmail(payload.email),
    password: payload.password,
    role: payload.role,
    active: payload.active ?? true
  };

  ensureEnum(normalizedPayload.role, "role", USER_ROLES);

  if (findUserEntityByEmail(normalizedPayload.email)) {
    throw new HttpError(409, "USER_EMAIL_ALREADY_EXISTS", "Ja existe um usuario com este e-mail.");
  }

  const user = createClinicUserModel({
    id: nextId("users"),
    name: normalizedPayload.name,
    email: normalizedPayload.email,
    role: normalizedPayload.role,
    active: normalizedPayload.active,
    passwordHash: hashPassword(normalizedPayload.password)
  });

  db.users.push(user);
  return sanitizeUser(user);
}

function updateUser(id, payload) {
  ensureAllowedFields(payload, USER_UPDATE_FIELDS);

  const user = db.users.find((item) => item.id === id);
  if (!user) {
    throw new HttpError(404, "USER_NOT_FOUND", "Usuario nao encontrado.");
  }

  if (payload.email !== undefined) {
    const normalizedEmail = normalizeEmail(payload.email);
    if (normalizedEmail !== user.email) {
      const existingUser = findUserEntityByEmail(normalizedEmail);
      if (existingUser) {
        throw new HttpError(409, "USER_EMAIL_ALREADY_EXISTS", "Ja existe um usuario com este e-mail.");
      }
    }

    user.email = normalizedEmail;
  }

  if (payload.role !== undefined) {
    ensureEnum(payload.role, "role", USER_ROLES);
    user.role = payload.role;
  }

  if (payload.name !== undefined) {
    user.name = normalizeString(payload.name);
  }

  if (payload.password !== undefined) {
    user.passwordHash = hashPassword(payload.password);
  }

  if (typeof payload.active === "boolean") {
    user.active = payload.active;
  }

  user.updatedAt = new Date().toISOString();
  return sanitizeUser(user);
}

function deleteUser(id) {
  const user = db.users.find((item) => item.id === id);
  if (!user) {
    throw new HttpError(404, "USER_NOT_FOUND", "Usuario nao encontrado.");
  }

  user.active = false;
  user.updatedAt = new Date().toISOString();
  return sanitizeUser(user);
}

module.exports = {
  USER_ROLES,
  createUser,
  deleteUser,
  findUserEntityByEmail,
  getUserById,
  listUsers,
  sanitizeUser,
  updateUser
};
