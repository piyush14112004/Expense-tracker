-- Expense Tracker database schema
-- The backend can also create/update these tables through Hibernate.

CREATE DATABASE IF NOT EXISTS expense_tracker;
USE expense_tracker;

CREATE TABLE IF NOT EXISTS user_accounts (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_accounts_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS expenses (
    id BIGINT NOT NULL AUTO_INCREMENT,
    description VARCHAR(120) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(40) NOT NULL,
    expense_date DATE NOT NULL,
    user_id BIGINT NULL,
    PRIMARY KEY (id),
    KEY idx_expenses_user_id (user_id),
    CONSTRAINT fk_expenses_user_account
        FOREIGN KEY (user_id) REFERENCES user_accounts(id)
) ENGINE=InnoDB;