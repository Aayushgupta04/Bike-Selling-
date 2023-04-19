const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const User = require('./models/user');

const app = express();

app.set('views', path.join(__dirname, 'views'));


// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/bikeselling',{
  useNewUrlParser :true,
  useUnifiedTopology :true
});

const db = mongoose.connection;

db.on("error",console.error.bind(console,"connection error :"));
db.once("open",()=>{
  console.log('database connected')
});

// Set up session middleware
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false
}));

// Set up middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));

// Set up middleware to serve static files
app.use(express.static('public'));

// Set up view engine
app.set('view engine', 'ejs');

// Set up routes
app.get('/', function(req, res) {
  res.render('home');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login', async function(req, res) {
  const { email, password } = req.body;

  const user = await User.authenticate(email, password);

  if (user) {
    req.session.user = user;
    res.redirect('/');
  } else {
    res.render('login', { error: 'Invalid email or password' });
  }
});

app.get('/register', function(req, res) {
  res.render('register');
});

app.post('/register', async function(req, res) {
  const { name, email, password } = req.body;

  // Validate form data
  if (!name || !email || !password) {
    return res.render('register', { error: 'Please fill in all fields' });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.render('register', { error: 'Email already in use' });
  }

  // Create new user
  const user = new User({ name, email, password });
  await user.save();

  req.session.user = user;

  res.redirect('/');
});

app.get('/contact', function(req, res) {
  res.render('contact');
});
app.get('/home', function(req, res) {
  res.render('home');
});

app.post('/contact', function(req, res) {
  // Handle form submission here
  // Send email, save to database, etc.
  res.send('Thanks for contacting us!');
});

// Start server
app.listen(3000, function() {
  console.log('Server started on port 3000');
});