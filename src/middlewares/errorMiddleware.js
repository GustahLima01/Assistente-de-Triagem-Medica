const { error } = require("../utils/apiResponse");

function errorMiddleware(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "Erro interno do servidor.";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json(error(code, message, err.details));
}

module.exports = {
  errorMiddleware
};
