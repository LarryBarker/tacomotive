const Order = require('../models/Order');

module.exports = {
    index: (req, res) => {
        res.render('admin/index', { layout: 'admin' })
    },
    orders: (req, res) => {
        Order.find({}).sort({ date: 'desc' }).exec(function (err, orders) {
            res.format({
                'application/json': () => {
                    res.json({orders: orders});
                },
                'application/xml': () => {
                    let ordersXml = '<?xml version="1.0"?>\n' +
                        '<orders>\n' +
                        orders.map(function (order) {
                            return '\t<order id="' + order.id + '">\n' +
                                '\t\t<total>' + order.total + '</total>\n' +
                                '\t\t<status>' + order.status + '</status>\n' +
                                '\t\t<date>' + order.date + '</date>\n' +
                                '\t</order>';
                        }).join('\n') + '\n</orders>\n'

                    res.type('application/xml');
                    res.send(ordersXml);
                },
                'text/html': () => {
                    res.render('admin/orders', { layout: 'admin', orders: orders })
                }
            });
        });
    },
    order: (req, res) => {
        Order.findOne({_id:req.params.id}, function (err, order) {
            if(err) {
                res.status(404)
                return res.render('404', {layout: 'admin'});
            }
            if (order.status == 'Pending') {
                status = order.status
            } else {
                status = undefined;
            }
            User.findOne({_id:order.user}, function (err, user) {
                return res.render('admin/order', {
                    layout: 'admin',
                    order: order, user: user, status: status
                });
            })
        })
    },
    processOrder: (req, res) => {
        Order.findOne({_id:req.params.id}, function (err, order) {
            if(err) {
                res.status(404)
                return res.render('404', {layout: 'admin'});
            }
            order.status = 'Complete';
            order.save()
            return res.redirect('back');

        })
    }
}