const express = require("express");
const triageController = require("../controllers/triageController");

const router = express.Router();

router.get("/", triageController.listTriages);
router.get("/:id", triageController.getTriage);
router.post("/", triageController.createTriage);
router.post("/specialty-consult", triageController.consultSpecialty);

module.exports = router;
