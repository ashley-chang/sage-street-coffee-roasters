// import the model we're gonna use
const Product = require('../models/product');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);

//create a product
const products = [
  new Product({
    imagePath: "/img/coffee-bag-1.jpg",
    title: 'House Blend',
    price: 11
  }),
  new Product({
    imagePath: '/img/coffee-bag-2.jpg',
    title: 'Colombia',
    price: 11
  }),
  new Product({
    imagePath: '/img/coffee-bag-3.jpg',
    title: 'Breakfast Blend',
    price: 12
  }),
  new Product({
    imagePath: '/img/coffee-bag-1.jpg',
    title: 'Cinnamon Dolce',
    price: 13
  }),
  new Product({
    imagePath: '/img/coffee-bag-2.jpg',
    title: 'Espresso Roast',
    price: 13
  }),
  new Product({
    imagePath: '/img/coffee-bag-3.jpg',
    title: 'Dark French Roast',
    price: 13
  }),
  new Product({
    imagePath: '/img/coffee-bag-1.jpg',
    title: 'Mocha',
    price: 12
  }),
  new Product({
    imagePath: '/img/coffee-bag-2.jpg',
    title: 'Caramel',
    price: 11
  }),
  new Product({
    imagePath: '/img/coffee-bag-3.jpg',
    title: 'Intenso',
    price: 13
  }),
  new Product({
    imagePath: '/img/coffee-bag-1.jpg',
    title: 'Kilimanjaro',
    price: 13
  })
];

var done= 0;
for (var i = 0; i < products.length; i++) {
  products[i].save(function(err, result) {
    done++;
    if (done === products.length) {
      exit();
    }
  });
}

function exit() {
  mongoose.disconnect();
}
