CREATE DATABASE IF NOT EXISTS foodwaste;

USE foodwaste;

CREATE TABLE IF NOT EXISTS Admin (
    admin_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NULL,
    password VARCHAR(100) NULL
);


CREATE TABLE IF NOT EXISTS Users (
    user_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NULL,
    password VARCHAR(100) NULL,
    email VARCHAR(100) NULL
);

CREATE TABLE business (
    biz_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    category VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE food_listings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    biz_id INT,
    item_name VARCHAR(255),
    category VARCHAR(50),
    quantity INT,
    expiration_date DATE,
    pickup_time VARCHAR(255),
    pickup_location VARCHAR(255),
    special_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (biz_id) REFERENCES business(biz_id) ON DELETE CASCADE
);