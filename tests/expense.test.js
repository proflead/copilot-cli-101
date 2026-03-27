import { describe, it, expect, beforeEach, vi } from 'vitest';
import expenseManager, { Expense } from '../js/expense.js';

// Mock storage
vi.mock('../js/storage.js', () => ({
  default: {
    addExpense: vi.fn(),
    updateExpense: vi.fn(),
    deleteExpense: vi.fn(),
    getExpenseById: vi.fn(),
    getExpenses: vi.fn(),
    filterExpenses: vi.fn(),
    getExpensesByMonth: vi.fn(),
    getTotalAmount: vi.fn(),
    getTotalByCategory: vi.fn()
  }
}));

import storage from '../js/storage.js';

describe('Expense class', () => {
  it('should create expense with provided data', () => {
    const data = {
      id: 'test123',
      amount: 50.00,
      date: '2024-03-15',
      category: 'Food',
      description: 'Lunch',
      notes: 'At cafe'
    };

    const expense = new Expense(data);

    expect(expense.id).toBe('test123');
    expect(expense.amount).toBe(50.00);
    expect(expense.date).toBe('2024-03-15');
    expect(expense.category).toBe('Food');
    expect(expense.description).toBe('Lunch');
    expect(expense.notes).toBe('At cafe');
  });

  it('should set defaults for missing fields', () => {
    const expense = new Expense({});

    expect(expense.id).toBeNull();
    expect(expense.amount).toBe(0);
    expect(expense.date).toBeDefined();
    expect(expense.category).toBe('');
    expect(expense.description).toBe('');
    expect(expense.notes).toBe('');
    expect(expense.createdAt).toBeDefined();
  });

  it('should parse amount as float', () => {
    const expense = new Expense({ amount: '50.50' });
    expect(expense.amount).toBe(50.50);
    expect(typeof expense.amount).toBe('number');
  });

  describe('validation', () => {
    it('should validate a valid expense', () => {
      const expense = new Expense({
        amount: 50.00,
        date: '2024-03-15',
        category: 'Food',
        description: 'Lunch'
      });

      const result = expense.validate();

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should fail validation with zero amount', () => {
      const expense = new Expense({
        amount: 0,
        date: '2024-03-15',
        category: 'Food',
        description: 'Lunch'
      });

      const result = expense.validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount must be greater than 0');
    });

    it('should fail validation with negative amount', () => {
      const expense = new Expense({
        amount: -10,
        date: '2024-03-15',
        category: 'Food',
        description: 'Lunch'
      });

      const result = expense.validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount must be greater than 0');
    });

    it('should fail validation without date', () => {
      const expense = new Expense({
        amount: 50,
        date: '',
        category: 'Food',
        description: 'Lunch'
      });

      const result = expense.validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Date is required');
    });

    it('should fail validation with future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];

      const expense = new Expense({
        amount: 50,
        date: dateStr,
        category: 'Food',
        description: 'Lunch'
      });

      const result = expense.validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Date cannot be in the future');
    });

    it('should fail validation without category', () => {
      const expense = new Expense({
        amount: 50,
        date: '2024-03-15',
        category: '',
        description: 'Lunch'
      });

      const result = expense.validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Category is required');
    });

    it('should fail validation without description', () => {
      const expense = new Expense({
        amount: 50,
        date: '2024-03-15',
        category: 'Food',
        description: ''
      });

      const result = expense.validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description is required');
    });

    it('should collect multiple validation errors', () => {
      const expense = new Expense({
        amount: 0,
        date: '',
        category: '',
        description: ''
      });

      const result = expense.validate();

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('toJSON', () => {
    it('should convert expense to JSON object', () => {
      const expense = new Expense({
        id: 'test123',
        amount: 50.00,
        date: '2024-03-15',
        category: 'Food',
        description: 'Lunch',
        notes: 'At cafe'
      });

      const json = expense.toJSON();

      expect(json).toEqual({
        id: 'test123',
        amount: 50.00,
        date: '2024-03-15',
        category: 'Food',
        description: 'Lunch',
        notes: 'At cafe',
        createdAt: expense.createdAt
      });
    });
  });
});

describe('ExpenseManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('add', () => {
    it('should add a valid expense', () => {
      const expenseData = {
        amount: 50.00,
        date: '2024-03-15',
        category: 'Food',
        description: 'Lunch'
      };

      const savedExpense = { ...expenseData, id: 'test123', createdAt: new Date().toISOString() };
      storage.addExpense.mockReturnValue(savedExpense);

      const result = expenseManager.add(expenseData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(savedExpense);
      expect(result.errors.length).toBe(0);
      expect(storage.addExpense).toHaveBeenCalled();
    });

    it('should fail to add invalid expense', () => {
      const expenseData = {
        amount: 0,
        date: '2024-03-15',
        category: 'Food',
        description: ''
      };

      const result = expenseManager.add(expenseData);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(storage.addExpense).not.toHaveBeenCalled();
    });

    it('should return error when storage fails', () => {
      const expenseData = {
        amount: 50.00,
        date: '2024-03-15',
        category: 'Food',
        description: 'Lunch'
      };

      storage.addExpense.mockReturnValue(null);

      const result = expenseManager.add(expenseData);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Failed to save expense');
    });
  });

  describe('update', () => {
    it('should update a valid expense', () => {
      const expenseData = {
        amount: 60.00,
        date: '2024-03-15',
        category: 'Food',
        description: 'Dinner'
      };

      storage.updateExpense.mockReturnValue(true);

      const result = expenseManager.update('test123', expenseData);

      expect(result.success).toBe(true);
      expect(storage.updateExpense).toHaveBeenCalledWith('test123', expect.any(Object));
    });

    it('should fail to update invalid expense', () => {
      const expenseData = {
        amount: 0,
        date: '2024-03-15',
        category: 'Food',
        description: ''
      };

      const result = expenseManager.update('test123', expenseData);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(storage.updateExpense).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an expense', () => {
      storage.deleteExpense.mockReturnValue(true);

      const result = expenseManager.delete('test123');

      expect(result.success).toBe(true);
      expect(storage.deleteExpense).toHaveBeenCalledWith('test123');
    });

    it('should return error when delete fails', () => {
      storage.deleteExpense.mockReturnValue(false);

      const result = expenseManager.delete('test123');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Failed to delete expense');
    });
  });

  describe('getById', () => {
    it('should retrieve expense by ID', () => {
      const expense = {
        id: 'test123',
        amount: 50.00,
        category: 'Food',
        description: 'Lunch'
      };

      storage.getExpenseById.mockReturnValue(expense);

      const result = expenseManager.getById('test123');

      expect(result).toEqual(expense);
      expect(storage.getExpenseById).toHaveBeenCalledWith('test123');
    });
  });

  describe('getAll', () => {
    it('should retrieve all expenses', () => {
      const expenses = [
        { id: '1', amount: 50, category: 'Food', description: 'Lunch' },
        { id: '2', amount: 30, category: 'Transport', description: 'Taxi' }
      ];

      storage.getExpenses.mockReturnValue(expenses);

      const result = expenseManager.getAll();

      expect(result).toEqual(expenses);
      expect(storage.getExpenses).toHaveBeenCalled();
    });
  });

  describe('filter', () => {
    it('should filter expenses', () => {
      const filters = { category: 'Food' };
      const filtered = [{ id: '1', amount: 50, category: 'Food' }];

      storage.filterExpenses.mockReturnValue(filtered);

      const result = expenseManager.filter(filters);

      expect(result).toEqual(filtered);
      expect(storage.filterExpenses).toHaveBeenCalledWith(filters);
    });
  });

  describe('month operations', () => {
    it('should get current month expenses', () => {
      const now = new Date();
      const expenses = [{ id: '1', amount: 50 }];

      storage.getExpensesByMonth.mockReturnValue(expenses);

      const result = expenseManager.getCurrentMonth();

      expect(result).toEqual(expenses);
      expect(storage.getExpensesByMonth).toHaveBeenCalledWith(
        now.getFullYear(),
        now.getMonth()
      );
    });

    it('should get expenses by specific month', () => {
      const expenses = [{ id: '1', amount: 50 }];

      storage.getExpensesByMonth.mockReturnValue(expenses);

      const result = expenseManager.getByMonth(2024, 2);

      expect(result).toEqual(expenses);
      expect(storage.getExpensesByMonth).toHaveBeenCalledWith(2024, 2);
    });
  });

  describe('statistics', () => {
    it('should get total spending', () => {
      const expenses = [
        { amount: 50 },
        { amount: 30 },
        { amount: 20 }
      ];

      storage.getTotalAmount.mockReturnValue(100);

      const result = expenseManager.getTotalSpending(expenses);

      expect(result).toBe(100);
      expect(storage.getTotalAmount).toHaveBeenCalledWith(expenses);
    });

    it('should get spending by category', () => {
      const expenses = [
        { amount: 50, category: 'Food' },
        { amount: 30, category: 'Transport' }
      ];

      const totals = { Food: 50, Transport: 30 };
      storage.getTotalByCategory.mockReturnValue(totals);

      const result = expenseManager.getSpendingByCategory(expenses);

      expect(result).toEqual(totals);
    });

    it('should calculate full statistics', () => {
      const expenses = [
        { amount: 50, category: 'Food', date: '2024-03-15' },
        { amount: 30, category: 'Transport', date: '2024-03-20' },
        { amount: 20, category: 'Food', date: '2024-03-25' }
      ];

      storage.getExpenses.mockReturnValue(expenses);
      storage.getTotalAmount.mockReturnValue(100);
      storage.getTotalByCategory.mockReturnValue({ Food: 70, Transport: 30 });

      const result = expenseManager.getStatistics();

      expect(result.total).toBe(100);
      expect(result.count).toBe(3);
      expect(result.average).toBe(100 / 3);
      expect(result.byCategory).toEqual({ Food: 70, Transport: 30 });
      expect(result.earliestDate).toBeDefined();
      expect(result.latestDate).toBeDefined();
      expect(result.dailyAverage).toBeGreaterThan(0);
    });
  });

  describe('sort', () => {
    const expenses = [
      { amount: 30, date: '2024-03-20', category: 'Transport', description: 'Taxi' },
      { amount: 50, date: '2024-03-15', category: 'Food', description: 'Lunch' },
      { amount: 20, date: '2024-03-25', category: 'Food', description: 'Coffee' }
    ];

    it('should sort by date descending (default)', () => {
      const result = expenseManager.sort(expenses);

      expect(result[0].date).toBe('2024-03-25');
      expect(result[2].date).toBe('2024-03-15');
    });

    it('should sort by date ascending', () => {
      const result = expenseManager.sort(expenses, 'date', 'asc');

      expect(result[0].date).toBe('2024-03-15');
      expect(result[2].date).toBe('2024-03-25');
    });

    it('should sort by amount', () => {
      const result = expenseManager.sort(expenses, 'amount', 'asc');

      expect(result[0].amount).toBe(20);
      expect(result[2].amount).toBe(50);
    });

    it('should sort by category', () => {
      const result = expenseManager.sort(expenses, 'category', 'asc');

      expect(result[0].category).toBe('Food');
      expect(result[2].category).toBe('Transport');
    });

    it('should sort by description', () => {
      const result = expenseManager.sort(expenses, 'description', 'asc');

      expect(result[0].description).toBe('Coffee');
      expect(result[2].description).toBe('Taxi');
    });

    it('should not mutate original array', () => {
      const original = [...expenses];
      expenseManager.sort(expenses, 'amount', 'asc');

      expect(expenses).toEqual(original);
    });
  });
});
