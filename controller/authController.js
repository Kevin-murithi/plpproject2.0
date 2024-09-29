const db = require('../models/db');
const bcrypt = require('bcryptjs');

module.exports.register = async (req, res) => {
  try {
    const { username, email, password, latitude, longitude } = req.body;

    // Check for missing fields
    if (!username || !email || !password || latitude === null || longitude === null) {
      return res.status(400).send('All fields and location are required');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL query to insert the new user
    const sql = 'INSERT INTO Users (username, email, password, latitude, longitude) VALUES (?, ?, ?, ?, ?)';
    const values = [username, email, hashedPassword, latitude, longitude];

    // Insert the user into the database and get the insertId (user_id)
    const [result] = await db.promise().query(sql, values);
    const user_id = result.insertId; 

    // Create a session for the user using the insertId
    req.session.user = {
      user_id: user_id,
      username: username,
      email: email
    };

    console.log("Session created:", req.session.user);
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } 
  catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).send('Internal Server Error');
  }
}

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
      } 
      else {
        res.status(401).json({ success: false, message: 'Invalid Usernames or Password!' });
      }
    } 
    else {
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

    // SQL query to insert the new business
    const sql = 'INSERT INTO business (name, email, password) VALUES (?, ?, ?)';
    const values = [name, email, hashedPassword];
    const [insertResult] = await db.promise().query(sql, values);

    // Get the generated biz_id from the insert result
    const biz_id = insertResult.insertId; // insertId contains the new business ID

    // Create a session with the newly created biz_id
    req.session.biz_id = biz_id; // Store biz_id in the session
    req.session.biz = {
      biz_id: biz_id,
      name: name,
      email: email
    };

    console.log("Session created: ", req.session.biz);

    res.status(201).json({ success: true, message: 'Business registered successfully' });
  } 
  catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).send('Internal Server Error');
  }
};

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
          console.log ("session created", req.session.biz_id);
        } 
        else {
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
  if (!item_name || !category || !quantity || !expiration_date || !pickup_time || !pickup_location || !special_notes) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const biz_id = req.session.biz_id;  // Get business ID from session

  // Check if biz_id is available
  if (!biz_id) {
    return res.status(403).json({ message: 'Unauthorized: No business ID found in session' });
  }

  // Fetch the business name to include in notifications
  const businessQuery = 'SELECT name FROM business WHERE biz_id = ?';
  const [businessResult] = await db.promise().query(businessQuery, [biz_id]);

  if (!businessResult || businessResult.length === 0) {
    return res.status(400).json({ message: 'Business not found' });
  }
  const businessName = businessResult[0].name;

  // Insert the new food listing into the database
  const insertFoodQuery = `
    INSERT INTO food_listings (biz_id, item_name, category, quantity, expiration_date, pickup_time, pickup_location, special_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(insertFoodQuery, [biz_id, item_name, category, quantity, expiration_date, pickup_time, pickup_location, special_notes], async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating food listing', error: err.message });
    }

    // Send a notification to the business about the new listing
    const businessNotificationSql = 'INSERT INTO notifications (biz_id, message) VALUES (?, ?)';
    const businessNotificationMessage = `You have successfully created a new food listing for "${item_name}".`;
    await db.promise().query(businessNotificationSql, [biz_id, businessNotificationMessage]);

    // Send notifications to all users about the new listing (if required)
    const userNotificationSql = 'INSERT INTO notifications (user_id, message) SELECT user_id, ? FROM users';
    const userNotificationMessage = `New listing "${item_name}" created by ${businessName}. Check it out!`;
    await db.promise().query(userNotificationSql, [userNotificationMessage]);

    console.log(`Notification sent to business: ${biz_id} for new item: ${item_name}`);
    console.log(`Notifications sent to all users about the new item: ${item_name}`);

    res.status(201).json({ message: 'Food listing created successfully' });
  });
};

module.exports.removeListing = async (req, res) => {
  const listingId = req.params.id;

  try {
    const query = 'DELETE FROM food_listings WHERE id = ? AND no_of_claims >= quantity';

    await new Promise((resolve, reject) => {
      db.query(query, [listingId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    res.redirect('/bizdashboard');
  } catch (error) {
    console.error('Error removing food listing:', error.message);
    res.status(500).json({ message: 'Error removing food listing', error: error.message });
  }
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

module.exports.claimFood = async (req, res) => {
  const foodId = req.params.id;
  const userId = req.session.user_id;

  try {
    // Check if the user has already claimed this food item
    const checkSql = 'SELECT * FROM claimed_items WHERE user_id = ? AND food_id = ?';
    const [existingClaim] = await db.promise().query(checkSql, [userId, foodId]);

    if (existingClaim.length > 0) {
      return res.status(400).send('You have already claimed this food item.');
    }

    // Insert the claim into the claimed_items table
    const claimSql = 'INSERT INTO claimed_items (user_id, food_id) VALUES (?, ?)';
    await db.promise().query(claimSql, [userId, foodId]);

    // Update the number of claims in the food_listings table
    const updateSql = 'UPDATE food_listings SET no_of_claims = no_of_claims + 1 WHERE id = ?';
    await db.promise().query(updateSql, [foodId]);

    // Fetch the food listing and business information
    const foodListingQuery = `
      SELECT f.biz_id, f.item_name, b.name AS business_name 
      FROM food_listings f 
      JOIN business b ON f.biz_id = b.biz_id 
      WHERE f.id = ?
    `;
    const [foodListing] = await db.promise().query(foodListingQuery, [foodId]);

    if (!foodListing || foodListing.length === 0) {
      return res.status(400).json({ message: 'Food listing not found' });
    }

    const { biz_id, item_name, business_name } = foodListing[0];

    // Fetch the user's name to include in the notification
    const userQuery = 'SELECT username FROM users WHERE user_id = ?';
    const [userResult] = await db.promise().query(userQuery, [userId]);

    if (!userResult || userResult.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const userName = userResult[0].username;

    // Insert a notification for the business
    const notificationSql = 'INSERT INTO notifications (biz_id, message) VALUES (?, ?)';
    const notificationMessage = `User ${userName} has claimed your food listing for "${item_name}".`;
    await db.promise().query(notificationSql, [biz_id, notificationMessage]);

    console.log(`Notification sent to business: ${biz_id} for claimed item: ${item_name}`);

    res.redirect('/dashboard');
  } 
  catch (error) {
    console.error("Error during claiming food item:", error.message);
    res.status(500).send('Internal Server Error');
  }
};


module.exports.unclaimFood = async (req, res) => {
  const foodId = req.params.id;
  const userId = req.session.user_id;

  try {
    const deleteSql = 'DELETE FROM claimed_items WHERE user_id = ? AND food_id = ?';
    await db.promise().query(deleteSql, [userId, foodId]);

    const updateSql = 'UPDATE food_listings SET no_of_claims = no_of_claims - 1 WHERE id = ?';
    await db.promise().query(updateSql, [foodId]);

    console.log(`Item unclaimed: ${foodId} by user: ${userId}`);

    res.redirect('/dashboard');
  } 
  catch (error) {
    console.error("Error during unclaiming food item:", error.message);
    res.status(500).send('Internal Server Error');
  }
};


module.exports.bizlogout = async (req, res) => {
  await req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err.message);
      return res.status(500).json({ message: 'Error logging out, please try again' });
    }

    console.log('Logged out successfully');
  });
};

module.exports.isAuthenticated = (req, res, next) => {
  if (req.session.biz_id) {
    next();
  } 
  else {
    res.status(401).send("Unauthorized access, please log in.");
  }
}

module.exports.getNotificationsUser = async (req, res) => {
  try {
    const userId = req.session.user_id;

    if (!userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const sql = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC';
    const [notifications] = await db.promise().query(sql, [userId]);

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

module.exports.getBizNotifications = async (req, res) => {
  try {
    // Get the business ID from the session
    const biz_id = req.session.biz_id;

    if (!biz_id) {
      return res.status(403).json({ message: 'Unauthorized: No business ID found in session' });
    }

    // Query to fetch notifications for this specific business
    const sql = 'SELECT * FROM notifications WHERE biz_id = ? ORDER BY created_at DESC';
    const [notifications] = await db.promise().query(sql, [biz_id]);

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching business notifications:", error.message);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

module.exports.getLeaderboard = async (req, res) => {
  try {
    const query = `
      SELECT u.username, COUNT(c.user_id) AS claims_count
      FROM users u
      JOIN claimed_items c ON u.user_id = c.user_id
      GROUP BY u.user_id
      ORDER BY claims_count DESC
      LIMIT 10
    `;
    
    const [leaderboard] = await db.promise().query(query);
    
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports.submitSupportRequest = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.session.user_id;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required.' });
    }

    const query = 'INSERT INTO support_requests (user_id, subject, message) VALUES (?, ?, ?)';
    await db.promise().query(query, [userId, subject, message]);

    res.status(201).json({ message: 'Support request submitted successfully.' });
  } catch (error) {
    console.error('Error submitting support request:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

