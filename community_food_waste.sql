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


-- 
-- module.exports.createFood = async (req, res) => {
--     const {
--         item_name,
--         amount,
--         location,
--         category,
--         quantity,
--         expiration_date,
--         pickup_time,
--         pickup_location,
--         special_notes
--     } = req.body;

--     // Check if all required fields are provided
--     if (!item_name || !amount || !location || !category || !quantity || !expiration_date || !pickup_time || !pickup_location) {
--         return res.status(400).json({ message: 'All fields are required' });
--     }

--     // Assuming the business is authenticated and the biz_id is in req.business
--     const biz_id = req.business.id;

--     // Query to insert a new food listing into the database
--     const query = `
--         INSERT INTO food_listings (biz_id, item_name, amount, location, category, quantity, expiration_date, pickup_time, pickup_location, special_notes)
--         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
--     `;

--     db.query(query, [biz_id, item_name, amount, location, category, quantity, expiration_date, pickup_time, pickup_location, special_notes], (err) => {
--         if (err) {
--             return res.status(500).json({ message: 'Error creating food listing', error: err.message });
--         }
--         res.status(201).json({ message: 'Food listing created successfully' });
--     });
-- };

{
  "item_name": "Pizza",
  "amount": 10,
  "location": "123 Food St.",
  "category": "Fast Food",
  "quantity": 5,
  "expiration_date": "2024-09-30",
  "pickup_time": "12:00 PM - 5:00 PM",
  "pickup_location": "Food Warehouse",
  "special_notes": "Please refrigerate immediately."
}

