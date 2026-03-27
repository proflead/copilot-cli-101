# 💰 Expense Tracker

A simple, powerful, and fully client-side expense tracking web application built with vanilla JavaScript, HTML, and CSS. Track your spending, manage budgets, and visualize your financial data with beautiful charts and reports.

![Expense Tracker](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## ✨ Features

- **💳 Expense Management**
  - Add, edit, and delete expenses with ease
  - Categorize expenses (Food, Transport, Entertainment, Healthcare, etc.)
  - Add detailed notes to each expense
  - Date validation (no future dates allowed)

- **🎯 Budget Management**
  - Set monthly budgets per category or overall
  - Visual progress bars showing budget usage
  - Real-time alerts when approaching or exceeding budgets
  - Track spending against budgets

- **📊 Dashboard**
  - Real-time statistics (total expenses, transactions, daily average)
  - Interactive pie chart showing expenses by category
  - Spending trend line chart
  - Budget status overview

- **🔍 Advanced Filtering & Search**
  - Filter by date range
  - Filter by category
  - Text search across descriptions and notes
  - Clear all filters with one click

- **📈 Reports & Analytics**
  - Custom date range reports
  - Category breakdown with percentages
  - Monthly comparison bar charts
  - Spending trends and patterns

- **💾 Data Export**
  - Export to CSV (for spreadsheets)
  - Export to JSON (for backup/migration)
  - Export filtered results

- **📱 Responsive Design**
  - Works seamlessly on desktop, tablet, and mobile
  - Touch-friendly interface
  - Optimized for all screen sizes

- **🔔 Smart Notifications**
  - Toast notifications for all actions
  - Budget alerts and warnings
  - Success/error feedback

- **💪 Privacy-First**
  - All data stored locally in your browser
  - No backend or server required
  - Your data never leaves your device

## 🚀 Quick Start

### Option 1: Open Directly
1. Download or clone this repository
2. Open `index.html` in your web browser
3. Start tracking your expenses!

### Option 2: Use a Local Server
```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx http-server -p 8080

# Then open http://localhost:8080 in your browser
```

## 📖 How to Use

### Adding an Expense
1. Navigate to the **Expenses** tab
2. Click the **+ Add Expense** button
3. Fill in the amount, date, category, and description
4. Optionally add notes
5. Click **Save Expense**

### Setting a Budget
1. Navigate to the **Budget** tab
2. Click **+ Set Budget**
3. Select a category (or "Overall Budget")
4. Enter the monthly budget amount
5. Click **Save Budget**

### Viewing Reports
1. Navigate to the **Reports** tab
2. Select a date range (defaults to current month)
3. Click **Generate Report**
4. View charts and category breakdowns

### Filtering Expenses
1. Go to the **Expenses** tab
2. Use the search box to find specific expenses
3. Filter by category using the dropdown
4. Set date ranges to narrow results
5. Click **Clear Filters** to reset

### Exporting Data
1. In the **Expenses** tab, apply any filters you want
2. Click **Export CSV** or **Export JSON**
3. The file will be downloaded to your device

## 🛠️ Technical Details

### Technologies Used
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)** - Modular architecture with ES6 modules
- **Chart.js** - Beautiful, responsive charts
- **localStorage API** - Client-side data persistence

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Data Storage
All data is stored in your browser's localStorage:
- **Storage capacity**: ~5-10MB (more than enough for years of expenses)
- **Persistence**: Data persists until you clear browser data
- **Privacy**: Data never leaves your device

### File Structure
```
expense-tracker/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styles
├── js/
│   ├── app.js              # Main application logic
│   ├── storage.js          # localStorage manager
│   ├── expense.js          # Expense management
│   ├── category.js         # Category management
│   ├── budget.js           # Budget management
│   ├── notifications.js    # Toast notifications
│   └── utils/
│       └── dateUtils.js    # Date utility functions
└── README.md               # This file
```

## 🎨 Customization

### Adding Custom Categories
Default categories are initialized automatically, but you can add more by modifying the `DEFAULT_CATEGORIES` array in `js/category.js`:

```javascript
const DEFAULT_CATEGORIES = [
    { name: 'Your Category', icon: '🎯', color: '#FF6384' },
    // ... add more categories
];
```

### Changing Colors
Modify CSS variables in `css/styles.css`:

```css
:root {
    --primary-color: #4CAF50;
    --secondary-color: #2196F3;
    /* ... modify other colors */
}
```

## 💡 Tips & Best Practices

1. **Regular Backups**: Export your data as JSON periodically for backup
2. **Set Budgets**: Create budgets to help manage spending
3. **Use Categories**: Properly categorize expenses for better insights
4. **Add Notes**: Use the notes field for additional context
5. **Check Reports**: Review monthly reports to understand spending patterns

## 🔒 Privacy & Security

- ✅ No data sent to any server
- ✅ No tracking or analytics
- ✅ No external dependencies (except Chart.js CDN)
- ✅ Works completely offline (after initial load)
- ✅ Your data is yours alone

## 🐛 Troubleshooting

### Data Not Saving
- Check if cookies/localStorage are enabled in your browser
- Ensure you're not in private/incognito mode
- Check available storage space

### Charts Not Showing
- Ensure you have an internet connection (for Chart.js CDN)
- Try refreshing the page
- Check browser console for errors

### Performance Issues
- If you have many expenses (1000+), consider archiving old data
- Export old data and clear it from the app
- Keep only recent expenses for better performance

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📧 Support

If you have questions or need help, please open an issue in the repository.

## 🌟 Future Enhancements

Potential features for future versions:
- Multiple currency support
- Recurring expenses
- Income tracking
- Category icons customization
- Dark mode
- Data import from CSV
- Cloud sync (optional)
- Mobile app version

## 📊 Screenshots

### Dashboard
The dashboard provides an at-a-glance view of your finances with real-time statistics and interactive charts.

### Expense Management
Easily add, edit, and delete expenses with a clean, intuitive interface.

### Budget Tracking
Set budgets and monitor your progress with visual indicators and alerts.

### Reports
Generate detailed reports with custom date ranges and beautiful visualizations.

---

**Made with ❤️ using vanilla JavaScript**

*No frameworks, no build tools, just clean code that works!*
