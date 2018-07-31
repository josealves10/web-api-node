var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();
let User = require('../models/user');

router.get('/login', (req, res) => {
	res.render('login');
});

passport.use(new LocalStrategy(
  function(username, password, done) {
  	User.getUserByUsername(username, (err, user) => {
  		if(err) throw err;
  		if(!user){
  			return done(null, false, {message: 'Unknown User'});
  			console.log('user inexistente');
  		}

  		User.comparePassword(password, user.password, (err, isMatch) => {
  			if(err) throw err;
  			if(isMatch){
  				console.log('work');
  				return done(null, user);
  			} else {
  				console.log('invalid password');
  				return done(null, false, {message: 'Invalid Password'});
  			}
  		});
  	});
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login', 
	passport.authenticate('local', {successRedirect: '/dashboard', failureRedirect: '/users/login', failureFlash: true}), 
	(req, res) => {
	res.redirect('/dashboard');
});

router.post('/regist', (req, res) => {
  let name = req.body.name;
  let username = req.body.username;
  let password = req.body.password;
  let type = req.body.type;
  let description = req.body.description;

  let user = new User();
  user.name = name;
  user.username = username;
  user.password = password;
  user.type = type;
  user.description = description;

  User.createUser(user, (err, result) => {
    if(err) throw err;
    console.log(result);
  });
});


router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success_msg', 'You are logged out ');

	res.redirect('/users/login');
});

module.exports = router;