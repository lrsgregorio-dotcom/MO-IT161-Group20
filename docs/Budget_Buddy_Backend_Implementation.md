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

Make one change from this list at a time. Review and test it before making the next. Commit and push each completed increment using the team's commit conventions.

### Step 1: Confirm course setup and protect current work

Check that Node.js LTS and npm are installed. Review the official Milestone 2 assignment and team submission rules. Decide how existing browser-local transactions should be handled before switching the transaction UI to the API; do not silently erase or overwrite them.

**Completion check:** Node and npm versions are available, requirements are confirmed, and the local-data transition decision is recorded.

### Step 2: Prepare a public frontend directory

Move `index.html`, `css/`, and `js/` into `public/`. Keep `img/` and `docs/` at the root. Update README paths and instructions while preserving the current app behavior.

**Completion check:** The app still loads its styles and scripts from the new location, and README screenshot links remain valid.

### Step 3: Initialize Node and Express

Create `package.json`, install Express, and add `app.js` to serve `public/`. Add a health-check endpoint and a start script. Add `node_modules/` and any private runtime files to `.gitignore` as appropriate.

**Completion check:** `npm start` runs the app at the local URL, the frontend is served by Express, and the health check returns JSON.

### Step 4: Add transaction file storage

Create the initial `data/transactions.json` and add small server-side read/write helpers using the Node file system API. Handle missing or malformed data without returning a false success.

**Completion check:** The server can read an empty transaction list and write/read a test record across a server restart.

### Step 5: Add transaction read and create routes

Implement `GET /api/transactions` and `POST /api/transactions`, including JSON parsing, server-side validation, server-generated IDs, and appropriate status codes.

**Completion check:** A valid POST returns `201`, appears in a subsequent GET, and remains after restarting the server; invalid input returns an error response.

### Step 6: Connect transaction loading and creation

Change the frontend to load transactions from the API and submit new transactions using `fetch()`. Keep rendering, filtering, CSV export, spending chart, budget calculations, and totals working from the loaded transaction array. Handle network and server errors visibly.

**Completion check:** A transaction created in the UI is returned by the backend and updates history and dependent dashboard sections only after success.

### Step 7: Add delete route and connect delete action

Implement `DELETE /api/transactions/:id`, persist the removal, and update the existing delete button to call the endpoint and handle its response.

**Completion check:** Deleting a transaction removes it from the API, history, and totals; deleting an unknown ID returns `404`.

### Step 8: Add update route and transaction editing

Implement `PUT /api/transactions/:id` and add a small edit interaction to the transaction UI. Keep the edit form consistent with existing fields and reuse backend validation.

**Completion check:** Editing updates the server record and visible totals; invalid edits are rejected; unknown IDs return `404`.

### Step 9: Refine, verify, and document

Test the complete feature, including persistence after restart, validation failures, error responses, filtering, CSV export, dashboard totals, and the old localStorage transition. Update the README and the Browser-Based Application Development Workflow Worksheet with actual implementation details, decisions, and test results. Complete team contribution and submission materials separately as required by the course.

**Completion check:** The team can demonstrate one complete frontend-to-Express-to-file-to-frontend feature and explain its limits.

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
