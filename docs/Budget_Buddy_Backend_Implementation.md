# Budget Buddy Backend Implementation Plan

## 1. Purpose

This document adapts the Milestone 2 backend reading materials to Budget Buddy. The planned transaction-backend slice is now implemented: Express serves the frontend, the browser communicates with `fetch()`, and transaction data persists in a JSON file using Node.js `fs`.

The first backend-supported feature will be transaction management. Transactions are already a central feature of Budget Buddy, and the current app already supports adding, listing, filtering, exporting, and deleting them. Adding transaction editing completes CRUD without introducing an unrelated feature.

The transaction-backend milestone was completed as a local learning project. A later user-requested addition adds basic account sign-in and transaction ownership; it is still not production authentication. Step-by-step prompts are retained below as a record of the original scope and sequence; Sections 13 and 14 describe the completed work.

## 2. Course Alignment

The supplied Milestone 2 guide establishes these relevant expectations and techniques:

- Use Node.js and Express.js for backend functionality.
- Serve the existing HTML application through Express.
- Define routes that receive requests and return responses.
- Use `fetch()` to communicate from the browser frontend to Express.
- Send form data in a POST request body and parse it with Express JSON middleware.
- Return JSON responses and handle those responses in the frontend.
- Persist submitted data beyond server restarts.
- The reading demonstrates JSON-file persistence with Node.js `fs` as a lightweight alternative to a database.
- Test the behavior and document implementation decisions and progress.

The supplied guide does not require a particular database, prohibit databases, require user accounts, or require that every feature move to the backend. The original transaction slice used JSON-file storage and did not include authentication. The later account feature is an additional user-requested learning increment, not a course requirement.

## 3. Current Project Findings

- The frontend is one hash-routed `public/index.html` page with vanilla JavaScript in `public/js/main.js` and CSS in `public/css/style.css`.
- Express serves `public/` from `app.js`; `npm start` runs the server on port 3000 by default, with `PORT` available as an override.
- Transactions use `GET`, `POST`, `PUT`, and `DELETE` API routes and persist in `data/transactions.json` through `transactionStore.js`.
- Transaction history, filtering, CSV export, charts, category-budget calculations, totals, budget health, create, edit, and delete use API-loaded transaction data.
- Subscriptions and category budgets remain in browser `localStorage`.
- Subscription reminders can be edited, but the subscription's name, amount, and billing cycle do not currently have a full edit flow.
- Category budgets can be created, updated by category, listed, and removed.
- Account registration and sign-in use unique email addresses, salted password hashes, and server-side sessions. Transaction routes require a session and scope data by account.
- Subscriptions and category budgets remain browser-local. No database or payment integration is implemented.

## 4. Initial Scope

### Included

- Run the existing frontend through Express.
- Add an optional health-check route for local server testing.
- Add persistent transaction CRUD endpoints: create, read, update, and delete.
- Store transactions in a JSON file outside the statically served frontend directory.
- Connect the existing transaction history, add form, filter, CSV export, and dashboard calculations to API-loaded transaction data.
- Add a transaction edit flow so Update is available in the UI as well as the API.
- Validate input and handle success and failure responses in both backend and frontend.
- Verify saved transactions remain after restarting the server.

### Not included in the first backend slice

- A database product such as MongoDB, MySQL, PostgreSQL, or SQLite.
- Real user registration, password handling, sessions, or per-user data separation.
- Bank connections, payment processing, or production financial-data handling.
- Moving subscriptions and category budgets to the backend.
- Server-scheduled or email subscription reminders.
- A frontend framework or a microservices architecture.

Subscriptions and budgets can be moved to the backend in later increments if the course requirements, team plan, and remaining time support them. Until then, they remain browser-local features.

## 5. Proposed Structure

```text
MO-IT161-Group20/
├── app.js
├── transactionStore.js
├── package.json
├── package-lock.json
├── .gitignore
├── public/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
├── data/
│   └── transactions.json
├── docs/
│   ├── Budget_Buddy_Implementation_Plan.docx
│   └── Budget_Buddy_Backend_Implementation.md
└── img/
    └── ...existing README screenshots...
```

`public/` contains files the browser is allowed to request. Keep `data/transactions.json` outside `public/` so it is accessed only by the server and not exposed as a static file. Keep `img/` at the project root because the current README references those screenshots.

Install dependencies with `npm install`, then start the server from the repository root with `npm start`. The default URL is `http://localhost:3000`; set `PORT` to override it. The storage module creates `data/transactions.json` containing `[]` when the file is missing. The runtime data file is ignored by Git.

The course example uses `app.js`; the plan follows that name. The initial implementation can keep the beginner-sized routes in `app.js`. If the file becomes difficult to follow, routes can be extracted into a module in a separate later change.

## 6. Transaction API

All API routes use the `/api` prefix. The frontend and API are served from the same Express origin, so no cross-origin configuration should be needed for local development.

| Method | Path | Purpose | Successful response |
|---|---|---|---|
| `GET` | `/api/health` | Confirm the local server is running; development check only | `200` JSON status |
| `GET` | `/api/transactions` | Read all saved transactions | `200` JSON array |
| `POST` | `/api/transactions` | Create a transaction from the JSON request body | `201` JSON transaction |
| `PUT` | `/api/transactions/:id` | Replace editable fields on an existing transaction | `200` JSON transaction |
| `DELETE` | `/api/transactions/:id` | Delete a transaction | `204` with no response body |

The backend should return a `400` response for invalid submitted fields and a `404` response when an update or delete references an unknown ID. Unexpected server or file errors should receive a generic `500` JSON response; internal file paths and stack traces should not be sent to the browser.

### Transaction record

```json
{
  "id": "server-generated-id",
  "type": "expense",
  "category": "Food",
  "amount": 12.5,
  "date": "2026-10-24",
  "note": "Lunch"
}
```

The server generates the ID. It validates that `type` is `income` or `expense`, `category` is non-empty, `amount` is a positive finite number, `date` is present and valid, and `note` is a string if provided. The server should not trust frontend-only form validation.

## 7. Request and Response Flow

### Read transactions

1. The browser requests `GET /api/transactions` when the app starts or when transaction data needs refreshing.
2. Express reads the JSON file and returns the records as JSON.
3. The frontend parses the response and uses the returned records to render transaction history and dashboard calculations.

### Create a transaction

1. The user submits the existing transaction form.
2. The frontend sends the transaction fields as JSON in a `POST` request body.
3. Express parses and validates the body, adds a server-generated ID, and persists the record.
4. Express returns the created record with `201` status.
5. The frontend checks the response and refreshes its transaction data and dependent UI only after success.

### Update and delete

The edit UI sends `PUT` with the changed fields. The delete action sends `DELETE`. The frontend must use the response status to decide whether to show a success or error state and refresh the display; it should not report success before the backend confirms the operation.

## 8. File Persistence

- Initialize `data/transactions.json` with an empty JSON array (`[]`).
- Use Node.js file APIs (`fs` / `fs/promises`) to read and write JSON records.
- Parse the file and validate that it contains an array of valid transaction records before using it; handle a missing file through an intentional initialization path.
- Persist changes for create, update, and delete before returning a success response.
- Keep the data file out of `public/` and exclude generated runtime data from version control if that matches the team submission requirements. If the course requires sample data to be submitted, use a separate clearly identified sample file rather than committing private user data.
- Treat this as a local, single-user learning implementation. A JSON file does not provide database transactions or safe multi-user concurrent writes and is not a production storage design.

## 9. Gradual Work and Commit Boundaries

The prompts below record the intended sequence. Steps 2-9 have been completed and verified to the extent described in Section 13. Review and commit changes in the team's normal workflow; do not include private transaction data.

### Step 1: Confirm setup and transaction-data decision

**Copy-paste prompt:**

```text
We are beginning Milestone 2 for Budget Buddy in this workspace. Read docs/Budget_Buddy_Backend_Implementation.md. The course guide teaches Node.js LTS, Express routes, fetch() communication, JSON request/response bodies, and persistent JSON-file storage using Node's fs module. It does not require a database or real authentication.

This is a read-only checkpoint. Check the available Node.js and npm versions. Inspect the project files and Git status, but do not edit files, install packages, or switch branches. The current browser app stores transactions in localStorage under the "transactions" key in js/main.js; do not assume you can inspect browser storage from the workspace.

Report whether Node and npm are available, confirm the current storage/server setup, and note any course or repository constraints. Then ask me to choose how to handle existing browser transactions before migration: (A) import them once to the backend, (B) manually re-enter them, or (C) start with an empty backend file while leaving browser data untouched. Do not continue to Step 2 until I choose. Do not commit or push.
```

**Completion check:** Node/npm status and constraints are reported, and the user explicitly chooses a local-data transition.

### Step 2: Move the frontend into `public/`

**Copy-paste prompt:**

```text
Continue Milestone 2 for Budget Buddy. Read docs/Budget_Buddy_Backend_Implementation.md and inspect the file tree and Git status. Step 1 is complete; my transaction-data decision is: [PASTE MY STEP 1 CHOICE HERE].

For this step only, move index.html, css/, and js/ into public/ so Express can serve the browser app later. Keep docs/ and img/ at the repository root so the README screenshot links remain valid. Preserve the existing interface and behavior, and check/update relative CSS, JavaScript, and image paths as needed. Update only README paths or instructions made inaccurate by the move.

Do not add Express, package.json, API routes, persistence, or change app behavior yet. Verify the new asset paths and README screenshot links. Report changed paths and results. Do not commit or push.
```

**Completion check:** Frontend files are under `public/`; asset references work and root README image links remain valid.

### Step 3: Add Express and `npm start`

**Copy-paste prompt:**

```text
Continue Milestone 2 for Budget Buddy. Read docs/Budget_Buddy_Backend_Implementation.md and inspect the files and Git status. Step 2 is complete: index.html, css/, and js/ are under public/, while docs/ and img/ remain at the root.

For this step only, initialize the Node project, install Express, and create app.js. Configure Express to serve public/ and return JSON from GET /api/health. Add an npm start script so the app starts from the repository root with "npm start" after dependencies are installed. Use a suitable local port and allow an environment-variable override if appropriate. Add necessary ignore rules such as node_modules/ without ignoring project source.

Do not add transaction routes, persistence, authentication, a database, or frontend fetch() calls yet. Run the server with npm start and verify both the frontend and health route locally. Report commands, changed files, and results. Do not commit or push.
```

**Completion check:** `npm start` serves the frontend through Express and `/api/health` returns JSON.

### Step 4: Add JSON-file transaction storage

**Copy-paste prompt:**

```text
Continue Milestone 2 for Budget Buddy. Read the file-persistence rules in docs/Budget_Buddy_Backend_Implementation.md and inspect the server, files, and Git status. Steps 2-3 are complete: Express serves public/, npm start works, and GET /api/health returns JSON.

For this step only, implement a small server-side transaction storage module using Node.js fs/promises and data/transactions.json. Keep data/ outside public/. Store an array of transaction records. Handle a missing file through an intentional initialization path. Do not silently replace malformed JSON with an empty array or report success when a file write fails. Keep file access separate from HTTP routes where practical, without unnecessary abstractions.

Do not add API routes or change frontend code. Follow the Step 1 local-data decision, but do not import browser data in this step. Avoid committing personal transaction data; choose a safe empty-file/runtime initialization consistent with the course submission requirements. Add a focused verification, including that written data survives server restart. Report files, results, and limitations. Do not commit or push.
```

**Completion check:** Storage reads/writes valid JSON, handles missing or malformed data explicitly, persists across restart, and is outside `public/`.

### Step 5: Add transaction list and create routes

**Copy-paste prompt:**

```text
Continue Milestone 2 for Budget Buddy. Read docs/Budget_Buddy_Backend_Implementation.md and inspect the server, storage module, and Git status. Steps 2-4 are complete: Express works and JSON-file transaction storage is available.

For this step only, add GET /api/transactions and POST /api/transactions. Parse JSON request bodies with Express middleware. GET returns the saved array as JSON. POST validates on the server: type is income or expense, category is non-empty text, amount is a positive finite number, date is valid, and note is optional text. Generate IDs on the server and persist before responding. Return the created record with HTTP 201; use HTTP 400 for invalid input and a generic JSON HTTP 500 response for unexpected storage/server errors. Do not expose paths or stack traces.

Do not connect the frontend, add update/delete routes, authentication, or a database. Test empty GET, valid POST then GET, persistence after restart, and invalid POST. Report changed files and actual results. Do not commit or push.
```

**Completion check:** GET/POST work with persistent storage and invalid submitted data is rejected with an appropriate response.

### Step 6: Connect transaction loading and creation

**Copy-paste prompt:**

```text
Continue Milestone 2 for Budget Buddy. Read docs/Budget_Buddy_Backend_Implementation.md and inspect the frontend and API. Steps 2-5 are complete: Express serves the app, JSON persistence works, and GET/POST /api/transactions pass their checks.

For this step only, use fetch() to load transactions from GET /api/transactions when the app starts and submit the existing transaction form as JSON to POST /api/transactions. Treat the server response as the source of truth: do not add a transaction to UI state or reset the form until the request succeeds. Keep history rendering, filters, CSV export, spending chart, budget calculations, totals, and budget-health display working from the API-loaded transaction array.

Follow my Step 1 decision: [PASTE MY STEP 1 CHOICE HERE]. Preserve browser data until any chosen import is confirmed successful; do not silently discard or overwrite it. Leave subscriptions and category budgets on localStorage. Show accessible loading/error feedback and never show false success. Do not implement update/delete yet. Test success and failure through the UI; report results. Do not commit or push.
```

**Completion check:** The UI loads and creates transactions through Express while existing dependent views continue working and failures are visible.

### Step 7: Add transaction deletion

**Copy-paste prompt:**

```text
Continue Milestone 2 for Budget Buddy. Read docs/Budget_Buddy_Backend_Implementation.md and inspect the transaction API, frontend, and Git status. Steps 2-6 are complete: loading and creation use the API; filters, export, charts, budgets, and totals still work.

For this step only, implement DELETE /api/transactions/:id using the JSON storage module, then connect the existing Delete button with fetch(). Persist removal before returning HTTP 204. Return HTTP 404 for an unknown ID and a generic JSON HTTP 500 response for unexpected errors. Update browser state only after a successful response; show an error if deletion fails. Refresh history and all dependent totals/charts/budget progress after success.

Do not add edit, authentication, a database, or other resource APIs. Test successful deletion, unknown ID, persistence after server restart, and UI updates. Report changed files and results. Do not commit or push.
```

**Completion check:** Deletion persists and updates the UI only after server confirmation; unknown IDs return 404.

### Step 8: Add transaction updating and an edit UI

**Copy-paste prompt:**

```text
Continue Milestone 2 for Budget Buddy. Read docs/Budget_Buddy_Backend_Implementation.md and inspect the transaction API, UI, and Git status. Steps 2-7 are complete: create, list, and delete work through Express and JSON-file storage.

For this step only, implement PUT /api/transactions/:id and add a simple, accessible edit interaction for type, category, amount, date, and note. Reuse POST's server-side validation and preserve the server-generated ID. Persist before returning HTTP 200 with the updated JSON record. Return HTTP 400 for invalid data, HTTP 404 for an unknown ID, and a generic JSON HTTP 500 response for unexpected errors. The frontend must use the response and update the UI only after success, with visible failure feedback.

Keep the existing visual style and responsive behavior. After edits, ensure history, CSV export, spending chart, category-budget progress, totals, and budget health reflect the updated record. Do not add unrelated features. Test valid/invalid edits, unknown IDs, persistence after restart, and dependent UI. Report files and results. Do not commit or push.
```

**Completion check:** Transactions support full CRUD through API and UI, with validation and derived views staying in sync.

### Step 9: Refine, verify, and document

**Copy-paste prompt:**

```text
Complete the planned Milestone 2 transaction-backend slice for Budget Buddy. Read docs/Budget_Buddy_Backend_Implementation.md, inspect the implementation and Git status, and distinguish completed behavior from planned work.

For this step only, run/refine focused checks for: Express serving the frontend; npm start; GET/POST/PUT/DELETE response behavior; server validation; JSON persistence after restart; 404 for unknown IDs; frontend loading/create/edit/delete/filter/CSV/chart/category-budget/totals/budget-health behavior; visible network/server errors without false success; existing subscription and budget localStorage behavior; and ensuring transaction data is not served as a static file.

Fix only defects in this Milestone 2 slice. Update README.md and this implementation document with actual setup/run commands, structure, API behavior, storage decision, verified tests, and known limits. Update the Browser-Based Application Development Workflow Worksheet only if it exists in the workspace; otherwise report that it is missing and provide facts for the team to enter. Do not claim unverified tests or deliverables are complete. Do not add authentication, a database, payments, or unrelated cleanup. Report results, changed files, risks, and remaining course deliverables. Do not commit or push.
```

**Completion check:** The complete transaction feature is verified end-to-end, documentation reflects actual behavior, and remaining course deliverables are identified.

## 10. Testing Checklist

- Start the app using the documented npm command and load it through Express.
- Confirm the health-check endpoint returns its expected JSON response.
- Load the transaction list when the JSON file is empty.
- Create valid income and expense records through the UI and confirm the backend response is used.
- Confirm required-field, invalid-type, invalid-date, and non-positive-amount requests are rejected.
- Restart the server and verify created/updated/deleted records persist as expected.
- Update a transaction and verify the list, CSV export, spending chart, category budgets, and dashboard totals reflect it.
- Delete a transaction and verify it disappears from the API and UI and changes totals.
- Confirm unknown transaction IDs return `404` and network failures do not display false success.
- Confirm existing subscription and category-budget behavior still works from its current localStorage source.
- Confirm the data JSON file cannot be downloaded as a static asset.

## 11. Important Limits and Decisions

- **No real authentication in this phase:** The existing sign-in/sign-up interface is a prototype and does not protect the API. It must not be presented as secure authentication. The JSON-backed backend is a local learning feature, not suitable for real personal financial information or public deployment.
- **Single-user data:** Without authentication and per-user authorization, all API users of the local server share the same transaction file.
- **Partial backend migration:** Subscriptions and category budgets remain in localStorage during the first slice. This is intentional and should be documented in the README.
- **Existing local data:** The selected policy is a one-time import when the backend is empty. Keep the browser copy until the imported records are confirmed by the server; if the backend already contains records, keep the browser copy and avoid automatic duplicate imports.
- **File storage limits:** JSON-file persistence is suitable for demonstrating the course concepts but has limitations for concurrent requests, multiple users, and deployment.
- **Future increments:** If required or approved later, subscriptions and category budgets can use the same route/request/response/persistence pattern. Authentication, production database storage, and server-scheduled reminders require separate scope decisions.

## 12. Documentation and Team Deliverables

Record the actual commands, route behavior, storage decisions, test results, and known limitations in the README and course workflow worksheet. Do not describe planned work as completed. Review the implementation with the team, complete the Team Contributions Table, and prepare the Milestone 2 submission according to the instructor's checklist.

## 13. Completed Milestone 2 Slice and Verification

### Implemented

- `npm install` installs the dependencies; `npm start` serves `public/` from Express at `http://localhost:3000` by default. Set `PORT` to override the port.
- `GET /api/health` returns JSON. Transaction routes implement list (`GET`), create (`POST`), update (`PUT`), and delete (`DELETE`) using `data/transactions.json` through `transactionStore.js`.
- The missing transaction file is created with `[]`. Reads reject malformed JSON, non-array contents, and records that do not have a valid ID, type, category, amount, date, and note. Storage and request errors return a generic JSON `500` response; details are not sent to the browser.
- POST and PUT validate submitted fields on the server. POST returns `201`; PUT returns `200` and preserves the existing ID; invalid fields return `400`; unknown update/delete IDs return `404`; successful DELETE returns `204`.
- The browser loads and changes transactions through the API. Its history, filter, CSV export, spending chart, budget progress, dashboard totals, and budget health use the server-loaded transaction list. Loading and write failures are announced; the UI changes only after a successful response.
- Existing browser transactions are imported once only when the backend is empty. The browser copy is retained until all imported records have been confirmed by a subsequent server read. An interrupted import can be retried; if the backend already contains transactions, the browser copy is retained to avoid duplicates.
- Subscriptions and category budgets remain in browser `localStorage`. The prototype sign-in screen is unchanged and is not real authentication.
- `data/transactions.json` is outside `public/` and ignored by Git. `README.md` has the install/run instructions, feature status, API summary, data decision, and limitations.

### Verification performed

Manual HTTP checks used the locally running `npm start` server and disposable data:

- The home page, CSS, JavaScript, and `/api/health` returned HTTP `200`; `/data/transactions.json` was not served and returned `404`.
- Empty GET returned an empty JSON array. POST returned `201` with a server-generated ID. Invalid type, blank category, non-positive amount, invalid date, and non-string note were rejected with `400`.
- PUT returned `200`, changed the record, preserved its ID, and rejected invalid fields with `400`. Unknown PUT and DELETE IDs returned `404`; successful DELETE returned `204`.
- Malformed request JSON returned `400`. Malformed stored JSON returned a generic JSON `500` without exposing the storage path.
- Created, updated, and deleted data was checked across a server restart.
- Browser checks covered transaction load/create/edit/delete, income/expense filtering, CSV-export status, and recalculation of totals, budget health, spending chart, and category-budget progress after edits and deletes. Simulated failures for GET, POST, PUT, and DELETE showed errors without false success or premature state changes.
- Browser checks confirmed subscriptions and category budgets continued to load and save through `localStorage`. The one-time import and retry behavior were also exercised during Step 6.
- `node --check` passed for the server and browser JavaScript, and `git diff --check` passed. There is no automated test script in `package.json`; these are focused manual checks, not a full automated suite.

### Worksheet and remaining work

No file named for the Browser-Based Application Development Workflow Worksheet was found in the workspace. Facts for the team to enter in the course-provided worksheet:

- **Application:** Budget Buddy; Milestone 2 transaction-backend slice.
- **Stack:** Node.js, Express, vanilla HTML/CSS/JavaScript, `fetch()`, JSON request/response, Node `fs/promises`.
- **Run:** `npm install`, then `npm start`; default URL `http://localhost:3000`, optional `PORT` override.
- **Persistence:** `data/transactions.json`, created as `[]` when absent; runtime transaction data is Git-ignored. Existing browser transactions are imported once only when the backend is empty.
- **API:** `GET /api/health`; `GET`, `POST`, `PUT`, and `DELETE /api/transactions` (update/delete use `/:id`).
- **Still local/prototype:** subscriptions, category budgets, and demo sign-in use browser `localStorage`; there is no real authentication or per-user separation.
- **Limitations:** local single-user JSON storage has no database transaction or safe concurrent-write guarantees and is not suitable for production financial data.

The team still needs to complete and review the course worksheet and Team Contributions Table and confirm any instructor-specific Milestone 2 submission requirements. No claims are made here about those external deliverables.

## 14. Account Sign-In Follow-Up

This is a later, user-requested learning increment; it is not required by the supplied course guide.

### Implemented

- `authStore.js` stores accounts in `data/users.json`, initializes the file when it is missing, and hashes passwords with Node.js `crypto.scrypt` and a random salt. Passwords and hashes are never returned by the API.
- Registration requires a name, valid email, and an 8–128 character password. Email matching is case-insensitive. Duplicate emails return `409`; invalid registration returns `400`.
- Login, current-session lookup, and logout use `/api/auth/login`, `/api/auth/session`, and `/api/auth/logout`. A random opaque session ID is stored in an HTTP-only, `SameSite=Lax` cookie. Sessions are held in memory for up to eight hours; cookies have the `Secure` attribute when `NODE_ENV=production`.
- All transaction API routes require a valid session. New records include the authenticated account ID; list, update, and delete operate only on that account's records. An unassigned legacy record is left in the JSON file and hidden from all accounts.
- The sign-in and sign-up forms use the API and display an accessible status/error message. Subscriptions, category budgets, and reminder status remain in browser `localStorage`, namespaced by account ID. Existing unscoped browser copies are moved into the first account that signs in on that browser. A browser transaction copy is reserved for its first importing account; later accounts leave it untouched. Import remains confirmation-based and only runs when that account's API list is empty.
- `data/users.json` and `data/transactions.json` remain outside `public/` and are ignored by Git.

### Verification performed for this follow-up

- `node --check` passed for `app.js`, `authStore.js`, `transactionStore.js`, and `public/js/main.js`; `git diff --check` passed.
- An isolated temporary copy of the app was used for HTTP checks, so the existing ignored `data/transactions.json` in the working repository was not changed.
- Registration validation, case-insensitive duplicate-email rejection, incorrect-password rejection, session lookup, unauthenticated transaction rejection, and safe public user fields were checked.
- The account cookie's `HttpOnly` and `SameSite=Lax` attributes were checked. Logout returned `204` and the same cookie could no longer access transaction routes.
- Two accounts were created. Account B could not list, update, or delete account A's transaction; those cross-account ID requests returned `404`. A newly created transaction was assigned to account A.
- Transaction create/update validation, ID preservation, unknown IDs, and successful deletion were checked. A transaction remained after restarting the isolated server and signing in again; the in-memory session correctly required sign-in after restart.
- The isolated check confirmed the unassigned legacy record remained unchanged and was not returned to either account. `data/users.json` and `data/transactions.json` were not served as static files; the frontend and health route were available.
- The frontend HTML, CSS, and JavaScript assets were served successfully and the JavaScript passed syntax checking. A separate interactive browser test of the new forms was not completed.

### Limits and remaining decisions

- This is not production-grade authentication: no HTTPS is configured for local development, rate limiting, email verification, password reset, session persistence across restarts, or account-management workflow is included.
- JSON files do not safely coordinate concurrent writes or multiple server processes. Accounts and transaction files are local runtime data, not encrypted-at-rest financial storage.
- Account-specific browser `localStorage` is confined to one browser profile/device. Users should not enter real financial data or reuse an important password.
- The Browser-Based Application Development Workflow Worksheet was not present in the workspace during the earlier Milestone 2 check. The team still needs to enter the current account and transaction behavior in the course-provided copy, complete the Team Contributions Table, and confirm instructor-specific submission requirements.
