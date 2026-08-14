const express = require("express");
const cors = require("cors");
require("dotenv").config();

const groupsRouter = require("./routes/groups");
const expensesRouter = require("./routes/expenses");
const paymentsRouter = require("./routes/payments");
const app = express();

app.use(cors());
app.use(express.json());

/* const {
  generateInviteCode,
  generateMemberToken,
  generateRecoveryCode,
} = require("./utils/generateCode");

console.log(generateInviteCode());
console.log(generateMemberToken());
console.log(generateRecoveryCode()); */

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