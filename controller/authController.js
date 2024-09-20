const db = require('../models/db');
const bcrypt = require('bcryptjs');

module.exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check for missing fields
    if (!username || !email || !password) {
      return res.status(400).send('All fields are required');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL query to insert the new user
    const sql = 'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)';
    const values = [username, email, hashedPassword];

    // Insert the user into the database
    await db.promise().query(sql, values);
    res.redirect(200, '/signIn');
  } 
  catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).send('Internal Server Error');
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const sql = 'SELECT * FROM Users WHERE email = ?';
    const [results] = await db.promise().query(sql, [email]);

    if (results.length > 0) {
        const match = await bcrypt.compare(password, results[0].password);
        if (match) {
            req.session.user_id = results[0].user_id;
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid Usernames or Password!' });
        }
    } else {
        res.status(401).json({ success: false, message: 'Invalid Username or Password!' });
    }
  } 
  catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

module.exports.profile = async (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  const user_id = req.session.user_id;
  db.query('SELECT username, email FROM users WHERE user_id = ?', [user_id], (err, results) => {
      if (err || results.length === 0) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(results[0]);
  });
};

module.exports.bizregister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check for missing fields
    if (!name || !email || !password) {
      return res.status(400).send('All fields are required');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL query to insert the new user
    const sql = 'INSERT INTO business (name, email, password) VALUES (?, ?, ?)';
    const values = [name, email, hashedPassword];

    // Insert the user into the database
    await db.promise().query(sql, values);
    res.redirect(200, '/bizsignIn');
  } 
  catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).send('Internal Server Error');
  }
}

module.exports.bizlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const sql = 'SELECT * FROM business WHERE email = ?';
    const [results] = await db.promise().query(sql, [email]);

    if (results.length > 0) {
        const match = await bcrypt.compare(password, results[0].password);
        if (match) {
            req.session.biz_id = results[0].biz_id;
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid name or Password!' });
        }
    } else {
        res.status(401).json({ success: false, message: 'Invalid name or Password!' });
    }
  } 
  catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

module.exports.bizprofile = async (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  const user_id = req.session.user_id;
  db.query('SELECT username, email FROM business WHERE user_id = ?', [user_id], (err, results) => {
      if (err || results.length === 0) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(results[0]);
  });
}

module.exports.createFood = async (req, res) => {
  const {
      item_name,
      category,
      quantity,
      expiration_date,
      pickup_time,
      pickup_location,
      special_notes
  } = req.body;

  // Check if all required fields are provided
  if (!item_name || !category || !quantity || !expiration_date || !pickup_time || !pickup_location) {
      return res.status(400).json({ message: 'All fields are required' });
  }

  // Assuming the business is authenticated and the business ID is in req.business
  const biz_id = req.session.biz_id;

  // Query to insert a new food listing into the database
  const query = `
      INSERT INTO food_listings (biz_id, item_name, category, quantity, expiration_date, pickup_time, pickup_location, special_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [biz_id, item_name, category, quantity, expiration_date, pickup_time, pickup_location, special_notes], (err) => {
      if (err) {
          return res.status(500).json({ message: 'Error creating food listing', error: err.message });
      }
      res.status(201).json({ message: 'Food listing created successfully' });
  });
};


module.exports.listings = async (req, res) => {
  const query = 'SELECT * FROM food_listings ORDER BY created_at DESC';
    
  db.query(query, (err, results) => {
      if (err) {
          return res.status(500).json({ message: 'Error fetching food listings', error: err.message });
      }
      res.status(200).json(results);
  });
}

module.exports.singleListing = async (req, res) => {
  const listingId = req.params.id;

  db.query('SELECT * FROM food_listings WHERE id = ?', [listingId], (err, results) => {
      if (err || results.length === 0) {
          return res.status(404).json({ message: 'Food listing not found' });
      }
      res.status(200).json(results[0]);
  });
}