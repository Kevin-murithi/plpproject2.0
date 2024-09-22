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
    const query = 'SELECT * FROM food_listings ORDER BY created_at DESC';
    
    // Promisify the database query for food listings
    const foodListings = await new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (foodListings.length === 0) {
      return res.render('dashboard', { pageTitle: 'User dashboard', foodListings: [], bizDetails: [] });
    }

    const businessId = foodListings[0].biz_id; 
    const getBizDetails = `SELECT * FROM business WHERE biz_id = ?`;

    // Promisify the business details query
    const bizDetails = await new Promise((resolve, reject) => {
      db.query(getBizDetails, [businessId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    const userId = req.session.user_id;

    // Check claimed status for each food listing
    const claimedItems = await Promise.all(foodListings.map(async (item) => {
      const sql = 'SELECT * FROM claimed_items WHERE user_id = ? AND food_id = ?';
      const [result] = await db.promise().query(sql, [userId, item.id]);
      return { ...item, claimed: result.length > 0 };
    }));

    // Render the dashboard with the data
    res.render('dashboard', {
      pageTitle: 'User dashboard',
      foodListings: claimedItems,
      bizDetails: bizDetails,
      userId: userId
    });
  } 
  
  catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ message: 'Error fetching data', error: error.message });
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