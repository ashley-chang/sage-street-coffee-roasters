require('dotenv').config();

const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const session = require('express-session');
const { check, validationResult } = require('express-validator/check');
const passport = require('passport');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo')(session);
const nodeMailer = require('nodemailer');
const compression = require('compression');

const Product = require('./models/product');
const Cart = require('./models/cart');
const Order = require('./models/order');
const { BlogEntry, Comment} = require('./models/blog-entry');
const isLoggedIn = require('./middleware/isLoggedIn');
const isNotLoggedIn = require('./middleware/isNotLoggedIn');

const PORT = process.env.PORT || 3000;
const app = express();
const csrfProtection = csrf();

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'secretSession',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 120 * 60 * 1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(csrfProtection);

app.use(express.static(path.join(__dirname, "dist")));
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping').then(() => {
  console.log("Connected to Database");
}).catch((err) => {
  console.log("Not connected to Database: ", err);
});
require('./config/passport');

app.engine('handlebars', exphbs({
  defaultLayout : __dirname + '/views/layouts/main.handlebars',
  partialsDir: __dirname + '/views/partials',
  layoutsDir: __dirname + '/views/layouts',
  helpers: {
            section: function(name, options){
                if(!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            },
            concat: function () {
              let result = "";
              for(let i = 0; i < arguments.length - 1; i++) {
                  result += arguments[i] + " ";
              }
              return result;
            },
            formatTimestamp: function(timestamp, options = 'withTime') {
              let timeOptions;
              if (options === 'withoutTime') {
                timeOptions = {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                }
              } else if (options === 'withTime'){
                timeOptions = {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                };
              }
              return timestamp.toLocaleString('en-US', timeOptions);
            },
          }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));

// execute on all requests
app.use((req, res, next) => {
  // set a global variable to tell whether user is authenticated
  res.locals.loggedIn = req.isAuthenticated(); //t/f
  res.locals.session = req.session;
  // login variable available in all views
  next();
});

// **********************
// ROUTES FOR LOGGED IN USERS
// **********************

app.get('/account', isLoggedIn, (req, res) => {
  Order.find({user: req.user}, (err, orders) => {
    if (err) {
      return res.write('Something went wrong.');
    }
    let cart;
    orders.forEach(function(order) { //array of orders
        cart = new Cart(order.cart);
        order.items = cart.generateArray();
        order.timestamp = order._id.getTimestamp().toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
    });
    res.render('user/account', {
      orders,
      title: 'Sage Street Coffee Roasters - My Account Details'
    });
  })
});

app.get('/logout', isLoggedIn, (req, res) => {
  req.logout(); // passport method
  res.redirect('/');
});

app.get('/checkout', isLoggedIn, (req, res) => {
  if (!req.session.cart) {
    return res.redirect('/cart');
  }
  const cart = new Cart(req.session.cart);
  const errorMsg = req.flash('error')[0];
  res.render('shop/checkout', {
    total: cart.totalPrice,
    csrfToken: req.csrfToken(),
    errorMsg,
    noError: !errorMsg,
    title: 'Sage Street Coffee Roasters - Checkout'
  });
});

app.post('/checkout', isLoggedIn, (req, res) => {
  if (!req.session.cart) {
    return res.redirect('/cart');
  }
  const cart = new Cart(req.session.cart);
  var stripe = require("stripe")(process.env.STRIPE_KEY);

  const token = req.body.stripeToken;

  stripe.charges.create({
    amount: cart.totalPrice * 100,
    currency: 'usd',
    description: 'Example charge',
    source: token,
  }, (err, charge) => {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }
    const order = new Order({
      user: req.user, // provided by passport, can access throughout app
      cart,
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      shippingAddressStreet: req.body.shipping_address_street, //retrieve from post request (values sent with post request are located in body)
      shippingAddressAptNumber: req.body.shipping_address_apt_number,
      shippingAddressCity: req.body.shipping_address_city,
      shippingAddressZipcode: req.body.shipping_address_zipcode,
      shippingAddressState: req.body.shipping_address_state,
      paymentId: charge.id
    });

    order.save((err, result) => {
      if (err) {
        req.flash('error', 'Something went wrong.');
        res.redirect('/checkout');
      }
      req.flash('success', 'Your order has been confirmed. Thank you!');
      req.session.cart = null;
      res.redirect('/success');
    });
  });
});

// **********************
// COMMON ROUTES
// **********************

app.get('/', (req, res) => {
  Product.find(null, null, {limit: 3}, function(err, products) {
    if (err) return res.status(500).render('oops');
    BlogEntry.find(null, null, {limit: 3}, function(err, entries) {
      if (err) return res.status(500).render('oops');
      res.render('home', {
        title: 'Sage Street Coffee Roasters - Home',
        featuredProducts: products,
        blogEntries: entries
      });
    });
  });
});

app.get('/about', (req, res) => {
  res.render('about', {
    title: 'Sage Street Coffee Roasters - Our Story'
  });
});

app.get('/menu', (req, res) => {
  res.render('menu', {
    title: 'Sage Street Coffee Roasters - Menu'
  });
});

app.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Sage Street Coffee Roasters - Contact Us',
    csrfToken: req.csrfToken(),
    msgStatus: req.flash('msgStatus')
  });
});

app.post('/contact', (req, res) => {
  let mailOpts, smtpTrans;
  smtpTrans = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD
    }
  });
  mailOpts = {
    from: req.body.name + ' &lt;' + req.body.email + '&gt; ',
    to: process.env.NODEMAILER_USER,
    subject: 'Message from contact form at Sage Street',
    text: `${req.body.name} (${req.body.email}) says: ${req.body.message}`
  };
  smtpTrans.sendMail(mailOpts, function (err, info) {
    if (err) {
      console.log(err);
      req.flash('msgStatus', 'An error occured while sending your message.');
    }
    else {
      console.log('Message sent');
      req.flash('msgStatus', 'Thank you! Your message has been received. You should receive a response within 1-2 business days.');
    }
    return res.redirect('/contact');
  });
});

app.get('/products', (req, res) => {
  Product.find((err, docs) => {
    if (err) return res.status(500).render('oops');
    res.render('shop/products', {
      title: 'Sage Street Coffee Roasters - Products',
      products: docs
    });
  });
})

app.get('/add-to-cart/:id', (req, res) => {
  // have a cart object in session
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(req.params.id, (err, product) => {
    if (err) return res.redirect('/');
    cart.addItem(product, product.id);
    req.session.cart = cart; //express session will auto save with each response sent back
    res.send({
      totalPrice: req.session.cart.totalPrice,
      totalQty: req.session.cart.totalQty,
      itemPrice: req.session.cart.items[productId].price,
      itemQty: req.session.cart.items[productId].qty,
    });
  });
});

app.get('/reduce/:id', (req, res) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.reduceItem(productId);
  req.session.cart = cart;
  const itemExists = req.session.cart.items[productId];
  if (req.session.cart.totalQty === 0) {
    res.send({
      totalQty: 0
    });
  } else if (itemExists) {
    res.send({
      totalPrice: req.session.cart.totalPrice,
      totalQty: req.session.cart.totalQty,
      itemPrice: req.session.cart.items[productId].price,
      itemQty: req.session.cart.items[productId].qty,
    });
  } else {
    res.send({
      totalPrice: req.session.cart.totalPrice,
      totalQty: req.session.cart.totalQty,
    });
  }
});

app.get('/remove/:id', (req, res) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.removeItem(productId);
  req.session.cart = cart;
  res.send({
    totalPrice: req.session.cart.totalPrice,
    totalQty: req.session.cart.totalQty,
  });
});

app.get('/cart', (req, res) => {
  if (!req.session.cart) {
    return res.render('shop/cart', {products: null})
  }
  const cart = new Cart(req.session.cart);
  res.render('shop/cart', {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
    title: 'Sage Street Coffee Roasters - Your Shopping Cart'
  });
});

app.get('/success', (req, res) => {
  res.render('shop/success', {
    title: 'Sage Street Coffee Roasters - Order Success'
  });
});

app.get('/blog', (req, res) => {
  BlogEntry.find((err, docs) => {
    if (err) {
      console.log(err);
      return res.render('oops');
    }
    if (docs) {
      res.render('blog/archive', {
        title: 'Sage Street Coffee Roasters - Blog',
        blogEntries: docs
      });
    } else {
      res.render('blog/archive', {
        title: 'Sage Street Coffee Roasters - Blog',
        blogEntries: null
      });
    }
  })
});

app.get('/blog/:id', (req, res) => {
  BlogEntry.findById(req.params.id).populate('comments').exec((err, doc) => {
    if (err) {
      if (err) console.log(err);
      return res.status(500).render('oops');
    };
    if (doc) {
      const title = `Sage Street Coffee Roasters - ${doc.title}`;
      res.render('blog/entry', {
        title,
        entry: doc,
        csrfToken: req.csrfToken()
      });
    } else {
      return res.status(404).render('oops');
    }
  });
});

// making a comment to a blog entry
app.post('/blog/:id', (req, res) => {
  const comment = new Comment({
    user: req.body.user,
    message: req.body.message,
    blogEntry: req.params.id,
  });
  comment.save((err, comment) => {
    if (err) {
      console.log(err);
      return res.status(500).render('oops');
    }
    const timeOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    const formattedTimestamp = comment.createdAt.toLocaleString('en-US', timeOptions);
    BlogEntry.findOneAndUpdate({ _id: req.params.id }, { $push: {comments: comment._id }}, (err, result) => {
      if (err) return res.status(500).render('oops');
      res.send({
        comment,
        commentsLength: result.comments.length,
        formattedTimestamp
      });
    });
  });
});

// **********************
// USER ROUTES
// **********************

app.get('/register', (req, res) => {
  let msgs = req.flash('error');
  // let hasErrors = msgs.length ? true : false
  res.render('user/register', {
    csrfToken: req.csrfToken(),
    messages: msgs,
    hasErrors: msgs,
    title: 'Sage Street Coffee Roasters - Create an Account'
  });
});

app.post('/register', [
  check('email', 'Invalid email').not().isEmpty().isEmail(),
  check('password', 'Invalid password').isLength({min:6})
],
  passport.authenticate('local.register', {
  failureRedirect: '/register',
  failureFlash: true
}), (req, res) => {
  if (req.session.oldUrl) {
    let oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/account');
  }
});

// **********************
// ROUTES FOR LOGGED OUT USERS
// **********************

app.use('/', isNotLoggedIn, function(req,res,next) {
  next();
});

app.get('/login', (req, res) => {
  let msgs = req.flash('error');
  res.render('user/login', {
    csrfToken: req.csrfToken(),
    messages: msgs,
    hasErrors: msgs,
    title: 'Sage Street Coffee Roasters - User Login'
  });
});

app.post('/login',
  passport.authenticate('local.login', {
  failureRedirect: '/login',
  failureFlash: true
}), (req, res) => {
  if (req.session.oldUrl) {
    let oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/account');
  }
});

// **********************
// ERROR ROUTES
// **********************
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = '404';
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  return res.render('oops', {
    title: 'Sage Street Coffee Roasters - Not Found'
  });
});



app.listen(PORT, () => {
  console.log(`Up and running on port ${PORT}!`);
});
