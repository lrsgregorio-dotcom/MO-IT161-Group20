[README.md](https://github.com/user-attachments/files/32670832/README.md)
# Budget Buddy

A simple browser-based personal finance and subscription tracker. Users can log income and expenses, manage recurring subscriptions, filter their transaction history, and see a real-time budget health indicator.

**Current phase:** Static site (HTML, CSS, JavaScript). Data is saved in the browser using `localStorage` — no backend/server needed.

---

## Tech Stack

- HTML
- CSS
- JavaScript (vanilla, no frameworks)
- Browser localStorage (for saving data)

---

## Project Structure

```
budget-buddy/
├── index.html          # Main app page (dashboard, forms, lists)
│
├── css/
│   └── style.css        # All styling, including budget health colors
│
├── js/
│   └── main.js           # App logic: add/delete/filter, totals, health indicator
```

Everything lives on one page. The page links its CSS/JS like this:
```html
<link rel="stylesheet" href="css/style.css">
<script src="js/main.js"></script>
```

---

## How to Run It

No installs needed. Pick one:

**Option A — Just open it**
Double-click `index.html` and it opens in your browser.

**Option B — VS Code Live Server (recommended)**
Install the "Live Server" extension → right-click `index.html` → "Open with Live Server."

**Option C — Terminal**
```bash
npx http-server .
```
Then open the local URL it prints.

---

## Features

| Feature | Where |
|---|---|
| Add income/expense | "Add a Transaction" form |
| Add recurring subscription (Monthly/Yearly) | "Recurring Subscriptions" form |
| Filter transactions (All / Income / Expenses) | Dropdown above transaction history |
| Delete a transaction or subscription | Delete button on each list item |
| Live totals (income, expenses, balance, subscriptions) | Dashboard cards |
| Budget health indicator (Good / Warning / Over Budget) | Badge below the dashboard cards |

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

- All data is stored only in the current browser (`localStorage`). Clearing browser data will erase transactions and subscriptions.
- This is Milestone 1 of the project — no login system, charts, or real payment integration yet. See the Implementation Plan for planned future improvements.
