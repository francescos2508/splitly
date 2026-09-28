const express = require("express");
const cors = require("cors");
require("dotenv").config();

const groupsRouter = require("./routes/groups");
const expensesRouter = require("./routes/expenses");
const paymentsRouter = require("./routes/payments");
const app = express();

app.use(cors({
    origin: [
        "http://localhost:8081",
        "http://192.168.0.15:3000",
        "https://splitly-f.onrender.com",
    ]
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Splitly backend running"
  });
});

app.use("/groups", groupsRouter);
app.use("/expenses", expensesRouter);
app.use("/payments", paymentsRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});