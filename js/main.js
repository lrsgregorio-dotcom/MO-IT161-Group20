// ===================================================
// Budget Buddy - main.js
// Simple beginner-level JavaScript (no frameworks)
// ===================================================

// ---- Load saved data from localStorage, or start with empty lists ----
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let subscriptions = JSON.parse(localStorage.getItem("subscriptions")) || [];

// ---- Grab the HTML elements we need to work with ----
const transactionForm = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");
const filterType = document.getElementById("filterType");

const subscriptionForm = document.getElementById("subscriptionForm");
const subscriptionList = document.getElementById("subscriptionList");

const totalIncomeEl = document.getElementById("totalIncome");
const totalExpensesEl = document.getElementById("totalExpenses");
const totalBalanceEl = document.getElementById("totalBalance");
const totalSubscriptionsEl = document.getElementById("totalSubscriptions");
const healthBadge = document.getElementById("healthBadge");

// ===================================================
// SAVE TO LOCAL STORAGE
// ===================================================
function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function saveSubscriptions() {
  localStorage.setItem("subscriptions", JSON.stringify(subscriptions));
}

// ===================================================
// ADD A TRANSACTION
// ===================================================
transactionForm.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  const type = document.getElementById("transactionType").value;
  const category = document.getElementById("transactionCategory").value.trim();
  const amount = parseFloat(document.getElementById("transactionAmount").value);
  const date = document.getElementById("transactionDate").value;
  const note = document.getElementById("transactionNote").value.trim();

  // simple check so we don't save broken/empty entries
  if (!category || !amount || amount <= 0 || !date) {
    alert("Please fill out category, amount, and date correctly.");
    return;
  }

  const newTransaction = {
    id: Date.now(), // simple unique id using the current timestamp
    type: type,
    category: category,
    amount: amount,
    date: date,
    note: note,
  };

  transactions.push(newTransaction);
  saveTransactions();

  transactionForm.reset();
  renderTransactions();
  updateSummary();
});

// ===================================================
// ADD A SUBSCRIPTION
// ===================================================
subscriptionForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("subscriptionName").value.trim();
  const amount = parseFloat(document.getElementById("subscriptionAmount").value);
  const cycle = document.getElementById("subscriptionCycle").value;

  if (!name || !amount || amount <= 0) {
    alert("Please fill out subscription name and amount correctly.");
    return;
  }

  const newSubscription = {
    id: Date.now(),
    name: name,
    amount: amount,
    cycle: cycle,
  };

  subscriptions.push(newSubscription);
  saveSubscriptions();

  subscriptionForm.reset();
  renderSubscriptions();
  updateSummary();
});

// ===================================================
// FILTER DROPDOWN
// ===================================================
filterType.addEventListener("change", function () {
  renderTransactions();
});

// ===================================================
// RENDER TRANSACTIONS (based on selected filter)
// ===================================================
function renderTransactions() {
  const selectedFilter = filterType.value; // "all", "income", or "expense"

  transactionList.innerHTML = ""; // clear the list before re-drawing it

  transactions
    .filter(function (item) {
      if (selectedFilter === "all") return true;
      return item.type === selectedFilter;
    })
    .forEach(function (item) {
      const li = document.createElement("li");

      const colorClass = item.type === "income" ? "income-color" : "expense-color";
      const sign = item.type === "income" ? "+" : "-";

      li.innerHTML = `
        <div class="item-info">
          <span class="item-title">${item.category}</span>
          <span class="item-sub">${item.date}${item.note ? " • " + item.note : ""}</span>
        </div>
        <div>
          <span class="item-amount ${colorClass}">${sign}₱${item.amount.toFixed(2)}</span>
          <button class="delete-btn" data-id="${item.id}">Delete</button>
        </div>
      `;

      transactionList.appendChild(li);
    });

  // hook up the delete buttons we just created
  document.querySelectorAll("#transactionList .delete-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const idToDelete = Number(btn.getAttribute("data-id"));
      transactions = transactions.filter(function (item) {
        return item.id !== idToDelete;
      });
      saveTransactions();
      renderTransactions();
      updateSummary();
    });
  });
}

// ===================================================
// RENDER SUBSCRIPTIONS
// ===================================================
function renderSubscriptions() {
  subscriptionList.innerHTML = "";

  subscriptions.forEach(function (sub) {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="item-info">
        <span class="item-title">${sub.name}</span>
        <span class="item-sub">${sub.cycle === "monthly" ? "Billed monthly" : "Billed yearly"}</span>
      </div>
      <div>
        <span class="item-amount expense-color">₱${sub.amount.toFixed(2)}</span>
        <button class="delete-btn" data-id="${sub.id}">Delete</button>
      </div>
    `;

    subscriptionList.appendChild(li);
  });

  document.querySelectorAll("#subscriptionList .delete-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const idToDelete = Number(btn.getAttribute("data-id"));
      subscriptions = subscriptions.filter(function (sub) {
        return sub.id !== idToDelete;
      });
      saveSubscriptions();
      renderSubscriptions();
      updateSummary();
    });
  });
}

// ===================================================
// UPDATE DASHBOARD TOTALS + BUDGET HEALTH INDICATOR
// ===================================================
function updateSummary() {
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(function (item) {
    if (item.type === "income") {
      totalIncome += item.amount;
    } else {
      totalExpenses += item.amount;
    }
  });

  // convert every subscription into a monthly amount so they can be added together
  let totalSubscriptions = 0;
  subscriptions.forEach(function (sub) {
    if (sub.cycle === "monthly") {
      totalSubscriptions += sub.amount;
    } else {
      totalSubscriptions += sub.amount / 12;
    }
  });

  const balance = totalIncome - totalExpenses - totalSubscriptions;

  totalIncomeEl.textContent = "₱" + totalIncome.toFixed(2);
  totalExpensesEl.textContent = "₱" + totalExpenses.toFixed(2);
  totalSubscriptionsEl.textContent = "₱" + totalSubscriptions.toFixed(2);
  totalBalanceEl.textContent = "₱" + balance.toFixed(2);

  updateHealthBadge(totalIncome, balance);
}

// ---- Decide the budget health color: Good / Warning / Over Budget ----
function updateHealthBadge(totalIncome, balance) {
  healthBadge.classList.remove("badge-good", "badge-warning", "badge-over");

  if (totalIncome === 0) {
    healthBadge.textContent = "No Data Yet";
    healthBadge.classList.add("badge-warning");
    return;
  }

  // how much of the income is left over, as a percentage
  const remainingPercent = (balance / totalIncome) * 100;

  if (balance < 0) {
    healthBadge.textContent = "Over Budget";
    healthBadge.classList.add("badge-over");
  } else if (remainingPercent < 20) {
    healthBadge.textContent = "Warning";
    healthBadge.classList.add("badge-warning");
  } else {
    healthBadge.textContent = "Good";
    healthBadge.classList.add("badge-good");
  }
}

// ===================================================
// RUN ON PAGE LOAD
// ===================================================
renderTransactions();
renderSubscriptions();
updateSummary();
