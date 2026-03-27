# Expense Tracker — Documentation

## Overview
A client-side expense tracking web application built with vanilla JavaScript (ES6+), HTML5, and CSS3. No backend, no build step, and no framework — open index.html in a browser or serve via a local static server.

## Quick Start
- Direct open: open index.html (Chart.js may require internet)
- Local server (recommended):
  - python3 -m http.server 8080
  - or: npx http-server -p 8080

No install or build step required.

## Architecture
The app uses ES6 modules and a singleton manager pattern. All data flows through a StorageManager which persists to localStorage.

File structure (key files):
- js/app.js — Main app controller (ExpenseTrackerApp)
- js/storage.js — localStorage CRUD (StorageManager singleton)
- js/expense.js — ExpenseManager singleton
- js/category.js — CategoryManager singleton
- js/budget.js — BudgetManager singleton
- js/notifications.js — NotificationManager singleton
- js/utils/dateUtils.js — Date helpers
- index.html — App markup and CDN for Chart.js
- css/ — Styles

## Data Flow
User action → app.js (UI handler) → Manager (business logic) → storage.js → localStorage → UI render

When rendering, managers read fresh data from StorageManager and app.js updates the DOM.

## localStorage Schema
Keys prefixed with `expense_tracker_`:
- expense_tracker_expenses — Array of expense objects
- expense_tracker_categories — Array of category objects
- expense_tracker_budgets — Array of budget objects
- expense_tracker_settings — Settings object (currency, etc.)

Categories are initialized with defaults on first run.

## Data Models
Expense:
{
  id: string,
  amount: number, // parseFloat()
  date: string, // ISO 'YYYY-MM-DD'
  category: string, // category name
  description: string,
  notes: string?,
  createdAt: string // ISO timestamp
}

Budget:
{
  id: string,
  category: string, // category name or 'overall'
  amount: number, // monthly limit
  month: number, // 0-11
  year: number,
  createdAt: string
}

Category:
{
  id: string,
  name: string,
  icon: string, // emoji
  color: string, // hex
  isDefault: boolean
}

## Manager Pattern
Each manager exports a singleton instance and follows this pattern:
- Use StorageManager for persistence
- Expose add/get/update/delete methods
- Validate input and return { success, data?, errors }

Example:
class SomeManager { constructor() { this.storage = storage; } add(data) { /* validate & persist */ } }

export default new SomeManager();

## Validation
Models implement validate() that returns { isValid, errors }.
Managers call validate before persisting and return structured results for app.js to handle.

## Charts
Charts (Chart.js) are created in app.js and stored in this.charts by canvas ID.
Always destroy an existing chart before creating a new one:
if (this.charts[id]) this.charts[id].destroy();

Chart.js is loaded via CDN in index.html.

## Dates
- Dates stored as ISO strings (YYYY-MM-DD)
- Use dateUtils.formatDateForInput() for form inputs
- Budget months use 0-11 indexing
- Future dates are blocked in expense validation

## Export/Import
- CSV and JSON export respect active filters
- CSV quotes all fields
- JSON uses JSON.stringify(..., null, 2)
- Download via Blob + temporary anchor element

## Budgets & Status
Budgets are monthly. Status based on percentage spent:
0-50% = success, 50-80% = info, 80-100% = warning, >100% = danger

## Adding Features
1. Add/extend data model or manager
2. Add storage methods if needed in storage.js
3. Add UI markup to index.html
4. Wire event handlers in app.js
5. Add render methods and update notifications

## Testing & Verification
No automated tests. Manual checks:
- Run locally and open in browser
- Add expenses, categories, budgets
- Verify charts, filters, and exports
- Clear localStorage to test initialization

## Browser Compatibility
- Requires modern browsers supporting ES6 modules
- localStorage required (won't work in some incognito modes)
- Chart.js CDN needs internet on first load

## Common Gotchas
- Imports must include .js extension
- Months are 0-indexed in JavaScript
- Destroy charts before recreating to avoid leaks
- Category names are used as keys for grouping/filtering
- Number formatting: parseFloat() and toFixed(2)
- Filters are read from DOM when rendering

## Developer Guidelines
- Keep business logic in Managers (not app.js)
- Follow the singleton export pattern
- Keep UI updates in app.js render methods
- Document any schema changes and consider migrations

## File Modification Guidance
- Edit index.html for markup/sections
- Edit css/ for styling
- Edit js managers for logic and storage.js for persistence
- Keep changes localized and update Documentation.md when adding features

## Troubleshooting
- If charts fail to render, check CDN load and console errors
- If data missing, inspect localStorage keys in DevTools
- Use browser console to call manager methods for debugging

---

For questions or contributions, open an issue or contact the maintainer listed in repository metadata.
