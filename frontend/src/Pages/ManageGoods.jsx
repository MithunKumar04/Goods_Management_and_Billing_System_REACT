import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ManageGoods.css';

const ManageGoods = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [originalProduct, setOriginalProduct] = useState(null);

  useEffect(() => {
    fetchGoods();
  }, []);

  const fetchGoods = async () => {
    try {
      const res = await axios.get('https://goods-management-and-billing-system.onrender.com/api/goods');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleDetailsClick = (product) => {
    setSelectedProduct(product);
    // Store the original product data for comparison
    setOriginalProduct({...product});
  };

  const handleCloseDetails = () => {
    setSelectedProduct(null);
    setOriginalProduct(null);
  };

  const handleChange = (id, field, value) => {
    setProducts((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, [field]: value, updatedAt: new Date() } : item
      )
    );
    
    // Update the selected product in state if it's the one being edited
    if (selectedProduct && selectedProduct._id === id) {
      setSelectedProduct(prev => ({ ...prev, [field]: value }));
    }
  };

  const hasChanges = () => {
    if (!selectedProduct || !originalProduct) return false;
    
    // Compare relevant fields that can be edited
    const editableFields = ['price', 'quantity'];
    return editableFields.some(field => 
      selectedProduct[field] !== originalProduct[field]
    );
  };

  const handleSave = async (id) => {
  try {
    const product = products.find((item) => item._id === id);
    const price = parseFloat(product.price);
    const quantity = parseInt(product.quantity);

    if (price < 0 || quantity < 0) {
      alert('Price and Quantity must be zero or positive values.');
      return;
    }

    await axios.put(`https://goods-management-and-billing-system.onrender.com/api/goods/${id}`, product);
    alert('Product updated');
    // Update the original product to match the new state
    setOriginalProduct({ ...product });
  } catch (err) {
    console.error('Error updating product:', err);
  }
};


  return (
    <div className="manage-container">
      <h2 className="manage-title">Manage Products</h2>
      <div className="product-grid">
        {products.map((item) => (
          <div key={item._id} className="product-card">
            <img
              src={item.images?.[0]}
              alt={item.name}
              className="product-image"
            />
            <div className="product-info">
              <div className="product-name"><strong>{item.name}</strong></div>
              <div>Category: {item.category}</div>
              <div>
                <label>Price:</label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => handleChange(item._id, 'price', e.target.value)}
                  className="product-input"
                />
              </div>
              <div>
                <label>Quantity:</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleChange(item._id, 'quantity', e.target.value)}
                  className="product-input"
                />
              </div>
              <button
                onClick={() => handleDetailsClick(item)}
                className="btn-details"
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for product details */}
      {selectedProduct && (
        <div className="modal-overlay">
          <div className="product-details-modal">
            <div className="modal-header">
              <h3>{selectedProduct.name} - Details</h3>
              <button onClick={handleCloseDetails} className="btn-close">&times;</button>
            </div>
            <div className="modal-content">
              <div className="modal-image-container">
                <img
                  src={selectedProduct.images?.[0]}
                  alt={selectedProduct.name}
                  className="modal-product-image"
                />
              </div>
              <div className="modal-details">
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{selectedProduct.category}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Price:</span>
                  <input
                    type="number"
                    value={selectedProduct.price}
                    onChange={(e) => handleChange(selectedProduct._id, 'price', e.target.value)}
                    className="detail-input"
                  />
                </div>
                <div className="detail-row">
                  <span className="detail-label">Quantity:</span>
                  <input
                    type="number"
                    value={selectedProduct.quantity}
                    onChange={(e) => handleChange(selectedProduct._id, 'quantity', e.target.value)}
                    className="detail-input"
                  />
                </div>
                <div className="detail-row">
                  <span className="detail-label">Features:</span>
                  <span className="detail-value">{selectedProduct.features}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{selectedProduct.description}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Sizes:</span>
                  <span className="detail-value">{selectedProduct.sizes}</span>
                </div>
                {selectedProduct.colors?.length > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Available Colors:</span>
                  <div className="color-display-container">
                    {selectedProduct.colors.map((color, idx) => (
                      <div key={idx} className="color-item">
                        <div
                          className="color-box"
                          style={{ backgroundColor: color.hexCode }}
                        ></div>
                        <span>{color.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                <h4 className="specifications-title">Specifications</h4>
                <div className="detail-row">
                  <span className="detail-label">Material:</span>
                  <span className="detail-value">{selectedProduct.specifications?.material}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Length:</span>
                  <span className="detail-value">{selectedProduct.specifications?.length}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Thickness:</span>
                  <span className="detail-value">{selectedProduct.specifications?.thickness}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tensile Strength:</span>
                  <span className="detail-value">{selectedProduct.specifications?.tensileStrength}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Finish:</span>
                  <span className="detail-value">{selectedProduct.specifications?.finish}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => handleSave(selectedProduct._id)} 
                className="btn-save"
                disabled={!hasChanges()}
              >
                Save Changes
              </button>
              <button onClick={handleCloseDetails} className="btn-cancel">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGoods;