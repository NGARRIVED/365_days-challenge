// ===================================
// EXPENSE TRACKER - MAIN APPLICATION
// ===================================

// === GLOBAL VARIABLES ===
let transactions = [];
let categories = {
    expense: ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Groceries', 'Other'],
    income: ['Salary', 'Freelancing', 'Business', 'Investments', 'Gifts', 'Other']
};
let budgets = {};
let currentTheme = localStorage.getItem('expenseTrackerTheme') || 'light';
let currentPage = 'dashboard';
let charts = {};

// === DOM ELEMENTS ===
const elements = {
    // Navigation
    themeToggle: document.getElementById('themeToggle'),
    exportBtn: document.getElementById('exportBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    
    // Sidebar Navigation
    navLinks: document.querySelectorAll('.nav-link'),
    sidebarIncome: document.getElementById('sidebarIncome'),
    sidebarExpenses: document.getElementById('sidebarExpenses'),
    sidebarBalance: document.getElementById('sidebarBalance'),
    
    // Pages
    pages: document.querySelectorAll('.page'),
    
    // Dashboard Elements
    addTransactionBtn: document.getElementById('addTransactionBtn'),
    addTransactionBtn2: document.getElementById('addTransactionBtn2'),
    totalIncome: document.getElementById('totalIncome'),
    totalExpenses: document.getElementById('totalExpenses'),
    currentBalance: document.getElementById('currentBalance'),
    recentTransactionsList: document.getElementById('recentTransactionsList'),
    viewAllBtn: document.getElementById('viewAllBtn'),
    
    // Charts
    expenseChart: document.getElementById('expenseChart'),
    trendsChart: document.getElementById('trendsChart'),
    categoryChart: document.getElementById('categoryChart'),
    incomeExpenseChart: document.getElementById('incomeExpenseChart'),
    
    // Transactions Page
    dateFilter: document.getElementById('dateFilter'),
    categoryFilter: document.getElementById('categoryFilter'),
    typeFilter: document.getElementById('typeFilter'),
    searchFilter: document.getElementById('searchFilter'),
    transactionsTableBody: document.getElementById('transactionsTableBody'),
    transactionsPagination: document.getElementById('transactionsPagination'),
    
    // Analytics
    analyticsDateRange: document.getElementById('analyticsDateRange'),
    topCategory: document.getElementById('topCategory'),
    avgDaily: document.getElementById('avgDaily'),
    totalTransactions: document.getElementById('totalTransactions'),
    
    // Budgets
    addBudgetBtn: document.getElementById('addBudgetBtn'),
    budgetsContainer: document.getElementById('budgetsContainer'),
    
    // Modals
    transactionModal: document.getElementById('transactionModal'),
    budgetModal: document.getElementById('budgetModal'),
    settingsModal: document.getElementById('settingsModal'),
    
    // Transaction Form
    transactionForm: document.getElementById('transactionForm'),
    transactionType: document.getElementById('transactionType'),
    transactionAmount: document.getElementById('transactionAmount'),
    transactionCategory: document.getElementById('transactionCategory'),
    transactionDescription: document.getElementById('transactionDescription'),
    transactionDate: document.getElementById('transactionDate'),
    closeTransactionModal: document.getElementById('closeTransactionModal'),
    cancelTransaction: document.getElementById('cancelTransaction'),
    
    // Budget Form
    budgetForm: document.getElementById('budgetForm'),
    budgetCategory: document.getElementById('budgetCategory'),
    budgetAmount: document.getElementById('budgetAmount'),
    closeBudgetModal: document.getElementById('closeBudgetModal'),
    cancelBudget: document.getElementById('cancelBudget'),
    
    // Settings
    closeSettingsModal: document.getElementById('closeSettingsModal'),
    categoriesList: document.getElementById('categoriesList'),
    newCategoryName: document.getElementById('newCategoryName'),
    newCategoryType: document.getElementById('newCategoryType'),
    addCategoryBtn: document.getElementById('addCategoryBtn'),
    exportDataBtn: document.getElementById('exportDataBtn'),
    importDataBtn: document.getElementById('importDataBtn'),
    clearDataBtn: document.getElementById('clearDataBtn'),
    fileInput: document.getElementById('fileInput'),
    
    // Notification
    notification: document.getElementById('notification'),
    notificationMessage: document.getElementById('notificationMessage'),
    notificationClose: document.getElementById('notificationClose')
};

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load data from database/localStorage
    loadData().then(() => {
        // Set initial theme
        setTheme(currentTheme);
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize current date in transaction form
        elements.transactionDate.value = new Date().toISOString().split('T')[0];
        
        // Update UI
        updateDashboard();
        updateSidebarStats();
        populateCategorySelects();
        
        // Show dashboard by default
        showPage('dashboard');
        
        console.log('Expense Tracker initialized successfully!');
    }).catch(error => {
        console.error('Error initializing app:', error);
        
        // Fallback initialization
        setTheme(currentTheme);
        setupEventListeners();
        elements.transactionDate.value = new Date().toISOString().split('T')[0];
        updateDashboard();
        updateSidebarStats();
        populateCategorySelects();
        showPage('dashboard');
        
        showNotification('App initialized with limited functionality', 'warning');
    });
}

// === EVENT LISTENERS ===
function setupEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const page = this.dataset.page;
            showPage(page);
        });
    });
    
    // Dashboard
    elements.addTransactionBtn.addEventListener('click', () => showModal('transaction'));
    elements.addTransactionBtn2.addEventListener('click', () => showModal('transaction'));
    elements.viewAllBtn.addEventListener('click', () => showPage('transactions'));
    
    // Transaction Modal
    elements.closeTransactionModal.addEventListener('click', () => hideModal('transaction'));
    elements.cancelTransaction.addEventListener('click', () => hideModal('transaction'));
    elements.transactionForm.addEventListener('submit', handleTransactionSubmit);
    elements.transactionType.addEventListener('change', updateCategoryOptions);
    
    // Budget Modal
    elements.addBudgetBtn.addEventListener('click', () => showModal('budget'));
    elements.closeBudgetModal.addEventListener('click', () => hideModal('budget'));
    elements.cancelBudget.addEventListener('click', () => hideModal('budget'));
    elements.budgetForm.addEventListener('submit', handleBudgetSubmit);
    
    // Settings Modal
    elements.settingsBtn.addEventListener('click', () => showModal('settings'));
    elements.closeSettingsModal.addEventListener('click', () => hideModal('settings'));
    elements.addCategoryBtn.addEventListener('click', addCategory);
    elements.exportDataBtn.addEventListener('click', exportData);
    elements.importDataBtn.addEventListener('click', () => elements.fileInput.click());
    elements.clearDataBtn.addEventListener('click', clearAllData);
    elements.fileInput.addEventListener('change', importData);
    
    // Filters
    elements.dateFilter.addEventListener('change', applyFilters);
    elements.categoryFilter.addEventListener('change', applyFilters);
    elements.typeFilter.addEventListener('change', applyFilters);
    elements.searchFilter.addEventListener('input', debounce(applyFilters, 300));
    
    // Analytics
    elements.analyticsDateRange.addEventListener('change', updateAnalytics);
    
    // Notification
    elements.notificationClose.addEventListener('click', hideNotification);
    
    // Export
    elements.exportBtn.addEventListener('click', exportData);
    
    // Close modals on backdrop click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            const modalId = e.target.id.replace('Modal', '');
            hideModal(modalId);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// === THEME MANAGEMENT ===
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(currentTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    localStorage.setItem('expenseTrackerTheme', theme);
    
    // Update theme toggle icon
    const themeIcon = elements.themeToggle.querySelector('i');
    themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    
    // Notify charts of theme change
    if (window.chartFunctions) {
        setTimeout(() => window.chartFunctions.updateChartsTheme(), 100);
    }
    
    showNotification(`Switched to ${theme} theme`);
}

// === PAGE NAVIGATION ===
function showPage(pageId) {
    // Update navigation
    elements.navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId);
    });
    
    // Show/hide pages
    elements.pages.forEach(page => {
        page.classList.toggle('active', page.id === pageId + 'Page');
    });
    
    currentPage = pageId;
    
    // Update page-specific content
    switch(pageId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'transactions':
            updateTransactionsPage();
            break;
        case 'analytics':
            updateAnalytics();
            break;
        case 'budgets':
            updateBudgetsPage();
            break;
    }
}

// === DATA MANAGEMENT ===
async function loadData() {
    try {
        // Try to load from database first
        if (window.dbService) {
            await window.dbService.init();
            
            // Load transactions
            const dbTransactions = await window.dbService.getTransactions();
            if (dbTransactions && dbTransactions.length > 0) {
                transactions = dbTransactions;
            } else {
                // Fallback to localStorage
                const savedTransactions = localStorage.getItem('expenseTrackerTransactions');
                if (savedTransactions) {
                    transactions = JSON.parse(savedTransactions);
                    // Migrate to database
                    for (const transaction of transactions) {
                        await window.dbService.addTransaction(transaction);
                    }
                }
            }
            
            // Load categories
            const dbCategories = await window.dbService.getCategories();
            if (dbCategories && dbCategories.length > 0) {
                // Convert array to object format
                const categoriesObj = { expense: [], income: [] };
                dbCategories.forEach(cat => {
                    if (categoriesObj[cat.type]) {
                        categoriesObj[cat.type].push(cat.name);
                    }
                });
                categories = { ...categories, ...categoriesObj };
            } else {
                // Load from localStorage and migrate
                const savedCategories = localStorage.getItem('expenseTrackerCategories');
                if (savedCategories) {
                    const localCategories = JSON.parse(savedCategories);
                    categories = { ...categories, ...localCategories };
                    
                    // Migrate to database
                    for (const [type, catList] of Object.entries(localCategories)) {
                        for (const catName of catList) {
                            await window.dbService.addCategory({ name: catName, type });
                        }
                    }
                }
            }
            
            // Load budgets
            const dbBudgets = await window.dbService.getBudgets();
            if (dbBudgets && dbBudgets.length > 0) {
                // Convert array to object format
                budgets = {};
                dbBudgets.forEach(budget => {
                    budgets[budget.category] = budget.amount;
                });
            } else {
                // Load from localStorage and migrate
                const savedBudgets = localStorage.getItem('expenseTrackerBudgets');
                if (savedBudgets) {
                    budgets = JSON.parse(savedBudgets);
                    
                    // Migrate to database
                    for (const [category, amount] of Object.entries(budgets)) {
                        await window.dbService.setBudget(category, amount);
                    }
                }
            }
            
        } else {
            // Fallback to localStorage only
            loadDataFromLocalStorage();
        }
    } catch (error) {
        console.error('Error loading data from database, falling back to localStorage:', error);
        loadDataFromLocalStorage();
    }
}

function loadDataFromLocalStorage() {
    // Load transactions
    const savedTransactions = localStorage.getItem('expenseTrackerTransactions');
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    }
    
    // Load categories
    const savedCategories = localStorage.getItem('expenseTrackerCategories');
    if (savedCategories) {
        categories = { ...categories, ...JSON.parse(savedCategories) };
    }
    
    // Load budgets
    const savedBudgets = localStorage.getItem('expenseTrackerBudgets');
    if (savedBudgets) {
        budgets = JSON.parse(savedBudgets);
    }
}

async function saveData() {
    try {
        // Save to database if available
        if (window.dbService) {
            // Transactions are saved individually when added/updated
            // Categories and budgets need to be saved here
            
            // Save categories to database
            for (const [type, catList] of Object.entries(categories)) {
                for (const catName of catList) {
                    try {
                        await window.dbService.addCategory({ name: catName, type });
                    } catch (error) {
                        // Category might already exist, ignore error
                    }
                }
            }
            
            // Save budgets to database
            for (const [category, amount] of Object.entries(budgets)) {
                await window.dbService.setBudget(category, amount);
            }
        }
        
        // Also save to localStorage as backup
        localStorage.setItem('expenseTrackerTransactions', JSON.stringify(transactions));
        localStorage.setItem('expenseTrackerCategories', JSON.stringify(categories));
        localStorage.setItem('expenseTrackerBudgets', JSON.stringify(budgets));
        
    } catch (error) {
        console.error('Error saving to database, using localStorage only:', error);
        // Fallback to localStorage only
        localStorage.setItem('expenseTrackerTransactions', JSON.stringify(transactions));
        localStorage.setItem('expenseTrackerCategories', JSON.stringify(categories));
        localStorage.setItem('expenseTrackerBudgets', JSON.stringify(budgets));
    }
}

// === TRANSACTION MANAGEMENT ===
async function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const transaction = {
        id: Date.now().toString(),
        type: elements.transactionType.value,
        amount: parseFloat(elements.transactionAmount.value),
        category: elements.transactionCategory.value,
        description: elements.transactionDescription.value,
        date: elements.transactionDate.value,
        timestamp: new Date().toISOString()
    };
    
    // Validate transaction
    if (!validateTransaction(transaction)) {
        return;
    }
    
    try {
        // Add to database first
        if (window.dbService) {
            await window.dbService.addTransaction(transaction);
        }
        
        // Add to local array
        transactions.unshift(transaction);
        
        // Save to localStorage as backup
        saveData();
        
        // Update UI
        updateDashboard();
        updateSidebarStats();
        
        // Reset form and close modal
        elements.transactionForm.reset();
        elements.transactionDate.value = new Date().toISOString().split('T')[0];
        hideModal('transaction');
        
        showNotification(`${transaction.type === 'income' ? 'Income' : 'Expense'} added successfully!`);
        
    } catch (error) {
        console.error('Error adding transaction:', error);
        showNotification('Error saving transaction. Please try again.', 'error');
    }
}

function validateTransaction(transaction) {
    if (!transaction.amount || transaction.amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return false;
    }
    
    if (!transaction.category) {
        showNotification('Please select a category', 'error');
        return false;
    }
    
    if (!transaction.description.trim()) {
        showNotification('Please enter a description', 'error');
        return false;
    }
    
    return true;
}

async function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        try {
            // Delete from database first
            if (window.dbService) {
                await window.dbService.deleteTransaction(id);
            }
            
            // Remove from local array
            transactions = transactions.filter(t => t.id !== id);
            
            // Save to localStorage as backup
            saveData();
            
            // Update UI
            updateDashboard();
            updateSidebarStats();
            updateTransactionsPage();
            
            showNotification('Transaction deleted successfully!');
            
        } catch (error) {
            console.error('Error deleting transaction:', error);
            showNotification('Error deleting transaction. Please try again.', 'error');
        }
    }
}

// === CALCULATIONS ===
function calculateTotals(filteredTransactions = transactions) {
    const totals = {
        income: 0,
        expenses: 0,
        balance: 0
    };
    
    filteredTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totals.income += transaction.amount;
        } else {
            totals.expenses += transaction.amount;
        }
    });
    
    totals.balance = totals.income - totals.expenses;
    
    return totals;
}

function calculateMonthlyTotals() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    return calculateTotals(monthlyTransactions);
}

// === UI UPDATES ===
function updateDashboard() {
    const monthlyTotals = calculateMonthlyTotals();
    
    // Update summary cards
    elements.totalIncome.textContent = formatCurrency(monthlyTotals.income);
    elements.totalExpenses.textContent = formatCurrency(monthlyTotals.expenses);
    elements.currentBalance.textContent = formatCurrency(monthlyTotals.balance);
    
    // Update balance card color
    const balanceCard = elements.currentBalance.closest('.summary-card');
    balanceCard.classList.toggle('negative', monthlyTotals.balance < 0);
    
    // Update recent transactions
    updateRecentTransactions();
    
    // Update charts
    updateDashboardCharts();
}

function updateSidebarStats() {
    const monthlyTotals = calculateMonthlyTotals();
    
    elements.sidebarIncome.textContent = formatCurrency(monthlyTotals.income);
    elements.sidebarExpenses.textContent = formatCurrency(monthlyTotals.expenses);
    elements.sidebarBalance.textContent = formatCurrency(monthlyTotals.balance);
    
    // Update balance color
    if (monthlyTotals.balance >= 0) {
        elements.sidebarBalance.className = 'stat-value income';
    } else {
        elements.sidebarBalance.className = 'stat-value expense';
    }
}

function updateRecentTransactions() {
    const recentTransactions = transactions.slice(0, 5);
    
    if (recentTransactions.length === 0) {
        elements.recentTransactionsList.innerHTML = `
            <div class="empty-state">
                <p>No transactions yet. <a href="#" onclick="showModal('transaction')">Add your first transaction</a></p>
            </div>
        `;
        return;
    }
    
    elements.recentTransactionsList.innerHTML = recentTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-meta">
                    <span class="transaction-category">${transaction.category}</span>
                    <span class="transaction-date">${formatDate(transaction.date)}</span>
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
            </div>
        </div>
    `).join('');
}

function updateTransactionsPage() {
    // Update category filter options
    populateFilterSelects();
    
    // Apply current filters
    applyFilters();
}

function populateFilterSelects() {
    // Update category filter
    const allCategories = [...new Set([
        ...categories.income,
        ...categories.expense
    ])];
    
    elements.categoryFilter.innerHTML = `
        <option value="all">All Categories</option>
        ${allCategories.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('')}
    `;
}

function applyFilters() {
    let filteredTransactions = [...transactions];
    
    // Date filter
    const dateFilter = elements.dateFilter.value;
    if (dateFilter !== 'all') {
        filteredTransactions = filterByDate(filteredTransactions, dateFilter);
    }
    
    // Category filter
    const categoryFilter = elements.categoryFilter.value;
    if (categoryFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
    }
    
    // Type filter
    const typeFilter = elements.typeFilter.value;
    if (typeFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
    }
    
    // Search filter
    const searchFilter = elements.searchFilter.value.toLowerCase();
    if (searchFilter) {
        filteredTransactions = filteredTransactions.filter(t => 
            t.description.toLowerCase().includes(searchFilter) ||
            t.category.toLowerCase().includes(searchFilter)
        );
    }
    
    // Update table
    updateTransactionsTable(filteredTransactions);
}

function filterByDate(transactions, period) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        
        switch(period) {
            case 'today':
                return transactionDate >= today;
            case 'week':
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                return transactionDate >= weekAgo;
            case 'month':
                return transactionDate.getMonth() === now.getMonth() && 
                       transactionDate.getFullYear() === now.getFullYear();
            case 'year':
                return transactionDate.getFullYear() === now.getFullYear();
            default:
                return true;
        }
    });
}

function updateTransactionsTable(filteredTransactions) {
    if (filteredTransactions.length === 0) {
        elements.transactionsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">No transactions found</td>
            </tr>
        `;
        return;
    }
    
    elements.transactionsTableBody.innerHTML = filteredTransactions.map(transaction => `
        <tr>
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td>
                <span class="type-badge ${transaction.type}">
                    ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </span>
            </td>
            <td class="amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
            </td>
            <td>
                <button class="btn-icon" onclick="deleteTransaction('${transaction.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// === UTILITY FUNCTIONS ===
function formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// === MODAL MANAGEMENT ===
function showModal(modalType) {
    const modal = document.getElementById(modalType + 'Modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Special handling for different modals
    if (modalType === 'settings') {
        updateSettingsModal();
    } else if (modalType === 'budget') {
        populateBudgetCategories();
    }
}

function hideModal(modalType) {
    const modal = document.getElementById(modalType + 'Modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// === CATEGORY MANAGEMENT ===
function populateCategorySelects() {
    updateCategoryOptions();
}

function updateCategoryOptions() {
    const type = elements.transactionType.value;
    const categoryOptions = categories[type];
    
    elements.transactionCategory.innerHTML = `
        <option value="">Select Category</option>
        ${categoryOptions.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('')}
    `;
}

function addCategory() {
    const name = elements.newCategoryName.value.trim();
    const type = elements.newCategoryType.value;
    
    if (!name) {
        showNotification('Please enter a category name', 'error');
        return;
    }
    
    if (categories[type].includes(name)) {
        showNotification('Category already exists', 'error');
        return;
    }
    
    categories[type].push(name);
    saveData();
    populateCategorySelects();
    updateSettingsModal();
    
    elements.newCategoryName.value = '';
    showNotification('Category added successfully!');
}

function deleteCategory(name, type) {
    if (confirm(`Are you sure you want to delete the category "${name}"?`)) {
        categories[type] = categories[type].filter(cat => cat !== name);
        saveData();
        populateCategorySelects();
        updateSettingsModal();
        showNotification('Category deleted successfully!');
    }
}

function updateSettingsModal() {
    const categoriesHtml = Object.entries(categories).map(([type, cats]) => 
        cats.map(cat => `
            <div class="category-tag ${type}">
                <span>${cat}</span>
                <button class="category-delete" onclick="deleteCategory('${cat}', '${type}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('')
    ).join('');
    
    elements.categoriesList.innerHTML = categoriesHtml;
}

// === NOTIFICATION SYSTEM ===
function showNotification(message, type = 'success') {
    elements.notificationMessage.textContent = message;
    elements.notification.className = `notification ${type}`;
    elements.notification.style.display = 'flex';
    
    setTimeout(() => {
        elements.notification.classList.add('show');
    }, 10);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        hideNotification();
    }, 3000);
}

function hideNotification() {
    elements.notification.classList.remove('show');
    setTimeout(() => {
        elements.notification.style.display = 'none';
    }, 300);
}

// === KEYBOARD SHORTCUTS ===
function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'n':
                e.preventDefault();
                showModal('transaction');
                break;
            case 'e':
                e.preventDefault();
                exportData();
                break;
            case ',':
                e.preventDefault();
                showModal('settings');
                break;
        }
    }
    
    // Escape key to close modals
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            const modalType = activeModal.id.replace('Modal', '');
            hideModal(modalType);
        }
    }
}

// === DATA EXPORT/IMPORT ===
async function exportData() {
    try {
        let data;
        
        // Try to export from database first
        if (window.dbService) {
            data = await window.dbService.exportData();
        } else {
            // Fallback to localStorage data
            data = {
                transactions,
                categories,
                budgets,
                exportDate: new Date().toISOString()
            };
        }
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `expense-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Data exported successfully!');
        
    } catch (error) {
        console.error('Error exporting data:', error);
        showNotification('Error exporting data. Please try again.', 'error');
    }
}

async function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('This will replace all existing data. Are you sure?')) {
                // Import to database if available
                if (window.dbService) {
                    await window.dbService.importData(data);
                    
                    // Reload data from database
                    await loadData();
                } else {
                    // Fallback to localStorage
                    transactions = data.transactions || [];
                    categories = { ...categories, ...data.categories };
                    budgets = data.budgets || {};
                    
                    saveData();
                }
                
                updateDashboard();
                updateSidebarStats();
                populateCategorySelects();
                
                showNotification('Data imported successfully!');
            }
        } catch (error) {
            console.error('Error importing data:', error);
            showNotification('Invalid file format', 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
}

async function clearAllData() {
    if (confirm('This will delete ALL data permanently. Are you sure?')) {
        if (confirm('This action cannot be undone. Continue?')) {
            try {
                // Clear database if available
                if (window.dbService) {
                    await window.dbService.clearAllData();
                }
                
                // Clear local data
                transactions = [];
                budgets = {};
                // Keep default categories
                categories = {
                    expense: ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Groceries', 'Other'],
                    income: ['Salary', 'Freelancing', 'Business', 'Investments', 'Gifts', 'Other']
                };
                
                // Clear localStorage
                localStorage.removeItem('expenseTrackerTransactions');
                localStorage.removeItem('expenseTrackerCategories');
                localStorage.removeItem('expenseTrackerBudgets');
                
                updateDashboard();
                updateSidebarStats();
                populateCategorySelects();
                
                showNotification('All data cleared successfully!');
                
            } catch (error) {
                console.error('Error clearing data:', error);
                showNotification('Error clearing data. Please try again.', 'error');
            }
        }
    }
}

// Initialize dashboard charts and analytics
function updateDashboardCharts() {
    if (window.chartFunctions) {
        window.chartFunctions.updateDashboardCharts();
    }
}

function updateAnalytics() {
    if (window.chartFunctions) {
        window.chartFunctions.updateAnalytics();
    }
}

function updateBudgetsPage() {
    if (!elements.budgetsContainer) return;
    
    const expenseCategories = categories.expense;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calculate current month spending by category
    const monthlySpending = {};
    transactions
        .filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && 
                   date.getMonth() === currentMonth && 
                   date.getFullYear() === currentYear;
        })
        .forEach(t => {
            monthlySpending[t.category] = (monthlySpending[t.category] || 0) + t.amount;
        });
    
    // Create budget cards
    const budgetCards = expenseCategories.map(category => {
        const budgetAmount = budgets[category] || 0;
        const spentAmount = monthlySpending[category] || 0;
        const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
        const remaining = budgetAmount - spentAmount;
        
        let statusClass = 'success';
        if (percentage >= 100) statusClass = 'danger';
        else if (percentage >= 80) statusClass = 'warning';
        
        return `
            <div class="budget-card">
                <div class="budget-header">
                    <h3 class="budget-category">${category}</h3>
                    <div class="budget-actions">
                        <button class="btn-icon" onclick="editBudget('${category}')" title="Edit Budget">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="deleteBudget('${category}')" title="Delete Budget">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="budget-amounts">
                    <div class="amount-item">
                        <span class="amount-label">Budget</span>
                        <span class="amount-value">${formatCurrency(budgetAmount)}</span>
                    </div>
                    <div class="amount-item">
                        <span class="amount-label">Spent</span>
                        <span class="amount-value expense">${formatCurrency(spentAmount)}</span>
                    </div>
                    <div class="amount-item">
                        <span class="amount-label">Remaining</span>
                        <span class="amount-value ${remaining >= 0 ? 'income' : 'expense'}">${formatCurrency(Math.abs(remaining))}</span>
                    </div>
                </div>
                <div class="budget-progress">
                    <div class="progress-bar">
                        <div class="progress-fill ${statusClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <span class="progress-text">${percentage.toFixed(1)}% used</span>
                </div>
                ${budgetAmount === 0 ? `
                    <div class="no-budget">
                        <p>No budget set for this category</p>
                        <button class="btn-secondary btn-sm" onclick="setBudgetForCategory('${category}')">Set Budget</button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    if (budgetCards) {
        elements.budgetsContainer.innerHTML = budgetCards;
    } else {
        elements.budgetsContainer.innerHTML = `
            <div class="empty-state">
                <p>No budget categories found. <a href="#" onclick="showModal('budget')">Create your first budget</a></p>
            </div>
        `;
    }
}

function populateBudgetCategories() {
    // Populate budget form categories
    elements.budgetCategory.innerHTML = `
        <option value="">Select Category</option>
        ${categories.expense.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('')}
    `;
}

function handleBudgetSubmit(e) {
    e.preventDefault();
    
    const category = elements.budgetCategory.value;
    const amount = parseFloat(elements.budgetAmount.value);
    
    if (!category || !amount || amount <= 0) {
        showNotification('Please fill all fields correctly', 'error');
        return;
    }
    
    budgets[category] = amount;
    saveData();
    
    elements.budgetForm.reset();
    hideModal('budget');
    
    showNotification('Budget set successfully!');
    updateBudgetsPage();
}

function editBudget(category) {
    elements.budgetCategory.value = category;
    elements.budgetAmount.value = budgets[category] || '';
    showModal('budget');
}

function deleteBudget(category) {
    if (confirm(`Are you sure you want to delete the budget for "${category}"?`)) {
        delete budgets[category];
        saveData();
        updateBudgetsPage();
        showNotification('Budget deleted successfully!');
    }
}

function setBudgetForCategory(category) {
    elements.budgetCategory.value = category;
    elements.budgetAmount.value = '';
    showModal('budget');
}
