// server/index.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const bodyParser = require("body-parser");

const { Goods, Order, History } = require("./models/goods");

dotenv.config();

const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Import models after setting up mongoose
const { userModel } = require("./models/goods.js");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log('✅ Connected to MongoDB Atlas');
})
.catch((err) => {
    console.error('❌ Error connecting to MongoDB Atlas:', err);
});


// User authentication route 
app.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    
    if (user) {
      if (user.password === password) {
        res.json(user);
      } else {
        res.status(401).json("Incorrect password");
      }
    } else {
      res.status(404).json("User does not exist");
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json("Server error");
  }
});


// DASHBOARD: Get stats
app.get("/api/dashboard", async (req, res) => {
  try {
    const totalGoods = await Goods.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const completedOrders = await Order.find({ status: "completed" });

    const monthlySales = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({ totalGoods, totalOrders, pendingOrders, monthlySales });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD GOODS
app.post("/api/goods", async (req, res) => {
  try {
    const good = await Goods.create(req.body);
    await History.create({ type: "Added", detail: `Added product ${good.name}` });
    res.status(201).json(good);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL GOODS
app.get("/api/goods", async (req, res) => {
  const goods = await Goods.find();
  res.json(goods);
});

// UPDATE GOODS
app.put("/api/goods/:id", async (req, res) => {
  try {
    const updated = await Goods.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await History.create({ type: "Updated", detail: `Updated product ${updated.name}` });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD ORDER - Modified endpoint
app.post("/api/orders", async (req, res) => {
  try {
    const { items, customerName } = req.body;
    let total = 0;

    // 1. Validate stock availability first
    for (const item of items) {
      const product = await Goods.findById(item.productId);
      if (!product || product.quantity < item.count) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product?.name || 'product'}` 
        });
      }
      total += product.price * item.count;
    }

    // 2. Get the last order ID
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    let lastIdNumber = 0;
    
    if (lastOrder?.orderId) {
      const idParts = lastOrder.orderId.split('-');
      lastIdNumber = parseInt(idParts[1]) || 0;
    }

    // 3. Generate new order ID
    const newIdNumber = lastIdNumber + 1;
    const orderId = `KCM-${newIdNumber.toString().padStart(4, '0')}`;

    // 4. Process the order
    const order = await Order.create({
      orderId,
      customerName, // This should be included
      items,
      totalAmount: total,
      status: 'Pending'
    });

    // 5. Update stock quantities
    for (const item of items) {
      await Goods.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: -item.count } }
      );
    }

    // 6. Create history record
    await History.create({ 
      type: "Order", 
      detail: `Created order ${orderId} for ${order.customerName}` 
    });

    res.status(201).json({
      success: true,
      orderId,
      order
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET LAST ORDER ID - New endpoint
app.get("/api/orders/last", async (req, res) => {
  try {
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    res.json({ 
      orderId: lastOrder?.orderId || null 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/shortage', async (req, res) => {
  console.log('Shortage notification received:', req.body);

  // Here you can save shortage info in a DB or send notification email

  res.status(200).json({ message: 'Shortage notification received' });
  await History.create({ 
      type: "Order", 
      detail: `${req.body.message}` 
    });
});

// GET ORDER BY ID
app.get("/api/orders/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.json(order);
});

// PUT route to update the order status
app.put('/api/orders/:orderId', async (req, res) => {
  const { orderId } = req.params; // Get orderId from URL parameters
  const { status } = req.body; // Get the status from the request body

  try {
    // Find the order by its orderId
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await History.create({ 
      type: "status change", 
      detail: `Changed order ${orderId} status from ${order.status} to ${status}` 
    });
    // Update the status of the order
    order.status = status;
    
    // Save the updated order
    await order.save();

    // Send the updated order as the response
    res.status(200).json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// GET COMPLETED ORDERS
app.get("/api/orders", async (req, res) => {
  const status = req.query.status;
  const orders = await Order.find();
  res.json(orders);
});

// GENERATE INVOICE (PDF)



// GET HISTORY
app.get("/api/history", async (req, res) => {
  const logs = await History.find().sort({ timestamp: -1 });
  res.json(logs);
});





















// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});