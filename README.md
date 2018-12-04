# Sage Street Coffee Roasters

This is a website I created for a fictional coffee shop, Sage Street Coffee Roasters.  It was built with HTML (using Handlebars), CSS (Extended by SASS), jQuery, Node.js, Express, and MongoDB. You can view it on the web here: https://peaceful-dusk-85763.herokuapp.com/

# Get Started

To start, you'll need to have Node, NPM, and MongoDB installed.

## Initial Setup
 1. Clone the repository: git clone https://github.com/ashley-chang/sage-street-coffee-roasters.git
 2. Open folder: cd sage-street-coffee-roasters
 3. Install Dependencies: npm install
 
## Setup Environment Variables
Since we will be using a few outside libraries/APIs, you will need to set up a few variables. Note: this project uses dotenv as a dev dependency, so you may set up these variables in a .env file.
1. Setup your **MongoDB port** `export MONGODB_URI=mongodb://localhost:<MONGODB_PORT>/shopping`. The default listening port is 27017.
2. To test payment, you need to set up a **Stripe account** with public/private keys.  `export STRIPE_KEY='<YOUR_SECRET_KEY>'` 
You will also need to replace the public key in /public/js/checkout.js with your own: `const stripe = Stripe('<YOUR_PUBLIC_KEY>');`
3. To send messages through a contact form, we use **NodeMailer**. To use this, you will need to set up the email account to which you would like to send emails. (Current setup for Gmail accounts only) `export NODEMAILER_USER=<YOUR_GMAIL_ACCOUNT>`
`export NODEMAILER_PASSWORD=<YOUR_GMAIL_PASSWORD>`

## Populate the Database
After you have mongod up and running, you can add products and blog entries to the database.
1. To seed the products data base, run `node seed/product-seeder.js`
2. To seed the blog data base, run `node seed/blog-seeder.js`

## Start the Server
1. Start the server with `npm run start` (or with Gulp watching changes, `gulp serve`). The server will be at localhost:3000.

