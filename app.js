const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');
const mongoose = require('mongoose');
const pass = "jpcgpa";

//Connection to DB
mongoose.connect('mongodb://localhost/cmu');
let db = mongoose.connection;

db.once('open', () => {
  console.log("Connected to MongoDB");
});

db.on('error', (err) => {
  console.log(err);
});

let routes = require('./routes/index');
let users = require('./routes/users');

const app = express();


app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

//body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

app.use(passport.initialize());
app.use(passport.session());


//express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    let namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    }
  }
}));

//connect flash
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/', routes);
app.use('/users', users);

/*

let Local = require('./models/local');
let User = require('./models/user');


//API ROUTES

//GET All locals
app.get('/api/locals/all', (req, res) => {
  Local.find({}, (err, locals) => {
    if(err){
      res.status(500).send(err);
    }
    res.status(200).json(locals);
  });
});

//GET Locals By City
app.get('/api/locals/city', (req, res) => {
  let cityPretended = req.query.city;

  Local.find({city: cityPretended}, (err, locals) => {
    if(err){
      res.status(500).send(err);
    }
    res.status(200).json(locals);
  });
});


//DASHBOARD ROUTES


app.get('/dashboard/add', (req, res) => {
  res.render('add');
});

//ADD LOCALS ROUTE
app.post('/dashboard/add', (req, res) => {
  let key = req.body.password;

  if(key === pass){
    let local = new Local();
    local.name = req.body.name;
    local.description = req.body.description;
    local.type = req.body.type;
    local.latitude = req.body.latitude;
    local.longitude = req.body.longitude;
    local.likes = req.body.likes;
    local.city = req.body.city;
    local.contact = req.body.contact;
    local.imageURL = req.body.imageURL;

    local.save((err) => {
      if(err){
        res.status(500).send('error');
        return;
      }else {
        res.status(200).send('ok');
      }
    });
  }else {
    res.redirect('/');
    console.log("password errada");
  }
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login');
});
*/
app.listen(3000, () => {
  console.log("Server running on PORT 3000...");
});