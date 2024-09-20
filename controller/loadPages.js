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

module.exports.dashboard = async (_req, res) => {
  const query = 'SELECT * FROM food_listings ORDER BY created_at DESC';
    
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching food listings', error: err.message });
    }

    res.render('dashboard', {pageTitle: 'User dashboard', foodListings: results});
  });
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

module.exports.bizdashboard = async (_req, res) => {
  res.render('bizdashboard', {pageTitle: 'bizdashboard'});
}
