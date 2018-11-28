const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'}, //set a reference to User model -- store an ID but be aware that it refers to something in the users collection
  cart: {type: Object, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  shippingAddressStreet: {type: String, required: true},
  shippingAddressAptNumber: {type: String, required: false},
  shippingAddressCity: {type: String, required: true},
  shippingAddressZipcode: {type: String, required: true},
  shippingAddressState: {type: String, required: true},
  paymentId: {type: String, required: true}
});

module.exports = mongoose.model('Order', schema);

// leave this off for simplicity...
// billingAddressStreet: {type: String, required: false},
// billingAddressAptNumber: {type: String, required: false},
// billingAddressCity: {type: String, required: false},
// billingAddressZipcode: {type: String, required: false},
// billingAddressState: {type: String, required: false},
