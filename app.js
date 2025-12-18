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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Note: Profile photos are now stored in MongoDB, not in local files

app.use("/plans", planRoutes);
app.use("/users", userRoutes);
app.use("/transactions", transactionRoutes);
app.use("/feedbacks", feedbackRoutes);

app.listen(port, () => {
  console.log(`App2 listening at port :${port}`);
});

module.exports = app;