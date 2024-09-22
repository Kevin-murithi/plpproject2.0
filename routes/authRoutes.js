const { Router } = require ('express');
const router = Router();
const bodyParser = require('body-parser');
const authController = require ('../controller/authController');
const loadPages = require ('../controller/loadPages');
const {isAuthenticated} = require('../controller/authController')

// create application/json parser
const jsonParser = bodyParser.json();

router.get('/', loadPages.indexPage);
router.get('/signUP', loadPages.signUP);
router.get('/signIn', loadPages.signIn);
router.get('/dashboard', loadPages.dashboard);
router.get('/bizsignUP', loadPages.bizsignUP);
router.get('/bizsignIn', loadPages.bizsignIn);
router.get('/bizdashboard', loadPages.bizdashboard);
router.get('/selectAuth', loadPages.selectAuth);
router.get('/adminSignIn', loadPages.adminSignIn);
router.get('/admindashboard', loadPages.admindashboard);

router.post('/register', authController.register);
router.post('/api/users/login', authController.login);
router.get('/api/users/profile', authController.profile);

//router.post('/api/users/adminLogin', authController.adminLogin);

router.post('/bizregister', authController.bizregister);
router.post('/api/users/bizlogin', authController.bizlogin);
router.get('/api/users/bizprofile', authController.bizprofile);
router.get('/bizlogout', authController.bizlogout);

router.post('/api/food/createFood', authController.createFood);
router.post('/api/food/removeListing', authController.removeListing);
router.get('/api/food/listings', authController.listings);
router.get('/api/food/listings/:id', authController.singleListing);

router.get('/claim/:id', authController.claimFood);
router.get('/unclaim/:id', authController.unclaimFood);

module.exports = router;