const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  cart: {
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  let updateCart;
    if (!this.cart) {
      updateCart = {
        items: [{ productId: new mongodb.ObjectId(product._id), quantity: 1 }],
      };
    } else {
      const cartProductIndex = this.cart.items.findIndex((cp) => {
        return cp.productId.toString() === product._id.toString();
      });

      let newQuantity = 1;
      const updateCartItems = [...this.cart.items];

      if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updateCartItems[cartProductIndex].quantity = newQuantity;
      } else {
        updateCartItems.push({
          productId: product._id,
          quantity: 1,
        });
      }

      updateCart = { items: updateCartItems };
    }
    this.cart = updateCart;
    return this.save();  
}

userSchema.methods.removeFromCart = function (prodId) {
  const updateCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== prodId.toString();
  });
  this.cart.items = updateCartItems;
  return this.save();
}

userSchema.methods.clearCart = function () {
  this.cart = { items: []};
  return this.save();
}


module.exports = mongoose.model("User", userSchema);
