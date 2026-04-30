const HttpError = require("../utils/httpError");
const { normalizeEmail } = require("../utils/normalizers");
const { comparePassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");
const { ensureRequiredFields } = require("../utils/validators");
const { findUserEntityByEmail, sanitizeUser } = require("./userService");

function login(payload) {
  ensureRequiredFields(payload, ["email", "password"]);

  const user = findUserEntityByEmail(normalizeEmail(payload.email));
  if (!user || !comparePassword(payload.password, user.passwordHash)) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "E-mail ou senha invalidos.");
  }

  if (!user.active) {
    throw new HttpError(403, "USER_INACTIVE", "Usuario inativo.");
  }

  const token = signToken({
    sub: user.id,
    role: user.role,
    email: user.email
  });

  return {
    token,
    user: sanitizeUser(user)
  };
}

module.exports = {
  login
};
