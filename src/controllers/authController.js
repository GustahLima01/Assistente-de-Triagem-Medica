const authService = require("../services/authService");
const { success } = require("../utils/apiResponse");
const { writeAuditLog } = require("../utils/auditLogger");

function login(req, res, next) {
  try {
    const result = authService.login(req.body);
    writeAuditLog("LOGIN_SUCCESS", {
      userId: result.user.id,
      email: result.user.email
    });
    res.status(200).json(success(result, "Login realizado com sucesso."));
  } catch (error) {
    writeAuditLog("LOGIN_FAILURE", {
      email: req.body?.email || null,
      reason: error.code || "UNKNOWN_AUTH_ERROR"
    });
    next(error);
  }
}

module.exports = {
  login
};
