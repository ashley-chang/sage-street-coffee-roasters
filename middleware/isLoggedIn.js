const express = require('express');
const passport = require('passport');

// Passport manages authentication state in session
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/login');
}

module.exports =  isLoggedIn;
