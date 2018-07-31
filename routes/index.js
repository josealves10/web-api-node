const express = require('express');
const moment = require('moment');
let router = express.Router();
let Local = require('../models/local');
let User = require('../models/user');
let Access = require('../models/access');

router.get('/', (req, res) => {
	res.render('home');
});

router.get('/api/locals/all', (req, res) => {
	Local.getAllLocals((err, locals) => {
		if(err) throw err;
		res.send(locals);
	});
});

router.get('/api/locals/city', (req, res) => {
	let city = req.query.city;

	Local.getLocalsByCity(city, (err, locals) => {
		if(err) throw err;

		let access = new Access();
		access.city = city;

		let today = new Date();

		let finalDate = moment(today).format('YYYY-DD-MM');

		access.accessDate = finalDate;

		Access.createAccess(access, (err, result) => {
			if(err) throw err;
			res.send(locals);
		});
	});
});

//mudei isto
router.post('/newpassword', ensureAuthentication, (req, res) => {
	let x = req.body.password;

	let userId = req.user._id;

	User.newPassword(userId, x, (err, result) => {
		if(err) throw err;
		res.redirect('/dashboard');
	});
});

router.get('/dashboard', ensureAuthentication, (req, res) => {
	let allAccess;
	let mostCityRequested;
	let numberLocals;
	let acessos;
	let mostCityLocals;

	let firstLogin = req.user.firstLogin;

	if(firstLogin){
		res.render('change-password');
	} else {
			Access.getMostCityRequested((err, result) => {
		if(err) throw err;
		 mostCityRequested = result[0]._id;

		Access.getAllAccess((err, result2) => {
			if(err) throw err;
			allAccess = result2;

			Local.getLocalCount((err, result3) => {
				if(err) throw err;
				numberLocals = result3;

				Local.getMostCityLocal((err, result5) => {
					if(err) throw err;

					mostCityLocals = result[0]._id;
					let today = new Date();
					let todayString = moment(today).format('YYYY-DD-MM');

					Access.getAccessOfToday(todayString, (err, result4) => {
						if(err) throw err;
						acessos = result4;		

						let finalResult = {
							nAccess: allAccess,
							totalAcessos: acessos,
							cityAccess: mostCityRequested,
							cityLocal: mostCityLocals,
							nLocals: numberLocals
						};

						res.render('index', {data: finalResult});
						});
					});
			});
		});
	});
	}



});

router.get('/dashboard/locals', ensureAuthentication, (req, res) => {
	Local.getAllLocals((err, locals) => {
		if(err) throw err;
		if(!locals){			
			req.flash('error_msg', 'You dont have any local');
		}
	res.render('locals', {data: locals});
	});
});

router.get('/dashboard/locals/detail', ensureAuthentication, (req, res) => {
	let id = req.query.id;

	Local.getLocalById(id, (err, local) => {
		if(err) throw err;
		res.render('local-detail', {data: local});
	});
});

router.get('/dashboard/locals/add', ensureAuthentication, (req, res) => {
	res.render('local-add');
});

router.post('/dashboard/locals/add', ensureAuthentication, (req, res) => {
	let local = new Local();
		local.name = req.body.name,
		local.description = req.body.description,
		local.type = req.body.type,
		local.latitude = req.body.latitude,
		local.longitude = req.body.longitude,
		local.city = req.body.city,
		local.contact = req.body.contact,
		local.imageURL = req.body.imageURL,
		local.website = req.body.website,
		local.cost_for_two = req.body.cost_for_two

	Local.addLocal(local, (err, result) => {
		if(err) throw err;
		req.flash("success_msg", "Local successfull added!");
		res.redirect('/dashboard/locals');
	});
});

router.get('/dashboard/locals/delete', ensureAuthentication, (req, res) => {
	let id = req.query.id;

	Local.removeLocal(id, (err, local) => {
		if(err) throw err;
		req.flash("success_msg", "Local successfull deleted!");
		res.redirect('/dashboard/locals');
	});
});


router.get('/dashboard/locals/edit', ensureAuthentication, (req, res) => {
	let id= req.query.id;

	Local.getLocalById(id, (err, local) => {
		if(err) throw err;
		res.render('local-edit', {data: local});
	});
});

router.post('/dashboard/locals/edit', ensureAuthentication, (req, res) => {
	let id = req.body.id;

	Local.getLocalById(id, (err, local) => {
		if(err) throw err;
		local.type = req.body.type;
		local.contact = req.body.contact;
		local.imageURL = req.body.imageURL;
		local.website = req.body.website;

		local.save();
		req.flash("success_msg", "Local Successfull edited!");
		res.redirect('/dashboard/locals');
	});
});

router.get('/dashboard/users', ensureAuthentication, (req, res) => {
	User.getAllUsers((err, values) => {
		if(err) throw err;
		if(!values){
			req.flash('error_msg', 'You dont have any User');			
		}

		let result = false;

		let type = req.user.type;

		if(type === "CEO"){
			result = true;
		}

		let information = {
			isCEO: result,
			users: values
		};

	res.render('users.handlebars', {data: information});
	});
});

router.get('/dashboard/users/add', ensureAuthentication, (req, res) => {
	res.render('user-add');
});

router.post('/dashboard/users/add', ensureAuthentication, (req, res) => {
	let user = new User();
	user.name = req.body.name;
	user.username = req.body.username;
	user.password = req.body.password;
	user.type = req.body.type;
	user.description = req.body.description;

	User.createUser(user, (err, result) => {
		if(err) throw err;
		req.flash("success_msg", "User successfull created!");
		res.redirect('/dashboard/users');		
	});
});

router.get('/dashboard/users/edit', ensureAuthentication, (req, res) => {
	let id = req.query.id;

	User.getUserById(id, (err, user) => {
		if(err) throw err;
		res.render('user-edit', {data: user});
	});
});

router.post('/dashboard/users/edit', ensureAuthentication, (req, res) => {
	let id = req.body.id;
	User.getUserById(id, (err, user) => {
		if(err) throw err;
		user.type = req.body.type;
		user.description = req.body.description;

		user.save();
		req.flash("success_msg", "User Successfull edited!");
		res.redirect('/dashboard/users');
	});
});

router.get('/dashboard/users/delete', ensureAuthentication, (req, res) => {
	let id = req.query.id;

	User.getUserById(id, (err, user) => {
		if(err) throw err;

		if(user.type === "CEO"){
			req.flash("error_msg", "CEO can not be deleted");
			res.redirect('/dashboard/users');
		} else {
			User.removeUser(id, (err, result) => {
				if(err) throw err;
				req.flash("success_msg", "User Successful deleted!");
				res.redirect('/dashboard/users');
			});
		}
	});
});



function ensureAuthentication(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg', 'You are not logged in');
		res.redirect('/');
	}
}

module.exports = router;