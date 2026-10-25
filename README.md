[README.md](https://github.com/user-attachments/files/32670832/README.md)
# Budget Buddy

A simple browser-based personal finance and subscription tracker. Users can log income and expenses, manage recurring subscriptions, filter their transaction history, and see a real-time budget health indicator.

**Current phase:** Express serves the app, stores accounts and transactions in JSON files, and protects transaction data with account sign-in. Subscriptions and category budgets remain in browser `localStorage`.

---

## Screenshots

### Sign Up
![Budget Buddy sign-up page](img/Sign-Up%20Page.PNG)

### Sign In
![Budget Buddy sign-in page](img/Sign-In%20Page.PNG)

### Dashboard
![Budget Buddy dashboard](img/Dashboard.PNG)

### Add Transaction
![Budget Buddy add transaction page](img/Add%20Transaction.PNG)

### Subscription
![Budget Buddy subscriptions page](img/Subscription.PNG)

### History
![Budget Buddy transaction history page](img/History.PNG)

---

## Tech Stack

- HTML
- CSS
- JavaScript (vanilla, no frameworks)
- Node.js and Express
- JSON-file account and transaction storage
- Browser localStorage (subscriptions, category budgets, and reminder settings)

---

## Project Structure

```
budget-buddy/
├── app.js              # Express server, account, and transaction routes
├── authStore.js        # JSON-file accounts and password hashing
├── transactionStore.js # JSON-file transaction storage
├── package.json        # Project scripts and dependencies
├── package-lock.json   # Locked npm dependency versions
├── .gitignore          # Excludes node_modules and runtime transactions
├── public/
│   ├── index.html      # Authentication and hash-routed app views
│   ├── css/
│   │   └── style.css   # Authentication, navigation, and app styling
│   └── js/
│   └── main.js          # Account forms, routing, and tracker logic
├── img/                # Screenshots shown in this README
├── data/
│   ├── transactions.json  # Created at runtime; ignored by Git
│   └── users.json         # Created at runtime; ignored by Git
└── docs/
```

The app uses one HTML document with separate hash-routed views for Dashboard, Add Transaction, Subscriptions, and History. The page links its CSS and JavaScript like this:
```html
<link rel="stylesheet" href="css/style.css">
<script src="js/main.js"></script>
```
These paths are relative to `public/index.html`.

---

## How to Run It

Install the project dependencies, then start the Express server from the project root:
```bash
npm install
npm start
```
Open the local URL printed by the server (by default, `http://localhost:3000`).
Set the `PORT` environment variable to use another local port.

---

## Transaction API

The browser and API use the same Express server, so no separate frontend server or CORS setup is needed.

| Method | Path | Behavior |
|---|---|---|
| `GET` | `/api/health` | Returns `200` JSON server status |
| `POST` | `/api/auth/register` | Creates an account with a unique email and starts a session |
| `POST` | `/api/auth/login` | Verifies credentials and starts a session |
| `GET` | `/api/auth/session` | Returns the current account when signed in |
| `POST` | `/api/auth/logout` | Ends the current session |
| `GET` | `/api/transactions` | Returns only the signed-in account's saved transactions |
| `POST` | `/api/transactions` | Validates and saves a transaction for the signed-in account; returns `201` |
| `PUT` | `/api/transactions/:id` | Validates and saves a change to the signed-in account's transaction; returns `200` |
| `DELETE` | `/api/transactions/:id` | Removes the signed-in account's transaction and returns `204` |

Transactions require a valid session; unauthenticated requests return `401`. Invalid fields and malformed JSON return `400`; duplicate registration returns `409`; unknown or other-account transaction IDs return `404`; unexpected server or storage errors return a generic JSON `500`.

## Features

| Feature | Where |
|---|---|
| Add income/expense | "Add a Transaction" form |
| Add recurring subscription (Monthly/Yearly) with a next renewal date and reminder lead time | "Recurring Subscriptions" form |
| View upcoming renewals and optionally receive browser notifications | Renewal Reminders on the Subscriptions page |
| Filter transactions (All / Income / Expenses) | Dropdown above transaction history |
| Export all or filtered transaction history as a spreadsheet-friendly CSV | Export CSV button on History |
| Edit a transaction | Edit button in transaction history |
| Delete a subscription | Delete button on each subscription |
| Delete a transaction | Delete button in transaction history |
| Live totals (income, expenses, balance, subscriptions) | Dashboard cards |
| Budget health indicator (Good / Warning / Over Budget) | Badge below the dashboard cards |
| Monthly spending limits by category with progress, remaining, and over-budget amounts | Dashboard category budgets |
| Account sign-up/sign-in with unique email and hashed password | Authentication screen |
| Navigate between app views | Navigation bar |

---

## How the Budget Health Indicator Works

1. Adds up all income and all expenses.
2. Adds up subscriptions, turning yearly ones into a monthly amount (`yearly amount ÷ 12`).
3. Balance = Income − Expenses − Monthly Subscriptions.
4. Badge color:
   - 🟩 **Good** — balance is more than 20% of income
   - 🟨 **Warning** — balance is positive but less than 20% of income
   - 🟥 **Over Budget** — balance is negative

---

## Notes

- Accounts are stored in `data/users.json`; passwords are stored as salted hashes. Transactions are stored by the server in `data/transactions.json`. Both files are created at runtime and ignored by Git.
- The first account to use a browser can import its existing browser transactions once, only when its server list is empty. The browser copy is removed only after the server confirms import; a failed or interrupted import keeps it for retry. If the server already contains transactions, or another account owns the browser copy, it is left untouched to avoid duplicates or cross-account imports.
- Existing records without an account owner remain unassigned and are not shown to accounts. New transaction records are associated with the signed-in account.
- Sign-in uses an HTTP-only, SameSite cookie and an in-memory server session. Restarting the server ends active sessions; users can sign in again.
- Subscriptions, category budgets, and reminder settings remain in browser `localStorage`, namespaced by account on that browser.
- Focused API checks covered authentication, account-isolated transaction CRUD, validation, persistence across a server restart, and private data-file access. The earlier browser checks covered the transaction UI; the new sign-up/sign-in UI has not yet had a separate browser interaction test.
- This is a simple learning example, not production authentication. It has no HTTPS setup for local development, email verification, password reset, rate limiting, or durable session store. Do not use real financial information or reuse an important password.
- Subscription reminder dates are stored locally. Browser notifications require permission and work only while Budget Buddy is open in a supported secure browser context; upcoming dates remain listed in the app.
- This is a local learning implementation. JSON files do not provide database transactions or safe concurrent-write guarantees and are not suitable for real financial information or public deployment.
