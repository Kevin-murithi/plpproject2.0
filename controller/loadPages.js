const db = require('../models/db');

module.exports.indexPage = async (_req, res) => {
  res.render('index', {pageTitle: 'Home'});
}

module.exports.signUP = async (_req, res) => {
  res.render('registerUser', {pageTitle: 'signUp'});
}

module.exports.signIn = async (_req, res) => {
  res.render('loginUser', {pageTitle: 'signIn'});
}

module.exports.selectAuth = async (_req, res) => {
  res.render('selectAuth', {pageTitle: 'selectAuth'});
}

module.exports.adminSignIn = async (_req, res) => {
  res.render('adminLogin', {pageTitle: 'adminSignIn'});
}

module.exports.bizsignUP = async (_req, res) => {
  res.render('registerbiz', {pageTitle: 'bizsignUp'});
}

module.exports.bizsignIn = async (_req, res) => {
  res.render('loginbiz', {pageTitle: 'bizsignIn'});
}

module.exports.dashboard = async (req, res) => {
  try {
    const userId = req.session.user_id;

    // Fetch user details (username, email, phone_number)
    const userQuery = 'SELECT username, email, phone_number FROM users WHERE user_id = ?';
    const [userResult] = await db.promise().query(userQuery, [userId]);

    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { username, email, phone_number } = userResult[0];  // Extract user details

    // Fetch all food listings and associated business details
    const query = `
      SELECT f.*, b.name AS business_name 
      FROM food_listings f 
      JOIN business b ON f.biz_id = b.biz_id 
      ORDER BY f.created_at DESC
    `;
    const foodListings = await new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // Check claimed status for each food listing by the logged-in user
    const claimedItems = await Promise.all(foodListings.map(async (item) => {
      const sql = 'SELECT * FROM claimed_items WHERE user_id = ? AND food_id = ?';
      const [result] = await db.promise().query(sql, [userId, item.id]);
      return { ...item, claimed: result.length > 0 };  // Add claimed status to each listing
    }));

    // Count the number of claims made by the logged-in user
    const claimsQuery = 'SELECT COUNT(*) AS claims_count FROM claimed_items WHERE user_id = ?';
    const [claimsResult] = await db.promise().query(claimsQuery, [userId]);
    const claimsCount = claimsResult[0].claims_count || 0;  // Get the number of claims (default to 0 if none)

    // Calculate waste reduction percentage
    const totalListingsQuery = 'SELECT COUNT(*) AS total_listings FROM food_listings';
    const [totalListingsResult] = await db.promise().query(totalListingsQuery);
    const totalListings = totalListingsResult[0].total_listings || 1;  // Default to 1 to avoid division by zero

    const wasteReduction = ((claimsCount / totalListings) * 100).toFixed(2);  // Waste reduction as percentage, rounded to 2 decimal places

    // Render the dashboard with user details, claims count, and waste reduction
    res.render('dashboard', {
      pageTitle: 'User Dashboard',
      username,         // Pass username
      email,            // Pass email
      phone_number,     // Pass phone number
      foodListings: claimedItems,  // Pass listings with claim status
      claimsCount,      // Pass the number of claims
      wasteReduction    // Pass the waste reduction percentage
    });
  } 
  catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports.bizdashboard = async (req, res) => {
  try {
    const bizId = req.session.biz_id;

    // Update max_exceeded for all listings of the business where no_of_claims >= quantity
    const updateQuery = `
      UPDATE food_listings 
      SET max_exceeded = 'yes' 
      WHERE biz_id = ? AND no_of_claims >= quantity
    `;

    // Execute the update query to set max_exceeded where necessary
    await new Promise((resolve, reject) => {
      db.query(updateQuery, [bizId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // Query the food listings specific to the logged-in business
    const query = 'SELECT * FROM food_listings WHERE biz_id = ? ORDER BY created_at DESC';
    
    const foodListings = await new Promise((resolve, reject) => {
      db.query(query, [bizId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (foodListings.length === 0) {
      return res.render('bizdashboard', { pageTitle: 'Business dashboard', foodListings: [] });
    }

    // Render the dashboard with the filtered food listings
    res.render('bizdashboard', {
      pageTitle: 'Business dashboard',
      foodListings: foodListings,
    });
  } 
  catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ message: 'Error fetching data', error: error.message });
  }
};

module.exports.admindashboard = async (_req, res) => {
  res.render('admindashboard', {pageTitle: 'Admin Dashboard'});
}