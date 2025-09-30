// ===================================
// EXPENSE TRACKER - CHARTS & ANALYTICS
// ===================================

// Chart instances storage
let chartInstances = {};

// Chart configuration
const chartColors = {
    primary: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    purple: '#8b5cf6',
    pink: '#ec4899',
    indigo: '#6366f1',
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
    orange: '#f97316',
    teal: '#14b8a6',
    cyan: '#06b6d4',
    light: '#f8fafc',
    dark: '#1e293b'
};

const chartPalette = [
    chartColors.primary,
    chartColors.success,
    chartColors.warning,
    chartColors.error,
    chartColors.purple,
    chartColors.pink,
    chartColors.orange,
    chartColors.teal,
    chartColors.cyan,
    chartColors.blue
];

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeCharts, 100); // Small delay to ensure other scripts are loaded
});

function initializeCharts() {
    createExpenseChart();
    createTrendsChart();
    createCategoryChart();
    createIncomeExpenseChart();
}

// === DASHBOARD CHARTS ===
function updateDashboardCharts() {
    updateExpenseChart();
    updateTrendsChart();
}

function createExpenseChart() {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (chartInstances.expenseChart) {
        chartInstances.expenseChart.destroy();
    }
    
    chartInstances.expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: chartPalette,
                borderWidth: 2,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg') || '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 11,
                            family: 'Inter, sans-serif'
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#1e293b'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

function createTrendsChart() {
    const ctx = document.getElementById('trendsChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (chartInstances.trendsChart) {
        chartInstances.trendsChart.destroy();
    }
    
    chartInstances.trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Income',
                data: [],
                borderColor: chartColors.success,
                backgroundColor: chartColors.success + '20',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }, {
                label: 'Expenses',
                data: [],
                borderColor: chartColors.error,
                backgroundColor: chartColors.error + '20',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 11,
                            family: 'Inter, sans-serif'
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#1e293b'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#64748b',
                        font: {
                            size: 10,
                            family: 'Inter, sans-serif'
                        }
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color') || '#e2e8f0'
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#64748b',
                        font: {
                            size: 10,
                            family: 'Inter, sans-serif'
                        }
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color') || '#e2e8f0'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// === ANALYTICS CHARTS ===
function createCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (chartInstances.categoryChart) {
        chartInstances.categoryChart.destroy();
    }
    
    chartInstances.categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Amount Spent',
                data: [],
                backgroundColor: chartPalette,
                borderColor: chartPalette,
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#64748b',
                        font: {
                            size: 10,
                            family: 'Inter, sans-serif'
                        }
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color') || '#e2e8f0'
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#64748b',
                        font: {
                            size: 10,
                            family: 'Inter, sans-serif'
                        },
                        maxRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function createIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (chartInstances.incomeExpenseChart) {
        chartInstances.incomeExpenseChart.destroy();
    }
    
    chartInstances.incomeExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Income',
                data: [],
                backgroundColor: chartColors.success,
                borderColor: chartColors.success,
                borderWidth: 1,
                borderRadius: 4
            }, {
                label: 'Expenses',
                data: [],
                backgroundColor: chartColors.error,
                borderColor: chartColors.error,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 11,
                            family: 'Inter, sans-serif'
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#1e293b'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#64748b',
                        font: {
                            size: 10,
                            family: 'Inter, sans-serif'
                        }
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color') || '#e2e8f0'
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#64748b',
                        font: {
                            size: 10,
                            family: 'Inter, sans-serif'
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// === DATA UPDATE FUNCTIONS ===
function updateExpenseChart() {
    if (!chartInstances.expenseChart) return;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Get current month's expense transactions
    const monthlyExpenses = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transaction.type === 'expense' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    // Calculate category totals
    const categoryTotals = {};
    monthlyExpenses.forEach(transaction => {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
    });
    
    // Sort categories by amount
    const sortedCategories = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10); // Top 10 categories
    
    const labels = sortedCategories.map(([category]) => category);
    const data = sortedCategories.map(([, amount]) => amount);
    
    chartInstances.expenseChart.data.labels = labels;
    chartInstances.expenseChart.data.datasets[0].data = data;
    chartInstances.expenseChart.update();
}

function updateTrendsChart() {
    if (!chartInstances.trendsChart) return;
    
    // Get last 7 days data
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last7Days.push(date);
    }
    
    const labels = last7Days.map(date => 
        date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    );
    
    const incomeData = [];
    const expenseData = [];
    
    last7Days.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTransactions = transactions.filter(transaction => 
            transaction.date === dateStr
        );
        
        const dayIncome = dayTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const dayExpenses = dayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        incomeData.push(dayIncome);
        expenseData.push(dayExpenses);
    });
    
    chartInstances.trendsChart.data.labels = labels;
    chartInstances.trendsChart.data.datasets[0].data = incomeData;
    chartInstances.trendsChart.data.datasets[1].data = expenseData;
    chartInstances.trendsChart.update();
}

function updateAnalytics() {
    updateCategoryChart();
    updateIncomeExpenseChart();
    updateAnalyticsInsights();
}

function updateCategoryChart() {
    if (!chartInstances.categoryChart) return;
    
    const dateRange = elements.analyticsDateRange?.value || 'month';
    const filteredTransactions = filterTransactionsByDateRange(transactions, dateRange);
    
    // Calculate category totals for expenses
    const categoryTotals = {};
    filteredTransactions
        .filter(t => t.type === 'expense')
        .forEach(transaction => {
            categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
        });
    
    // Sort and get top categories
    const sortedCategories = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    const labels = sortedCategories.map(([category]) => category);
    const data = sortedCategories.map(([, amount]) => amount);
    
    chartInstances.categoryChart.data.labels = labels;
    chartInstances.categoryChart.data.datasets[0].data = data;
    chartInstances.categoryChart.update();
}

function updateIncomeExpenseChart() {
    if (!chartInstances.incomeExpenseChart) return;
    
    const dateRange = elements.analyticsDateRange?.value || 'month';
    
    // Get data based on range
    let labels = [];
    let incomeData = [];
    let expenseData = [];
    
    if (dateRange === 'week') {
        // Last 7 days
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last7Days.push(date);
        }
        
        labels = last7Days.map(date => 
            date.toLocaleDateString('en-IN', { weekday: 'short' })
        );
        
        last7Days.forEach(date => {
            const dateStr = date.toISOString().split('T')[0];
            const dayTransactions = transactions.filter(t => t.date === dateStr);
            
            incomeData.push(dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0));
            expenseData.push(dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
        });
    } else if (dateRange === 'month') {
        // Last 30 days grouped by week
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        labels = weeks;
        
        const today = new Date();
        for (let week = 0; week < 4; week++) {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - ((3 - week) * 7 + 6));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            const weekTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate >= weekStart && tDate <= weekEnd;
            });
            
            incomeData.push(weekTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0));
            expenseData.push(weekTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
        }
    } else {
        // Last 12 months
        const months = [];
        const today = new Date();
        
        for (let i = 11; i >= 0; i--) {
            const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push(month);
        }
        
        labels = months.map(month => 
            month.toLocaleDateString('en-IN', { month: 'short' })
        );
        
        months.forEach(month => {
            const monthTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === month.getMonth() && 
                       tDate.getFullYear() === month.getFullYear();
            });
            
            incomeData.push(monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0));
            expenseData.push(monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
        });
    }
    
    chartInstances.incomeExpenseChart.data.labels = labels;
    chartInstances.incomeExpenseChart.data.datasets[0].data = incomeData;
    chartInstances.incomeExpenseChart.data.datasets[1].data = expenseData;
    chartInstances.incomeExpenseChart.update();
}

function updateAnalyticsInsights() {
    const dateRange = elements.analyticsDateRange?.value || 'month';
    const filteredTransactions = filterTransactionsByDateRange(transactions, dateRange);
    
    // Calculate insights
    const totals = calculateTotals(filteredTransactions);
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
    
    // Top spending category
    const categoryTotals = {};
    expenseTransactions.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    const topCategory = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)[0];
    
    // Average daily spending
    const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 365;
    const avgDaily = totals.expenses / days;
    
    // Update UI
    if (elements.topCategory) {
        elements.topCategory.textContent = topCategory ? topCategory[0] : 'N/A';
    }
    if (elements.avgDaily) {
        elements.avgDaily.textContent = formatCurrency(avgDaily);
    }
    if (elements.totalTransactions) {
        elements.totalTransactions.textContent = filteredTransactions.length.toString();
    }
}

function filterTransactionsByDateRange(transactions, range) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        
        switch(range) {
            case 'week':
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                return transactionDate >= weekAgo;
            case 'month':
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                return transactionDate >= monthAgo;
            case 'year':
                return transactionDate.getFullYear() === now.getFullYear();
            default:
                return true;
        }
    });
}

// Theme change handler
function updateChartsTheme() {
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#1e293b';
    const textSecondary = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#64748b';
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color') || '#e2e8f0';
    
    Object.values(chartInstances).forEach(chart => {
        if (chart && chart.options) {
            // Update legend colors
            if (chart.options.plugins?.legend?.labels) {
                chart.options.plugins.legend.labels.color = textColor;
            }
            
            // Update scale colors
            if (chart.options.scales) {
                Object.keys(chart.options.scales).forEach(scaleKey => {
                    const scale = chart.options.scales[scaleKey];
                    if (scale.ticks) {
                        scale.ticks.color = textSecondary;
                    }
                    if (scale.grid) {
                        scale.grid.color = borderColor;
                    }
                });
            }
            
            chart.update();
        }
    });
}

// Listen for theme changes
document.addEventListener('themeChanged', updateChartsTheme);

// Export functions for use in main script
window.chartFunctions = {
    updateDashboardCharts,
    updateAnalytics,
    updateChartsTheme
};