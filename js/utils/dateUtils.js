// Date utility functions

// Format date to readable string
export function formatDate(date, format = 'short') {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
        return 'Invalid Date';
    }

    const options = {
        short: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    };

    return d.toLocaleDateString('en-US', options[format] || options.short);
}

// Format date to ISO string for input fields
export function formatDateForInput(date = new Date()) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get relative date string (today, yesterday, etc.)
export function getRelativeDate(date) {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const compareDate = new Date(d);
    compareDate.setHours(0, 0, 0, 0);
    
    const diffTime = today - compareDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === -1) return 'Tomorrow';
    if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
    
    return formatDate(date);
}

// Get month name
export function getMonthName(monthIndex, format = 'long') {
    const date = new Date(2000, monthIndex, 1);
    return date.toLocaleDateString('en-US', { month: format });
}

// Get date range for current month
export function getCurrentMonthRange() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
        start: formatDateForInput(firstDay),
        end: formatDateForInput(lastDay)
    };
}

// Get date range for last N days
export function getLastNDaysRange(days) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    return {
        start: formatDateForInput(start),
        end: formatDateForInput(end)
    };
}

// Get date range for a specific month
export function getMonthRange(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    return {
        start: formatDateForInput(firstDay),
        end: formatDateForInput(lastDay)
    };
}

// Calculate days between two dates
export function daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Group dates by month
export function groupByMonth(dates) {
    const groups = {};
    
    dates.forEach(dateStr => {
        const date = new Date(dateStr);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = `${getMonthName(date.getMonth(), 'short')} ${date.getFullYear()}`;
        
        if (!groups[key]) {
            groups[key] = {
                key,
                label,
                year: date.getFullYear(),
                month: date.getMonth(),
                dates: []
            };
        }
        
        groups[key].dates.push(dateStr);
    });
    
    return Object.values(groups);
}

// Check if date is today
export function isToday(date) {
    const d = new Date(date);
    const today = new Date();
    
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
}

// Check if date is in current month
export function isCurrentMonth(date) {
    const d = new Date(date);
    const now = new Date();
    
    return d.getMonth() === now.getMonth() &&
           d.getFullYear() === now.getFullYear();
}

// Get all months between two dates
export function getMonthsBetween(startDate, endDate) {
    const months = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);
    
    while (current <= last) {
        months.push({
            year: current.getFullYear(),
            month: current.getMonth(),
            label: `${getMonthName(current.getMonth(), 'short')} ${current.getFullYear()}`
        });
        current.setMonth(current.getMonth() + 1);
    }
    
    return months;
}

export default {
    formatDate,
    formatDateForInput,
    getRelativeDate,
    getMonthName,
    getCurrentMonthRange,
    getLastNDaysRange,
    getMonthRange,
    daysBetween,
    groupByMonth,
    isToday,
    isCurrentMonth,
    getMonthsBetween
};
