const express = require("express");
const { resetDatabase } = require("../data/memoryDb");
const { createUser } = require("../services/userService");

const router = express.Router();

router.post("/reset", (req, res) => {
  if (process.env.NODE_ENV !== "test") {
    return res.status(404).json({ success: false, error: { code: "NOT_FOUND" } });
  }

  resetDatabase();
  createUser({
    name: "Medico de Teste",
    email: "doctor@clinica.local",
    password: "Senha@123",
    role: "DOCTOR"
  });
  return res.status(204).send();
});

module.exports = router;
