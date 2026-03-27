import storage from './storage.js';

// Income class representing a monthly income entry
class Income {
    constructor(data) {
        this.id = data.id || null;
        this.amount = parseFloat(data.amount) || 0;
        this.month = data.month !== undefined ? data.month : new Date().getMonth();
        this.year = data.year !== undefined ? data.year : new Date().getFullYear();
        this.source = data.source || '';
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    validate() {
        const errors = [];
        if (this.amount < 0) {
            errors.push('Income amount must be 0 or greater');
        }
        return { isValid: errors.length === 0, errors };
    }

    toJSON() {
        return {
            id: this.id,
            amount: this.amount,
            month: this.month,
            year: this.year,
            source: this.source,
            createdAt: this.createdAt
        };
    }
}

// IncomeManager handles income operations
class IncomeManager {
    constructor() {
        this.storage = storage;
    }

    // Set income for a specific month (upsert)
    set(incomeData) {
        const income = new Income(incomeData);
        const validation = income.validate();

        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        const saved = this.storage.setIncome(income.toJSON());
        return {
            success: !!saved,
            data: saved,
            errors: saved ? [] : ['Failed to save income']
        };
    }

    // Get all income entries
    getAll() {
        return this.storage.getIncomes();
    }

    // Get income for a specific month/year
    getByMonth(month, year) {
        return this.storage.getIncomeByMonth(month, year);
    }

    // Get income amount for a specific month (returns 0 if not set)
    getMonthlyAmount(month = null, year = null) {
        const m = month !== null ? month : new Date().getMonth();
        const y = year !== null ? year : new Date().getFullYear();
        const income = this.getByMonth(m, y);
        return income ? income.amount : 0;
    }

    // Get the most recently set income amount (useful as a default/fallback)
    getLatestAmount() {
        const incomes = this.getAll();
        if (incomes.length === 0) return 0;
        // Sort by year desc, month desc, pick the most recent
        const sorted = [...incomes].sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year;
            return b.month - a.month;
        });
        return sorted[0].amount;
    }
}

// Create and export singleton instance
const incomeManager = new IncomeManager();
export default incomeManager;
export { Income, IncomeManager };
