const fs = require("fs/promises");
const path = require("path");

const DATA_DIRECTORY = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIRECTORY, "transactions.json");

function isValidTransaction(transaction) {
  const validDate = typeof transaction?.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(transaction.date) &&
    !Number.isNaN(Date.parse(transaction.date)) &&
    new Date(transaction.date).toISOString().slice(0, 10) === transaction.date;

  return (
    transaction &&
    typeof transaction === "object" &&
    !Array.isArray(transaction) &&
    ["income", "expense"].includes(transaction.type) &&
    typeof transaction.category === "string" &&
    Boolean(transaction.category.trim()) &&
    typeof transaction.amount === "number" &&
    Number.isFinite(transaction.amount) &&
    transaction.amount > 0 &&
    validDate &&
    (transaction.note === undefined || typeof transaction.note === "string")
  );
}

function isValidTransactionRecord(transaction) {
  return (
    typeof transaction?.id === "string" &&
    Boolean(transaction.id.trim()) &&
    isValidTransaction(transaction) &&
    typeof transaction.note === "string" &&
    (transaction.userId === undefined ||
      (typeof transaction.userId === "string" && Boolean(transaction.userId.trim())))
  );
}

async function readTransactions() {
  let fileContents;

  try {
    fileContents = await fs.readFile(DATA_FILE, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    await fs.mkdir(DATA_DIRECTORY, { recursive: true });
    await fs.writeFile(DATA_FILE, "[]\n", "utf8");
    return [];
  }

  const transactions = JSON.parse(fileContents);
  if (!Array.isArray(transactions) || transactions.some(function (transaction) {
    return !isValidTransactionRecord(transaction);
  })) {
    throw new Error("Transaction data contains invalid records.");
  }

  return transactions;
}

async function writeTransactions(transactions) {
  if (!Array.isArray(transactions) || transactions.some(function (transaction) {
    return !isValidTransactionRecord(transaction);
  })) {
    throw new TypeError("Transactions must contain valid transaction records.");
  }

  await fs.mkdir(DATA_DIRECTORY, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(transactions, null, 2) + "\n", "utf8");
}

module.exports = {
  isValidTransaction,
  readTransactions,
  writeTransactions,
};
