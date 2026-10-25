[README.md](https://github.com/user-attachments/files/32670832/README.md)
# Budget Buddy

A simple browser-based personal finance and subscription tracker. Users can log income and expenses, manage recurring subscriptions, filter their transaction history, and see a real-time budget health indicator.

**Current phase:** Milestone 2 is in progress. Express serves the app and stores transactions in a JSON file. Subscriptions, budgets, and the prototype sign-in session still use browser `localStorage`.

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
- JSON-file transaction storage
- Browser localStorage (subscriptions, budgets, and prototype sign-in)

---

## Project Structure

```
budget-buddy/
├── app.js              # Express server and transaction routes
├── package.json        # Project scripts and dependencies
├── public/
│   ├── index.html      # Authentication and hash-routed app views
│   ├── css/
│   │   └── style.css   # Authentication, navigation, and app styling
│   └── js/
│       └── main.js     # Authentication prototype, routing, and tracker logic
├── img/                # Screenshots shown in this README
├── data/
│   └── transactions.json  # Created by the server; ignored by Git
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

---

## Features

| Feature | Where |
|---|---|
| Add income/expense | "Add a Transaction" form |
| Add recurring subscription (Monthly/Yearly) with a next renewal date and reminder lead time | "Recurring Subscriptions" form |
| View upcoming renewals and optionally receive browser notifications | Renewal Reminders on the Subscriptions page |
| Filter transactions (All / Income / Expenses) | Dropdown above transaction history |
| Export all or filtered transaction history as a spreadsheet-friendly CSV | Export CSV button on History |
| Delete a subscription | Delete button on each subscription |
| Delete a transaction | Planned for the next backend step; currently unavailable |
| Live totals (income, expenses, balance, subscriptions) | Dashboard cards |
| Budget health indicator (Good / Warning / Over Budget) | Badge below the dashboard cards |
| Monthly spending limits by category with progress, remaining, and over-budget amounts | Dashboard category budgets |
| Prototype sign-in and sign-up (any non-empty text is accepted) | Authentication screen |
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

- Transactions are stored by the server in `data/transactions.json`. The file is created when transactions are first requested and is ignored by Git.
- Subscriptions, category budgets, and the prototype sign-in session are stored in the current browser (`localStorage`).
- Authentication is for prototype demonstration only. There is no backend, credential validation, or secure account system; do not enter real passwords.
- Subscription reminder dates are stored locally. Browser notifications require permission and work only while Budget Buddy is open in a supported secure browser context; upcoming dates remain listed in the app.
- This is a local learning implementation. The JSON-file backend is single-user and is not suitable for real financial information or public deployment.
