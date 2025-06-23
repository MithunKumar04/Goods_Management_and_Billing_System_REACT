import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./AddOrder.css";

const AddOrder = () => {
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [lastOrderId, setLastOrderId] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await axios.get('https://goods-management-and-billing-system.onrender.com/api/goods');
        setProducts(productsResponse.data);

        const ordersResponse = await axios.get('https://goods-management-and-billing-system.onrender.com/api/orders/last');
        if (ordersResponse.data && ordersResponse.data.orderId) {
          const lastId = parseInt(ordersResponse.data.orderId.split('-')[1]) || 0;
          setLastOrderId(lastId);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const generateOrderId = () => {
    const nextId = lastOrderId + 1;
    return `KCM-${nextId.toString().padStart(4, '0')}`;
  };

  const handleAddItem = async () => {
    const product = products.find((p) => p._id === selectedProduct);
    if (product) {
      if (quantity > product.quantity) {
        alert(
          `Requested quantity (${quantity}) is greater than available stock (${product.quantity}). Goods may take more time to arrive.`
        );

        const shortageMessage = {
          productId: product._id,
          productName: product.name,
          requestedQuantity: quantity,
          availableQuantity: product.quantity,
          message: `Customer requested ${quantity}, but only ${product.quantity} available.`,
          timestamp: new Date(),
        };

        try {
          await axios.post('https://goods-management-and-billing-system.onrender.com/api/shortage', shortageMessage);
          console.log('Shortage message sent to backend');
        } catch (error) {
          console.error('Failed to send shortage message:', error);
        }

        return;
      }

      const item = {
        productId: product._id,
        name: product.name,
        price: product.price,
        count: quantity,
        total: product.price * quantity,
      };

      setOrderItems([...orderItems, item]);
      setTotalAmount((prevTotal) => prevTotal + item.total);
    }
  };

  const handleSubmitOrder = async () => {
    const orderId = generateOrderId();

    const order = {
      orderId,
      customerName,
      status: 'Pending',
      totalAmount,
      items: orderItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        count: item.count
      })),
      createdAt: new Date(),
    };

    try {
      const response = await axios.post('https://goods-management-and-billing-system.onrender.com/api/orders', order);
      console.log('Order created:', response.data);
      alert(`Order created successfully! Order ID: ${orderId}`);

      setLastOrderId(prev => prev + 1);
      setCustomerName('');
      setOrderItems([]);
      setTotalAmount(0);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  return (
    <div className="add-order-container">
      <div className="order-box">
        <h2>Create New Order - Karupparayan Cotton Mills</h2>
        <div className="order-id-preview">
          Next Order ID: {generateOrderId()}
        </div>

        {/* Form with NO BORDER */}
        <form onSubmit={(e) => e.preventDefault()} className="no-border-form">
          <div className="form-group">
            <label htmlFor="customerName">Customer Name</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              placeholder="Enter customer name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="product">Product</label>
            <select
              id="product"
              name="product"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              required
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={quantity}
              min="1"
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setQuantity(val >= 1 ? val : 1);
              }}
              required
            />
          </div>

          <button type="button" onClick={handleAddItem}>
            Add Item
          </button>

          <div className="order-items">
            {orderItems.map((item, index) => (
              <div key={index} className="order-item">
                <span>
                  {item.name} - ₹{item.price} x {item.count} = ₹{item.total}
                </span>
              </div>
            ))}
          </div>

          <div className="total-amount">
            <strong>Total Amount: ₹{totalAmount}</strong>
          </div>

          <button type="button" onClick={handleSubmitOrder}>
            Create Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddOrder;
