// ===================================
// EXPENSE TRACKER - DATABASE CONFIG
// ===================================

// Database connection configuration
const dbConfig = {
    // MySQL/MariaDB Configuration
    mysql: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'expense_app',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'expense_tracker',
        connectionLimit: 10,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        charset: 'utf8mb4',
        timezone: 'local'
    },

    // SQLite Configuration (for local development)
    sqlite: {
        filename: process.env.SQLITE_PATH || './database/expense_tracker.db',
        driver: 'sqlite3'
    },

    // PostgreSQL Configuration (alternative)
    postgresql: {
        host: process.env.PG_HOST || 'localhost',
        port: process.env.PG_PORT || 5432,
        user: process.env.PG_USER || 'expense_app',
        password: process.env.PG_PASSWORD || '',
        database: process.env.PG_DATABASE || 'expense_tracker',
        ssl: process.env.NODE_ENV === 'production'
    }
};

// Database type selection
const DB_TYPE = process.env.DB_TYPE || 'sqlite'; // 'mysql', 'sqlite', 'postgresql'

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        dbConfig,
        DB_TYPE
    };
} else {
    // Browser environment - use IndexedDB configuration
    window.dbConfig = {
        indexedDB: {
            name: 'ExpenseTrackerDB',
            version: 1,
            stores: {
                transactions: {
                    keyPath: 'id',
                    autoIncrement: true,
                    indexes: [
                        { name: 'date', keyPath: 'date' },
                        { name: 'type', keyPath: 'type' },
                        { name: 'category', keyPath: 'category' }
                    ]
                },
                categories: {
                    keyPath: 'id',
                    autoIncrement: true,
                    indexes: [
                        { name: 'type', keyPath: 'type' },
                        { name: 'name', keyPath: 'name' }
                    ]
                },
                budgets: {
                    keyPath: 'category',
                    indexes: [
                        { name: 'amount', keyPath: 'amount' },
                        { name: 'period', keyPath: 'period' }
                    ]
                },
                settings: {
                    keyPath: 'key'
                }
            }
        }
    };
}