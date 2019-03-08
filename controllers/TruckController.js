const axios = require('axios');
const MenuItem = require('../models/MenuItem');
const mongoose = require('mongoose');
module.exports = {
    index: (req, res) => {

        // if(!req.query._lat || !req.query._lng) {
        //     return res.render('search');
        // } else if (!req.session.lat || !req.session.lng) {
        //     req.session.lat = req.query._lat
        //     req.session.lng = req.query._lng
        // }

        // if (req.query._lat && req.query._lng) {

        // }

        axios.get('https://api.yelp.com/v3/businesses/search?term=tacos&latitude='+req.query._lat+'&longitude='+req.query._lng+'&categories=mexican,foodtrucks&price=1,2,3&sort_by=rating',
        {headers: {
            "Authorization" : "bearer n5JJRNBlussSj3N3Ufjw9YuV7q-4xnjTBRK_Ehj5zaLDnXWGzjV8PhA0RaQ4PDqeOZFInVjigcx0M1KEtZsEQ1mhuscYIvcAKq2CTUhqOj_NmiN_uz8imbdowGXrW3Yx"
        }
        })
        .then(response => {
            trucks = response.data.businesses
            res.format({
                'application/json': () => {
                    let results = response.data.businesses
                    let trucks = results.map(result => {
                        let truck = {}
                        truck.id = result.id
                        truck.name = result.name
                        truck.address = result.location.address1
                        truck.phone = result.phone
                        truck.price = result.price
                        truck.rating = result.rating
                        truck.url = '/api/trucks/' + result.id
                        return truck
                    })
                    return res.json({trucks: trucks});
                },
                'application/xml': () => {
                    let trucksXml = '<?xml version="1.0"?>\n' +
                        '<trucks>\n' +
                        response.data.businesses.map(function (truck) {
                            return '\t<truck id="' + truck.id + '">\n' +
                                '\t\t<name>' + truck.name + '</name>\n' +
                                '\t\t<address>' + truck.location.address1 + '</address>\n' +
                                '\t\t<phone>' + truck.phone + '</phone>\n' +
                                '\t\t<price>' + truck.price + '</price>\n' +
                                '\t\t<rating>' + truck.location.address1 + '</rating>\n' +
                                '\t\t<url>' + '/api/trucks/' + truck.id + '</url>\n' +
                                '\t</truck>';
                        }).join('\n') + '\n</trucks>\n'

                    res.type('application/xml');
                    return res.send(trucksXml);
                },
                'text/html': () => {
                    trucks = response.data.businesses
                    return res.render('trucks', { trucks: trucks })
                }
            });
        })
        .catch(error => {
            res.format({
                'application/json': () => {
                    res.status(404)
                    return res.json({error: 'Please specify latitude and longitude.'});
                },
                'application/xml': () => {
                    let message = "\n<?xml version='1.0'?>\n" +
                        "<message>Method not supported.</message>"

                    res.type('application/xml');
                    return res.send(message);
                },
                'text/html': () => {
                    res.status(404)
                    return res.render('search')
                }
            })
        });
    },
    show: (req, res) => {
        function aggregateMenu(collection, callback){
            collection.aggregate([
                { $group : { _id : "$category", items: { $push: "$$ROOT" } } }
                ], function(err, result) {
                if (err) {
                    console.log(err);
                } else if (result.length > 0) {
                    menu = result;
                }
            });
        }
        let menu = aggregateMenu(MenuItem);

        url = 'https://api.yelp.com/v3/businesses/' + req.params.id
        axios.get(url, {
            headers: {
                "Authorization" : "bearer n5JJRNBlussSj3N3Ufjw9YuV7q-4xnjTBRK_Ehj5zaLDnXWGzjV8PhA0RaQ4PDqeOZFInVjigcx0M1KEtZsEQ1mhuscYIvcAKq2CTUhqOj_NmiN_uz8imbdowGXrW3Yx"
            }
        })
        .then(response => {
            truck = response.data
            req.session.truck = truck
            res.format({
                'application/json': () => {
                    let truck = response.data;
                    let result = {};

                    result.id = truck.id;
                    result.name = truck.name;
                    result.address = truck.location.address1
                    result.phone = truck.phone
                    result.price = truck.price
                    result.rating = truck.rating
                    result.url = '/api/trucks/' + truck.id
                    result.menu = menu

                    return res.json({truck: result});
                },
                'text/html': () => {
                    truck = response.data
                    req.session.truck = truck
                    return res.render('truck', { truck: truck, menu: menu })
                }
            });
        })
        .catch(error => {
            res.format({
                'application/json': () => {
                    res.status(404)
                    return res.json({error: 'Truck with that ID not found.'});
                },
                'application/xml': () => {
                    let message = "\n<?xml version='1.0'?>\n" +
                        "<message>Truck with that ID not found.</message>"

                    res.type('application/xml');
                    return res.send(message);
                },
                'text/html': () => {
                    return res.render('search')
                }
            })
        });


    }
}