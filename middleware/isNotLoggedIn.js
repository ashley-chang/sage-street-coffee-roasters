const express = require('express');
const passport = require('passport');

// Passport manages authentication state in session
function isNotLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports =  isNotLoggedIn;
