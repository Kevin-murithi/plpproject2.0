const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path')
const hbs = require('express-handlebars');
const Handlebars = require('handlebars');
const dotenv = require('dotenv');
const db = require('./models/db');
const authRoutes = require("./routes/authRoutes");
const morgan = require('morgan');

dotenv.config();
const app = express();

//Set view engine
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');

const handlebars = hbs.create({
  extname: '.hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars)
});

app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(session({
  key: 'session_cookie_name',
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(authRoutes);
app.use(cors());
app.use(morgan("dev"));


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});