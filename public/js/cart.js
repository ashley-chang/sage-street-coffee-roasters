// ********************************************
// AJAX functions for editing cart quantities.
// ********************************************

// General edit quantity
$('.edit-qty').on('click', function(e){
  const btn = $(this);
  e.preventDefault();
  const url = this.href;
  $.ajax({
    type: 'GET',
    url: url
  }).done(function(data) {
    if (data.totalQty !== 0) {
      $('.userBar__cart-totalQty').text(data.totalQty);
    } else {
      $('.userBar__cart-totalQty').text('');
      $('.cart-container').html('<div class="message__empty-cart"><h3>There are no items in your cart.</h3></div>');
      // $('.wrapper').html('<div class="message__empty-cart"><h2>Your cart is currently empty.</h2></div>');
      return;
    }
    const itemQty = $(btn).parent().parent().find('.cart__product-qty');
    const totalPrice = $('.cart__total-price');
    if (itemQty && totalPrice && data.itemPrice && data.itemQty) {
        itemQty.text(data.itemQty);
        totalPrice.text('Total: $' + data.totalPrice);
    } else if (!data.itemPrice && !data.itemQty) {
      $(btn).parent().parent().remove();
      totalPrice.text('Total: $' + data.totalPrice);
    }
  }).fail(function(req, status, error) {
    console.log(status);
    console.log(error);
  });
});
