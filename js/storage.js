// StorageManager - Handles all localStorage operations
class StorageManager {
    constructor() {
        this.keys = {
            expenses: 'expense_tracker_expenses',
            categories: 'expense_tracker_categories',
            budgets: 'expense_tracker_budgets',
            settings: 'expense_tracker_settings'
        };
        this.initializeDefaults();
    }

    // Initialize default data if not exists
    initializeDefaults() {
        if (!this.getItem(this.keys.expenses)) {
            this.setItem(this.keys.expenses, []);
        }
        if (!this.getItem(this.keys.budgets)) {
            this.setItem(this.keys.budgets, []);
        }
        if (!this.getItem(this.keys.settings)) {
            this.setItem(this.keys.settings, {
                currency: 'USD',
                currencySymbol: '$'
            });
        }
    }

    // Generic localStorage methods
    getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            if (error.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please clear some data.');
            }
            return false;
        }
    }

    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    // Expenses CRUD
    getExpenses() {
        return this.getItem(this.keys.expenses) || [];
    }

    addExpense(expense) {
        const expenses = this.getExpenses();
        expense.id = this.generateId();
        expense.createdAt = new Date().toISOString();
        expenses.push(expense);
        return this.setItem(this.keys.expenses, expenses) ? expense : null;
    }

    updateExpense(id, updatedExpense) {
        const expenses = this.getExpenses();
        const index = expenses.findIndex(e => e.id === id);
        if (index !== -1) {
            expenses[index] = { ...expenses[index], ...updatedExpense, id };
            return this.setItem(this.keys.expenses, expenses);
        }
        return false;
    }

    deleteExpense(id) {
        const expenses = this.getExpenses();
        const filtered = expenses.filter(e => e.id !== id);
        return this.setItem(this.keys.expenses, filtered);
    }

    getExpenseById(id) {
        const expenses = this.getExpenses();
        return expenses.find(e => e.id === id) || null;
    }

    // Categories CRUD
    getCategories() {
        return this.getItem(this.keys.categories) || [];
    }

    addCategory(category) {
        const categories = this.getCategories();
        category.id = this.generateId();
        categories.push(category);
        return this.setItem(this.keys.categories, categories) ? category : null;
    }

    deleteCategory(id) {
        const categories = this.getCategories();
        const filtered = categories.filter(c => c.id !== id);
        return this.setItem(this.keys.categories, filtered);
    }

    // Budgets CRUD
    getBudgets() {
        return this.getItem(this.keys.budgets) || [];
    }

    addBudget(budget) {
        const budgets = this.getBudgets();
        // Check if budget for this category already exists
        const existingIndex = budgets.findIndex(b => b.category === budget.category);
        if (existingIndex !== -1) {
            budgets[existingIndex] = { ...budget, id: budgets[existingIndex].id };
        } else {
            budget.id = this.generateId();
            budgets.push(budget);
        }
        return this.setItem(this.keys.budgets, budgets) ? budget : null;
    }

    deleteBudget(id) {
        const budgets = this.getBudgets();
        const filtered = budgets.filter(b => b.id !== id);
        return this.setItem(this.keys.budgets, filtered);
    }

    getBudgetByCategory(category) {
        const budgets = this.getBudgets();
        return budgets.find(b => b.category === category) || null;
    }

    // Settings
    getSettings() {
        return this.getItem(this.keys.settings) || { currency: 'USD', currencySymbol: '$' };
    }

    updateSettings(settings) {
        const current = this.getSettings();
        return this.setItem(this.keys.settings, { ...current, ...settings });
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Filter and aggregation methods
    filterExpenses(filters = {}) {
        let expenses = this.getExpenses();

        if (filters.dateFrom) {
            expenses = expenses.filter(e => new Date(e.date) >= new Date(filters.dateFrom));
        }

        if (filters.dateTo) {
            expenses = expenses.filter(e => new Date(e.date) <= new Date(filters.dateTo));
        }

        if (filters.category) {
            expenses = expenses.filter(e => e.category === filters.category);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            expenses = expenses.filter(e =>
                e.description.toLowerCase().includes(searchLower) ||
                (e.notes && e.notes.toLowerCase().includes(searchLower))
            );
        }

        if (filters.minAmount !== undefined) {
            expenses = expenses.filter(e => parseFloat(e.amount) >= parseFloat(filters.minAmount));
        }

        if (filters.maxAmount !== undefined) {
            expenses = expenses.filter(e => parseFloat(e.amount) <= parseFloat(filters.maxAmount));
        }

        return expenses;
    }

    getExpensesByMonth(year, month) {
        const expenses = this.getExpenses();
        return expenses.filter(e => {
            const date = new Date(e.date);
            return date.getFullYear() === year && date.getMonth() === month;
        });
    }

    getTotalByCategory(expenses = null) {
        if (!expenses) expenses = this.getExpenses();
        
        const totals = {};
        expenses.forEach(expense => {
            const category = expense.category;
            if (!totals[category]) {
                totals[category] = 0;
            }
            totals[category] += parseFloat(expense.amount);
        });
        return totals;
    }

    getTotalAmount(expenses = null) {
        if (!expenses) expenses = this.getExpenses();
        return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    }

    // Data management
    clearAllData() {
        Object.values(this.keys).forEach(key => {
            this.removeItem(key);
        });
        this.initializeDefaults();
    }

    exportData() {
        return {
            expenses: this.getExpenses(),
            categories: this.getCategories(),
            budgets: this.getBudgets(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
    }

    importData(data) {
        try {
            if (data.expenses) this.setItem(this.keys.expenses, data.expenses);
            if (data.categories) this.setItem(this.keys.categories, data.categories);
            if (data.budgets) this.setItem(this.keys.budgets, data.budgets);
            if (data.settings) this.setItem(this.keys.settings, data.settings);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    getStorageInfo() {
        let totalSize = 0;
        Object.values(this.keys).forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                totalSize += item.length;
            }
        });
        
        return {
            usedBytes: totalSize,
            usedKB: (totalSize / 1024).toFixed(2),
            usedMB: (totalSize / 1024 / 1024).toFixed(2)
        };
    }
}

// Create and export singleton instance
const storage = new StorageManager();
export default storage;
