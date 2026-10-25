const fs = require("fs/promises");
const path = require("path");

const DATA_DIRECTORY = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIRECTORY, "transactions.json");

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
  if (!Array.isArray(transactions)) {
    throw new Error("Transaction data must be a JSON array.");
  }

  return transactions;
}

async function writeTransactions(transactions) {
  if (!Array.isArray(transactions)) {
    throw new TypeError("Transactions must be an array.");
  }

  await fs.mkdir(DATA_DIRECTORY, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(transactions, null, 2) + "\n", "utf8");
}

module.exports = {
  readTransactions,
  writeTransactions,
};
