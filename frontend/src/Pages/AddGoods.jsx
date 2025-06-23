import React, { useState, useRef, useEffect } from 'react';
import './AddGoods.css';
import axios from 'axios';

const AddGoods = () => {
  const materials = ['cotton', 'polyester', 'silk', 'linen'];
  const thicknesses = ['thin', 'medium', 'thick'];
  const tensileStrengths = ['Ne 40s', 'Ne 60s', 'Ne 90s'];
  const finishTypes = ['matte', 'glossy', 'satin'];
  const threadCategories = [
    'Sewing ',
    'Embroidery ',
    'Quilting ',
    'Upholstery ',
    'Serger ',
    'Industrial ',
    'Decorative ',
    'Metallic ',
    'Elastic '
  ];
  const predefinedColors = [
  { name: 'Red', hexCode: '#FF0000' },
  { name: 'Green', hexCode: '#00FF00' },
  { name: 'Blue', hexCode: '#0000FF' },
  { name: 'Yellow', hexCode: '#FFFF00' },
  { name: 'Black', hexCode: '#000000' },
  { name: 'White', hexCode: '#FFFFFF' },
  { name: 'Pink', hexCode: '#FFC0CB' },
  { name: 'Orange', hexCode: '#FFA500' },
  { name: 'Purple', hexCode: '#800080' },
  { name: 'Brown', hexCode: '#A52A2A' }
];


  const [product, setProduct] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
    colors: [],
    sizes: [],
    features: [],
    specifications: {
      material: '',
      length: '',
      thickness: '',
      tensileStrength: '',
      finish: ''
    },
    images: []
  });

  const [newColor, setNewColor] = useState({ name: '', hexCode: '#cccccc' });
  const [newSize, setNewSize] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newImages, setImages] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef(null);

  // Auto update product name when category or material changes
  useEffect(() => {
    if (product.category && product.specifications.material) {
      const formattedCategory = product.category.replace(/-/g, ' ');
      setProduct(prev => ({
        ...prev,
        name: `${formattedCategory} ${prev.specifications.material} thread`
      }));
    } else {
      setProduct(prev => ({
        ...prev,
        name: ''
      }));
    }
  }, [product.category, product.specifications.material]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      // Handle nested properties (specifications)
      const [parent, child] = name.split('.');
      setProduct(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleColorAdd = () => {
    if (newColor.name.trim() && newColor.hexCode) {
      setProduct(prev => ({
        ...prev,
        colors: [...prev.colors, { ...newColor }]
      }));
      setNewColor({ name: '', hexCode: '#cccccc' });
    }
  };

  const handleColorRemove = (index) => {
    setProduct(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const handleSizeAdd = () => {
    if (newSize.trim()) {
      setProduct(prev => ({
        ...prev,
        sizes: [...prev.sizes, newSize]
      }));
      setNewSize('');
    }
  };

  const handleSizeRemove = (index) => {
    setProduct(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  const handleFeatureAdd = () => {
    if (newFeature.trim()) {
      setProduct(prev => ({
        ...prev,
        features: [...prev.features, newFeature]
      }));
      setNewFeature('');
    }
  };

  const handleFeatureRemove = (index) => {
    setProduct(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleImageAdd = () => {
    if (newImages.trim()) {
      setProduct(prev => ({
        ...prev,
        images: [...prev.images, newImages]
      }));
      setImages('');
    }
  };

  const handleImageRemove = (index) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://localhost:3000/api/goods', product);

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Reset form after successful submission
      setProduct({
        name: '',
        category: '',
        price: '',
        quantity: '',
        description: '',
        colors: [],
        sizes: [],
        features: [],
        specifications: {
          material: '',
          length: '',
          thickness: '',
          tensileStrength: '',
          finish: ''
        },
        images: []
      });
      setImages([]);

      // Show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Reset form fields not managed by React state
      formRef.current.reset();

    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="thread-product-container">
      <div className="form-header">
        <h2>Add New Thread Details</h2>
        <p>Enter the details below to add a new thread product to your inventory</p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="thread-product-form">
        <div className="form-section">
          <h3>Basic Information</h3>

          {/* Material Dropdown inside Specifications, but placed above Category */}
          <div className="form-group">
            <label htmlFor="specifications.material">Material</label>
            <select
              id="specifications.material"
              name="specifications.material"
              value={product.specifications.material}
              onChange={handleChange}
              required
            >
              <option value="">Select Material</option>
              {materials.map((mat, idx) => (
                <option key={idx} value={mat}>{mat.charAt(0).toUpperCase() + mat.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Category dropdown */}
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={product.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Thread Category</option>
              {threadCategories.map((category, index) => (
                <option key={index} value={category.toLowerCase().replace(/ /g, '-')}>
                  {category}
                </option>
              ))}
              <option value="other">Other</option>
            </select>
          </div>

          {/* Product Name - Auto-filled */}
          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={product.name}
              onChange={handleChange}
              placeholder="Auto-filled based on category and material"
              readOnly
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (₹)</label>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                value={product.price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                value={product.quantity}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Thread Specifications</h3>

          <div className="form-row">
            {/* Length */}
            <div className="form-group">
              <label htmlFor="specifications.length">Length</label>
                <input type="text" id="specifications.length" name="specifications.length" value={product.specifications.length} onChange={handleChange} placeholder="e.g., 100m, 200yd" required />
              </div>

                    {/* Thickness Dropdown */}
        <div className="form-group">
          <label htmlFor="specifications.thickness">Thickness</label>
          <select
            id="specifications.thickness"
            name="specifications.thickness"
            value={product.specifications.thickness}
            onChange={handleChange}
            required
          >
            <option value="">Select Thickness</option>
            {thicknesses.map((thick, idx) => (
              <option key={idx} value={thick}>
                {thick.charAt(0).toUpperCase() + thick.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        {/* Tensile Strength Dropdown */}
        <div className="form-group">
          <label htmlFor="specifications.tensileStrength">Tensile Strength</label>
          <select
            id="specifications.tensileStrength"
            name="specifications.tensileStrength"
            value={product.specifications.tensileStrength}
            onChange={handleChange}
            required
          >
            <option value="">Select Tensile Strength</option>
            {tensileStrengths.map((ts, idx) => (
              <option key={idx} value={ts}>
                {ts.charAt(0).toUpperCase() + ts.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Finish Type Dropdown */}
        <div className="form-group">
          <label htmlFor="specifications.finish">Finish</label>
          <select
            id="specifications.finish"
            name="specifications.finish"
            value={product.specifications.finish}
            onChange={handleChange}
            required
          >
            <option value="">Select Finish</option>
            {finishTypes.map((finish, idx) => (
              <option key={idx} value={finish}>
                {finish.charAt(0).toUpperCase() + finish.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>


<div className="form-section">
  <h3>Colors</h3>
  <div className="form-row">
    <select
      value={newColor.name}
      onChange={(e) => {
        const selected = predefinedColors.find(c => c.name === e.target.value);
        if (selected) setNewColor(selected);
      }}
    >
      <option value="">Select Color</option>
      {predefinedColors.map((color, index) => (
        <option key={index} value={color.name}>
          {color.name}
        </option>
      ))}
    </select>
    <button type="button" onClick={handleColorAdd}>Add Color</button>
  </div>

  <ul className="color-list">
    {product.colors.map((color, index) => (
      <li key={index}>
        <span
          style={{
            backgroundColor: color.hexCode,
            display: 'inline-block',
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            marginRight: '8px',
            verticalAlign: 'middle'
          }}
        ></span>
        {color.name}
        <button type="button" onClick={() => handleColorRemove(index)}>x</button>
      </li>
    ))}
  </ul>
</div>


    <div className="form-section">
      <h3>Sizes</h3>
      <div className="form-row">
        <input
          type="text"
          placeholder="Size (e.g. S, M, L)"
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
        />
        <button type="button" onClick={handleSizeAdd}>Add Size</button>
      </div>
      <ul className="size-list">
        {product.sizes.map((size, index) => (
          <li key={index}>
            {size}
            <button type="button" onClick={() => handleSizeRemove(index)}>x</button>
          </li>
        ))}
      </ul>
    </div>


    <div className="form-section">
      <h3>Images (URLs)</h3>
      <div className="form-row">
        <input
          type="text"
          placeholder="Image URL"
          value={newImages}
          onChange={(e) => setImages(e.target.value)}
        />
        <button type="button" onClick={handleImageAdd}>Add Image</button>
      </div>
      <ul className="image-list">
        {product.images.map((url, index) => (
          <li key={index}>
            <a href={url} target="_blank" rel="noreferrer">Image {index + 1}</a>
            <button type="button" onClick={() => handleImageRemove(index)}>x</button>
          </li>
        ))}
      </ul>
    </div>

    <div className="form-section">
      <h3>Features</h3>
      <div className="form-row">
        <input
          type="text"
          placeholder="Feature"
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
        />
        <button type="button" onClick={handleFeatureAdd}>Add Feature</button>
      </div>
      <ul className="feature-list">
        {product.features.map((feature, index) => (
          <li key={index}>
            {feature}
            <button type="button" onClick={() => handleFeatureRemove(index)}>x</button>
          </li>
        ))}
      </ul>
    </div>


     <div className="form-section">
      <h3>Description</h3>
      <textarea
        name="description"
        value={product.description}
        onChange={handleChange}
        placeholder="Write product description..."
        rows="4"
        required
      />
    </div>

    

    <button type="submit" disabled={loading}>
      {loading ? 'Adding Product...' : 'Add Product'}
    </button>

    {success && <p className="success-message">Product added successfully!</p>}
  </form>
</div>
);
};

export default AddGoods;
