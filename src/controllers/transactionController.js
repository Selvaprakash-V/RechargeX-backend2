const Transaction = require("../models/transactionModel");

// CREATE transaction
exports.createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create({
      ...req.body,
      transactionId: "TXN_" + Date.now()
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("userId")
      .populate("planId");

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single transaction
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE transaction status
exports.updateTransactionStatus = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET transactions by userId
exports.getTransactionsByUser = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId })
      .populate("planId")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE transaction
exports.deleteTransaction = async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
