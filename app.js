const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const planRoutes = require("./src/routes/planRoute");
const userRoutes = require("./src/routes/userRoute");
const transactionRoutes = require("./src/routes/transactionRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoute");

connectDB();

// CORS configuration for React frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/plans", planRoutes);
app.use("/users", userRoutes);
app.use("/transactions", transactionRoutes);
app.use("/feedbacks", feedbackRoutes);

app.listen(port, () => {
  console.log(`App2 listening at port :${port}`);
});

module.exports = app;