// ===================================
// EXPENSE TRACKER - DATABASE SERVICE
// ===================================

class DatabaseService {
    constructor() {
        this.db = null;
        this.isOnline = navigator.onLine;
        this.useIndexedDB = true; // Browser environment
        this.dbName = 'ExpenseTrackerDB';
        this.version = 1;
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Initialize database
    async init() {
        try {
            if (this.useIndexedDB) {
                await this.initIndexedDB();
            }
            console.log('Database initialized successfully');
            return true;
        } catch (error) {
            console.error('Database initialization failed:', error);
            return false;
        }
    }

    // Initialize IndexedDB for browser storage
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create transactions store
                if (!db.objectStoreNames.contains('transactions')) {
                    const transactionStore = db.createObjectStore('transactions', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    transactionStore.createIndex('date', 'date', { unique: false });
                    transactionStore.createIndex('type', 'type', { unique: false });
                    transactionStore.createIndex('category', 'category', { unique: false });
                    transactionStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Create categories store
                if (!db.objectStoreNames.contains('categories')) {
                    const categoryStore = db.createObjectStore('categories', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    categoryStore.createIndex('type', 'type', { unique: false });
                    categoryStore.createIndex('name', 'name', { unique: false });
                }

                // Create budgets store
                if (!db.objectStoreNames.contains('budgets')) {
                    const budgetStore = db.createObjectStore('budgets', {
                        keyPath: 'category'
                    });
                    budgetStore.createIndex('amount', 'amount', { unique: false });
                }

                // Create settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }

                // Create sync queue for offline support
                if (!db.objectStoreNames.contains('sync_queue')) {
                    const syncStore = db.createObjectStore('sync_queue', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    syncStore.createIndex('timestamp', 'timestamp', { unique: false });
                    syncStore.createIndex('operation', 'operation', { unique: false });
                }
            };
        });
    }

    // Generic database operation wrapper
    async performOperation(storeName, operation, data = null, key = null) {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            let request;

            switch (operation) {
                case 'add':
                    request = store.add(data);
                    break;
                case 'put':
                    request = store.put(data);
                    break;
                case 'get':
                    request = store.get(key);
                    break;
                case 'getAll':
                    request = store.getAll();
                    break;
                case 'delete':
                    request = store.delete(key);
                    break;
                case 'clear':
                    request = store.clear();
                    break;
                default:
                    reject(new Error(`Unknown operation: ${operation}`));
                    return;
            }

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // TRANSACTION OPERATIONS
    async addTransaction(transaction) {
        try {
            // Add timestamp and ensure proper data types
            const transactionData = {
                ...transaction,
                timestamp: new Date().toISOString(),
                amount: parseFloat(transaction.amount),
                id: transaction.id || Date.now().toString()
            };

            await this.performOperation('transactions', 'put', transactionData);
            
            // Queue for sync if offline
            if (!this.isOnline) {
                await this.queueForSync('transaction', 'add', transactionData);
            }
            
            return transactionData;
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }
    }

    async getTransactions(filters = {}) {
        try {
            const transactions = await this.performOperation('transactions', 'getAll');
            
            // Apply filters
            let filteredTransactions = transactions || [];

            if (filters.type) {
                filteredTransactions = filteredTransactions.filter(t => t.type === filters.type);
            }

            if (filters.category) {
                filteredTransactions = filteredTransactions.filter(t => t.category === filters.category);
            }

            if (filters.dateFrom) {
                filteredTransactions = filteredTransactions.filter(t => t.date >= filters.dateFrom);
            }

            if (filters.dateTo) {
                filteredTransactions = filteredTransactions.filter(t => t.date <= filters.dateTo);
            }

            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filteredTransactions = filteredTransactions.filter(t => 
                    t.description.toLowerCase().includes(searchLower) ||
                    t.category.toLowerCase().includes(searchLower)
                );
            }

            // Sort by date (newest first)
            filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            return filteredTransactions;
        } catch (error) {
            console.error('Error getting transactions:', error);
            return [];
        }
    }

    async updateTransaction(id, updates) {
        try {
            const transaction = await this.performOperation('transactions', 'get', null, id);
            if (transaction) {
                const updatedTransaction = { ...transaction, ...updates };
                await this.performOperation('transactions', 'put', updatedTransaction);
                
                if (!this.isOnline) {
                    await this.queueForSync('transaction', 'update', updatedTransaction);
                }
                
                return updatedTransaction;
            }
            throw new Error('Transaction not found');
        } catch (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }
    }

    async deleteTransaction(id) {
        try {
            await this.performOperation('transactions', 'delete', null, id);
            
            if (!this.isOnline) {
                await this.queueForSync('transaction', 'delete', { id });
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    }

    // CATEGORY OPERATIONS
    async getCategories(type = null) {
        try {
            const categories = await this.performOperation('categories', 'getAll');
            if (type) {
                return (categories || []).filter(cat => cat.type === type);
            }
            return categories || [];
        } catch (error) {
            console.error('Error getting categories:', error);
            return [];
        }
    }

    async addCategory(category) {
        try {
            const categoryData = {
                ...category,
                id: category.id || Date.now().toString(),
                timestamp: new Date().toISOString()
            };
            
            await this.performOperation('categories', 'put', categoryData);
            return categoryData;
        } catch (error) {
            console.error('Error adding category:', error);
            throw error;
        }
    }

    async deleteCategory(id) {
        try {
            await this.performOperation('categories', 'delete', null, id);
            return true;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }

    // BUDGET OPERATIONS
    async getBudgets() {
        try {
            return await this.performOperation('budgets', 'getAll') || [];
        } catch (error) {
            console.error('Error getting budgets:', error);
            return [];
        }
    }

    async setBudget(category, amount) {
        try {
            const budgetData = {
                category,
                amount: parseFloat(amount),
                timestamp: new Date().toISOString()
            };
            
            await this.performOperation('budgets', 'put', budgetData);
            return budgetData;
        } catch (error) {
            console.error('Error setting budget:', error);
            throw error;
        }
    }

    async deleteBudget(category) {
        try {
            await this.performOperation('budgets', 'delete', null, category);
            return true;
        } catch (error) {
            console.error('Error deleting budget:', error);
            throw error;
        }
    }

    // SETTINGS OPERATIONS
    async getSetting(key) {
        try {
            const setting = await this.performOperation('settings', 'get', null, key);
            return setting ? setting.value : null;
        } catch (error) {
            console.error('Error getting setting:', error);
            return null;
        }
    }

    async setSetting(key, value) {
        try {
            await this.performOperation('settings', 'put', { key, value });
            return true;
        } catch (error) {
            console.error('Error setting value:', error);
            return false;
        }
    }

    // DATA EXPORT/IMPORT
    async exportData() {
        try {
            const [transactions, categories, budgets, settings] = await Promise.all([
                this.performOperation('transactions', 'getAll'),
                this.performOperation('categories', 'getAll'),
                this.performOperation('budgets', 'getAll'),
                this.performOperation('settings', 'getAll')
            ]);

            return {
                transactions: transactions || [],
                categories: categories || [],
                budgets: budgets || [],
                settings: settings || [],
                exportDate: new Date().toISOString(),
                version: this.version
            };
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }

    async importData(data) {
        try {
            // Clear existing data
            await Promise.all([
                this.performOperation('transactions', 'clear'),
                this.performOperation('categories', 'clear'),
                this.performOperation('budgets', 'clear'),
                this.performOperation('settings', 'clear')
            ]);

            // Import new data
            if (data.transactions) {
                for (const transaction of data.transactions) {
                    await this.performOperation('transactions', 'add', transaction);
                }
            }

            if (data.categories) {
                for (const category of data.categories) {
                    await this.performOperation('categories', 'add', category);
                }
            }

            if (data.budgets) {
                for (const budget of data.budgets) {
                    await this.performOperation('budgets', 'add', budget);
                }
            }

            if (data.settings) {
                for (const setting of data.settings) {
                    await this.performOperation('settings', 'add', setting);
                }
            }

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    }

    async clearAllData() {
        try {
            await Promise.all([
                this.performOperation('transactions', 'clear'),
                this.performOperation('categories', 'clear'),
                this.performOperation('budgets', 'clear'),
                this.performOperation('settings', 'clear'),
                this.performOperation('sync_queue', 'clear')
            ]);
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            throw error;
        }
    }

    // OFFLINE SUPPORT
    async queueForSync(entityType, operation, data) {
        try {
            const queueItem = {
                entityType,
                operation,
                data,
                timestamp: new Date().toISOString(),
                retries: 0
            };
            
            await this.performOperation('sync_queue', 'add', queueItem);
        } catch (error) {
            console.error('Error queuing for sync:', error);
        }
    }

    async syncOfflineData() {
        try {
            const queueItems = await this.performOperation('sync_queue', 'getAll');
            
            for (const item of queueItems || []) {
                try {
                    // Here you would sync with your remote server
                    // For now, we'll just remove from queue
                    await this.performOperation('sync_queue', 'delete', null, item.id);
                } catch (syncError) {
                    console.error('Error syncing item:', item, syncError);
                    
                    // Update retry count
                    item.retries = (item.retries || 0) + 1;
                    if (item.retries < 3) {
                        await this.performOperation('sync_queue', 'put', item);
                    } else {
                        await this.performOperation('sync_queue', 'delete', null, item.id);
                    }
                }
            }
        } catch (error) {
            console.error('Error syncing offline data:', error);
        }
    }

    // STATISTICS AND ANALYTICS
    async getStatistics(period = 'month') {
        try {
            const transactions = await this.getTransactions();
            const now = new Date();
            let startDate;

            switch (period) {
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            }

            const filteredTransactions = transactions.filter(t => 
                new Date(t.date) >= startDate
            );

            const income = filteredTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expenses = filteredTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            // Category breakdown
            const categoryTotals = {};
            filteredTransactions
                .filter(t => t.type === 'expense')
                .forEach(t => {
                    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
                });

            return {
                income,
                expenses,
                balance: income - expenses,
                transactionCount: filteredTransactions.length,
                categoryBreakdown: categoryTotals,
                period
            };
        } catch (error) {
            console.error('Error getting statistics:', error);
            return {
                income: 0,
                expenses: 0,
                balance: 0,
                transactionCount: 0,
                categoryBreakdown: {},
                period
            };
        }
    }
}

// Create global instance
window.dbService = new DatabaseService();

// Initialize database when script loads
window.dbService.init().then(() => {
    console.log('Database service ready');
}).catch(error => {
    console.error('Database service initialization failed:', error);
});