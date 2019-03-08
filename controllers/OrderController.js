const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const mongoose = require('mongoose');

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport')

function getItems(req, res) {
    MenuItem.find(function (err, items) {
        if (err) res.send(err);

        return items;
    });
}

module.exports = {
    index: (req, res) => {
        if (!req.user) {
            return res.redirect('/login')
        }

        const orders = User.
            findOne({ _id: req.user._id }).
            populate('orders').
            exec(function (err, user) {
                if (err) return handleError(err);
                return res.render('orders', {orders:user.orders})
            });
    },
    create: (req, res) => {
        if (req.user) {
            req.session.order.user = req.user
            req.session.order.status = 'Pending'
            Order.create(req.session.order).then((order) => {
                console.log(order);
                req.user.orders.push(order)
                req.user.save();
            });

            req.session.flash = {
                type: 'success',
                intro: 'Thank you!',
                message: 'Your order is being processed.'
            }
            delete req.session.order
            return res.redirect(303, '/orders');
        }

        const { name, email, password } = req.body;
        let errors = [];

        console.log(password);

        if (!name || !email ) {
            errors.push(req.session.flash = {
                type: 'danger',
                intro: 'Oops!',
                message: 'Please provide your name and email address.'
            })
        }

        if (password && password.length < 6) {
            errors.push(req.session.flash = {
                type: 'danger',
                intro: 'Oops!',
                message: 'Your password must be at least 6 characters.'
            })
        }

        if (errors.length > 0) {
            res.redirect('back');
        }

        // attempt to find a user with the email provided
        // otherwise, register a new user with the credentials
        User.findOne({ email: email }).then(user => {
            // if the user exists we'll log them in
            // and process the order
            if (user) {
                passport.authenticate('local', (err, user, info) => {
                    if (err) { return next(err); }
                    if (!user) {
                        req.session.flash = {
                            type: 'danger',
                            intro: 'Oops!',
                            message: 'The credentials you provided are incorrect.'
                        }
                        return res.redirect('back');
                    }
                    req.logIn(user, function (err) {
                        if (err) {
                            req.session.flash = {
                                type: 'danger',
                                intro: 'Oops!',
                                message: 'The credentials you provided are incorrect.'
                            }
                            res.redirect('back');
                        }

                        Order.create(req.session.order).then((order) => {
                            console.log(order);
                            user.orders.push(order)
                            user.save();
                        });

                        req.session.flash = {
                            type: 'success',
                            intro: 'Thank you!',
                            message: 'Your order is being processed.'
                        }

                        res.redirect('/orders');
                    });
                })(req, res);
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
                                        res.redirect('back');
                                    }
                                });
                            })
                            .catch(err => console.log(err));
                    });
                });

                Order.create(req.session.order).then((order) => {
                    console.log(order);
                    req.user.orders.push(order)
                    req.user.save();
                });

                req.session.flash = {
                    type: 'success',
                    intro: 'Thank you!',
                    message: 'Your order is being processed.'
                }

                res.redirect('/orders');
            }
        });

    },
    update: (req, res) => {
        MenuItem.findOne({ _id: req.body._item }).then(item => {
            if (item) {
                qty = req.body.itemQuantity ? parseInt(req.body.itemQuantity) : 1;

                let orderItem = {}

                orderItem.id = item._id;
                orderItem.name = item.name;
                orderItem.description = item.description;
                orderItem.price = item.price;
                orderItem.truck = req.session.truck.name;
                orderItem.quantity = qty;

                req.session.order.items.push(orderItem)
                req.session.order.total += item.price * qty
                req.session.order.totalItems += qty;

                req.session.flash = {
                    type: 'success',
                    intro: 'Yum!',
                    message: 'Added ' + item.name + ' to your order.'
                }

                res.redirect('back')
            } else {
                res.status(404)
                res.render('404')
            }
        });
    },
    delete: (req, res) => {
        let itemId = req.params.id;

        let orderItems = req.session.order.items;

        req.session.order.items = orderItems.filter((item) => {
            if (item.id == itemId) {
                item.quantity -= 1;
                req.session.order.total -= item.price;
                req.session.order.totalItems -= 1;
            }
            return item.quantity > 0;
        });

        req.session.flash = {
            type: 'success',
            intro: 'Aw!',
            message: 'Item removed from your order.'
        }

        res.redirect('back')

    },
    add: (req, res) => {
        let itemId = req.params.id;

        let orderItems = req.session.order.items;

        orderItems.filter((item) => {
            if (item.id == itemId) {
                item.quantity += 1;
                req.session.order.total += item.price;
                req.session.order.totalItems += 1;
            }
        })

        req.session.flash = {
            type: 'success',
            intro: 'Woot!',
            message: 'Item quantity increased. You must be hungry!'
        }

        res.redirect('back');
    },
    show: (req, res) => {
        if (!req.user) {
            return res.redirect('/login')
        }

        Order.findOne({_id:req.params.id}, function (err, order) {
            if(err) {
                res.status(404)
                return res.render('404');
            }
            return res.render('order', {order:order});
        });
    },
}