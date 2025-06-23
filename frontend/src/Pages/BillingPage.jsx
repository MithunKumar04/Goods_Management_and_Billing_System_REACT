import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './BillingPage.css';
import html2pdf from 'html2pdf.js';


const BillingPage = () => {
  const [orders, setOrders] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const invoiceRef = useRef();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('https://goods-management-and-billing-system.onrender.com/api/orders');
        setOrders(res.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleDownloadPDF = () => {
    const element = invoiceRef.current;
  
    const opt = {
      margin:       0.3,
      filename:     `${selectedOrder.orderId || 'invoice'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, scrollY: 0 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { avoid: 'tr' } // Optional: prevent breaking table rows
    };
    
  
    html2pdf().set(opt).from(element).save();
  };
  
  const handleStatusChange = (id, newStatus) => {
    setOrders(prev =>
      prev.map(order => order._id === id ? { ...order, status: newStatus } : order)
    );
  };

  const handleSaveStatus = async (order) => {
    try {
      await axios.put(`https://goods-management-and-billing-system.onrender.com/api/orders/${order.orderId}`, {
        status: order.status,
      });
      alert('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleCreateInvoice = async (order) => {
    try {
      const response = await axios.get(`https://goods-management-and-billing-system.onrender.com/api/orders/${order._id}`);
      setSelectedOrder(response.data);
      console.log(response.data);
      setShowInvoice(true);
      document.body.style.overflow = 'hidden';  // Disable scroll when modal is open
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Failed to load order details for invoice');
    }
  };

  const handleCloseInvoice = () => {
    setSelectedOrder(null);
    setShowInvoice(false);
    document.body.style.overflow = 'auto';  // Re-enable scroll when modal is closed
  };

  if (isLoading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="billing-container">
      <h2>Billing Page - Karuparayan Cotton Mill</h2>
      
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Total (₹)</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map(order => (
              <tr key={order._id}>
                <td>{order.orderId || order._id.substring(0, 8)}</td>
                <td>{order.customerName}</td>
                <td>{Number(order.totalAmount || 0).toFixed(2)}</td>

                <td>
                  {editMode ? (
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  ) : (
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  )}
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  {editMode ? (
                    <button 
                      className="save-btn"
                      onClick={() => handleSaveStatus(order)}
                    >
                      Save
                    </button>
                  ) : (
                    <button 
                      className="invoice-btn"
                      onClick={() => handleCreateInvoice(order)}
                    >
                      Create Invoice
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-orders">No orders found</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="action-bar">
        <button 
          className={`edit-mode-btn ${editMode ? 'active' : ''}`}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? 'Exit Edit Mode' : 'Edit Statuses'}
        </button>
      </div>

      {/* Invoice Modal */}
      {showInvoice && selectedOrder && (
        <div className="invoice-modal-overlay">
          <div className="invoice-modal-content">
            <button 
              className="close-modal-button" 
              onClick={handleCloseInvoice}
              aria-label="Close invoice"
            >
              &times;
            </button>
            
            <div ref={invoiceRef} className="invoice-document">
              <div className="quote-header">
                <h2 className="quote-title">INVOICE</h2>
                <div className="quote-meta">
                  <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  <p><strong>Invoice #:</strong> {selectedOrder.orderId || selectedOrder._id}</p>
                  <p><strong>Customer ID:</strong> {selectedOrder.customerId || 'N/A'}</p>
                  <p><strong>Valid Until:</strong> {/* insert logic here */}</p>
                </div>
              </div>

              <div className="company-info">
                <h3>Karuparayan Cotton Mill</h3>
                <p>8/134,Sillangadu, Nsdupatti,Uthukuli, Tamil Nadu</p>
                <p>Website: https://kc-mills.netlify.app/</p>
                <p>Phone: 9786300829</p>
                <p>Email: sddeepak512@gmail.com</p>
                <p>GSTIN/UIN: 33CLMPD7076A1ZC</p>
              </div>

              <div className="customer-info">
                <h4>Customer</h4>
                <p>{selectedOrder.customerName}</p>
                <p>{selectedOrder.customerAddress || '---'}</p>
                <p>{selectedOrder.customerPhone || '---'}</p>
              </div>

              <table className="quote-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th>Tax</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.price}</td>
                      <td>{item.count}</td>
                      <td>18%</td>
                      <td>{(item.price * item.count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="quote-summary">
                <p><strong>Subtotal:</strong> ₹{selectedOrder.totalAmount}</p>
                <p><strong>Taxable:</strong> ₹{(selectedOrder.items.reduce((a, b) => a + b.price * b.count, 0)*0.18).toFixed(2)}</p>
                <p className="quote-total"><strong>Total:</strong> ₹{(Number(selectedOrder.totalAmount+selectedOrder.items.reduce((a, b) => a + b.price * b.count, 0)*0.18).toFixed(2))}</p>
              </div>

              <div className="terms">
                <h4>Terms and Conditions</h4>
                <ol>
                  <li>Customer will be billed after indicating acceptance of this invoice.</li>
                  <li>Payment will be due prior to delivery of service and goods.</li>
                  <li>Please email or upload the signed invoice.</li>
                </ol>
                <p><strong>Customer Acceptance (sign below):</strong></p>
                <div className="signature-line">x __________________________________________</div>
                <p>Print Name: _______________________________</p>
                <p className="footer-note">
                Thank You For Your Business!
              </p>
              </div>
            </div>
              <div className="action-bar">
                <button className="save-btn" onClick={handleDownloadPDF}>
                  Download PDF
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
