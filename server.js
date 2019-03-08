const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const expressValidator = require('express-validator');


const config = require('./config/db');

mongoose.connect(config.database, { useNewUrlParser: true });
let db = mongoose.connection;

// Check connection
db.once('open', ()=> {
    console.log('Connected to MongoDB');
    console.log('Seeding admin user...')
    let User = require('./models/User');
    let bcrypt = require('bcryptjs');
    User.findOne({ email: 'lbarker@bu.edu'}, (err, user) => {
        if(err) return console.error(err);
        if(user) return console.log('Database already seeded!');
        let admin = new User({
                    name: 'Larry',
                    email: 'lbarker@bu.edu',
                    password: 'larry12345',
                    role: 'admin'
                });
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(admin.password, salt, (err, hash) => {
                if (err) throw err;
                admin.password = hash;
                admin.save().then(console.log('Successfully added admin!'));
            });
        });
    });

    User.findOne({ email: 'taco@jon.com'}, (err, user) => {
        if(err) return console.error(err);
        if(user) return console.log('Demo user already added!');
        let admin = new User({
                    name: 'Jon',
                    email: 'taco@jon.com',
                    password: 'tacojon1',
                    role: 'customer'
                });
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(admin.password, salt, (err, hash) => {
                if (err) throw err;
                admin.password = hash;
                admin.save().then(console.log('Successfully added demo user!'));
            });
        });
    });

    console.log('Seeding default menu...')
    let MenuItem = require('./models/MenuItem');

    let menu = [
        {
            name: 'Queso & Chips',
            category: 'Starters',
            price: 4.00,
            description: 'Cheese with green chilies and garlic'
        },
        {
            name: 'Guacamole & Chips',
            category: 'Starters',
            price: 4.00,
            description: 'Avocado-based dip with onion, garlic, tomato and lime juice'
        },
        {
            name: 'Chips & Salsa',
            category: 'Starters',
            price: 3.00,
            description: 'Salsa and homemade corn tortilla chips'
        },
        {
            name: 'Al Pastor',
            category: 'Tacos',
            price: 2.00,
            description: 'Pork marinated in a red chile sauce'
        },
        {
            name: 'Fish',
            category: 'Tacos',
            price: 3.00,
            description: 'Fried fish with cuban slaw and pico'
        },
        {
            name: 'Carne Asada',
            category: 'Tacos',
            price: 3.00,
            description: 'Grilled steak, marinated to perfection'
        },
        {
            name: 'Elote',
            category: 'Sides',
            price: 2.00,
            description: 'Corn in a cup, cheese, sour cream and lime'
        },
        {
            name: 'Mexican Rice',
            category: 'Sides',
            price: 2.00,
            description: 'Traditional Mexican rice with carrots, corn and green beans'
        },
        {
            name: 'Black Beans',
            category: 'Sides',
            price: 2.00,
            description: 'Fully cooked and seasoned whole black beans'
        },
    ];

    menu.forEach((item) => {
        MenuItem.findOne({ name: item.name}, (err, menuItem) => {
            if(err) return console.error(err);
            if(menuItem) return console.log('Menu item already seeded!');
            let newMenuItem = new MenuItem({
                        name: item.name,
                        category: item.category,
                        price: item.price,
                        description: item.description
                    }).save();

        });
    })

});

// Check for DB errors
db.on('error', (err) => {
    console.log(err);
});

const app = express();

// setup handlebars view engine
app.engine('handlebars',
    handlebars({
        helpers: {
            phoneNumber: (num) => {
                num = num.toString().substr(2);

                return '(' + num.substr(0, 3) + ') '
                  + num.substr(3, 3) + '-'
                  + num.substr(6, 4);
            },
            getStringifiedJson: (value) => {
                return JSON.stringify(value);
            },
            section: function (name, options) {
                if (!this._sections) {
                    this._sections = {};
                }
                this._sections[name] = options.fn(this);
                return null;
            }
        },
        defaultLayout: 'main',
        partialsDir: __dirname + '/views/partials/'
    }));
app.set('view engine', 'handlebars');

// static resources
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(require('express-session')({
    resave: true,
    saveUninitialized: true,
    secret: 'a1b2c3d4e5f6',
}));

app.use(require('connect-flash')());

// flash message middleware
// source: Web Development with Node and Express, Ethan Brown, pp. 107-108
app.use((req, res, next) => {
    // if there's a flash message, transfer
    // it to the context, then clear it
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});


// validator middleware
app.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// passport
const passport = require('passport');
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

const Order = require('./models/Order')
app.use((req, res, next) => {
    if (!req.session.order) {
        req.session.order = new Order
        req.session.order.items = [];
        req.session.order.totalItems = 0;
        req.session.order.total = 0.00;
        console.log(req.session.order)
    }
    res.locals.order = req.session.order
    next();
})
// add user to locals
app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

app.use('/', require('./routes/auth'));

app.use('/trucks', require('./routes/trucks'));

app.use('/admin', require('./routes/admin'));

app.use('/orders', require('./routes/orders'))

app.get('/checkout', (req, res) => {
    res.render('checkout')
})

app.use('/api', require('./routes/api'));

app.use((req, res, next) => {
    res.status(500);
    res.send('Whoops! Server 500 error.');
});

app.use((req, res) => {
    res.status(404);
    res.render('404');
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 8000;
}
app.listen(port);

// app.listen(3000, () => {
//     console.log('Listening on http://localhost:3000...');
// });