const User = require('../models/User');

module.exports = {
    index: (req, res) => {
        User.find({role:'customer'}, function (err, users) {
            res.format({
                'application/json': () => {
                    let customers = users.map(user => {
                        let customer = {}
                        customer.id = user.id
                        customer.name = user.name
                        customer.email = user.email
                        customer.orders = user.orders
                        customer.role = user.role
                        customer.date_registerd = user.date
                        return customer
                    })
                    res.json({customers: customers});
                },
                'application/xml': () => {
                    let customersXml = '<?xml version="1.0"?>\n' +
                        '<customers>\n' +
                        users.map(function (user) {
                            return '\t<customer id="' + user.id + '">\n' +
                                '\t\t<name>' + user.name + '</name>\n' +
                                '\t\t<email>' + user.email + '</email>\n' +
                                '\t\t<role>' + user.role + '</role>\n' +
                                '\t\t<date_registered>' + user.date + '</date_registered>\n' +
                                '\t</customer>';
                        }).join('\n') + '\n</customers>\n'

                    res.type('application/xml');
                    res.send(customersXml);
                },
                'text/html': () => {
                    res.render('admin/customers', { layout: 'admin', users: users })
                }
            });
        });
    },
    orders: (req, res) => {
        User.findOne({ _id: req.params.id }, function (err, user) {
            Order.find({ user: user._id }, function (err, orders) {
                res.render('admin/customerorders', { layout: 'admin', user: user, orders: orders })
            })
        });
    }
}