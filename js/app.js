import expenseManager from './expense.js';
import categoryManager from './category.js';
import budgetManager from './budget.js';
import notifications from './notifications.js';
import dateUtils from './utils/dateUtils.js';

// Main Application Class
class ExpenseTrackerApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentExpenseId = null;
        this.charts = {};
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.setupNavigation();
        this.setupExpenseForm();
        this.setupBudgetForm();
        this.setupFilters();
        this.setupExport();
        this.populateCategoryDropdowns();
        this.render();
        
        // Check for budget alerts on load
        this.checkBudgetAlerts();
    }

    // Navigation
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                this.switchSection(section);
            });
        });
    }

    switchSection(section) {
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === section);
        });

        // Update active section
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.toggle('active', sec.id === section);
        });

        this.currentSection = section;
        this.renderCurrentSection();
    }

    renderCurrentSection() {
        switch (this.currentSection) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'expenses':
                this.renderExpenseList();
                break;
            case 'budget':
                this.renderBudgetList();
                break;
            case 'reports':
                this.renderReports();
                break;
        }
    }

    // Expense Form
    setupExpenseForm() {
        const form = document.getElementById('expense-form');
        const addBtn = document.getElementById('add-expense-btn');
        const cancelBtn = document.getElementById('cancel-form-btn');
        const formContainer = document.getElementById('expense-form-container');

        // Set today's date as default
        document.getElementById('expense-date').value = dateUtils.formatDateForInput();

        addBtn.addEventListener('click', () => {
            this.showExpenseForm();
        });

        cancelBtn.addEventListener('click', () => {
            this.hideExpenseForm();
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveExpense();
        });
    }

    showExpenseForm(expense = null) {
        const formContainer = document.getElementById('expense-form-container');
        const formTitle = document.getElementById('form-title');
        const form = document.getElementById('expense-form');

        if (expense) {
            // Edit mode
            formTitle.textContent = 'Edit Expense';
            document.getElementById('expense-id').value = expense.id;
            document.getElementById('expense-amount').value = expense.amount;
            document.getElementById('expense-date').value = expense.date;
            document.getElementById('expense-category').value = expense.category;
            document.getElementById('expense-description').value = expense.description;
            document.getElementById('expense-notes').value = expense.notes || '';
            this.currentExpenseId = expense.id;
        } else {
            // Add mode
            formTitle.textContent = 'Add New Expense';
            form.reset();
            document.getElementById('expense-date').value = dateUtils.formatDateForInput();
            this.currentExpenseId = null;
        }

        formContainer.classList.remove('hidden');
        document.getElementById('expense-amount').focus();
    }

    hideExpenseForm() {
        const formContainer = document.getElementById('expense-form-container');
        const form = document.getElementById('expense-form');
        formContainer.classList.add('hidden');
        form.reset();
        this.currentExpenseId = null;
    }

    saveExpense() {
        const expenseData = {
            amount: document.getElementById('expense-amount').value,
            date: document.getElementById('expense-date').value,
            category: document.getElementById('expense-category').value,
            description: document.getElementById('expense-description').value,
            notes: document.getElementById('expense-notes').value
        };

        let result;
        if (this.currentExpenseId) {
            result = expenseManager.update(this.currentExpenseId, expenseData);
        } else {
            result = expenseManager.add(expenseData);
        }

        if (result.success) {
            notifications.success(
                this.currentExpenseId ? 'Expense updated successfully!' : 'Expense added successfully!'
            );
            this.hideExpenseForm();
            this.render();
            this.checkBudgetAlerts();
        } else {
            notifications.error(result.errors.join(', '));
        }
    }

    deleteExpense(id) {
        if (!confirm('Are you sure you want to delete this expense?')) {
            return;
        }

        const result = expenseManager.delete(id);
        if (result.success) {
            notifications.success('Expense deleted successfully!');
            this.render();
        } else {
            notifications.error('Failed to delete expense');
        }
    }

    // Budget Form
    setupBudgetForm() {
        const form = document.getElementById('budget-form');
        const addBtn = document.getElementById('add-budget-btn');
        const cancelBtn = document.getElementById('cancel-budget-btn');
        const formContainer = document.getElementById('budget-form-container');

        addBtn.addEventListener('click', () => {
            formContainer.classList.remove('hidden');
            document.getElementById('budget-amount').focus();
        });

        cancelBtn.addEventListener('click', () => {
            formContainer.classList.add('hidden');
            form.reset();
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBudget();
        });
    }

    saveBudget() {
        const budgetData = {
            category: document.getElementById('budget-category').value,
            amount: document.getElementById('budget-amount').value,
            month: new Date().getMonth(),
            year: new Date().getFullYear()
        };

        const result = budgetManager.set(budgetData);
        
        if (result.success) {
            notifications.success('Budget saved successfully!');
            document.getElementById('budget-form-container').classList.add('hidden');
            document.getElementById('budget-form').reset();
            this.renderBudgetList();
            this.renderDashboard();
        } else {
            notifications.error(result.errors.join(', '));
        }
    }

    deleteBudget(id) {
        if (!confirm('Are you sure you want to delete this budget?')) {
            return;
        }

        const result = budgetManager.delete(id);
        if (result.success) {
            notifications.success('Budget deleted successfully!');
            this.renderBudgetList();
            this.renderDashboard();
        } else {
            notifications.error('Failed to delete budget');
        }
    }

    // Filters
    setupFilters() {
        const searchInput = document.getElementById('search-input');
        const filterCategory = document.getElementById('filter-category');
        const filterDateFrom = document.getElementById('filter-date-from');
        const filterDateTo = document.getElementById('filter-date-to');
        const clearBtn = document.getElementById('clear-filters-btn');

        [searchInput, filterCategory, filterDateFrom, filterDateTo].forEach(input => {
            input.addEventListener('change', () => this.renderExpenseList());
            input.addEventListener('input', () => {
                if (input === searchInput) {
                    this.renderExpenseList();
                }
            });
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            filterCategory.value = '';
            filterDateFrom.value = '';
            filterDateTo.value = '';
            this.renderExpenseList();
        });
    }

    getActiveFilters() {
        return {
            search: document.getElementById('search-input').value,
            category: document.getElementById('filter-category').value,
            dateFrom: document.getElementById('filter-date-from').value,
            dateTo: document.getElementById('filter-date-to').value
        };
    }

    // Export
    setupExport() {
        document.getElementById('export-csv-btn').addEventListener('click', () => {
            this.exportToCSV();
        });

        document.getElementById('export-json-btn').addEventListener('click', () => {
            this.exportToJSON();
        });
    }

    exportToCSV() {
        const filters = this.getActiveFilters();
        const expenses = expenseManager.filter(filters);

        if (expenses.length === 0) {
            notifications.warning('No expenses to export');
            return;
        }

        const headers = ['Date', 'Category', 'Description', 'Amount', 'Notes'];
        const rows = expenses.map(e => [
            e.date,
            e.category,
            e.description,
            e.amount,
            e.notes || ''
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        this.downloadFile(csv, 'expenses.csv', 'text/csv');
        notifications.success('Expenses exported to CSV!');
    }

    exportToJSON() {
        const filters = this.getActiveFilters();
        const expenses = expenseManager.filter(filters);

        if (expenses.length === 0) {
            notifications.warning('No expenses to export');
            return;
        }

        const json = JSON.stringify(expenses, null, 2);
        this.downloadFile(json, 'expenses.json', 'application/json');
        notifications.success('Expenses exported to JSON!');
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Populate dropdowns
    populateCategoryDropdowns() {
        const categories = categoryManager.getAll();
        const dropdowns = [
            document.getElementById('expense-category'),
            document.getElementById('filter-category'),
            document.getElementById('budget-category')
        ];

        dropdowns.forEach((dropdown, index) => {
            // Clear existing options except the first one
            while (dropdown.options.length > 1) {
                dropdown.remove(1);
            }

            // Add overall option for budget dropdown only
            if (index === 2) {
                const overallOption = document.createElement('option');
                overallOption.value = 'overall';
                overallOption.textContent = '📊 Overall Budget';
                dropdown.appendChild(overallOption);
            }

            // Add category options
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.name;
                option.textContent = `${cat.icon} ${cat.name}`;
                dropdown.appendChild(option);
            });
        });
    }

    // Rendering methods
    render() {
        this.renderCurrentSection();
    }

    renderDashboard() {
        const expenses = expenseManager.getCurrentMonth();
        const stats = expenseManager.getStatistics(expenses);
        
        // Update stat cards
        const settings = { currencySymbol: '$' };
        document.getElementById('total-expenses').textContent = 
            `${settings.currencySymbol}${stats.total.toFixed(2)}`;
        document.getElementById('total-transactions').textContent = stats.count;
        document.getElementById('daily-average').textContent = 
            `${settings.currencySymbol}${stats.dailyAverage.toFixed(2)}`;

        // Budget status
        const budgetSummary = budgetManager.getOverallSummary();
        if (budgetSummary) {
            const remaining = budgetSummary.totalRemaining;
            document.getElementById('budget-status').textContent = 
                remaining >= 0 
                    ? `${settings.currencySymbol}${remaining.toFixed(2)} left` 
                    : `${settings.currencySymbol}${Math.abs(remaining).toFixed(2)} over`;
        } else {
            document.getElementById('budget-status').textContent = 'No budget';
        }

        this.renderDashboardCharts(expenses);
    }

    renderDashboardCharts(expenses) {
        // Category pie chart
        this.renderCategoryChart('category-chart', expenses);
        
        // Trend line chart
        this.renderTrendChart('trend-chart', expenses);
    }

    renderCategoryChart(canvasId, expenses) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const byCategory = expenseManager.getSpendingByCategory(expenses);

        // Destroy existing chart
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        if (Object.keys(byCategory).length === 0) {
            return;
        }

        const categories = categoryManager.getAll();
        const labels = Object.keys(byCategory);
        const data = Object.values(byCategory);
        const colors = labels.map(cat => {
            const category = categories.find(c => c.name === cat);
            return category ? category.color : '#C9CBCF';
        });

        this.charts[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderTrendChart(canvasId, expenses) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        if (expenses.length === 0) {
            return;
        }

        // Group by date
        const byDate = {};
        expenses.forEach(exp => {
            if (!byDate[exp.date]) {
                byDate[exp.date] = 0;
            }
            byDate[exp.date] += parseFloat(exp.amount);
        });

        const sortedDates = Object.keys(byDate).sort();
        const labels = sortedDates.map(date => dateUtils.formatDate(date, 'short'));
        const data = sortedDates.map(date => byDate[date]);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Daily Spending',
                    data,
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderExpenseList() {
        const filters = this.getActiveFilters();
        const expenses = expenseManager.filter(filters);
        const sorted = expenseManager.sort(expenses, 'date', 'desc');
        
        const tbody = document.getElementById('expense-list');
        const settings = { currencySymbol: '$' };

        if (sorted.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="5">No expenses found.</td></tr>';
            return;
        }

        tbody.innerHTML = sorted.map(expense => {
            const category = categoryManager.getByName(expense.category);
            const icon = category ? category.icon : '📝';
            
            return `
                <tr>
                    <td>${dateUtils.formatDate(expense.date)}</td>
                    <td>${icon} ${expense.category}</td>
                    <td>${expense.description}</td>
                    <td>${settings.currencySymbol}${parseFloat(expense.amount).toFixed(2)}</td>
                    <td>
                        <button class="btn-icon btn-edit" data-id="${expense.id}" title="Edit">✏️</button>
                        <button class="btn-icon btn-delete" data-id="${expense.id}" title="Delete">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners
        tbody.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const expense = expenseManager.getById(btn.dataset.id);
                this.showExpenseForm(expense);
            });
        });

        tbody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                this.deleteExpense(btn.dataset.id);
            });
        });
    }

    renderBudgetList() {
        const budgets = budgetManager.getAll();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);
        
        const container = document.getElementById('budget-list');
        const settings = { currencySymbol: '$' };

        if (monthBudgets.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No budgets set. Click "Set Budget" to create your first budget.</p></div>';
            return;
        }

        container.innerHTML = monthBudgets.map(budget => {
            const status = budgetManager.getBudgetStatus(budget.category);
            if (!status) return '';

            const category = budget.category === 'overall' ? 'Overall' : budget.category;
            const icon = budget.category === 'overall' ? '📊' : categoryManager.getIconByName(budget.category);

            return `
                <div class="budget-card">
                    <div class="budget-header">
                        <h3>${icon} ${category}</h3>
                        <button class="btn-icon btn-delete" data-id="${budget.id}" title="Delete">🗑️</button>
                    </div>
                    <div class="budget-amounts">
                        <div class="amount-item">
                            <span class="label">Budget:</span>
                            <span class="value">${settings.currencySymbol}${status.budget.toFixed(2)}</span>
                        </div>
                        <div class="amount-item">
                            <span class="label">Spent:</span>
                            <span class="value">${settings.currencySymbol}${status.spent.toFixed(2)}</span>
                        </div>
                        <div class="amount-item">
                            <span class="label">Remaining:</span>
                            <span class="value ${status.remaining < 0 ? 'negative' : ''}">${settings.currencySymbol}${status.remaining.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${status.status}" style="width: ${Math.min(status.percentage, 100)}%"></div>
                    </div>
                    <div class="budget-status">
                        <span class="status-badge ${status.status}">${status.percentage.toFixed(0)}% used</span>
                    </div>
                </div>
            `;
        }).join('');

        // Add delete event listeners
        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                this.deleteBudget(btn.dataset.id);
            });
        });
    }

    renderReports() {
        const reportBtn = document.getElementById('generate-report-btn');
        const dateFrom = document.getElementById('report-date-from');
        const dateTo = document.getElementById('report-date-to');

        // Set default date range (current month)
        const range = dateUtils.getCurrentMonthRange();
        if (!dateFrom.value) dateFrom.value = range.start;
        if (!dateTo.value) dateTo.value = range.end;

        reportBtn.onclick = () => {
            const expenses = expenseManager.filter({
                dateFrom: dateFrom.value,
                dateTo: dateTo.value
            });

            this.updateReportSummary(expenses, dateFrom.value, dateTo.value);
            this.renderCategoryChart('report-category-chart', expenses);
            this.renderMonthlyChart(expenses);
            this.renderCategoryBreakdown(expenses);
        };

        // Generate initial report
        reportBtn.click();
    }

    updateReportSummary(expenses, dateFrom, dateTo) {
        const stats = expenseManager.getStatistics(expenses);
        const settings = { currencySymbol: '$' };
        
        document.getElementById('report-total').textContent = `${settings.currencySymbol}${stats.total.toFixed(2)}`;
        document.getElementById('report-count').textContent = stats.count;
        document.getElementById('report-avg').textContent = `${settings.currencySymbol}${stats.dailyAverage.toFixed(2)}`;
    }

    renderMonthlyChart(expenses) {
        const canvas = document.getElementById('report-monthly-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts['report-monthly-chart']) {
            this.charts['report-monthly-chart'].destroy();
        }

        if (expenses.length === 0) return;

        // Group by month
        const byMonth = {};
        expenses.forEach(exp => {
            const date = new Date(exp.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = dateUtils.getMonthName(date.getMonth(), 'short') + ' ' + date.getFullYear();
            
            if (!byMonth[key]) {
                byMonth[key] = { label, total: 0 };
            }
            byMonth[key].total += parseFloat(exp.amount);
        });

        const sorted = Object.keys(byMonth).sort();
        const labels = sorted.map(key => byMonth[key].label);
        const data = sorted.map(key => byMonth[key].total);

        this.charts['report-monthly-chart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Monthly Spending',
                    data,
                    backgroundColor: '#36A2EB'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderCategoryBreakdown(expenses) {
        const byCategory = expenseManager.getSpendingByCategory(expenses);
        const total = expenseManager.getTotalSpending(expenses);
        const container = document.getElementById('category-breakdown-list');
        const settings = { currencySymbol: '$' };

        if (Object.keys(byCategory).length === 0) {
            container.innerHTML = '<p>No data available</p>';
            return;
        }

        const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

        container.innerHTML = sorted.map(([category, amount]) => {
            const percentage = (amount / total) * 100;
            const icon = categoryManager.getIconByName(category);
            const color = categoryManager.getColorByName(category);

            return `
                <div class="category-breakdown-item">
                    <div class="category-info">
                        <span class="category-name">${icon} ${category}</span>
                        <span class="category-amount">${settings.currencySymbol}${amount.toFixed(2)}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%; background-color: ${color}"></div>
                    </div>
                    <div class="category-percentage">${percentage.toFixed(1)}%</div>
                </div>
            `;
        }).join('');
    }

    checkBudgetAlerts() {
        const alerts = budgetManager.checkBudgetAlerts();
        alerts.forEach(alert => {
            if (alert.type === 'danger') {
                notifications.error(alert.message, 5000);
            } else if (alert.type === 'warning') {
                notifications.warning(alert.message, 5000);
            }
        });
    }
}

// Initialize the app
const app = new ExpenseTrackerApp();
export default app;
