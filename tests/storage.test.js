import { describe, it, expect, beforeEach, vi } from 'vitest';
import storage from '../js/storage.js';

describe('StorageManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    storage.initializeDefaults();
  });

  describe('initialization', () => {
    it('should initialize with default keys', () => {
      expect(storage.keys).toBeDefined();
      expect(storage.keys.expenses).toBe('expense_tracker_expenses');
      expect(storage.keys.categories).toBe('expense_tracker_categories');
      expect(storage.keys.budgets).toBe('expense_tracker_budgets');
      expect(storage.keys.settings).toBe('expense_tracker_settings');
    });

    it('should initialize default data on first run', () => {
      const expenses = storage.getExpenses();
      const budgets = storage.getBudgets();
      const settings = storage.getSettings();

      expect(Array.isArray(expenses)).toBe(true);
      expect(expenses.length).toBe(0);
      expect(Array.isArray(budgets)).toBe(true);
      expect(budgets.length).toBe(0);
      expect(settings).toEqual({
        currency: 'USD',
        currencySymbol: '$'
      });
    });
  });

  describe('generic localStorage methods', () => {
    it('should set and get items from localStorage', () => {
      const testData = { test: 'value' };
      const success = storage.setItem('test_key', testData);
      
      expect(success).toBe(true);
      
      const retrieved = storage.getItem('test_key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const result = storage.getItem('non_existent');
      expect(result).toBeNull();
    });

    it('should remove items from localStorage', () => {
      storage.setItem('test_key', { test: 'value' });
      const removed = storage.removeItem('test_key');
      
      expect(removed).toBe(true);
      expect(storage.getItem('test_key')).toBeNull();
    });

    it('should handle JSON parse errors gracefully', () => {
      localStorage.setItem('bad_json', 'invalid{json');
      const result = storage.getItem('bad_json');
      expect(result).toBeNull();
    });
  });

  describe('expense CRUD operations', () => {
    it('should add a new expense', () => {
      const expenseData = {
        amount: 50.00,
        date: '2024-03-15',
        category: 'Food',
        description: 'Lunch'
      };

      const saved = storage.addExpense(expenseData);
      
      expect(saved).toBeDefined();
      expect(saved.id).toBeDefined();
      expect(saved.createdAt).toBeDefined();
      expect(saved.amount).toBe(50.00);
      expect(saved.category).toBe('Food');
    });

    it('should retrieve all expenses', () => {
      storage.addExpense({
        amount: 50.00,
        date: '2024-03-15',
        category: 'Food',
        description: 'Lunch'
      });
      
      storage.addExpense({
        amount: 30.00,
        date: '2024-03-16',
        category: 'Transport',
        description: 'Taxi'
      });

      const expenses = storage.getExpenses();
      expect(expenses.length).toBe(2);
    });

    it('should retrieve expense by ID', () => {
      const saved = storage.addExpense({
        amount: 50.00,
        date: '2024-03-15',
        category: 'Food',
        description: 'Lunch'
      });

      const retrieved = storage.getExpenseById(saved.id);
      expect(retrieved).toEqual(saved);
    });

    it('should update an existing expense', () => {
      const saved = storage.addExpense({
        amount: 50.00,
        date: '2024-03-15',
        category: 'Food',
        description: 'Lunch'
      });

      const updated = storage.updateExpense(saved.id, {
        amount: 60.00,
        description: 'Dinner'
      });

      expect(updated).toBe(true);
      
      const retrieved = storage.getExpenseById(saved.id);
      expect(retrieved.amount).toBe(60.00);
      expect(retrieved.description).toBe('Dinner');
      expect(retrieved.id).toBe(saved.id);
    });

    it('should delete an expense', () => {
      const saved = storage.addExpense({
        amount: 50.00,
        date: '2024-03-15',
        category: 'Food',
        description: 'Lunch'
      });

      const deleted = storage.deleteExpense(saved.id);
      expect(deleted).toBe(true);
      
      const retrieved = storage.getExpenseById(saved.id);
      expect(retrieved).toBeNull();
    });

    it('should generate unique IDs', () => {
      const id1 = storage.generateId();
      const id2 = storage.generateId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });
  });

  describe('category CRUD operations', () => {
    it('should add a new category', () => {
      const categoryData = {
        name: 'Custom',
        icon: '🎨',
        color: '#FF0000'
      };

      const saved = storage.addCategory(categoryData);
      
      expect(saved).toBeDefined();
      expect(saved.id).toBeDefined();
      expect(saved.name).toBe('Custom');
    });

    it('should retrieve all categories', () => {
      storage.addCategory({ name: 'Cat1', icon: '📝', color: '#000' });
      storage.addCategory({ name: 'Cat2', icon: '📝', color: '#000' });

      const categories = storage.getCategories();
      expect(categories.length).toBe(2);
    });

    it('should delete a category', () => {
      const saved = storage.addCategory({ 
        name: 'Custom', 
        icon: '🎨', 
        color: '#FF0000' 
      });

      const deleted = storage.deleteCategory(saved.id);
      expect(deleted).toBe(true);
      
      const categories = storage.getCategories();
      expect(categories.find(c => c.id === saved.id)).toBeUndefined();
    });
  });

  describe('budget CRUD operations', () => {
    it('should add a new budget', () => {
      const budgetData = {
        category: 'Food',
        amount: 500,
        month: 2,
        year: 2024
      };

      const saved = storage.addBudget(budgetData);
      
      expect(saved).toBeDefined();
      expect(saved.id).toBeDefined();
      expect(saved.amount).toBe(500);
    });

    it('should update existing budget for same category', () => {
      const budget1 = storage.addBudget({
        category: 'Food',
        amount: 500,
        month: 2,
        year: 2024
      });

      const budget2 = storage.addBudget({
        category: 'Food',
        amount: 600,
        month: 2,
        year: 2024
      });

      const budgets = storage.getBudgets();
      expect(budgets.length).toBe(1);
      expect(budgets[0].amount).toBe(600);
      expect(budgets[0].id).toBe(budget1.id);
    });

    it('should retrieve budget by category', () => {
      storage.addBudget({
        category: 'Food',
        amount: 500,
        month: 2,
        year: 2024
      });

      const budget = storage.getBudgetByCategory('Food');
      expect(budget).toBeDefined();
      expect(budget.category).toBe('Food');
    });

    it('should delete a budget', () => {
      const saved = storage.addBudget({
        category: 'Food',
        amount: 500,
        month: 2,
        year: 2024
      });

      const deleted = storage.deleteBudget(saved.id);
      expect(deleted).toBe(true);
      
      const budgets = storage.getBudgets();
      expect(budgets.length).toBe(0);
    });
  });

  describe('settings management', () => {
    it('should get default settings', () => {
      const settings = storage.getSettings();
      expect(settings).toEqual({
        currency: 'USD',
        currencySymbol: '$'
      });
    });

    it('should update settings', () => {
      const updated = storage.updateSettings({
        currency: 'EUR',
        currencySymbol: '€'
      });

      expect(updated).toBe(true);
      
      const settings = storage.getSettings();
      expect(settings.currency).toBe('EUR');
      expect(settings.currencySymbol).toBe('€');
    });

    it('should merge settings when updating', () => {
      storage.updateSettings({ newSetting: 'test' });
      
      const settings = storage.getSettings();
      expect(settings.currency).toBe('USD');
      expect(settings.newSetting).toBe('test');
    });
  });

  describe('filtering and aggregation', () => {
    beforeEach(() => {
      // Add test expenses
      storage.addExpense({
        amount: 50.00,
        date: '2024-03-15',
        category: 'Food',
        description: 'Lunch at restaurant',
        notes: 'With friends'
      });
      
      storage.addExpense({
        amount: 30.00,
        date: '2024-03-20',
        category: 'Transport',
        description: 'Taxi ride',
        notes: ''
      });
      
      storage.addExpense({
        amount: 100.00,
        date: '2024-02-10',
        category: 'Food',
        description: 'Grocery shopping',
        notes: ''
      });
    });

    it('should filter expenses by date range', () => {
      const filtered = storage.filterExpenses({
        dateFrom: '2024-03-01',
        dateTo: '2024-03-31'
      });

      expect(filtered.length).toBe(2);
    });

    it('should filter expenses by category', () => {
      const filtered = storage.filterExpenses({
        category: 'Food'
      });

      expect(filtered.length).toBe(2);
    });

    it('should filter expenses by search term', () => {
      const filtered = storage.filterExpenses({
        search: 'restaurant'
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].description).toContain('restaurant');
    });

    it('should filter expenses by amount range', () => {
      const filtered = storage.filterExpenses({
        minAmount: 40,
        maxAmount: 60
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].amount).toBe(50.00);
    });

    it('should combine multiple filters', () => {
      const filtered = storage.filterExpenses({
        category: 'Food',
        dateFrom: '2024-03-01',
        minAmount: 40
      });

      expect(filtered.length).toBe(1);
    });

    it('should get expenses by month', () => {
      const expenses = storage.getExpensesByMonth(2024, 2); // March (0-indexed)
      expect(expenses.length).toBe(2);
    });

    it('should calculate total by category', () => {
      const totals = storage.getTotalByCategory();
      
      expect(totals.Food).toBe(150.00);
      expect(totals.Transport).toBe(30.00);
    });

    it('should calculate total amount', () => {
      const total = storage.getTotalAmount();
      expect(total).toBe(180.00);
    });

    it('should calculate totals for filtered expenses', () => {
      const expenses = storage.filterExpenses({ category: 'Food' });
      const total = storage.getTotalAmount(expenses);
      
      expect(total).toBe(150.00);
    });
  });

  describe('data management', () => {
    beforeEach(() => {
      storage.addExpense({
        amount: 50.00,
        date: '2024-03-15',
        category: 'Food',
        description: 'Lunch'
      });
      
      storage.addCategory({ name: 'Custom', icon: '🎨', color: '#FF0000' });
      storage.addBudget({ category: 'Food', amount: 500, month: 2, year: 2024 });
      storage.updateSettings({ theme: 'dark' });
    });

    it('should export all data', () => {
      const exported = storage.exportData();
      
      expect(exported.expenses).toBeDefined();
      expect(exported.categories).toBeDefined();
      expect(exported.budgets).toBeDefined();
      expect(exported.settings).toBeDefined();
      expect(exported.exportDate).toBeDefined();
      
      expect(exported.expenses.length).toBe(1);
      expect(exported.categories.length).toBe(1);
      expect(exported.budgets.length).toBe(1);
    });

    it('should import data', () => {
      const data = {
        expenses: [{ amount: 100, date: '2024-03-20', category: 'Test', description: 'Test' }],
        categories: [{ name: 'Imported', icon: '📥', color: '#000' }],
        budgets: [{ category: 'Test', amount: 200, month: 3, year: 2024 }],
        settings: { currency: 'EUR' }
      };

      const success = storage.importData(data);
      expect(success).toBe(true);
      
      const expenses = storage.getExpenses();
      const categories = storage.getCategories();
      const budgets = storage.getBudgets();
      const settings = storage.getSettings();
      
      expect(expenses[0].description).toBe('Test');
      expect(categories[0].name).toBe('Imported');
      expect(budgets[0].category).toBe('Test');
      expect(settings.currency).toBe('EUR');
    });

    it('should clear all data', () => {
      storage.clearAllData();
      
      const expenses = storage.getExpenses();
      const budgets = storage.getBudgets();
      const categories = storage.getCategories();
      const settings = storage.getSettings();
      
      expect(expenses.length).toBe(0);
      expect(budgets.length).toBe(0);
      expect(categories.length).toBe(0);
      expect(settings).toEqual({ currency: 'USD', currencySymbol: '$' });
    });

    it('should get storage info', () => {
      const info = storage.getStorageInfo();
      
      expect(info.usedBytes).toBeGreaterThan(0);
      expect(info.usedKB).toBeDefined();
      expect(info.usedMB).toBeDefined();
    });
  });
});
