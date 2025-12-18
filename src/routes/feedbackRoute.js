const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Public route
router.get("/approved", feedbackController.getApprovedFeedbacks);

// Protected routes
router.post("/", verifyToken, feedbackController.createFeedback);

// Admin routes
router.get("/", verifyToken, authorizeRoles("ADMIN"), feedbackController.getAllFeedbacks);
router.put("/:id/approve", verifyToken, authorizeRoles("ADMIN"), feedbackController.approveFeedback);
router.delete("/:id", verifyToken, authorizeRoles("ADMIN"), feedbackController.deleteFeedback);

module.exports = router;
