const express = require("express");
const path = require("path");
const { randomBytes, randomUUID } = require("crypto");
const transactionStore = require("./transactionStore");
const { isValidTransaction } = transactionStore;
const authStore = require("./authStore");

const app = express();
const PORT = process.env.PORT || 3000;
const sessions = new Map();
const SESSION_COOKIE = "budgetBuddySession";
const SESSION_MAX_AGE = 8 * 60 * 60;

app.use(express.json());
app.use("/api", function (req, res, next) {
  res.setHeader("Cache-Control", "no-store");
  next();
});

function createTransactionRecord(transaction, id, userId) {
  return {
    id: id,
    userId: userId,
    type: transaction.type,
    category: transaction.category.trim(),
    amount: transaction.amount,
    date: transaction.date,
    note: transaction.note || "",
  };
}

function getSessionId(req) {
  const cookieHeader = req.headers.cookie || "";
  const sessionCookie = cookieHeader.split(";").map(function (cookie) {
    return cookie.trim();
  }).find(function (cookie) {
    return cookie.startsWith(SESSION_COOKIE + "=");
  });

  return sessionCookie ? sessionCookie.slice(SESSION_COOKIE.length + 1) : "";
}

function setSessionCookie(res, sessionId) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    SESSION_COOKIE + "=" + sessionId + "; HttpOnly; SameSite=Lax; Path=/; Max-Age=" +
      SESSION_MAX_AGE + secure
  );
}

function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    SESSION_COOKIE + "=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" + secure
  );
}

function createSession(user, res) {
  const sessionId = randomBytes(32).toString("hex");
  sessions.set(sessionId, {
    userId: user.id,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  });
  setSessionCookie(res, sessionId);
  return authStore.publicUser(user);
}

function getAuthenticatedUserId(req) {
  const sessionId = getSessionId(req);
  const session = sessions.get(sessionId);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  return session.userId;
}

function requireAuthentication(req, res, next) {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Please sign in to continue." });
  }

  req.userId = userId;
  next();
}

app.get("/api/health", function (req, res) {
  res.json({ status: "ok" });
});

app.get("/api/auth/session", function (req, res, next) {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Not signed in." });
  }

  authStore.readUsers().then(function (users) {
    const user = users.find(function (entry) {
      return entry.id === userId;
    });

    if (!user) {
      sessions.delete(getSessionId(req));
      clearSessionCookie(res);
      return res.status(401).json({ error: "Not signed in." });
    }

    res.json({ user: authStore.publicUser(user) });
  }).catch(next);
});

app.post("/api/auth/register", async function (req, res) {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = req.body?.password;

  if (
    !name ||
    name.length > 80 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  ) {
    return res.status(400).json({
      error: "Enter a name, valid email, and password between 8 and 128 characters.",
    });
  }

  const user = await authStore.createUser(name, email, password);
  if (!user) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  res.status(201).json({ user: createSession(user, res) });
});

app.post("/api/auth/login", async function (req, res) {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = req.body?.password;
  if (!email || typeof password !== "string") {
    return res.status(400).json({ error: "Enter your email and password." });
  }

  const user = await authStore.verifyUser(email, password);
  if (!user) {
    return res.status(401).json({ error: "Email or password is incorrect." });
  }

  res.json({ user: createSession(user, res) });
});

app.post("/api/auth/logout", function (req, res) {
  sessions.delete(getSessionId(req));
  clearSessionCookie(res);
  res.status(204).end();
});

app.use("/api/transactions", requireAuthentication);

app.get("/api/transactions", async function (req, res) {
  const transactions = await transactionStore.readTransactions();
  res.json(transactions.filter(function (transaction) {
    return transaction.userId === req.userId;
  }));
});

app.post("/api/transactions", async function (req, res) {
  const transaction = req.body;
  if (!isValidTransaction(transaction)) {
    return res.status(400).json({ error: "Invalid transaction. Check the submitted fields." });
  }

  const transactions = await transactionStore.readTransactions();
  const newTransaction = createTransactionRecord(transaction, randomUUID(), req.userId);

  transactions.push(newTransaction);
  await transactionStore.writeTransactions(transactions);

  res.status(201).json(newTransaction);
});

app.put("/api/transactions/:id", async function (req, res) {
  const transaction = req.body;
  if (!isValidTransaction(transaction)) {
    return res.status(400).json({ error: "Invalid transaction. Check the submitted fields." });
  }

  const transactions = await transactionStore.readTransactions();
  const index = transactions.findIndex(function (item) {
    return item.id === req.params.id && item.userId === req.userId;
  });

  if (index === -1) {
    return res.status(404).json({ error: "Transaction not found." });
  }

  const updatedTransaction = createTransactionRecord(
    transaction,
    transactions[index].id,
    transactions[index].userId
  );
  transactions[index] = updatedTransaction;
  await transactionStore.writeTransactions(transactions);

  res.json(updatedTransaction);
});

app.delete("/api/transactions/:id", async function (req, res) {
  const transactions = await transactionStore.readTransactions();
  const remainingTransactions = transactions.filter(function (transaction) {
    return transaction.id !== req.params.id || transaction.userId !== req.userId;
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
