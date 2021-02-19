var express = require('express');
var router = express.Router();
var connection = require('./db');
var bcrypt = require('bcrypt');

//display login page
router.get('/', function (req, res, next) {
    // render to views/user/add.ejs
    res.render('login', {
        title: 'VAT',
        message: {
            error: '',
            success: ''
        },
        username: '',
        password: ''
    });
});

//authenticate user
router.post('/authentication', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    connection.query('SELECT * FROM `useradmins` WHERE UserID = ?', [username], function (err, rows, fields) {
        if (err) throw err;
        // if user not found
        if (rows.length <= 0) {
            res.redirect('/');

        }
        else { // if user found
            // render to views/user/edit.ejs template file
            if (bcrypt.compare(password, rows.password)) {
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/Admin');
            }
            else {
                res.redirect('/');
            }
        }
    });
});

//display register page
router.get('/register', function (req, res, next) {
    // render to views/user/add.ejs
    res.render('register', {
        title: 'VAT',
        username: '',
        email: '',
        DateOfBirth: '',
        address: '',
        PhoneNumber: '',
        password: '',
        password_repeat: ''
    });
});

// user registration
router.post('/post', function (req, res, next) {
    // console.log("In post-register");
    req.assert('username', "Username is required").notEmpty();
    req.assert('username', 'Username is required').notEmpty();          //Validate name
    req.assert('email', 'A valid email is required').isEmail();  //Validate email
    req.assert('password', 'Password is required').notEmpty();   //Validate password
    req.assert('password', 'Password length must be in between 6 to 16').isLength({ min: 6, max: 16 });   //Validate password
    if (req.sanitize('password').escape().trim() == req.sanitize('password_repeat').escape().trim()) {
        var errors = req.validationErrors();
        if (!errors) {   //No errors were found.  Passed Validation!
            username = req.sanitize('username').escape().trim();
            email = req.sanitize('email').escape().trim();
            DateOfBirth = req.sanitize('DateOfBirth').escape().trim();
            PhoneNumber = req.sanitize('PhoneNumber').escape().trim();
            address = req.sanitize('address').escape().trim();
            password = req.sanitize('password').escape().trim();
            var hashedPassword = bcrypt.hash(password, 10);
            connection.query("INSERT INTO `useradmins` (`UserID`, `email`, `DOB`, `address`, `PhoneNumber`, `password`) VALUES ('" + username + "', '" + email + "', '" + DateOfBirth + "', '" + address + "','" + PhoneNumber + "','" + hashedPassword + "')", function (err, result) {
                //if(err) throw err
                if (err) {
                    res.render('register', {
                        title: ' VAT',
                        username: '',
                        email: '',
                        DateOfBirth: '',
                        address: '',
                        PhoneNumber: '',
                        password: '',
                        password_repeat: ''
                    });
                }
            });
        }
        else {   //Display errors to user
            var error_msg = '';
            errors.forEach(function (error) {
                error_msg += error.msg + '<br>';
            });
            res.render('register', {
                title: 'VAT',
                username: req.body.username,
                email: req.body.email,
                DateOfBirth: req.body.DateOfBirth,
                address: req.body.address,
                PhoneNumber: req.body.PhoneNumber,
                password: '',
                password_repeat: ''
            });
        }
    } else {
        alert('Password and Password(repeat) should be same');
        res.render('register', {
            title: 'VAT',
            username: req.body.username,
            email: req.body.email,
            DateOfBirth: req.body.DateOfBirth,
            address: req.body.address,
            PhoneNumber: req.body.PhoneNumber,
            password: '',
            password_repeat: ''
        });
    }

});


//display Admin page
router.get('/Admin', function (req, res, next) {
    if (req.session.loggedin) {
        res.render('Admin', {
            title: "VAT",
            username: req.session.name,
        });
    } else {
        // alert('Please login first!');
        // req.flash('success', 'Please login first!');
        res.redirect('/');
    }
});

router.get('/About', function (req, res, next) {
    if (req.session.loggedin) {
        res.render('About', {
            title: "VAT",
            username: req.session.name,
        });
    } else {
        // alert('Please login first!');
        // req.flash('success', 'Please login first!');
        res.redirect('/');
    }
});

module.exports = router;