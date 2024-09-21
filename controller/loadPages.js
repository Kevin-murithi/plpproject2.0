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
    
    // Promisify the database query
    const foodListings = await new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (foodListings.length === 0) {
      return res.render('dashboard', {pageTitle: 'User dashboard', foodListings: [], bizDetails: []});
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

    // Render the dashboard with the data
    res.render('dashboard', {
      pageTitle: 'User dashboard',
      foodListings: foodListings,
      bizDetails: bizDetails
    });
  } 
  catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ message: 'Error fetching data', error: error.message });
  }
};


module.exports.bizdashboard = async (_req, res) => {
  res.render('bizdashboard', {pageTitle: 'Business dashboard'});
}

module.exports.admindashboard = async (_req, res) => {
  res.render('admindashboard', {pageTitle: 'Admin Dashboard'});
}