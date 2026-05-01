const express = require("express");
const doctorController = require("../controllers/doctorController");

const router = express.Router();

router.get("/", doctorController.listDoctors);
router.get("/:id", doctorController.getDoctor);
router.post("/", doctorController.createDoctor);
router.put("/:id", doctorController.updateDoctor);
router.delete("/:id", doctorController.deleteDoctor);

module.exports = router;
