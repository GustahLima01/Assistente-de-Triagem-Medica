const express = require("express");
const swaggerUi = require("swagger-ui-express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const patientRoutes = require("./patientRoutes");
const doctorRoutes = require("./doctorRoutes");
const symptomRoutes = require("./symptomRoutes");
const triageRoutes = require("./triageRoutes");
const appointmentRoutes = require("./appointmentRoutes");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const swaggerDocument = require("../../resources/swagger.json");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API operacional.",
    data: {
      status: "ok",
      timestamp: new Date().toISOString()
    }
  });
});

router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

router.use("/auth", authRoutes);

router.use("/users", authenticate, authorize("ADMIN"), userRoutes);
router.use("/patients", authenticate, authorize("ADMIN", "RECEPTIONIST"), patientRoutes);
router.use("/doctors", authenticate, authorize("ADMIN"), doctorRoutes);
router.use("/symptoms", authenticate, authorize("ADMIN"), symptomRoutes);
router.use("/triages", authenticate, authorize("ADMIN", "RECEPTIONIST"), triageRoutes);
router.use("/appointments", authenticate, authorize("ADMIN", "RECEPTIONIST"), appointmentRoutes);

module.exports = router;
