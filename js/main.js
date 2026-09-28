// ===================================================
// Budget Buddy - main.js
// Simple beginner-level JavaScript (no frameworks)
// ===================================================

// ---- Load saved data from localStorage, or start with empty lists ----
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let subscriptions = JSON.parse(localStorage.getItem("subscriptions")) || [];
let categoryBudgets = JSON.parse(localStorage.getItem("categoryBudgets")) || [];

const authGate = document.getElementById("authGate");
const appShell = document.getElementById("appShell");
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const signInView = document.getElementById("signInView");
const signUpView = document.getElementById("signUpView");
const signInTab = document.getElementById("signInTab");
const signUpTab = document.getElementById("signUpTab");
const signedInUser = document.getElementById("signedInUser");
const prototypeSessionKey = "budgetBuddyPrototypeUser";
const pageLinks = document.querySelectorAll("[data-page-link]");
const appPages = document.querySelectorAll(".app-page");

function showPage(pageId) {
  const pageExists = Array.from(appPages).some(function (page) {
    return page.id === pageId;
  });
  const activePageId = pageExists ? pageId : "dashboard";

  appPages.forEach(function (page) {
    page.hidden = page.id !== activePageId;
  });

  pageLinks.forEach(function (link) {
    const isActive = link.getAttribute("data-page-link") === activePageId;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function syncPageFromHash() {
  showPage(window.location.hash.slice(1) || "dashboard");
}

window.addEventListener("hashchange", syncPageFromHash);
syncPageFromHash();

function showApp(userName) {
  signedInUser.textContent = userName;
  authGate.hidden = true;
  appShell.hidden = false;
  syncPageFromHash();
}

function setAuthMode(mode) {
  const signingUp = mode === "signup";
  signInView.hidden = signingUp;
  signUpView.hidden = !signingUp;
  signInTab.classList.toggle("is-active", !signingUp);
  signUpTab.classList.toggle("is-active", signingUp);
  signInTab.setAttribute("aria-pressed", String(!signingUp));
  signUpTab.setAttribute("aria-pressed", String(signingUp));
}

document.querySelectorAll("[data-auth-mode]").forEach(function (button) {
  button.addEventListener("click", function () {
    setAuthMode(button.getAttribute("data-auth-mode"));
  });
});

signInTab.addEventListener("click", function () {
  setAuthMode("signin");
});

signUpTab.addEventListener("click", function () {
  setAuthMode("signup");
});

signInForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const identifier = document.getElementById("signInEmail").value.trim();
  localStorage.setItem(prototypeSessionKey, identifier);
  showApp(identifier);
  updateNotificationControl();
  renderRenewalReminders();
  checkRenewalNotifications();
});

signUpForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const name = document.getElementById("signUpName").value.trim();
  localStorage.setItem(prototypeSessionKey, name);
  showApp(name);
  updateNotificationControl();
  renderRenewalReminders();
  checkRenewalNotifications();
});

document.getElementById("signOutButton").addEventListener("click", function () {
  localStorage.removeItem(prototypeSessionKey);
  appShell.hidden = true;
  authGate.hidden = false;
  signInForm.reset();
  signUpForm.reset();
  setAuthMode("signin");
});

const savedPrototypeUser = localStorage.getItem(prototypeSessionKey);
if (savedPrototypeUser) {
  showApp(savedPrototypeUser);
}

// ---- Grab the HTML elements we need to work with ----
const transactionForm = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");
const filterType = document.getElementById("filterType");

const subscriptionForm = document.getElementById("subscriptionForm");
const subscriptionList = document.getElementById("subscriptionList");
const renewalReminderList = document.getElementById("renewalReminderList");
const renewalReminderEmpty = document.getElementById("renewalReminderEmpty");
const notificationButton = document.getElementById("notificationButton");
const notificationStatus = document.getElementById("notificationStatus");

const totalIncomeEl = document.getElementById("totalIncome");
const totalExpensesEl = document.getElementById("totalExpenses");
const totalBalanceEl = document.getElementById("totalBalance");
const totalSubscriptionsEl = document.getElementById("totalSubscriptions");
const healthBadge = document.getElementById("healthBadge");
const spendingChart = document.getElementById("spendingChart");
const spendingChartEmpty = document.getElementById("spendingChartEmpty");
const categoryBudgetForm = document.getElementById("categoryBudgetForm");
const categoryBudgetList = document.getElementById("categoryBudgetList");
const categoryBudgetEmpty = document.getElementById("categoryBudgetEmpty");
const budgetMonthLabel = document.getElementById("budgetMonthLabel");

// ===================================================
// SAVE TO LOCAL STORAGE
// ===================================================
function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function saveSubscriptions() {
  localStorage.setItem("subscriptions", JSON.stringify(subscriptions));
}

function saveCategoryBudgets() {
  localStorage.setItem("categoryBudgets", JSON.stringify(categoryBudgets));
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
  const renewalDate = document.getElementById("subscriptionRenewalDate").value;
  const reminderDays = Number(document.getElementById("subscriptionReminderDays").value);

  if (!name || !amount || amount <= 0 || !renewalDate) {
    alert("Please enter a subscription name, a valid amount, and the next renewal date.");
    return;
  }

  const newSubscription = {
    id: Date.now(),
    name: name,
    amount: amount,
    cycle: cycle,
    renewalDate: renewalDate,
    reminderDays: reminderDays,
  };

  subscriptions.push(newSubscription);
  saveSubscriptions();

  subscriptionForm.reset();
  renderSubscriptions();
  renderRenewalReminders();
  checkRenewalNotifications();
  updateSummary();
});

notificationButton.addEventListener("click", function () {
  if (!notificationsAvailable()) return;

  window.Notification.requestPermission().then(function () {
    updateNotificationControl();
    checkRenewalNotifications();
  });
});

categoryBudgetForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const category = document.getElementById("budgetCategory").value.trim();
  const limit = parseFloat(document.getElementById("budgetLimit").value);

  if (!category || !limit || limit <= 0) {
    alert("Please enter a category and a monthly limit greater than zero.");
    return;
  }

  const categoryKey = category.toLocaleLowerCase();
  const existingBudget = categoryBudgets.find(function (budget) {
    return budget.category.toLocaleLowerCase() === categoryKey;
  });

  if (existingBudget) {
    existingBudget.category = category;
    existingBudget.limit = limit;
  } else {
    categoryBudgets.push({ category: category, limit: limit });
  }

  saveCategoryBudgets();
  categoryBudgetForm.reset();
  renderCategoryBudgets();
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
  subscriptionList.replaceChildren();

  subscriptions.forEach(function (sub) {
    const li = document.createElement("li");
    li.className = "subscription-item";

    const row = document.createElement("div");
    row.className = "subscription-row";

    const info = document.createElement("div");
    info.className = "item-info";

    const name = document.createElement("span");
    name.className = "item-title";
    name.textContent = sub.name;

    const cycle = document.createElement("span");
    cycle.className = "item-sub";
    cycle.textContent = sub.cycle === "monthly" ? "Billed monthly" : "Billed yearly";

    const renewal = document.createElement("span");
    renewal.className = "item-sub renewal-summary";
    renewal.textContent = sub.renewalDate
      ? "Next renewal " + formatRenewalDate(sub.renewalDate) + " · Remind " + Number(sub.reminderDays || 3) + " days before"
      : "Add a renewal date to enable reminders.";

    info.append(name, cycle, renewal);

    const actions = document.createElement("div");
    actions.className = "subscription-actions";

    const amount = document.createElement("span");
    amount.className = "item-amount expense-color";
    amount.textContent = "₱" + Number(sub.amount).toFixed(2);

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "reminder-edit-button";
    editButton.textContent = sub.renewalDate ? "Edit reminder" : "Set reminder";
    editButton.setAttribute("aria-expanded", String(!sub.renewalDate));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";

    actions.append(amount, editButton, deleteButton);
    row.append(info, actions);

    const editor = document.createElement("form");
    editor.className = "renewal-editor";
    editor.hidden = Boolean(sub.renewalDate);

    const dateField = document.createElement("div");
    dateField.className = "renewal-editor-field";
    const dateLabel = document.createElement("label");
    dateLabel.textContent = "Next renewal date";
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = sub.renewalDate || "";
    dateInput.required = true;
    dateLabel.appendChild(dateInput);
    dateField.appendChild(dateLabel);

    const leadField = document.createElement("div");
    leadField.className = "renewal-editor-field";
    const leadLabel = document.createElement("label");
    leadLabel.textContent = "Remind me before";
    const leadSelect = document.createElement("select");
    [1, 3, 7].forEach(function (days) {
      const option = document.createElement("option");
      option.value = String(days);
      option.textContent = days + (days === 1 ? " day" : " days");
      leadSelect.appendChild(option);
    });
    leadSelect.value = String(sub.reminderDays || 3);
    leadLabel.appendChild(leadSelect);
    leadField.appendChild(leadLabel);

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "btn-primary";
    saveButton.textContent = "Save reminder";

    editor.append(dateField, leadField, saveButton);
    editor.addEventListener("submit", function (event) {
      event.preventDefault();
      sub.renewalDate = dateInput.value;
      sub.reminderDays = Number(leadSelect.value);
      saveSubscriptions();
      renderSubscriptions();
      renderRenewalReminders();
      checkRenewalNotifications();
    });

    editButton.addEventListener("click", function () {
      editor.hidden = !editor.hidden;
      editButton.setAttribute("aria-expanded", String(!editor.hidden));
      if (!editor.hidden) dateInput.focus();
    });

    deleteButton.addEventListener("click", function () {
      subscriptions = subscriptions.filter(function (entry) {
        return entry.id !== sub.id;
      });
      saveSubscriptions();
      renderSubscriptions();
      renderRenewalReminders();
      updateSummary();
    });

    li.append(row, editor);
    subscriptionList.appendChild(li);
  });
}

function formatRenewalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function daysUntilRenewal(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const renewalDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((renewalDate - today) / 86400000);
}

function renderRenewalReminders() {
  const datedSubscriptions = subscriptions
    .filter(function (sub) {
      return Boolean(sub.renewalDate);
    })
    .sort(function (first, second) {
      return first.renewalDate.localeCompare(second.renewalDate);
    });

  renewalReminderList.replaceChildren();
  renewalReminderEmpty.hidden = datedSubscriptions.length > 0;

  datedSubscriptions.forEach(function (sub) {
    const days = daysUntilRenewal(sub.renewalDate);
    const item = document.createElement("li");
    item.className = "renewal-reminder";

    const info = document.createElement("div");
    info.className = "item-info";

    const name = document.createElement("span");
    name.className = "item-title";
    name.textContent = sub.name;

    const date = document.createElement("span");
    date.className = "item-sub";
    date.textContent = formatRenewalDate(sub.renewalDate);

    const status = document.createElement("span");
    status.className = "reminder-status";
    if (days < 0) {
      status.textContent = "Renewal date passed · update next date";
      status.classList.add("is-overdue");
    } else if (days === 0) {
      status.textContent = "Renews today";
      status.classList.add("is-due-soon");
    } else {
      status.textContent = "In " + days + (days === 1 ? " day" : " days");
      if (days <= Number(sub.reminderDays || 3)) status.classList.add("is-due-soon");
    }

    const amount = document.createElement("span");
    amount.className = "item-amount expense-color";
    amount.textContent = "₱" + Number(sub.amount).toFixed(2);

    info.append(name, date, status);
    item.append(info, amount);
    renewalReminderList.appendChild(item);
  });
}

function notificationsAvailable() {
  return window.isSecureContext && "Notification" in window;
}

function updateNotificationControl() {
  if (!notificationsAvailable()) {
    notificationButton.disabled = true;
    notificationButton.textContent = "Browser notifications unavailable";
    notificationStatus.textContent = "Renewal dates still appear here. Browser notifications require a secure browser context.";
    return;
  }

  if (window.Notification.permission === "granted") {
    notificationButton.disabled = true;
    notificationButton.textContent = "Notifications enabled";
    notificationStatus.textContent = "You will get browser reminders while Budget Buddy is open.";
  } else if (window.Notification.permission === "denied") {
    notificationButton.disabled = true;
    notificationButton.textContent = "Notifications blocked";
    notificationStatus.textContent = "Allow notifications in your browser settings to receive reminder alerts.";
  } else {
    notificationButton.disabled = false;
    notificationButton.textContent = "Enable browser notifications";
    notificationStatus.textContent = "Browser alerts are optional; upcoming renewal dates are listed below.";
  }
}

function checkRenewalNotifications() {
  if (appShell.hidden || !notificationsAvailable() || window.Notification.permission !== "granted") return;

  let sentReminders = [];
  try {
    sentReminders = JSON.parse(localStorage.getItem("budgetBuddySentRenewalReminders")) || [];
  } catch (error) {
    sentReminders = [];
  }

  let remindersChanged = false;
  subscriptions.forEach(function (sub) {
    if (!sub.renewalDate) return;

    const days = daysUntilRenewal(sub.renewalDate);
    const reminderDays = Number(sub.reminderDays || 3);
    const reminderKey = String(sub.id) + ":" + sub.renewalDate;
    if (days < 0 || days > reminderDays || sentReminders.includes(reminderKey)) return;

    try {
      new window.Notification("Subscription renewal coming up", {
        body: days === 0 ? sub.name + " renews today." : sub.name + " renews in " + days + (days === 1 ? " day." : " days."),
      });
      sentReminders.push(reminderKey);
      remindersChanged = true;
    } catch (error) {
      return;
    }
  });

  if (remindersChanged) {
    localStorage.setItem("budgetBuddySentRenewalReminders", JSON.stringify(sentReminders));
  }
}

window.addEventListener("focus", checkRenewalNotifications);
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) checkRenewalNotifications();
});
window.setInterval(checkRenewalNotifications, 60000);

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
  renderSpendingChart();
  renderCategoryBudgets();
}

function renderSpendingChart() {
  const categoryTotals = new Map();

  transactions.forEach(function (item) {
    if (item.type !== "expense") return;

    const category = item.category.trim();
    const categoryKey = category.toLocaleLowerCase();
    const existing = categoryTotals.get(categoryKey);

    if (existing) {
      existing.amount += item.amount;
    } else {
      categoryTotals.set(categoryKey, { category: category, amount: item.amount });
    }
  });

  const categories = Array.from(categoryTotals.values()).sort(function (first, second) {
    return second.amount - first.amount;
  });

  spendingChart.replaceChildren();
  spendingChartEmpty.hidden = categories.length > 0;

  if (categories.length === 0) return;

  const largestAmount = categories[0].amount;

  categories.forEach(function (entry) {
    const item = document.createElement("li");
    item.className = "chart-item";

    const row = document.createElement("div");
    row.className = "chart-row";

    const category = document.createElement("span");
    category.className = "chart-category";
    category.textContent = entry.category;

    const amount = document.createElement("span");
    amount.className = "chart-amount expense-color";
    amount.textContent = "₱" + entry.amount.toFixed(2);

    const track = document.createElement("div");
    track.className = "chart-track";
    track.setAttribute("role", "meter");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", largestAmount.toFixed(2));
    track.setAttribute("aria-valuenow", entry.amount.toFixed(2));
    track.setAttribute("aria-label", entry.category + " expenses");

    const bar = document.createElement("span");
    bar.className = "chart-bar";
    bar.style.width = (entry.amount / largestAmount) * 100 + "%";

    row.append(category, amount);
    track.appendChild(bar);
    item.append(row, track);
    spendingChart.appendChild(item);
  });
}

function renderCategoryBudgets() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const currentMonth = year + "-" + month;
  const expensesByCategory = new Map();

  budgetMonthLabel.textContent = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(today);

  transactions.forEach(function (item) {
    if (item.type !== "expense" || !item.date || item.date.slice(0, 7) !== currentMonth) return;

    const categoryKey = item.category.trim().toLocaleLowerCase();
    expensesByCategory.set(categoryKey, (expensesByCategory.get(categoryKey) || 0) + item.amount);
  });

  const sortedBudgets = categoryBudgets.slice().sort(function (first, second) {
    return first.category.localeCompare(second.category);
  });

  categoryBudgetList.replaceChildren();
  categoryBudgetEmpty.hidden = sortedBudgets.length > 0;

  sortedBudgets.forEach(function (budget) {
    const categoryKey = budget.category.toLocaleLowerCase();
    const spent = expensesByCategory.get(categoryKey) || 0;
    const remaining = budget.limit - spent;
    const isOverBudget = remaining < 0;
    const isNearLimit = !isOverBudget && spent >= budget.limit * 0.8;
    const progressPercent = Math.min((spent / budget.limit) * 100, 100);

    const item = document.createElement("li");
    item.className = "category-budget-item";

    const heading = document.createElement("div");
    heading.className = "budget-row";

    const category = document.createElement("span");
    category.className = "chart-category";
    category.textContent = budget.category;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "budget-remove";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", "Remove " + budget.category + " budget");
    removeButton.addEventListener("click", function () {
      categoryBudgets = categoryBudgets.filter(function (entry) {
        return entry.category.toLocaleLowerCase() !== categoryKey;
      });
      saveCategoryBudgets();
      renderCategoryBudgets();
    });

    const progress = document.createElement("div");
    progress.className = "budget-progress";
    progress.classList.toggle("is-near-limit", isNearLimit);
    progress.classList.toggle("is-over-budget", isOverBudget);
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-label", budget.category + " monthly budget progress");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", budget.limit.toFixed(2));
    progress.setAttribute("aria-valuenow", Math.min(spent, budget.limit).toFixed(2));

    const bar = document.createElement("span");
    bar.className = "budget-progress-bar";
    bar.style.width = progressPercent + "%";
    progress.appendChild(bar);

    const usage = document.createElement("p");
    usage.className = "budget-usage";
    usage.textContent = "₱" + spent.toFixed(2) + " of ₱" + budget.limit.toFixed(2) + " · " +
      (isOverBudget ? "₱" + Math.abs(remaining).toFixed(2) + " over budget" : "₱" + remaining.toFixed(2) + " remaining");

    heading.append(category, removeButton);
    item.append(heading, progress, usage);
    categoryBudgetList.appendChild(item);
  });
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
renderRenewalReminders();
updateNotificationControl();
checkRenewalNotifications();
updateSummary();
