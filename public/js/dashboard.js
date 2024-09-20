const db = require('../config/db');

// Model for food listing
const createFoodTable = `
    CREATE TABLE IF NOT EXISTS food_listings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        amount INT NOT NULL,
        location VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

db.query(createFoodTable, (err) => {
    if (err) {
        console.error("Error creating food table", err.message);
    } else {
        console.log("Food listings table created or already exists.");
    }
});

module.exports = db;
