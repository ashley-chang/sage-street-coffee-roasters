const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const userSchema = new Schema({
  email: {type: String, required: true},
  password: {type: String, required: true}
});

userSchema.pre('save', function(next) {
  var user = this;
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next (err);
      user.password = hash;
      next();
    })
  })
});

// userSchema.methods.encryptPassword = function(password) {
//   return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
// };

userSchema.methods.comparePassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  })
}
module.exports = mongoose.model('User', userSchema);
