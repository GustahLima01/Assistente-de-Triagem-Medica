const express = require("express");
const appointmentController = require("../controllers/appointmentController");

const router = express.Router();

router.get("/", appointmentController.listAppointments);
router.get("/:id", appointmentController.getAppointment);
router.post("/", appointmentController.createAppointment);

module.exports = router;
