import storage from './storage.js';
import expenseManager from './expense.js';

// Budget class
class Budget {
    constructor(data) {
        this.id = data.id || null;
        this.category = data.category || 'overall';
        this.amount = parseFloat(data.amount) || 0;
        this.month = data.month || new Date().getMonth();
        this.year = data.year || new Date().getFullYear();
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    validate() {
        const errors = [];

        if (!this.amount || this.amount <= 0) {
            errors.push('Budget amount must be greater than 0');
        }

        if (!this.category || this.category.trim() === '') {
            errors.push('Category is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    toJSON() {
        return {
            id: this.id,
            category: this.category,
            amount: this.amount,
            month: this.month,
            year: this.year,
            createdAt: this.createdAt
        };
    }
}

// BudgetManager handles all budget operations
class BudgetManager {
    constructor() {
        this.storage = storage;
    }

    // Add or update a budget
    set(budgetData) {
        const budget = new Budget(budgetData);
        const validation = budget.validate();

        if (!validation.isValid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        const saved = this.storage.addBudget(budget.toJSON());
        
        return {
            success: !!saved,
            data: saved,
            errors: saved ? [] : ['Failed to save budget']
        };
    }

    // Delete a budget
    delete(id) {
        const deleted = this.storage.deleteBudget(id);
        return {
            success: deleted,
            errors: deleted ? [] : ['Failed to delete budget']
        };
    }

    // Get all budgets
    getAll() {
        return this.storage.getBudgets();
    }

    // Get budget by category
    getByCategory(category, month = null, year = null) {
        const budgets = this.getAll();
        const currentMonth = month !== null ? month : new Date().getMonth();
        const currentYear = year !== null ? year : new Date().getFullYear();

        return budgets.find(b => 
            b.category === category && 
            b.month === currentMonth && 
            b.year === currentYear
        ) || null;
    }

    // Get budget status for a category
    getBudgetStatus(category, month = null, year = null) {
        const budget = this.getByCategory(category, month, year);
        
        if (!budget) {
            return null;
        }

        const currentMonth = month !== null ? month : new Date().getMonth();
        const currentYear = year !== null ? year : new Date().getFullYear();

        // Get expenses for this category in the specified month
        let expenses;
        if (category === 'overall') {
            expenses = expenseManager.getByMonth(currentYear, currentMonth);
        } else {
            const allExpenses = expenseManager.getByMonth(currentYear, currentMonth);
            expenses = allExpenses.filter(e => e.category === category);
        }

        const spent = expenseManager.getTotalSpending(expenses);
        const remaining = budget.amount - spent;
        const percentage = (spent / budget.amount) * 100;

        return {
            budget: budget.amount,
            spent,
            remaining,
            percentage: Math.min(percentage, 100),
            isOverBudget: spent > budget.amount,
            isNearLimit: percentage >= 80 && percentage < 100,
            status: this.getStatusLevel(percentage)
        };
    }

    // Get status level based on percentage
    getStatusLevel(percentage) {
        if (percentage >= 100) return 'danger';
        if (percentage >= 80) return 'warning';
        if (percentage >= 50) return 'info';
        return 'success';
    }

    // Get all budget statuses for current month
    getAllBudgetStatuses(month = null, year = null) {
        const budgets = this.getAll();
        const currentMonth = month !== null ? month : new Date().getMonth();
        const currentYear = year !== null ? year : new Date().getFullYear();

        return budgets
            .filter(b => b.month === currentMonth && b.year === currentYear)
            .map(budget => ({
                category: budget.category,
                ...this.getBudgetStatus(budget.category, month, year)
            }));
    }

    // Check if any budgets are exceeded or near limit
    checkBudgetAlerts() {
        const statuses = this.getAllBudgetStatuses();
        const alerts = [];

        statuses.forEach(status => {
            if (status.isOverBudget) {
                alerts.push({
                    type: 'danger',
                    category: status.category,
                    message: `Budget exceeded for ${status.category}! Spent $${status.spent.toFixed(2)} of $${status.budget.toFixed(2)}`
                });
            } else if (status.isNearLimit) {
                alerts.push({
                    type: 'warning',
                    category: status.category,
                    message: `Approaching budget limit for ${status.category}. ${status.percentage.toFixed(0)}% used.`
                });
            }
        });

        return alerts;
    }

    // Get overall budget summary
    getOverallSummary(month = null, year = null) {
        const statuses = this.getAllBudgetStatuses(month, year);
        
        if (statuses.length === 0) {
            return null;
        }

        const totalBudget = statuses.reduce((sum, s) => sum + s.budget, 0);
        const totalSpent = statuses.reduce((sum, s) => sum + s.spent, 0);
        const totalRemaining = totalBudget - totalSpent;
        const overallPercentage = (totalSpent / totalBudget) * 100;

        return {
            totalBudget,
            totalSpent,
            totalRemaining,
            percentage: Math.min(overallPercentage, 100),
            categoriesCount: statuses.length,
            overBudgetCount: statuses.filter(s => s.isOverBudget).length,
            status: this.getStatusLevel(overallPercentage)
        };
    }

    // Get budget progress for display
    getBudgetProgress(category, month = null, year = null) {
        const status = this.getBudgetStatus(category, month, year);
        
        if (!status) return null;

        return {
            category,
            budget: status.budget,
            spent: status.spent,
            remaining: status.remaining,
            percentage: status.percentage,
            progressBarClass: status.status,
            statusText: status.isOverBudget 
                ? 'Over Budget' 
                : status.isNearLimit 
                    ? 'Near Limit' 
                    : 'On Track'
        };
    }
}

// Create and export singleton instance
const budgetManager = new BudgetManager();
export default budgetManager;
export { Budget, BudgetManager };
