const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport')

// https://medium.com/@nikjohn/express-js-node-js-extract-path-from-request-object-529ceef2c7e5
function pathExtractor(req) {

    path = req.get('referrer').split(req.get('referrer').split(req.get('host'))[0]+req.get('host'))[1];

    return path;

  }

module.exports = {
    login: (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) { return next(err); }
            if (!user) {
                req.session.flash = {
                    type: 'danger',
                    intro: 'Oops!',
                    message: 'The credentials you provided are incorrect.'
                }
                console.log(pathExtractor(req))
                if (pathExtractor(req) == '/checkout') {
                    return res.redirect(303, '/checkout')
                }
                return res.redirect('/login');
            }
            req.logIn(user, function (err) {
                if (err) {
                    req.session.flash = {
                        type: 'danger',
                        intro: 'Oops!',
                        message: 'The credentials you provided are incorrect.'
                    }
                    return next(err);
                }

                req.session.flash = {
                    type: 'success',
                    intro: 'Welcome back!',
                    message: 'You have logged in successfully.'
                }

                if (user.role == 'admin')
                    return res.redirect('/admin');

                if (pathExtractor(req) == '/checkout') {
                    return res.redirect(303, '/checkout')
                }

                return res.redirect('/');
            });
        })(req, res, next);
    },
    signup: (req, res) => {
        const { name, email, password } = req.body;
        let errors = [];

        if (!name || !email || !password) {
            errors.push(req.session.flash = {
                type: 'danger',
                intro: 'Oops!',
                message: 'Please provide all fields.'
            })
        }

        if (password.length < 6) {
            errors.push(req.session.flash = {
                type: 'danger',
                intro: 'Oops!',
                message: 'Your password must be at least 6 characters.'
            })
        }

        if (errors.length > 0) {
            res.render('signup', {
                errors,
                name,
                email,
                password,
            });
        } else {
            User.findOne({ email: email }).then(user => {
                if (user) {
                    req.session.flash = {
                        type: 'danger',
                        intro: 'Oops!',
                        message: 'That email already exists.'
                    }
                    res.render('signup', {
                        name,
                        email,
                        password,
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser
                                .save()
                                .then(user => {
                                    req.logIn(user, function (err) {
                                        if (err) {
                                            req.session.flash = {
                                                type: 'danger',
                                                intro: 'Oops!',
                                                message: 'The credentials you provided are incorrect.'
                                            }
                                            return next(err);
                                        }

                                        req.session.flash = {
                                            type: 'success',
                                            intro: 'Thank you!',
                                            message: 'You are now logged in!'
                                        }

                                        if (req.session.order.items) {
                                            return res.redirect(303, '/checkout')
                                        }

                                        return res.redirect('/');
                                    });
                                })
                                .catch(err => console.log(err));
                        });
                    });
                }
            });
        }
    },
    logout: (req, res) => {
        req.logout();
        req.session.flash = {
            type: 'success',
            intro: 'See you!',
            message: 'You are logged out!'
        }
        res.redirect('/');
    }
}