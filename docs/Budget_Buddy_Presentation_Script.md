# Budget Buddy Presentation Script

Use this as a spoken script and demo checklist. Replace bracketed text with the
exact names, rows, results, and observations from your team's course artifacts.
The Workflow Planning Worksheet and Functional Testing Workbook were not found
in the project workspace, so the script does not invent their contents.

## Before presenting

- Start the app with `npm start` and sign in with a prepared test account.
- Have the project plan and backend implementation notes ready to show.
- Bring the actual Workflow Planning Worksheet and Functional Testing Workbook.
- For Questions 6–8, fill in the workbook-specific prompts below before recording.
- Use sample data only; this project is a local learning app, not for real
  financial information.

## Question 1 — Application Understanding

**[Show the Budget Buddy dashboard.]**

“Our application is **Budget Buddy**, a browser-based personal finance and
subscription tracker. It is intended for people who want a lightweight way to
track everyday money, especially students and young professionals managing an
allowance or salary.

An essential feature is income and expense tracking. A user records a
transaction with its type, category, amount, date, and an optional note. The
dashboard uses those records to show income, expenses, balance, and budget
health.

This feature is central to Budget Buddy because users need a clear picture of
where their money is going. It helps them organize spending and notice when
expenses are reducing the balance they have available.”

## Question 2 — System Understanding

**[Open Add Transaction. Submit a sample income or expense, then show its
appearance in History and the updated dashboard. If available, show the
transaction request and response in the browser's Network panel.]**

“I’m demonstrating the backend-supported transaction feature. I submitted a
sample **[income/expense]** for **[category]**, amount **[amount]**, dated
**[date]**. The browser sent those fields to the Express API as JSON. The server
validated the submitted values, generated the transaction ID, associated the
record with the signed-in account, and saved it in the server-side JSON store.

The successful response returned the saved transaction, and the interface
shows it in the list and recalculates the dashboard. This supports Budget
Buddy’s purpose by making transaction records available to the app from
persistent backend storage instead of relying only on browser-local transaction
data.”

## Question 3 — System Understanding

**[Open `public/js/main.js` at `postServerTransaction()` and the transaction
form submit handler. Then open `app.js` at `POST /api/transactions`.]**

“The frontend part is in `public/js/main.js`. The form handler collects the
transaction fields and calls `postServerTransaction()`, which sends a JSON
`POST` request to `/api/transactions`. It waits for the server response before
adding the returned record to the interface or resetting the form. If the
request fails, the page displays an error instead of showing a false success.

The matching backend route is in `app.js`. It validates the request, creates a
record with a server-generated ID and the signed-in user's ID, saves it through
`transactionStore`, and responds with HTTP 201 and the saved record. The
frontend then uses that response to update the visible list and totals. That
request-and-response flow is how the browser and Express work together.”

## Question 4 — Project Management Understanding

**[Open the Workflow Planning Worksheet and point to the actual high-priority
task. If the worksheet is not available during the presentation, show the
implementation plan as supporting project evidence.]**

“The high-priority task we selected was **[copy the task name from the
worksheet]**. We prioritized it because **[state the team's reason]**. Finishing
it supported later work by **[explain the dependency or follow-on tasks]**.

In the project implementation plan, transaction management was treated as a
central feature, and the work sequence put the Express server and persistent
transaction API before connecting the user interface. That provided a working
backend for the frontend to load, create, edit, and delete records.”

## Question 5 — Project Management Understanding

**[Show the original plan and the later implementation evidence, such as the
implementation plan's scope sections and the account sign-in follow-up.]**

“One adjustment was expanding the original backend scope to include account
sign-in and account-specific transaction ownership. The original Milestone 2
backend plan listed real authentication and per-user separation as out of
scope. The project documentation later records account sign-in as a separate,
user-requested follow-up.

The change was made to support signed-in accounts and prevent one account from
accessing another account's transactions. It added registration, sign-in,
server sessions, and account scoping to the transaction routes. We kept it
separate from the initial transaction-backend work so the core transaction
feature could be built first.”

## Question 6 — Testing and Refinement Understanding

**[Open the Functional Testing Workbook and select a completed internal test.
Fill in the exact workbook row, expected result, and recorded outcome below.]**

“This is test case **[ID/title]** from our internal testing. It evaluated
**[specific feature or input]**. It was important because **[risk or user
impact]**. We considered it passed when **[the workbook's pass criterion]**.
The recorded result was **[Pass/Fail and any notes]**.

For example, our backend verification notes report that non-positive transaction
amounts are rejected with HTTP 400. I will use that example only if it matches
the completed test case recorded in our workbook.”

## Question 7 — Testing and Refinement Understanding

**[Open the external testing notes or workbook and show the actual observation,
issue, or recommendation.]**

“During external testing, **[tester/source]** identified
**[exact observation, issue, or recommendation]**. This mattered because
**[effect on usability, clarity, or correctness]**. Our team responded by
**[specific change, decision, or reason for not changing it]**. The evidence
for that response is **[artifact, entry, or application location]**.”

## Question 8 — Testing and Refinement Understanding

**[Open Tab 4 – Revision and Improvement Summary, then show the corresponding
feature in the running app.]**

“Tab 4 records the improvement **[copy the workbook entry]**. In the
application, the corresponding change is **[show the screen or behavior]**.
The workbook records **[reason or testing finding]**, and the improvement
helps users by **[explain the benefit]**.”

## Question 9 — Ownership and Decision-Making

**[Show the implementation plan's scope decisions and, if useful, the
subscriptions or category-budget feature in the app.]**

“One implementation idea we chose not to include in the Milestone 2 backend
was moving subscriptions and category budgets from browser `localStorage` to
the server. The implementation plan identifies those features as remaining
browser-local, while the backend milestone focused on transaction management.

Keeping them out of that backend increment let the team concentrate on
completing and verifying transaction create, read, update, and delete without
adding more server routes and storage behavior. The final choice was appropriate
for the project's scope: subscriptions and budgets remain available in the
application, while the backend work demonstrates persistent transaction
handling. The plan leaves moving those features to a later increment if time
and requirements support it.”

## Project evidence in this workspace

- [README.md](../README.md) — application purpose, users, feature overview,
  run instructions, API summary, and known limits.
- [Budget_Buddy_Implementation_Plan.docx](./Budget_Buddy_Implementation_Plan.docx)
  — original goals, target users, features, and implementation sequence.
- [Budget_Buddy_Backend_Implementation.md](./Budget_Buddy_Backend_Implementation.md)
  — backend scope, planned sequence, completed implementation, verification,
  account sign-in follow-up, and remaining course deliverables.
- [app.js](../app.js) — Express health, authentication, and transaction routes.
- [public/js/main.js](../public/js/main.js) — frontend API requests and
  transaction UI behavior.

The named Workflow Planning Worksheet and Functional Testing Workbook were not
present in the workspace when this script was prepared. Bring those files and
replace the bracketed prompts with the team's actual entries before presenting.
