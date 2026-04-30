const HttpError = require("../utils/httpError");
const { verifyToken } = require("../utils/jwt");
const { db } = require("../data/memoryDb");

function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new HttpError(401, "MISSING_TOKEN", "Token JWT não informado.");
    }

    const token = header.replace("Bearer ", "");
    const payload = verifyToken(token);
    const user = db.users.find((item) => item.id === payload.sub);

    if (!user || !user.active) {
      throw new HttpError(401, "INVALID_TOKEN_USER", "Usuário do token não encontrado ou inativo.");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(new HttpError(401, "INVALID_TOKEN", "Token JWT inválido ou expirado."));
      return;
    }
    next(error);
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      next(new HttpError(403, "FORBIDDEN", "Usuário sem permissão para acessar este recurso."));
      return;
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize
};
