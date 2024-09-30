const dotenv = require('dotenv');
const mysql = require('mysql2');

dotenv.config();

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true  // Allows multiple queries at once
});

function initializeDatabase() {
    connection.query('CREATE DATABASE IF NOT EXISTS foodwaste', (err) => {
        if (err) {
            console.error("Error creating the database:", err);
            return;
        }

        console.log("Database created or already exists.");

        // Now connect to the 'foodwaste' database for table creation
        const db = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        const queries = `
            CREATE TABLE IF NOT EXISTS Admin (
                admin_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                email VARCHAR(100) NULL,
                password VARCHAR(100) NULL
            );

            CREATE TABLE IF NOT EXISTS Users (
                user_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(100),
                password VARCHAR(100),
                email VARCHAR(100),
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                phone_number VARCHAR(15)
            );

            CREATE TABLE IF NOT EXISTS business (
                biz_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100) NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                location VARCHAR(255),
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                phone_number VARCHAR(15),
                verification_status ENUM('verified', 'not_verified') DEFAULT 'not_verified',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS food_listings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                biz_id INT,
                item_name VARCHAR(255),
                category VARCHAR(50),
                expiration_date DATE,
                pickup_time VARCHAR(255),
                pickup_location VARCHAR(255),
                special_notes TEXT,
                quantity INT,
                no_of_claims INT DEFAULT 0,
                max_exceeded ENUM('Yes', 'No') DEFAULT 'No',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (biz_id) REFERENCES business(biz_id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS claimed_items (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT,
                food_id INT,
                FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (food_id) REFERENCES food_listings(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS support_requests (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT,
                subject VARCHAR(255),
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS business_messages (
                id INT PRIMARY KEY AUTO_INCREMENT,
                biz_id INT,
                message TEXT,
                business_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (biz_id) REFERENCES business(biz_id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS notifications (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NULL,
                biz_id INT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (biz_id) REFERENCES business(biz_id) ON DELETE CASCADE
            );
        `;

        // Execute the queries to create tables
        db.query(queries, (err) => {
            if (err) {
                console.error("Error creating tables:", err);
            } 
            else {
                console.log("Database and tables created successfully.");
            }
        });
    });
}

// Call the function to initialize the database when the app starts
//initializeDatabase();

module.exports = connection;
