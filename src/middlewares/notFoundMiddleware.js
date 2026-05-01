const { error } = require("../utils/apiResponse");

function notFoundMiddleware(req, res) {
  res.status(404).json(error("ROUTE_NOT_FOUND", "Rota não encontrada.", { path: req.originalUrl }));
}

module.exports = {
  notFoundMiddleware
};
