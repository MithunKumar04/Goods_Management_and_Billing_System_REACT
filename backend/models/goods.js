const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const userModel = mongoose.model("User", userSchema);



const colorSchema = new mongoose.Schema({
  name: String,
  hexCode: String
});
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  colors: [colorSchema],
  sizes: [String],
  features: [String],
  specifications: {
    material: String,
    length: String,
    thickness: String,
    tensileStrength: String,
    finish: String
  },
  images:[String],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
const Goods = mongoose.model('Product', productSchema);


const orderSchema = new mongoose.Schema({
  orderId:String,
  customerName: {
    type: String,
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goods',
      required: true
    },
    name:String,
    price:Number,
    count: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now }
  // ... other fields
});

const Order = mongoose.model("Order", orderSchema);



const historySchema = new mongoose.Schema({
  type: String, // Added, Updated, Order, Billed
  detail: String,
  timestamp: { type: Date, default: Date.now }
});
const History = mongoose.model("History", historySchema);



module.exports = { userModel,Goods, Order, History };