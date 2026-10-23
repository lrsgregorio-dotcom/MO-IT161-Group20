# Budget Buddy Backend Implementation Plan

## 1. Purpose

This document adapts the Milestone 2 backend reading materials to Budget Buddy. It proposes a gradual, course-aligned implementation that demonstrates an Express.js server, frontend/backend communication with `fetch()`, JSON responses, and persistent file storage using Node.js `fs`.

The first backend-supported feature will be transaction management. Transactions are already a central feature of Budget Buddy, and the current app already supports adding, listing, filtering, exporting, and deleting them. Adding transaction editing completes CRUD without introducing an unrelated feature.

This is an implementation plan, not a claim that any backend code has already been written.

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

The supplied guide does not require a particular database, prohibit databases, require user accounts, or require that every feature move to the backend. This plan therefore uses a JSON file for the initial feature and does not add a database or real authentication.

## 3. Current Project Findings

- The frontend is one hash-routed `index.html` page with vanilla JavaScript and CSS.
- `js/main.js` currently keeps transactions, subscriptions, and category budgets in browser `localStorage`.
- Transactions support create, read/list, filtering, export, and delete. There is no transaction edit UI yet.
- Subscription reminders can be edited, but the subscription's name, amount, and billing cycle do not currently have a full edit flow.
- Category budgets can be created, updated by category, listed, and removed.
- The sign-in/sign-up screen is a prototype. It accepts non-empty values and does not authenticate users.
- The project has no Express server or Node package setup yet.

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
- Parse and validate file contents before using them; handle a missing file through an intentional initialization path.
- Persist changes for create, update, and delete before returning a success response.
- Keep the data file out of `public/` and exclude generated runtime data from version control if that matches the team submission requirements. If the course requires sample data to be submitted, use a separate clearly identified sample file rather than committing private user data.
- Treat this as a local, single-user learning implementation. A JSON file does not provide database transactions or safe multi-user concurrent writes and is not a production storage design.

## 9. Gradual Work and Commit Boundaries

Use the prompts below one at a time, in order. Each prompt is self-contained for use in a new chat in this same workspace. Review and verify each result before moving on, then make your own commit and push. Do not ask Copilot to commit or push.

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
- **Existing local data:** Decide whether to begin with a fresh backend file, manually re-enter data, or implement a one-time import. Preserve browser data until that decision is made.
- **File storage limits:** JSON-file persistence is suitable for demonstrating the course concepts but has limitations for concurrent requests, multiple users, and deployment.
- **Future increments:** If required or approved later, subscriptions and category budgets can use the same route/request/response/persistence pattern. Authentication, production database storage, and server-scheduled reminders require separate scope decisions.

## 12. Documentation and Team Deliverables

As implementation proceeds, record the actual commands, route behavior, storage decisions, test results, and known limitations in the README and course workflow worksheet. Do not describe planned work as completed. Review the implementation with the team, complete the Team Contributions Table, and prepare the Milestone 2 submission according to the instructor's checklist.
