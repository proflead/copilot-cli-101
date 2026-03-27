import { describe, it, expect, beforeEach, vi } from 'vitest';
import categoryManager, { Category, DEFAULT_CATEGORIES } from '../js/category.js';

// Mock storage
vi.mock('../js/storage.js', () => ({
  default: {
    getCategories: vi.fn(),
    addCategory: vi.fn(),
    deleteCategory: vi.fn()
  }
}));

import storage from '../js/storage.js';

describe('Category class', () => {
  it('should create category with provided data', () => {
    const data = {
      id: 'cat123',
      name: 'Custom Category',
      icon: '🎨',
      color: '#FF0000',
      isDefault: false
    };

    const category = new Category(data);

    expect(category.id).toBe('cat123');
    expect(category.name).toBe('Custom Category');
    expect(category.icon).toBe('🎨');
    expect(category.color).toBe('#FF0000');
    expect(category.isDefault).toBe(false);
  });

  it('should set defaults for missing fields', () => {
    const category = new Category({});

    expect(category.id).toBeNull();
    expect(category.name).toBe('');
    expect(category.icon).toBe('📝');
    expect(category.color).toBe('#C9CBCF');
    expect(category.isDefault).toBe(false);
  });

  describe('validation', () => {
    it('should validate a valid category', () => {
      const category = new Category({
        name: 'Custom Category',
        icon: '🎨',
        color: '#FF0000'
      });

      const result = category.validate();

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should fail validation without name', () => {
      const category = new Category({
        name: '',
        icon: '🎨',
        color: '#FF0000'
      });

      const result = category.validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Category name is required');
    });

    it('should fail validation with name too long', () => {
      const category = new Category({
        name: 'A'.repeat(51),
        icon: '🎨',
        color: '#FF0000'
      });

      const result = category.validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Category name must be less than 50 characters');
    });
  });

  describe('toJSON', () => {
    it('should convert category to JSON object', () => {
      const category = new Category({
        id: 'cat123',
        name: 'Custom',
        icon: '🎨',
        color: '#FF0000',
        isDefault: false
      });

      const json = category.toJSON();

      expect(json).toEqual({
        id: 'cat123',
        name: 'Custom',
        icon: '🎨',
        color: '#FF0000',
        isDefault: false
      });
    });
  });
});

describe('DEFAULT_CATEGORIES', () => {
  it('should have 8 default categories', () => {
    expect(DEFAULT_CATEGORIES.length).toBe(8);
  });

  it('should have required properties for each category', () => {
    DEFAULT_CATEGORIES.forEach(cat => {
      expect(cat.name).toBeDefined();
      expect(cat.icon).toBeDefined();
      expect(cat.color).toBeDefined();
    });
  });

  it('should include common categories', () => {
    const names = DEFAULT_CATEGORIES.map(c => c.name);
    
    expect(names).toContain('Food');
    expect(names).toContain('Transport');
    expect(names).toContain('Entertainment');
    expect(names).toContain('Utilities');
    expect(names).toContain('Healthcare');
    expect(names).toContain('Shopping');
    expect(names).toContain('Education');
    expect(names).toContain('Other');
  });
});

describe('CategoryManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize default categories when none exist', () => {
      storage.getCategories.mockReturnValue([]);
      
      // Create new instance to trigger initialization
      const manager = new (class extends categoryManager.constructor {})();
      
      expect(storage.addCategory).toHaveBeenCalledTimes(8);
    });

    it('should not initialize categories when they exist', () => {
      storage.getCategories.mockReturnValue([
        { name: 'Existing', icon: '📝', color: '#000', isDefault: true }
      ]);
      
      vi.clearAllMocks();
      
      // Create new instance
      new (class extends categoryManager.constructor {})();
      
      expect(storage.addCategory).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should retrieve all categories', () => {
      const categories = [
        { id: '1', name: 'Food', icon: '🍔', color: '#FF6384', isDefault: true },
        { id: '2', name: 'Custom', icon: '🎨', color: '#FF0000', isDefault: false }
      ];

      storage.getCategories.mockReturnValue(categories);

      const result = categoryManager.getAll();

      expect(result).toEqual(categories);
      expect(storage.getCategories).toHaveBeenCalled();
    });
  });

  describe('getDefaults', () => {
    it('should return default categories', () => {
      const defaults = categoryManager.getDefaults();

      expect(defaults.length).toBe(8);
      defaults.forEach(cat => {
        expect(cat.isDefault).toBe(true);
      });
    });
  });

  describe('getByName', () => {
    it('should retrieve category by name', () => {
      const categories = [
        { id: '1', name: 'Food', icon: '🍔', color: '#FF6384' },
        { id: '2', name: 'Transport', icon: '🚗', color: '#36A2EB' }
      ];

      storage.getCategories.mockReturnValue(categories);

      const result = categoryManager.getByName('Food');

      expect(result).toEqual(categories[0]);
    });

    it('should return null for non-existent category', () => {
      storage.getCategories.mockReturnValue([]);

      const result = categoryManager.getByName('NonExistent');

      expect(result).toBeNull();
    });
  });

  describe('add', () => {
    it('should add a valid category', () => {
      const categoryData = {
        name: 'Custom',
        icon: '🎨',
        color: '#FF0000'
      };

      const savedCategory = { ...categoryData, id: 'cat123', isDefault: false };
      
      storage.getCategories.mockReturnValue([]);
      storage.addCategory.mockReturnValue(savedCategory);

      const result = categoryManager.add(categoryData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(savedCategory);
      expect(result.errors.length).toBe(0);
    });

    it('should fail to add invalid category', () => {
      const categoryData = {
        name: '',
        icon: '🎨',
        color: '#FF0000'
      };

      const result = categoryManager.add(categoryData);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(storage.addCategory).not.toHaveBeenCalled();
    });

    it('should fail to add duplicate category name', () => {
      const categoryData = {
        name: 'Food',
        icon: '🎨',
        color: '#FF0000'
      };

      storage.getCategories.mockReturnValue([
        { id: '1', name: 'Food', icon: '🍔', color: '#FF6384' }
      ]);

      const result = categoryManager.add(categoryData);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('A category with this name already exists');
      expect(storage.addCategory).not.toHaveBeenCalled();
    });

    it('should return error when storage fails', () => {
      const categoryData = {
        name: 'Custom',
        icon: '🎨',
        color: '#FF0000'
      };

      storage.getCategories.mockReturnValue([]);
      storage.addCategory.mockReturnValue(null);

      const result = categoryManager.add(categoryData);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Failed to save category');
    });
  });

  describe('delete', () => {
    it('should delete a custom category', () => {
      const categories = [
        { id: 'cat123', name: 'Custom', icon: '🎨', color: '#FF0000', isDefault: false }
      ];

      storage.getCategories.mockReturnValue(categories);
      storage.deleteCategory.mockReturnValue(true);

      const result = categoryManager.delete('cat123');

      expect(result.success).toBe(true);
      expect(storage.deleteCategory).toHaveBeenCalledWith('cat123');
    });

    it('should not delete default category', () => {
      const categories = [
        { id: 'cat123', name: 'Food', icon: '🍔', color: '#FF6384', isDefault: true }
      ];

      storage.getCategories.mockReturnValue(categories);

      const result = categoryManager.delete('cat123');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Cannot delete default categories');
      expect(storage.deleteCategory).not.toHaveBeenCalled();
    });

    it('should return error when category not found', () => {
      storage.getCategories.mockReturnValue([]);

      const result = categoryManager.delete('nonexistent');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Category not found');
    });

    it('should return error when delete fails', () => {
      const categories = [
        { id: 'cat123', name: 'Custom', icon: '🎨', color: '#FF0000', isDefault: false }
      ];

      storage.getCategories.mockReturnValue(categories);
      storage.deleteCategory.mockReturnValue(false);

      const result = categoryManager.delete('cat123');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Failed to delete category');
    });
  });

  describe('getColorByName', () => {
    it('should retrieve category color by name', () => {
      const categories = [
        { id: '1', name: 'Food', icon: '🍔', color: '#FF6384' }
      ];

      storage.getCategories.mockReturnValue(categories);

      const color = categoryManager.getColorByName('Food');

      expect(color).toBe('#FF6384');
    });

    it('should return default color for non-existent category', () => {
      storage.getCategories.mockReturnValue([]);

      const color = categoryManager.getColorByName('NonExistent');

      expect(color).toBe('#C9CBCF');
    });
  });

  describe('getIconByName', () => {
    it('should retrieve category icon by name', () => {
      const categories = [
        { id: '1', name: 'Food', icon: '🍔', color: '#FF6384' }
      ];

      storage.getCategories.mockReturnValue(categories);

      const icon = categoryManager.getIconByName('Food');

      expect(icon).toBe('🍔');
    });

    it('should return default icon for non-existent category', () => {
      storage.getCategories.mockReturnValue([]);

      const icon = categoryManager.getIconByName('NonExistent');

      expect(icon).toBe('📝');
    });
  });

  describe('getAsOptions', () => {
    it('should format categories as select options', () => {
      const categories = [
        { id: '1', name: 'Food', icon: '🍔', color: '#FF6384' },
        { id: '2', name: 'Transport', icon: '🚗', color: '#36A2EB' }
      ];

      storage.getCategories.mockReturnValue(categories);

      const options = categoryManager.getAsOptions();

      expect(options.length).toBe(2);
      expect(options[0]).toEqual({
        value: 'Food',
        label: '🍔 Food',
        color: '#FF6384'
      });
      expect(options[1]).toEqual({
        value: 'Transport',
        label: '🚗 Transport',
        color: '#36A2EB'
      });
    });
  });
});
