const express = require("express");
const patientController = require("../controllers/patientController");

const router = express.Router();

router.get("/", patientController.listPatients);
router.get("/:id", patientController.getPatient);
router.post("/", patientController.createPatient);
router.put("/:id", patientController.updatePatient);
router.delete("/:id", patientController.deletePatient);

module.exports = router;
