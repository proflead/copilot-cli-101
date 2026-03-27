import storage from './storage.js';

// Default categories with icons and colors
const DEFAULT_CATEGORIES = [
    { name: 'Food', icon: '🍔', color: '#FF6384' },
    { name: 'Transport', icon: '🚗', color: '#36A2EB' },
    { name: 'Entertainment', icon: '🎬', color: '#FFCE56' },
    { name: 'Utilities', icon: '💡', color: '#4BC0C0' },
    { name: 'Healthcare', icon: '⚕️', color: '#9966FF' },
    { name: 'Shopping', icon: '🛍️', color: '#FF9F40' },
    { name: 'Education', icon: '📚', color: '#FF6384' },
    { name: 'Other', icon: '📝', color: '#C9CBCF' }
];

// Category class
class Category {
    constructor(data) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.icon = data.icon || '📝';
        this.color = data.color || '#C9CBCF';
        this.isDefault = data.isDefault || false;
    }

    validate() {
        const errors = [];

        if (!this.name || this.name.trim() === '') {
            errors.push('Category name is required');
        }

        if (this.name.length > 50) {
            errors.push('Category name must be less than 50 characters');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            icon: this.icon,
            color: this.color,
            isDefault: this.isDefault
        };
    }
}

// CategoryManager handles all category operations
class CategoryManager {
    constructor() {
        this.storage = storage;
        this.initializeDefaultCategories();
    }

    // Initialize default categories if they don't exist
    initializeDefaultCategories() {
        const existing = this.storage.getCategories();
        
        if (existing.length === 0) {
            DEFAULT_CATEGORIES.forEach(cat => {
                const category = new Category({ ...cat, isDefault: true });
                this.storage.addCategory(category.toJSON());
            });
        }
    }

    // Get all categories
    getAll() {
        return this.storage.getCategories();
    }

    // Get default categories
    getDefaults() {
        return DEFAULT_CATEGORIES.map(cat => new Category({ ...cat, isDefault: true }).toJSON());
    }

    // Get category by name
    getByName(name) {
        const categories = this.getAll();
        return categories.find(cat => cat.name === name) || null;
    }

    // Add a new custom category
    add(categoryData) {
        const category = new Category(categoryData);
        const validation = category.validate();

        if (!validation.isValid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        // Check for duplicate names
        const existing = this.getByName(category.name);
        if (existing) {
            return {
                success: false,
                errors: ['A category with this name already exists']
            };
        }

        const saved = this.storage.addCategory(category.toJSON());
        
        return {
            success: !!saved,
            data: saved,
            errors: saved ? [] : ['Failed to save category']
        };
    }

    // Delete a custom category (cannot delete default categories)
    delete(id) {
        const categories = this.getAll();
        const category = categories.find(c => c.id === id);

        if (!category) {
            return {
                success: false,
                errors: ['Category not found']
            };
        }

        if (category.isDefault) {
            return {
                success: false,
                errors: ['Cannot delete default categories']
            };
        }

        const deleted = this.storage.deleteCategory(id);
        
        return {
            success: deleted,
            errors: deleted ? [] : ['Failed to delete category']
        };
    }

    // Get category color by name
    getColorByName(name) {
        const category = this.getByName(name);
        return category ? category.color : '#C9CBCF';
    }

    // Get category icon by name
    getIconByName(name) {
        const category = this.getByName(name);
        return category ? category.icon : '📝';
    }

    // Get categories as options for select dropdown
    getAsOptions() {
        return this.getAll().map(cat => ({
            value: cat.name,
            label: `${cat.icon} ${cat.name}`,
            color: cat.color
        }));
    }
}

// Create and export singleton instance
const categoryManager = new CategoryManager();
export default categoryManager;
export { Category, CategoryManager, DEFAULT_CATEGORIES };
