-- ===================================
-- EXPENSE TRACKER - DATABASE SCHEMA
-- ===================================

-- Create database
CREATE DATABASE IF NOT EXISTS expense_tracker;
USE expense_tracker;

-- Users table for future multi-user support
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    currency_preference VARCHAR(10) DEFAULT 'INR',
    theme_preference ENUM('light', 'dark') DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    name VARCHAR(50) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',
    icon VARCHAR(50) DEFAULT 'fas fa-tag',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_category (user_id, name, type)
);

-- Transactions table
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    category_id INT,
    type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    notes TEXT,
    tags JSON,
    receipt_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_user_date (user_id, transaction_date),
    INDEX idx_user_type (user_id, type),
    INDEX idx_user_category (user_id, category_id)
);

-- Budgets table
CREATE TABLE budgets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    category_id INT,
    amount DECIMAL(12, 2) NOT NULL,
    period ENUM('weekly', 'monthly', 'yearly') DEFAULT 'monthly',
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_active_budget (user_id, category_id, period, is_active)
);

-- Recurring transactions table
CREATE TABLE recurring_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    category_id INT,
    type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT NOT NULL,
    frequency ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    next_occurrence DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_next_occurrence (next_occurrence, is_active)
);

-- Savings goals table
CREATE TABLE savings_goals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) DEFAULT 0,
    target_date DATE,
    description TEXT,
    is_achieved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User preferences table
CREATE TABLE user_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    budget_alerts BOOLEAN DEFAULT TRUE,
    weekly_reports BOOLEAN DEFAULT TRUE,
    export_format ENUM('json', 'csv', 'pdf') DEFAULT 'json',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    first_day_of_week ENUM('monday', 'sunday') DEFAULT 'monday',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default categories for income
INSERT INTO categories (user_id, name, type, color, icon, is_default) VALUES
(NULL, 'Salary', 'income', '#10b981', 'fas fa-briefcase', TRUE),
(NULL, 'Freelancing', 'income', '#3b82f6', 'fas fa-laptop-code', TRUE),
(NULL, 'Business', 'income', '#8b5cf6', 'fas fa-store', TRUE),
(NULL, 'Investments', 'income', '#f59e0b', 'fas fa-chart-line', TRUE),
(NULL, 'Gifts', 'income', '#ec4899', 'fas fa-gift', TRUE),
(NULL, 'Other Income', 'income', '#6b7280', 'fas fa-plus-circle', TRUE);

-- Insert default categories for expenses
INSERT INTO categories (user_id, name, type, color, icon, is_default) VALUES
(NULL, 'Food & Dining', 'expense', '#ef4444', 'fas fa-utensils', TRUE),
(NULL, 'Transportation', 'expense', '#3b82f6', 'fas fa-car', TRUE),
(NULL, 'Shopping', 'expense', '#ec4899', 'fas fa-shopping-bag', TRUE),
(NULL, 'Entertainment', 'expense', '#8b5cf6', 'fas fa-film', TRUE),
(NULL, 'Bills & Utilities', 'expense', '#f59e0b', 'fas fa-file-invoice-dollar', TRUE),
(NULL, 'Healthcare', 'expense', '#10b981', 'fas fa-hospital', TRUE),
(NULL, 'Education', 'expense', '#6366f1', 'fas fa-graduation-cap', TRUE),
(NULL, 'Travel', 'expense', '#14b8a6', 'fas fa-plane', TRUE),
(NULL, 'Groceries', 'expense', '#84cc16', 'fas fa-shopping-cart', TRUE),
(NULL, 'Other Expenses', 'expense', '#6b7280', 'fas fa-minus-circle', TRUE);

-- Create indexes for better performance
CREATE INDEX idx_transactions_date_range ON transactions(user_id, transaction_date, type);
CREATE INDEX idx_budgets_active ON budgets(user_id, is_active, period);
CREATE INDEX idx_categories_type ON categories(user_id, type);

-- Create views for common queries
CREATE VIEW v_monthly_summary AS
SELECT 
    t.user_id,
    YEAR(t.transaction_date) as year,
    MONTH(t.transaction_date) as month,
    t.type,
    SUM(t.amount) as total_amount,
    COUNT(*) as transaction_count
FROM transactions t
GROUP BY t.user_id, YEAR(t.transaction_date), MONTH(t.transaction_date), t.type;

CREATE VIEW v_category_totals AS
SELECT 
    t.user_id,
    c.name as category_name,
    t.type,
    SUM(t.amount) as total_amount,
    COUNT(*) as transaction_count,
    AVG(t.amount) as avg_amount
FROM transactions t
JOIN categories c ON t.category_id = c.id
GROUP BY t.user_id, c.id, t.type;

CREATE VIEW v_budget_status AS
SELECT 
    b.id as budget_id,
    b.user_id,
    c.name as category_name,
    b.amount as budget_amount,
    b.period,
    COALESCE(SUM(t.amount), 0) as spent_amount,
    (b.amount - COALESCE(SUM(t.amount), 0)) as remaining_amount,
    CASE 
        WHEN b.amount > 0 THEN (COALESCE(SUM(t.amount), 0) / b.amount) * 100
        ELSE 0
    END as usage_percentage
FROM budgets b
JOIN categories c ON b.category_id = c.id
LEFT JOIN transactions t ON t.category_id = b.category_id 
    AND t.user_id = b.user_id
    AND t.type = 'expense'
    AND (
        (b.period = 'monthly' AND YEAR(t.transaction_date) = YEAR(CURDATE()) AND MONTH(t.transaction_date) = MONTH(CURDATE()))
        OR (b.period = 'yearly' AND YEAR(t.transaction_date) = YEAR(CURDATE()))
        OR (b.period = 'weekly' AND YEARWEEK(t.transaction_date) = YEARWEEK(CURDATE()))
    )
WHERE b.is_active = TRUE
GROUP BY b.id, b.user_id, c.name, b.amount, b.period;

-- Stored procedures for common operations
DELIMITER //

-- Procedure to get user summary
CREATE PROCEDURE GetUserSummary(IN p_user_id INT, IN p_period VARCHAR(10))
BEGIN
    DECLARE v_start_date DATE;
    DECLARE v_end_date DATE;
    
    SET v_end_date = CURDATE();
    
    CASE p_period
        WHEN 'week' THEN SET v_start_date = DATE_SUB(CURDATE(), INTERVAL 7 DAY);
        WHEN 'month' THEN SET v_start_date = DATE_SUB(CURDATE(), INTERVAL 1 MONTH);
        WHEN 'year' THEN SET v_start_date = DATE_SUB(CURDATE(), INTERVAL 1 YEAR);
        ELSE SET v_start_date = DATE_SUB(CURDATE(), INTERVAL 1 MONTH);
    END CASE;
    
    SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance,
        COUNT(*) as total_transactions
    FROM transactions 
    WHERE user_id = p_user_id 
        AND transaction_date BETWEEN v_start_date AND v_end_date;
END //

-- Procedure to get category spending
CREATE PROCEDURE GetCategorySpending(IN p_user_id INT, IN p_period VARCHAR(10))
BEGIN
    DECLARE v_start_date DATE;
    DECLARE v_end_date DATE;
    
    SET v_end_date = CURDATE();
    
    CASE p_period
        WHEN 'week' THEN SET v_start_date = DATE_SUB(CURDATE(), INTERVAL 7 DAY);
        WHEN 'month' THEN SET v_start_date = DATE_SUB(CURDATE(), INTERVAL 1 MONTH);
        WHEN 'year' THEN SET v_start_date = DATE_SUB(CURDATE(), INTERVAL 1 YEAR);
        ELSE SET v_start_date = DATE_SUB(CURDATE(), INTERVAL 1 MONTH);
    END CASE;
    
    SELECT 
        c.name as category_name,
        c.color as category_color,
        SUM(t.amount) as total_amount,
        COUNT(*) as transaction_count
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = p_user_id 
        AND t.type = 'expense'
        AND t.transaction_date BETWEEN v_start_date AND v_end_date
    GROUP BY c.id, c.name, c.color
    ORDER BY total_amount DESC;
END //

DELIMITER ;

-- Create triggers for data integrity and automation
DELIMITER //

-- Trigger to update budget status when transactions are added
CREATE TRIGGER update_budget_on_transaction
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    -- This could be used to send notifications when budget limits are exceeded
    -- For now, we'll just ensure data integrity
    IF NEW.type = 'expense' THEN
        UPDATE budgets 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = NEW.user_id 
            AND category_id = NEW.category_id 
            AND is_active = TRUE;
    END IF;
END //

-- Trigger to process recurring transactions
CREATE TRIGGER process_recurring_transactions
AFTER UPDATE ON recurring_transactions
FOR EACH ROW
BEGIN
    IF NEW.next_occurrence <= CURDATE() AND NEW.is_active = TRUE THEN
        INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date)
        VALUES (NEW.user_id, NEW.category_id, NEW.type, NEW.amount, NEW.description, NEW.next_occurrence);
        
        -- Update next occurrence based on frequency
        CASE NEW.frequency
            WHEN 'daily' THEN 
                UPDATE recurring_transactions 
                SET next_occurrence = DATE_ADD(next_occurrence, INTERVAL 1 DAY)
                WHERE id = NEW.id;
            WHEN 'weekly' THEN 
                UPDATE recurring_transactions 
                SET next_occurrence = DATE_ADD(next_occurrence, INTERVAL 1 WEEK)
                WHERE id = NEW.id;
            WHEN 'monthly' THEN 
                UPDATE recurring_transactions 
                SET next_occurrence = DATE_ADD(next_occurrence, INTERVAL 1 MONTH)
                WHERE id = NEW.id;
            WHEN 'yearly' THEN 
                UPDATE recurring_transactions 
                SET next_occurrence = DATE_ADD(next_occurrence, INTERVAL 1 YEAR)
                WHERE id = NEW.id;
        END CASE;
    END IF;
END //

DELIMITER ;

-- Sample data for testing (optional)
-- INSERT INTO users (username, email, password_hash, full_name) VALUES
-- ('demo_user', 'demo@example.com', '$2a$10$dummyhash', 'Demo User');

-- SET @demo_user_id = LAST_INSERT_ID();

-- INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date) VALUES
-- (@demo_user_id, 1, 'income', 50000.00, 'Monthly Salary', '2025-10-01'),
-- (@demo_user_id, 7, 'expense', 2500.00, 'Grocery Shopping', '2025-10-01'),
-- (@demo_user_id, 8, 'expense', 1200.00, 'Dinner at Restaurant', '2025-09-30');

-- Grant permissions (adjust as needed for your environment)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON expense_tracker.* TO 'expense_app'@'localhost';
-- FLUSH PRIVILEGES;