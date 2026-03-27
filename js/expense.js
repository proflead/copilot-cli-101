import storage from './storage.js';

// Expense class representing a single expense
class Expense {
    constructor(data) {
        this.id = data.id || null;
        this.amount = parseFloat(data.amount) || 0;
        this.date = data.date || new Date().toISOString().split('T')[0];
        this.category = data.category || '';
        this.description = data.description || '';
        this.notes = data.notes || '';
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    validate() {
        const errors = [];

        if (!this.amount || this.amount <= 0) {
            errors.push('Amount must be greater than 0');
        }

        if (!this.date) {
            errors.push('Date is required');
        } else {
            const expenseDate = new Date(this.date);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            if (expenseDate > today) {
                errors.push('Date cannot be in the future');
            }
        }

        if (!this.category || this.category.trim() === '') {
            errors.push('Category is required');
        }

        if (!this.description || this.description.trim() === '') {
            errors.push('Description is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    toJSON() {
        return {
            id: this.id,
            amount: this.amount,
            date: this.date,
            category: this.category,
            description: this.description,
            notes: this.notes,
            createdAt: this.createdAt
        };
    }
}

// ExpenseManager handles all expense operations
class ExpenseManager {
    constructor() {
        this.storage = storage;
    }

    // Add a new expense
    add(expenseData) {
        const expense = new Expense(expenseData);
        const validation = expense.validate();

        if (!validation.isValid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        const saved = this.storage.addExpense(expense.toJSON());
        
        return {
            success: !!saved,
            data: saved,
            errors: saved ? [] : ['Failed to save expense']
        };
    }

    // Update an existing expense
    update(id, expenseData) {
        const expense = new Expense({ ...expenseData, id });
        const validation = expense.validate();

        if (!validation.isValid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        const updated = this.storage.updateExpense(id, expense.toJSON());
        
        return {
            success: updated,
            data: updated ? expense.toJSON() : null,
            errors: updated ? [] : ['Failed to update expense']
        };
    }

    // Delete an expense
    delete(id) {
        const deleted = this.storage.deleteExpense(id);
        return {
            success: deleted,
            errors: deleted ? [] : ['Failed to delete expense']
        };
    }

    // Get expense by ID
    getById(id) {
        const expense = this.storage.getExpenseById(id);
        return expense;
    }

    // Get all expenses
    getAll() {
        return this.storage.getExpenses();
    }

    // Get filtered expenses
    filter(filters) {
        return this.storage.filterExpenses(filters);
    }

    // Get expenses for current month
    getCurrentMonth() {
        const now = new Date();
        return this.storage.getExpensesByMonth(now.getFullYear(), now.getMonth());
    }

    // Get expenses for a specific month
    getByMonth(year, month) {
        return this.storage.getExpensesByMonth(year, month);
    }

    // Get total spending
    getTotalSpending(expenses = null) {
        return this.storage.getTotalAmount(expenses);
    }

    // Get spending by category
    getSpendingByCategory(expenses = null) {
        return this.storage.getTotalByCategory(expenses);
    }

    // Get statistics for expenses
    getStatistics(expenses = null) {
        if (!expenses) expenses = this.getAll();

        const total = this.getTotalSpending(expenses);
        const count = expenses.length;
        const byCategory = this.getSpendingByCategory(expenses);

        // Calculate date range
        let earliestDate = null;
        let latestDate = null;
        if (expenses.length > 0) {
            const dates = expenses.map(e => new Date(e.date));
            earliestDate = new Date(Math.min(...dates));
            latestDate = new Date(Math.max(...dates));
        }

        // Calculate daily average
        let dailyAverage = 0;
        if (earliestDate && latestDate) {
            const daysDiff = Math.ceil((latestDate - earliestDate) / (1000 * 60 * 60 * 24)) + 1;
            dailyAverage = total / daysDiff;
        }

        return {
            total,
            count,
            byCategory,
            average: count > 0 ? total / count : 0,
            dailyAverage,
            earliestDate,
            latestDate
        };
    }

    // Sort expenses
    sort(expenses, sortBy = 'date', order = 'desc') {
        const sorted = [...expenses];
        
        sorted.sort((a, b) => {
            let compareValue = 0;

            switch (sortBy) {
                case 'date':
                    compareValue = new Date(a.date) - new Date(b.date);
                    break;
                case 'amount':
                    compareValue = parseFloat(a.amount) - parseFloat(b.amount);
                    break;
                case 'category':
                    compareValue = a.category.localeCompare(b.category);
                    break;
                case 'description':
                    compareValue = a.description.localeCompare(b.description);
                    break;
                default:
                    compareValue = 0;
            }

            return order === 'asc' ? compareValue : -compareValue;
        });

        return sorted;
    }
}

// Create and export singleton instance
const expenseManager = new ExpenseManager();
export default expenseManager;
export { Expense, ExpenseManager };
