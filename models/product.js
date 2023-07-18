const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productShema = new Schema ({
   title: {
    type: String,
    require: true // говорить про те що поле title повинно обовязково мати значення
   }, 

   price: {
    type: Number,
    require: true
   },

   description: {
    type: String,
    require: true
   },

   imageUrl: {
    type: String,
    require: true
   }
});

module.exports = mongoose.model('Product', productShema);
