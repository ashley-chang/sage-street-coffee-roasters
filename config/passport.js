const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { check, validationResult } = require('express-validator/check');
const User = require('../models/user');

passport.serializeUser((user, done) => {
  done(null, user.id);
}); //how to store user in secretSession

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  })
});

// When Passport authenticates a request, it parses the credentials contained in the request. It then invokes the verify callback with those credentials as arguments, in this case username and password. If the credentials are valid, the verify callback invokes done to supply Passport with the user that authenticated.

// If the credentials are not valid, done should be invoked with false instead of a user to indicate authentication failure.

passport.use('local.register', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, done) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let messages = [];
    errors.array().forEach((error) => {
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  }

  User.findOne({'email': email}, (err, user) => {
    if (err) { return done(err); } // server exception
    if (user) {
      // authentication failure
      return done(null, false, {message: 'Email already in use.'});
    }
    const newUser = new User({
      email,
      password
    });
    newUser.save(function(err, result) {
      if (err) {
        return done(err);
      }
      return done(null, newUser);
    });
  });
}));

passport.use('local.login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, done) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let messages = [];
    errors.array().forEach((error) => {
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  }

  User.findOne({'email': email}, (err, user) => {
    if (err) {
      // server exception
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: 'Invalid email/password. Please try again.' });
    }
    user.comparePassword(password, function(err, isMatch) {
      if(err) throw err;
      if (!isMatch) {
        return done(null, false, { message: 'Invalid email/password. Please try again.' });
      }
      if (isMatch) {
        return done(null, user);
      }
    });
  });

}));
