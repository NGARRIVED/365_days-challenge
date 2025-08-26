/**
 * SQLite Database Setup and Connection
 * Universal Authentication System - Day 1 of 365 Days Challenge
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
    constructor(dbPath = './auth_database.db') {
        this.dbPath = dbPath;
        this.db = null;
    }

    /**
     * Initialize database connection and create tables
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database.');
                    this.createTables()
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        });
    }

    /**
     * Create tables using the schema file
     */
    async createTables() {
        return new Promise((resolve, reject) => {
            const schemaPath = path.join(__dirname, 'schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            this.db.exec(schema, (err) => {
                if (err) {
                    console.error('Error creating tables:', err.message);
                    reject(err);
                } else {
                    console.log('Database tables created successfully.');
                    resolve();
                }
            });
        });
    }

    /**
     * Create a new user
     */
    async createUser(userData) {
        const { email, passwordHash, firstName, lastName } = userData;
        
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO users (email, password_hash, first_name, last_name, created_at, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `;
            
            this.db.run(sql, [email, passwordHash, firstName, lastName], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, email, firstName, lastName });
                }
            });
        });
    }

    /**
     * Find user by email
     */
    async findUserByEmail(email) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, email, password_hash, first_name, last_name, 
                       created_at, updated_at, last_login, is_active, email_verified
                FROM users 
                WHERE email = ? AND is_active = 1
            `;
            
            this.db.get(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Update last login timestamp
     */
    async updateLastLogin(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE users 
                SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            this.db.run(sql, [userId], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Create user session
     */
    async createSession(userId, sessionToken, expiresAt, ipAddress, userAgent) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            this.db.run(sql, [userId, sessionToken, expiresAt, ipAddress, userAgent], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('Database connection closed.');
                }
            });
        }
    }
}

// Export singleton instance
const database = new Database();

module.exports = {
    Database,
    database
};
