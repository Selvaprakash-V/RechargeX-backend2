const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// 🔐 Protected Routes - User must be authenticated
router.post("/", verifyToken, transactionController.createTransaction);
router.get("/user/:userId", verifyToken, transactionController.getTransactionsByUser);
router.get("/:id", verifyToken, transactionController.getTransactionById);

// 🔐 Admin Only Routes
router.get("/", verifyToken, authorizeRoles("ADMIN"), transactionController.getAllTransactions);
router.put("/:id", verifyToken, authorizeRoles("ADMIN"), transactionController.updateTransactionStatus);
router.delete("/:id", verifyToken, authorizeRoles("ADMIN"), transactionController.deleteTransaction);

module.exports = router;

