const express = require("express");
const path = require("path");
const { randomUUID } = require("crypto");
const transactionStore = require("./transactionStore");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/health", function (req, res) {
  res.json({ status: "ok" });
});

app.get("/api/transactions", async function (req, res) {
  const transactions = await transactionStore.readTransactions();
  res.json(transactions);
});

app.post("/api/transactions", async function (req, res) {
  const transaction = req.body;
  const validDate = typeof transaction?.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(transaction.date) &&
    !Number.isNaN(Date.parse(transaction.date)) &&
    new Date(transaction.date).toISOString().slice(0, 10) === transaction.date;

  if (
    !transaction ||
    typeof transaction !== "object" ||
    Array.isArray(transaction) ||
    !["income", "expense"].includes(transaction.type) ||
    typeof transaction.category !== "string" ||
    !transaction.category.trim() ||
    typeof transaction.amount !== "number" ||
    !Number.isFinite(transaction.amount) ||
    transaction.amount <= 0 ||
    !validDate ||
    (transaction.note !== undefined && typeof transaction.note !== "string")
  ) {
    return res.status(400).json({ error: "Invalid transaction. Check the submitted fields." });
  }

  const transactions = await transactionStore.readTransactions();
  const newTransaction = {
    id: randomUUID(),
    type: transaction.type,
    category: transaction.category.trim(),
    amount: transaction.amount,
    date: transaction.date,
    note: transaction.note || "",
  };

  transactions.push(newTransaction);
  await transactionStore.writeTransactions(transactions);

  res.status(201).json(newTransaction);
});

app.delete("/api/transactions/:id", async function (req, res) {
  const transactions = await transactionStore.readTransactions();
  const remainingTransactions = transactions.filter(function (transaction) {
    return transaction.id !== req.params.id;
  });

  if (remainingTransactions.length === transactions.length) {
    return res.status(404).json({ error: "Transaction not found." });
  }

  await transactionStore.writeTransactions(remainingTransactions);
  res.status(204).end();
});

app.use(express.static(path.join(__dirname, "public")));

app.use(function (error, req, res, next) {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }

  console.error("Request failed:", error);
  res.status(500).json({ error: "An unexpected server error occurred." });
});

app.listen(PORT, function () {
  console.log("Budget Buddy is running at http://localhost:" + PORT);
});
