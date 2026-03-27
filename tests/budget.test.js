import { describe, it, expect, beforeEach, vi } from 'vitest';
import budgetManager, { Budget } from '../js/budget.js';

// Mock storage
vi.mock('../js/storage.js', () => ({
  default: {
    getBudgets: vi.fn(),
    addBudget: vi.fn(),
    deleteBudget: vi.fn()
  }
}));

// Mock expense manager
vi.mock('../js/expense.js', () => ({
  default: {
    getByMonth: vi.fn(),
    getTotalSpending: vi.fn()
  }
}));

import storage from '../js/storage.js';
import expenseManager from '../js/expense.js';

describe('Budget class', () => {
  it('should create budget with provided data', () => {
    const data = {
      id: 'budget123',
      category: 'Food',
      amount: 500,
      month: 2,
      year: 2024,
      createdAt: '2024-03-15T10:00:00.000Z'
    };

    const budget = new Budget(data);

    expect(budget.id).toBe('budget123');
    expect(budget.category).toBe('Food');
    expect(budget.amount).toBe(500);
    expect(budget.month).toBe(2);
    expect(budget.year).toBe(2024);
    expect(budget.createdAt).toBe('2024-03-15T10:00:00.000Z');
  });

  it('should set defaults for missing fields', () => {
    const now = new Date();
    const budget = new Budget({});

    expect(budget.id).toBeNull();
    expect(budget.category).toBe('overall');
    expect(budget.amount).toBe(0);
    expect(budget.month).toBe(now.getMonth());
    expect(budget.year).toBe(now.getFullYear());
    expect(budget.createdAt).toBeDefined();
  });

  it('should parse amount as float', () => {
    const budget = new Budget({ amount: '500.50' });
    expect(budget.amount).toBe(500.50);
    expect(typeof budget.amount).toBe('number');
  });

  describe('validation', () => {
    it('should validate a valid budget', () => {
      const budget = new Budget({
        category: 'Food',
        amount: 500,
        month: 2,
        year: 2024
      });

      const result = budget.validate();

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should fail validation with zero amount', () => {
      const budget = new Budget({
        category: 'Food',
        amount: 0,
        month: 2,
        year: 2024
      });

      const result = budget.validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Budget amount must be greater than 0');
    });

    it('should fail validation with negative amount', () => {
      const budget = new Budget({
        category: 'Food',
        amount: -100,
        month: 2,
        year: 2024
      });

      const result = budget.validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Budget amount must be greater than 0');
    });

    it('should fail validation without category', () => {
      const budget = new Budget({
        category: '',
        amount: 500,
        month: 2,
        year: 2024
      });

      const result = budget.validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Category is required');
    });
  });

  describe('toJSON', () => {
    it('should convert budget to JSON object', () => {
      const budget = new Budget({
        id: 'budget123',
        category: 'Food',
        amount: 500,
        month: 2,
        year: 2024
      });

      const json = budget.toJSON();

      expect(json).toEqual({
        id: 'budget123',
        category: 'Food',
        amount: 500,
        month: 2,
        year: 2024,
        createdAt: budget.createdAt
      });
    });
  });
});

describe('BudgetManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('set', () => {
    it('should set a valid budget', () => {
      const budgetData = {
        category: 'Food',
        amount: 500,
        month: 2,
        year: 2024
      };

      const savedBudget = { ...budgetData, id: 'budget123', createdAt: new Date().toISOString() };
      storage.addBudget.mockReturnValue(savedBudget);

      const result = budgetManager.set(budgetData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(savedBudget);
      expect(result.errors.length).toBe(0);
      expect(storage.addBudget).toHaveBeenCalled();
    });

    it('should fail to set invalid budget', () => {
      const budgetData = {
        category: '',
        amount: 0,
        month: 2,
        year: 2024
      };

      const result = budgetManager.set(budgetData);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(storage.addBudget).not.toHaveBeenCalled();
    });

    it('should return error when storage fails', () => {
      const budgetData = {
        category: 'Food',
        amount: 500,
        month: 2,
        year: 2024
      };

      storage.addBudget.mockReturnValue(null);

      const result = budgetManager.set(budgetData);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Failed to save budget');
    });
  });

  describe('delete', () => {
    it('should delete a budget', () => {
      storage.deleteBudget.mockReturnValue(true);

      const result = budgetManager.delete('budget123');

      expect(result.success).toBe(true);
      expect(storage.deleteBudget).toHaveBeenCalledWith('budget123');
    });

    it('should return error when delete fails', () => {
      storage.deleteBudget.mockReturnValue(false);

      const result = budgetManager.delete('budget123');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Failed to delete budget');
    });
  });

  describe('getAll', () => {
    it('should retrieve all budgets', () => {
      const budgets = [
        { id: '1', category: 'Food', amount: 500, month: 2, year: 2024 },
        { id: '2', category: 'Transport', amount: 200, month: 2, year: 2024 }
      ];

      storage.getBudgets.mockReturnValue(budgets);

      const result = budgetManager.getAll();

      expect(result).toEqual(budgets);
      expect(storage.getBudgets).toHaveBeenCalled();
    });
  });

  describe('getByCategory', () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    it('should retrieve budget by category for current month', () => {
      const budgets = [
        { id: '1', category: 'Food', amount: 500, month: currentMonth, year: currentYear },
        { id: '2', category: 'Transport', amount: 200, month: currentMonth, year: currentYear }
      ];

      storage.getBudgets.mockReturnValue(budgets);

      const result = budgetManager.getByCategory('Food');

      expect(result).toEqual(budgets[0]);
    });

    it('should retrieve budget by category for specific month', () => {
      const budgets = [
        { id: '1', category: 'Food', amount: 500, month: 2, year: 2024 }
      ];

      storage.getBudgets.mockReturnValue(budgets);

      const result = budgetManager.getByCategory('Food', 2, 2024);

      expect(result).toEqual(budgets[0]);
    });

    it('should return null for non-existent budget', () => {
      storage.getBudgets.mockReturnValue([]);

      const result = budgetManager.getByCategory('NonExistent');

      expect(result).toBeNull();
    });
  });

  describe('getBudgetStatus', () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    it('should calculate budget status for category', () => {
      const budgets = [
        { id: '1', category: 'Food', amount: 500, month: currentMonth, year: currentYear }
      ];

      const expenses = [
        { amount: 100, category: 'Food' },
        { amount: 150, category: 'Food' }
      ];

      storage.getBudgets.mockReturnValue(budgets);
      expenseManager.getByMonth.mockReturnValue(expenses);
      expenseManager.getTotalSpending.mockReturnValue(250);

      const result = budgetManager.getBudgetStatus('Food');

      expect(result).toBeDefined();
      expect(result.budget).toBe(500);
      expect(result.spent).toBe(250);
      expect(result.remaining).toBe(250);
      expect(result.percentage).toBe(50);
      expect(result.isOverBudget).toBe(false);
      expect(result.isNearLimit).toBe(false);
      expect(result.status).toBe('info');
    });

    it('should calculate status for overall budget', () => {
      const budgets = [
        { id: '1', category: 'overall', amount: 1000, month: currentMonth, year: currentYear }
      ];

      const expenses = [
        { amount: 100, category: 'Food' },
        { amount: 150, category: 'Transport' }
      ];

      storage.getBudgets.mockReturnValue(budgets);
      expenseManager.getByMonth.mockReturnValue(expenses);
      expenseManager.getTotalSpending.mockReturnValue(250);

      const result = budgetManager.getBudgetStatus('overall');

      expect(result.spent).toBe(250);
    });

    it('should return null for non-existent budget', () => {
      storage.getBudgets.mockReturnValue([]);

      const result = budgetManager.getBudgetStatus('NonExistent');

      expect(result).toBeNull();
    });

    it('should mark as over budget when spent exceeds budget', () => {
      const budgets = [
        { id: '1', category: 'Food', amount: 500, month: currentMonth, year: currentYear }
      ];

      storage.getBudgets.mockReturnValue(budgets);
      expenseManager.getByMonth.mockReturnValue([]);
      expenseManager.getTotalSpending.mockReturnValue(600);

      const result = budgetManager.getBudgetStatus('Food');

      expect(result.isOverBudget).toBe(true);
      expect(result.percentage).toBe(100);
      expect(result.status).toBe('danger');
    });

    it('should mark as near limit when 80-100% spent', () => {
      const budgets = [
        { id: '1', category: 'Food', amount: 500, month: currentMonth, year: currentYear }
      ];

      storage.getBudgets.mockReturnValue(budgets);
      expenseManager.getByMonth.mockReturnValue([]);
      expenseManager.getTotalSpending.mockReturnValue(450);

      const result = budgetManager.getBudgetStatus('Food');

      expect(result.isNearLimit).toBe(true);
      expect(result.status).toBe('warning');
    });
  });

  describe('getStatusLevel', () => {
    it('should return success for 0-49%', () => {
      expect(budgetManager.getStatusLevel(0)).toBe('success');
      expect(budgetManager.getStatusLevel(49)).toBe('success');
    });

    it('should return info for 50-79%', () => {
      expect(budgetManager.getStatusLevel(50)).toBe('info');
      expect(budgetManager.getStatusLevel(79)).toBe('info');
    });

    it('should return warning for 80-99%', () => {
      expect(budgetManager.getStatusLevel(80)).toBe('warning');
      expect(budgetManager.getStatusLevel(99)).toBe('warning');
    });

    it('should return danger for 100%+', () => {
      expect(budgetManager.getStatusLevel(100)).toBe('danger');
      expect(budgetManager.getStatusLevel(150)).toBe('danger');
    });
  });

  describe('getAllBudgetStatuses', () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    it('should get all budget statuses for current month', () => {
      const budgets = [
        { id: '1', category: 'Food', amount: 500, month: currentMonth, year: currentYear },
        { id: '2', category: 'Transport', amount: 200, month: currentMonth, year: currentYear }
      ];

      storage.getBudgets.mockReturnValue(budgets);
      expenseManager.getByMonth.mockReturnValue([]);
      expenseManager.getTotalSpending.mockReturnValue(0);

      const result = budgetManager.getAllBudgetStatuses();

      expect(result.length).toBe(2);
      expect(result[0].category).toBe('Food');
      expect(result[1].category).toBe('Transport');
    });

    it('should filter budgets by month and year', () => {
      const budgets = [
        { id: '1', category: 'Food', amount: 500, month: 2, year: 2024 },
        { id: '2', category: 'Transport', amount: 200, month: 3, year: 2024 }
      ];

      storage.getBudgets.mockReturnValue(budgets);
      expenseManager.getByMonth.mockReturnValue([]);
      expenseManager.getTotalSpending.mockReturnValue(0);

      const result = budgetManager.getAllBudgetStatuses(2, 2024);

      expect(result.length).toBe(1);
      expect(result[0].category).toBe('Food');
    });
  });

  describe('checkBudgetAlerts', () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    it('should return danger alert for over budget', () => {
      const budgets = [
        { id: '1', category: 'Food', amount: 500, month: currentMonth, year: currentYear }
      ];

      storage.getBudgets.mockReturnValue(budgets);
      expenseManager.getByMonth.mockReturnValue([]);
      expenseManager.getTotalSpending.mockReturnValue(600);

      const alerts = budgetManager.checkBudgetAlerts();

      expect(alerts.length).toBe(1);
      expect(alerts[0].type).toBe('danger');
      expect(alerts[0].category).toBe('Food');
      expect(alerts[0].message).toContain('exceeded');
    });

    it('should return warning alert for near limit', () => {
      const budgets = [
        { id: '1', category: 'Food', amount: 500, month: currentMonth, year: currentYear }
      ];

      storage.getBudgets.mockReturnValue(budgets);
      expenseManager.getByMonth.mockReturnValue([]);
      expenseManager.getTotalSpending.mockReturnValue(450);

      const alerts = budgetManager.checkBudgetAlerts();

      expect(alerts.length).toBe(1);
      expect(alerts[0].type).toBe('warning');
      expect(alerts[0].category).toBe('Food');
      expect(alerts[0].message).toContain('Approaching');
    });

    it('should return no alerts when budgets are on track', () => {
      const budgets = [
        { id: '1', category: 'Food', amount: 500, month: currentMonth, year: currentYear }
      ];

      storage.getBudgets.mockReturnValue(budgets);
      expenseManager.getByMonth.mockReturnValue([]);
      expenseManager.getTotalSpending.mockReturnValue(200);

      const alerts = budgetManager.checkBudgetAlerts();

      expect(alerts.length).toBe(0);
    });
  });

  describe('getOverallSummary', () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    it('should calculate overall budget summary', () => {
      const budgets = [
        { id: '1', category: 'Food', amount: 500, month: currentMonth, year: currentYear },
        { id: '2', category: 'Transport', amount: 200, month: currentMonth, year: currentYear }
      ];

      storage.getBudgets.mockReturnValue(budgets);
      expenseManager.getByMonth.mockReturnValue([]);
      
      // Mock different spending for each category
      expenseManager.getTotalSpending
        .mockReturnValueOnce(250) // Food
        .mockReturnValueOnce(100); // Transport

      const result = budgetManager.getOverallSummary();

      expect(result).toBeDefined();
      expect(result.totalBudget).toBe(700);
      expect(result.totalSpent).toBe(350);
      expect(result.totalRemaining).toBe(350);
      expect(result.percentage).toBe(50);
      expect(result.categoriesCount).toBe(2);
      expect(result.overBudgetCount).toBe(0);
      expect(result.status).toBe('info');
    });

    it('should return null when no budgets exist', () => {
      storage.getBudgets.mockReturnValue([]);

      const result = budgetManager.getOverallSummary();

      expect(result).toBeNull();
    });
  });

  describe('getBudgetProgress', () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    it('should get budget progress for display', () => {
      const budgets = [
        { id: '1', category: 'Food', amount: 500, month: currentMonth, year: currentYear }
      ];

      storage.getBudgets.mockReturnValue(budgets);
      expenseManager.getByMonth.mockReturnValue([]);
      expenseManager.getTotalSpending.mockReturnValue(450);

      const result = budgetManager.getBudgetProgress('Food');

      expect(result).toBeDefined();
      expect(result.category).toBe('Food');
      expect(result.budget).toBe(500);
      expect(result.spent).toBe(450);
      expect(result.remaining).toBe(50);
      expect(result.percentage).toBe(90);
      expect(result.progressBarClass).toBe('warning');
      expect(result.statusText).toBe('Near Limit');
    });

    it('should show over budget status', () => {
      const budgets = [
        { id: '1', category: 'Food', amount: 500, month: currentMonth, year: currentYear }
      ];

      storage.getBudgets.mockReturnValue(budgets);
      expenseManager.getByMonth.mockReturnValue([]);
      expenseManager.getTotalSpending.mockReturnValue(600);

      const result = budgetManager.getBudgetProgress('Food');

      expect(result.statusText).toBe('Over Budget');
    });

    it('should show on track status', () => {
      const budgets = [
        { id: '1', category: 'Food', amount: 500, month: currentMonth, year: currentYear }
      ];

      storage.getBudgets.mockReturnValue(budgets);
      expenseManager.getByMonth.mockReturnValue([]);
      expenseManager.getTotalSpending.mockReturnValue(200);

      const result = budgetManager.getBudgetProgress('Food');

      expect(result.statusText).toBe('On Track');
    });

    it('should return null for non-existent budget', () => {
      storage.getBudgets.mockReturnValue([]);

      const result = budgetManager.getBudgetProgress('NonExistent');

      expect(result).toBeNull();
    });
  });
});
