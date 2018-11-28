// TODO: Refactor with jQuery
const stripe = Stripe('pk_test_xUP6oxz6ucEkctXm5Z1Qct0m'); //public key
const elements = stripe.elements();

// *********************
// Handle form validation messages
// *********************
const billingAddressSame = document.querySelector("input[name='billing_address_same']");
const billingAddressInputs = document.querySelectorAll(".checkout-form__billing-address input");
billingAddressSame.onclick = function() {
  if (this.checked) {
    for (let i = 0; i < billingAddressInputs.length; i++){
      billingAddressInputs[i].disabled = true;
      billingAddressInputs[i].required = false;
    }
  } else {
    for (let i = 0; i < billingAddressInputs.length; i++){
      billingAddressInputs[i].disabled = false;
      billingAddressInputs[i].required = true;
    }
  }
}

const inputs = document.getElementsByTagName("input");
const errorMessage = document.getElementById("error-message");
for (let i = 0; i < inputs.length; i++) {
  inputs[i].oninvalid = function(e) {
    e.target.setCustomValidity("");
    if (!e.target.validity.valid) {
      errorMessage.textContent = "Please fill out the required fields."
      e.target.setCustomValidity("This field cannot be left blank");
      e.target.classList.add("required");
    }
  };
  inputs[i].oninput = function(e) {
    e.target.setCustomValidity("");
  };
}

// *********************
// Card charging
// *********************

const style = {
  base: {
    fontFamily: 'system-ui',
  },
};

// Create an instance of the card Element.
const card = elements.create('card', {style});

// Add an instance of the card Element into the `card-element` <div>.
card.mount('#card-element');

card.addEventListener('change', ({error}) => {
  const displayError = document.getElementById('card-errors');
  if (error) {
    displayError.textContent = error.message;
  } else {
    displayError.textContent = '';
  }
});

const checkoutForm = document.getElementById('checkout-form');
checkoutForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const {token, error} = await stripe.createToken(card);
  if (error) {
    // Inform the customer that there was an error.
    const errorElement = document.getElementById('card-errors');
    errorElement.textContent = error.message;
    // Inform the customer that there was an error at the top of the page...
    const errorMsg = document.getElementById('error-message');
    errorMsg.textContent = error.message;
  } else {
    // Send the token to your server.
    stripeTokenHandler(token);
  }
});

const stripeTokenHandler = (token) => {
  // Insert the token ID into the form so it gets submitted to the server
  const checkoutForm = document.getElementById('checkout-form');
  const hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'stripeToken');
  hiddenInput.setAttribute('value', token.id);
  checkoutForm.appendChild(hiddenInput);

  // Submit the form
  checkoutForm.submit();
}
