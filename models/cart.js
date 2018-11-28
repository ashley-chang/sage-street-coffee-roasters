class Cart {
  constructor(previousCart) {
    this.items = previousCart.items || {};
    this.totalQty = previousCart.totalQty || 0;
    this.totalPrice = previousCart.totalPrice || 0;
  }

  addItem(item, id) {
    let storedItem = this.items[id];
    if (!storedItem) {
      storedItem = this.items[id] = {item: item, qty: 0, price: 0};
    }
    storedItem.qty++;
    storedItem.price = storedItem.item.price * storedItem.qty;
    this.totalQty++;
    this.totalPrice += storedItem.item.price;
  }

  reduceItem(id) {
    this.items[id].qty--;
    this.items[id].price -= this.items[id].item.price;
    this.totalQty--;
    this.totalPrice -= this.items[id].item.price;
    if (this.items[id].qty <= 0) {
      delete this.items[id];
    }
  }

  removeItem(id) {
    this.totalQty -= this.items[id].qty;
    this.totalPrice -= this.items[id].price;
    delete this.items[id];
  }

  deleteItem(item, id) {
    delete this.items[id];
  }

  generateArray() { // output an array of product types
    // Array.from not supported in IE
    const arr = [];
    for (let id in this.items) {
      arr.push(this.items[id]);
    }
    return arr;
  }
}


module.exports = Cart;
