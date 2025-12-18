const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// 🔓 Public Routes - Anyone can view plans
router.get("/", planController.getAllPlans);
router.get("/:id", planController.getPlanById);

// 🔐 Admin Only Routes - Only admins can create, update, delete plans
router.post("/", verifyToken, authorizeRoles("ADMIN"), planController.createPlan);
router.put("/:id", verifyToken, authorizeRoles("ADMIN"), planController.updatePlan);
router.delete("/:id", verifyToken, authorizeRoles("ADMIN"), planController.deletePlan);

module.exports = router;
