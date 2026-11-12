# Budget Buddy — Presentation Script

## Presenter prep

This is written to be spoken aloud, with demo cues in brackets. Before
presenting, fill in the few bracketed details from your team's actual worksheet
and testing workbook. Those course artifacts were not in the project workspace,
so their findings are not guessed here.

- Start the app with `npm start` and sign in to a prepared test account.
- Have the Workflow Planning Worksheet and Functional Testing Workbook ready.
- For Question 2, use sample data only. This local learning app is not for real
  financial information.

## Opening

**[Show the Budget Buddy dashboard.]**

“Hello everyone. Today we’re presenting **Budget Buddy**, our personal finance
and subscription tracker. We’ll show you what the application does, how one of
its backend-supported features works, and how our planning and testing informed
the project.”

## Question 1 — Application Understanding

**[Point out the dashboard totals and budget health indicator.]**

“Budget Buddy is designed for people who want a simple way to keep track of
their everyday money—especially students and young professionals managing an
allowance or salary.

One of the most important features is income and expense tracking. A user can
record whether a transaction is income or an expense, along with its category,
amount, date, and an optional note. The dashboard then uses those records to
show income, expenses, the current balance, and budget health.

This matters because it gives users a clearer picture of where their money is
going. Instead of trying to remember each purchase, they can organize their
transactions and see how their spending affects the money they have left.”

## Question 2 — System Understanding

**[Open Add Transaction. Enter a sample transaction, submit it, then show the
new record in History and the updated dashboard.]**

“Now we’ll demonstrate the transaction feature working with the backend. We’re
adding a sample **[income/expense]** for **[category]**, with an amount of
**[amount]** and the date **[date]**.”

**[Submit the form. Pause for the success message, then point to the record and
dashboard.]**

“The transaction has been saved and now appears in History. The dashboard has
also updated to include it.

Behind the scenes, the browser submitted the transaction details to our Express
backend. The server checked the information, created an ID, associated the
record with the signed-in account, and saved it in a JSON file. The response
from the server is what the application uses to show the saved transaction.
This supports Budget Buddy’s purpose by keeping users’ transaction records
available through persistent backend storage.”

## Question 3 — System Understanding

### Transaction code walkthrough

**[Show the Add Transaction form submit handler and `postServerTransaction()` in
`public/js/main.js`, then show `POST /api/transactions` in `app.js`.]**

“Let’s trace the transaction we just added. In `public/js/main.js`, the Add
Transaction form's submit handler starts the process.”

1. “First, the form handler reads the type, category, amount, date, and note,
   then checks the required values.”
2. “It calls `postServerTransaction()` in `public/js/main.js`, which sends the
   transaction fields as JSON to `/api/transactions`.”
3. “In `app.js`, the `POST /api/transactions` route validates the data again
   on the server before accepting it.”
4. “The route reads the existing records with `transactionStore.readTransactions()`
   so it can keep the current list.”
5. “It creates a server ID and adds the signed-in user's ID, then saves the
   updated list with `transactionStore.writeTransactions()`.”
6. “The route responds with the saved transaction, and `postServerTransaction()`
   returns that response to the form handler.”
7. “Back in `public/js/main.js`, the handler adds the returned record to the
   page, clears the form, and refreshes History and the dashboard.”

### Subscription code walkthrough

**[Show the subscription form submit handler, `saveSubscriptions()`, and
`renderSubscriptions()` in `public/js/main.js`. Then show the Subscriptions
page and dashboard.]**

“Subscriptions follow a similar sequence in the frontend, but they are saved
in browser storage rather than through the backend.”

1. “In `public/js/main.js`, the subscription form handler reads the name,
   amount, billing cycle, renewal date, and reminder timing.”
2. “It checks for a name, a positive amount, and a renewal date; if any are
   missing or invalid, the app asks us to correct the form.”
3. “The handler creates a subscription record with an ID and the reminder
   settings.”
4. “It adds that record to the `subscriptions` list for the signed-in user.”
5. “The `saveSubscriptions()` function stores the updated list in that user's
   browser `localStorage`.”
6. “The handler clears the form and calls `renderSubscriptions()` and
   `renderRenewalReminders()` to refresh the visible lists.”
7. “Finally, it checks for due reminders and calls `updateSummary()` to
   recalculate the dashboard total, including yearly subscriptions as monthly
   costs.”

## Question 4 — Project Management Understanding

**[Show the high-priority feature list in the Workflow Planning Worksheet.]**

“Our team marked these features as high priority: adding income and expenses,
which gives users the records needed to track their money; managing recurring
subscriptions, so regular costs are included in their spending picture; showing
dashboard totals, for a quick view of income, expenses, subscriptions, and
balance; setting monthly category budgets, to help users monitor spending
against limits; and navigating between pages, so users can easily reach each
part of the app. Together, these features form the core Budget Buddy experience
and support informed day-to-day budgeting.”

## Question 5 — Project Management Understanding

**[Show the original plan, then the later implementation evidence in the
backend implementation document.]**

“Our plan changed as the project developed. At first, the Milestone 2 backend
plan focused on transaction management and listed real authentication and
per-user data separation as out of scope. Later, account sign-in and
account-specific transaction ownership were added as a separate follow-up.

We made that adjustment so signed-in users could have their own transactions,
rather than all accounts sharing the same records. The change added account
registration and sign-in, server sessions, and account scoping to the
transaction routes.

We handled it after establishing the core transaction backend. That let us
build on the existing API while keeping the original milestone focused.”

## Question 6 — Testing and Refinement Understanding

**[Show the functional testing cases in the workbook.]**

“TC-01 confirmed that users could register, sign out, and sign back in
successfully. TC-02 verified that a zero transaction was rejected and that
valid income and expenses updated the dashboard correctly, so users can rely
on accurate totals. TC-03 confirmed that Food spending was tracked and an
existing budget updated rather than duplicated. TC-04 verified that monthly
and yearly subscriptions, renewal reminders, and the ₱699 monthly total
remained correct after refresh. TC-05 confirmed that history filtering,
editing, deletion, and CSV export initiation worked; all five cases were
recorded as passed.”

## Question 7 — Testing and Refinement Understanding

**[Show the note for TC-05 in the testing documentation.]**

“In internal test TC-05, the app displayed ‘Exported 1 transaction,’ but we
did not inspect the downloaded CSV, so we confirmed that export started but
not that the file contents were correct; our notes do not identify this as
external feedback.”

## Question 8 — Testing and Refinement Understanding

**[Show the Tab 4 entry about clarifying CSV export feedback, then demonstrate
the updated status message in History.]**

“Based on TC-05, we changed the message from ‘Exported’ to ‘Download started
for’ so the app does not imply that the downloaded file's contents were
verified. This makes the export feedback more accurate for users.”

## Question 9 — Ownership and Decision-Making

**[Show the implementation plan's scope decision. If helpful, show the
Subscriptions or category budgets screen.]**

“Not every idea made it into the Milestone 2 backend work. One idea we chose
not to implement in that milestone was moving subscriptions and category
budgets from browser storage to the server.

We kept the milestone focused on transaction management, including creating,
reading, updating, and deleting transactions. Moving more features to the
backend would have required additional routes and storage work. We decided it
was more appropriate to complete and verify the core transaction feature
first.

Subscriptions and category budgets are still available in the application;
they remain browser-local. The implementation plan identifies moving them to
the backend as possible future work if the requirements and project time allow.”

## Closing

**[Return to the dashboard.]**

“That concludes our presentation of Budget Buddy. We’ve shown the application’s
main purpose, demonstrated a transaction saved through the backend, explained
how the frontend and server work together, and shared how planning and testing
guided our decisions. Thank you for listening.”

## Project evidence to have open

- [README.md](../README.md) — application purpose, users, features, setup, and
  known limitations.
- [Budget_Buddy_Implementation_Plan.docx](./Budget_Buddy_Implementation_Plan.docx)
  — original goals, target users, features, and implementation sequence.
- [Budget_Buddy_Backend_Implementation.md](./Budget_Buddy_Backend_Implementation.md)
  — backend scope, completed work, verification, account follow-up, and limits.
- [app.js](../app.js) — Express health, authentication, and transaction routes.
- [public/js/main.js](../public/js/main.js) — frontend API requests and
  transaction UI behavior.

**Before presenting:** Replace the bracketed prompts in Questions 2 and 4–8
with your demo values and the exact entries from your course artifacts. The
Workflow Planning Worksheet and Functional Testing Workbook were not found in
the project workspace when this script was prepared.
