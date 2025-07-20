import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const receiptRef = useRef();

  const [formData, setFormData] = useState({
    name: "",
    model: "",
    purchaseDate: "",
    purchasePrice: "",
    type: "inverter",
    quantity: 1,
    supplier: "",
    warrantyPeriod: 12,
    specifications: "",
  });

  const [saleData, setSaleData] = useState({
    productName: "",
    soldPrice: "",
    soldDate: "",
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    serialNumber: "",
    additionalInfo: "",
    quantity: 1,
  });

  const [selectedProduct, setSelectedProduct] = useState("");
  const [isExistingProduct, setIsExistingProduct] = useState(false);
  const [showWarrantyAlert, setShowWarrantyAlert] = useState(false);

  // Company Information
  const companyInfo = {
    name: "Syed Solar Energy",
    address: "123 Solar Street, Energy City, Pakistan",
    phone: "+92-300-1234567",
    email: "info@syedsolar.com",
    website: "www.syedsolar.com",
    license: "SE-2024-001",
  };

  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem("products")) || [];
    const savedSales = JSON.parse(localStorage.getItem("sales")) || [];
    setProducts(savedProducts);
    setSales(savedSales);
    
    checkWarrantyExpiration(savedSales);
  }, []);

  const checkWarrantyExpiration = (salesData) => {
    if (!Array.isArray(salesData)) return;
    
    const today = new Date();
    const expiringSoon = salesData.filter(sale => {
      if (sale.warrantyExpiry) {
        const expiryDate = new Date(sale.warrantyExpiry);
        if (isNaN(expiryDate.getTime())) return false;
        
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      }
      return false;
    });

    if (expiringSoon.length > 0) {
      setShowWarrantyAlert(true);
    }
  };

  const generateSerialNumber = (productType) => {
    const prefix = productType === "inverter" ? "INV" : "BAT";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const calculateWarrantyExpiry = (saleDate, warrantyPeriod) => {
    if (!saleDate || !warrantyPeriod) return '';
    
    const date = new Date(saleDate);
    if (isNaN(date.getTime())) {
      console.error('Invalid sale date:', saleDate);
      return '';
    }
    
    date.setMonth(date.getMonth() + parseInt(warrantyPeriod));
    return date.toISOString().split('T')[0];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaleInputChange = (e) => {
    const { name, value } = e.target;
    setSaleData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductSelect = (e) => {
    const productName = e.target.value;
    setSelectedProduct(productName);
    const product = products.find((p) => p.name === productName);
    if (product) {
      setIsExistingProduct(true);
      setFormData({ ...product });
    } else {
      setIsExistingProduct(false);
      setFormData({
        name: "",
        model: "",
        purchaseDate: "",
        purchasePrice: "",
        type: "inverter",
        quantity: 1,
        supplier: "",
        warrantyPeriod: 12,
        specifications: "",
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updatedProducts = [...products];
    
    const productData = {
      ...formData,
      id: isExistingProduct ? formData.id : Date.now(),
      createdAt: isExistingProduct ? formData.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isExistingProduct) {
      const productIndex = updatedProducts.findIndex((p) => p.id === formData.id);
      if (productIndex !== -1) {
        updatedProducts[productIndex] = productData;
      }
    } else {
      updatedProducts.push(productData);
    }

    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));

    // Success animation
    const button = e.target.querySelector('button[type="submit"]');
    if (button) {
      button.style.background = "linear-gradient(145deg, #27ae60, #2ecc71)";
      button.textContent = "✓ Success!";
      
      setTimeout(() => {
        button.style.background = "linear-gradient(145deg, #FF6B35, #F7931E)";
        button.textContent = isExistingProduct ? "Update Product" : "Add Product";
      }, 2000);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      model: "",
      purchaseDate: "",
      purchasePrice: "",
      type: "inverter",
      quantity: 1,
      supplier: "",
      warrantyPeriod: 12,
      specifications: "",
    });
    setSelectedProduct("");
    setIsExistingProduct(false);
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setSelectedProduct(product.name);
    setIsExistingProduct(true);
    setActiveTab("products");
  };

  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      localStorage.setItem("products", JSON.stringify(updatedProducts));
    }
  };

  const generateReceipt = (saleEntries) => {
    const receiptData = {
      receiptNumber: `RCP-${Date.now()}`,
      date: new Date().toISOString(),
      company: companyInfo,
      customer: {
        name: saleEntries[0].customerName,
        phone: saleEntries[0].customerPhone,
        address: saleEntries[0].customerAddress,
      },
      items: saleEntries.map(sale => ({
        productName: sale.productName,
        serialNumber: sale.serialNumber,
        quantity: sale.quantity,
        unitPrice: parseFloat(sale.soldPrice),
        totalPrice: parseFloat(sale.soldPrice) * sale.quantity,
        warrantyExpiry: sale.warrantyExpiry,
        warrantyPeriod: sale.warrantyPeriod,
      })),
      subtotal: saleEntries.reduce((sum, sale) => sum + (parseFloat(sale.soldPrice) * sale.quantity), 0),
      tax: 0,
    };

    receiptData.total = receiptData.subtotal + receiptData.tax;
    return receiptData;
  };

  const handleSaleSubmit = (e) => {
    e.preventDefault();
    const product = products.find((p) => p.name === saleData.productName);
    if (!product) {
      alert("Product not found!");
      return;
    }

    const saleQuantity = parseInt(saleData.quantity) || 1;
    if (product.quantity < saleQuantity) {
      alert(`Insufficient stock! Only ${product.quantity} items available.`);
      return;
    }

    if (!saleData.soldDate) {
      alert("Please enter a sale date!");
      return;
    }

    const saleEntries = [];
    const updatedProducts = products.map((p) => {
      if (p.name === saleData.productName) {
        return { ...p, quantity: p.quantity - saleQuantity };
      }
      return p;
    });

    // Create multiple sale entries for bulk sales
    for (let i = 0; i < saleQuantity; i++) {
      const serialNumber = generateSerialNumber(product.type);
      const warrantyPeriod = parseInt(product.warrantyPeriod) || 12;
      const warrantyExpiry = calculateWarrantyExpiry(saleData.soldDate, warrantyPeriod);

      const saleEntry = {
        ...saleData,
        serialNumber,
        warrantyExpiry,
        warrantyPeriod,
        productType: product.type,
        saleId: Date.now() + i,
        timestamp: new Date().toISOString(),
        quantity: 1, // Each entry represents one item
      };

      saleEntries.push(saleEntry);
    }

    setProducts(updatedProducts);
    const updatedSales = [...sales, ...saleEntries];
    setSales(updatedSales);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    localStorage.setItem("sales", JSON.stringify(updatedSales));

    // Generate and show receipt
    const receiptData = generateReceipt(saleEntries);
    setCurrentReceipt(receiptData);
    setShowReceiptModal(true);

    // Success animation
    const button = e.target.querySelector('button[type="submit"]');
    if (button) {
      button.style.background = "linear-gradient(145deg, #27ae60, #2ecc71)";
      button.textContent = "✓ Sale Recorded!";
      
      setTimeout(() => {
        button.style.background = "linear-gradient(145deg, #FF6B35, #F7931E)";
        button.textContent = "Record Sale";
      }, 2000);
    }

    setSaleData({
      productName: "",
      soldPrice: "",
      soldDate: "",
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      serialNumber: "",
      additionalInfo: "",
      quantity: 1,
    });
  };

  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${currentReceipt.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .receipt-container { max-width: 600px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .logo { max-width: 100px; height: auto; }
            .company-info { margin: 10px 0; }
            .section { margin: 20px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .total { font-weight: bold; font-size: 1.2em; }
            .warranty-info { background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin: 10px 0; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          ${receiptRef.current?.innerHTML || ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getWarrantyStatus = (warrantyExpiry) => {
    if (!warrantyExpiry) {
      return { status: "No Warranty", color: "#95a5a6", days: 0 };
    }
    
    const today = new Date();
    const expiry = new Date(warrantyExpiry);
    
    if (isNaN(expiry.getTime())) {
      return { status: "Invalid Date", color: "#95a5a6", days: 0 };
    }
    
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { status: "Expired", color: "#e74c3c", days: Math.abs(daysLeft) };
    if (daysLeft <= 30) return { status: "Expiring Soon", color: "#f39c12", days: daysLeft };
    return { status: "Active", color: "#27ae60", days: daysLeft };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || product.type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Fixed calculations
  const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.soldPrice || 0), 0);
  const totalInvestment = products.reduce((sum, product) => sum + (parseFloat(product.purchasePrice || 0) * parseInt(product.quantity || 0)), 0);
  const totalStock = products.reduce((sum, product) => sum + parseInt(product.quantity || 0), 0);
  const totalSold = sales.length;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <button onClick={() => navigate(-1)} style={styles.backButton}>
              ← Back
            </button>
            <div>
              <h1 style={styles.title}>📦 Product Management</h1>
              <p style={styles.subtitle}>
                Manage your solar products, track sales, and monitor warranties
              </p>
            </div>
          </div>
          <div style={styles.statsContainer}>
            <div style={styles.statItem}>
              <div style={styles.statValue}>Rs {totalRevenue.toLocaleString()}</div>
              <div style={styles.statLabel}>Total Revenue</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{totalStock}</div>
              <div style={styles.statLabel}>Items in Stock</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{totalSold}</div>
              <div style={styles.statLabel}>Items Sold</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>Rs {totalInvestment.toLocaleString()}</div>
              <div style={styles.statLabel}>Total Investment</div>
            </div>
          </div>
        </div>
      </div>

      {/* Warranty Alert */}
      {showWarrantyAlert && (
        <div style={styles.warrantAlert}>
          <div style={styles.alertContent}>
            <span style={styles.alertIcon}>⚠️</span>
            <span>You have warranties expiring within 30 days!</span>
            <button onClick={() => setShowWarrantyAlert(false)} style={styles.alertClose}>×</button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "products" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("products")}
        >
          📦 Products
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "sales" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("sales")}
        >
          💰 Sales
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "warranty" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("warranty")}
        >
          🛡️ Warranty
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "analytics" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("analytics")}
        >
          📊 Analytics
        </button>
      </div>

      {/* Search and Filter */}
      <div style={styles.searchContainer}>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Search products, customers, or serial numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">All Types</option>
          <option value="inverter">Inverters</option>
          <option value="battery">Batteries</option>
        </select>
      </div>

      {/* Content based on active tab */}
      {activeTab === "products" && (
        <>
          {/* Add/Edit Product Form */}
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>
              {editingProduct ? "📝 Edit Product" : "➕ Add New Product"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Product Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    <option value="inverter">🔌 Inverter</option>
                    <option value="battery">🔋 Battery</option>
                  </select>
                </div>

                {!editingProduct && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Select Existing Product</label>
                    <select
                      value={selectedProduct}
                      onChange={handleProductSelect}
                      style={styles.input}
                    >
                      <option value="">Create New Product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.name}>
                          {product.name} - {product.model}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={styles.formGroup}>
                  <label style={styles.label}>Product Name *</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Model *</label>
                  <input
                    name="model"
                    type="text"
                    placeholder="Enter model number"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Purchase Date *</label>
                  <input
                    name="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Purchase Price *</label>
                  <input
                    name="purchasePrice"
                    type="number"
                    placeholder="Enter purchase price"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Quantity *</label>
                  <input
                    name="quantity"
                    type="number"
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Supplier</label>
                  <input
                    name="supplier"
                    type="text"
                    placeholder="Enter supplier name"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Warranty Period (Months)</label>
                  <input
                    name="warrantyPeriod"
                    type="number"
                    placeholder="Enter warranty period"
                    value={formData.warrantyPeriod}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroupFull}>
                  <label style={styles.label}>Specifications</label>
                  <textarea
                    name="specifications"
                    placeholder="Enter product specifications"
                    value={formData.specifications}
                    onChange={handleInputChange}
                    style={styles.textarea}
                    rows="3"
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" style={styles.submitButton}>
                  {editingProduct ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>

          {/* Products List */}
          <div style={styles.listCard}>
            <h3 style={styles.listTitle}>📋 Products Inventory</h3>
            <div style={styles.productGrid}>
              {filteredProducts.map((product) => (
                <div key={product.id} style={styles.productCard}>
                  <div style={styles.productHeader}>
                    <span style={styles.productIcon}>
                      {product.type === "inverter" ? "🔌" : "🔋"}
                    </span>
                    <div style={styles.productInfo}>
                      <h4 style={styles.productName}>{product.name}</h4>
                      <p style={styles.productModel}>{product.model}</p>
                    </div>
                    <div style={styles.stockBadge}>
                      <span style={styles.stockNumber}>{product.quantity}</span>
                      <span style={styles.stockLabel}>in stock</span>
                    </div>
                  </div>
                  <div style={styles.productDetails}>
                    <div style={styles.productRow}>
                      <span>💰 Price:</span>
                      <span>Rs {parseFloat(product.purchasePrice).toLocaleString()}</span>
                    </div>
                    <div style={styles.productRow}>
                      <span>📅 Purchased:</span>
                      <span>{new Date(product.purchaseDate).toLocaleDateString()}</span>
                    </div>
                    <div style={styles.productRow}>
                      <span>🛡️ Warranty:</span>
                      <span>{product.warrantyPeriod} months</span>
                    </div>
                    {product.supplier && (
                      <div style={styles.productRow}>
                        <span>🏭 Supplier:</span>
                        <span>{product.supplier}</span>
                      </div>
                    )}
                  </div>
                  <div style={styles.productActions}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={styles.editButton}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={styles.deleteButton}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "sales" && (
        <>
          {/* Record Sale Form */}
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>💰 Record New Sale</h2>
            <form onSubmit={handleSaleSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Product Name *</label>
                  <select
                    name="productName"
                    value={saleData.productName}
                    onChange={handleSaleInputChange}
                    required
                    style={styles.input}
                  >
                    <option value="">Select a product</option>
                    {products.filter(p => p.quantity > 0).map((product) => (
                      <option key={product.id} value={product.name}>
                        {product.name} - {product.model} (Stock: {product.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Quantity *</label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    placeholder="Enter quantity"
                    value={saleData.quantity}
                    onChange={handleSaleInputChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Unit Price *</label>
                  <input
                    name="soldPrice"
                    type="number"
                    placeholder="Enter unit price"
                    value={saleData.soldPrice}
                    onChange={handleSaleInputChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Sale Date *</label>
                  <input
                    name="soldDate"
                    type="date"
                    value={saleData.soldDate}
                    onChange={handleSaleInputChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Customer Name *</label>
                  <input
                    name="customerName"
                    type="text"
                    placeholder="Enter customer name"
                    value={saleData.customerName}
                    onChange={handleSaleInputChange}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Customer Phone</label>
                  <input
                    name="customerPhone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={saleData.customerPhone}
                    onChange={handleSaleInputChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroupFull}>
                  <label style={styles.label}>Customer Address</label>
                  <textarea
                    name="customerAddress"
                    placeholder="Enter customer address"
                    value={saleData.customerAddress}
                    onChange={handleSaleInputChange}
                    style={styles.textarea}
                    rows="2"
                  />
                </div>

                <div style={styles.formGroupFull}>
                  <label style={styles.label}>Additional Information</label>
                  <textarea
                    name="additionalInfo"
                    placeholder="Enter additional information"
                    value={saleData.additionalInfo}
                    onChange={handleSaleInputChange}
                    style={styles.textarea}
                    rows="3"
                  />
                </div>
              </div>

              <div style={styles.salePreview}>
                <h4>Sale Preview:</h4>
                <p>Total Amount: Rs {((parseFloat(saleData.soldPrice) || 0) * (parseInt(saleData.quantity) || 1)).toLocaleString()}</p>
              </div>

              <div style={styles.formActions}>
                <button type="submit" style={styles.submitButton}>
                  Record Sale & Generate Receipt
                </button>
              </div>
            </form>
          </div>

          {/* Sales List */}
          <div style={styles.listCard}>
            <h3 style={styles.listTitle}>📊 Sales History</h3>
            <div style={styles.salesGrid}>
              {filteredSales.map((sale) => {
                const warrantyStatus = getWarrantyStatus(sale.warrantyExpiry);
                return (
                  <div key={sale.saleId} style={styles.saleCard}>
                    <div style={styles.saleHeader}>
                      <div style={styles.saleInfo}>
                        <h4 style={styles.saleName}>{sale.productName}</h4>
                        <p style={styles.saleCustomer}>{sale.customerName}</p>
                      </div>
                      <div style={styles.salePrice}>Rs {parseFloat(sale.soldPrice).toLocaleString()}</div>
                    </div>
                    <div style={styles.saleDetails}>
                      <div style={styles.saleRow}>
                        <span>📅 Sold:</span>
                        <span>{new Date(sale.soldDate).toLocaleDateString()}</span>
                      </div>
                      <div style={styles.saleRow}>
                        <span>🔢 Serial:</span>
                        <span>{sale.serialNumber}</span>
                      </div>
                      <div style={styles.saleRow}>
                        <span>📞 Phone:</span>
                        <span>{sale.customerPhone || "N/A"}</span>
                      </div>
                      <div style={styles.saleRow}>
                        <span>🛡️ Warranty:</span>
                        <span style={{ color: warrantyStatus.color }}>
                          {warrantyStatus.status}
                        </span>
                      </div>
                    </div>
                    <div style={styles.saleActions}>
                      <button
                        onClick={() => {
                          const receiptData = generateReceipt([sale]);
                          setCurrentReceipt(receiptData);
                          setShowReceiptModal(true);
                        }}
                        style={styles.receiptButton}
                      >
                        🧾 Receipt
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {activeTab === "warranty" && (
        <div style={styles.listCard}>
          <h3 style={styles.listTitle}>🛡️ Warranty Management</h3>
          <div style={styles.warrantyGrid}>
            {sales.map((sale) => {
              const warrantyStatus = getWarrantyStatus(sale.warrantyExpiry);
              return (
                <div key={sale.saleId} style={styles.warrantyCard}>
                  <div style={styles.warrantyHeader}>
                    <div style={styles.warrantyInfo}>
                      <h4 style={styles.warrantyProduct}>{sale.productName}</h4>
                      <p style={styles.warrantyCustomer}>{sale.customerName}</p>
                    </div>
                    <div style={{
                      ...styles.warrantyStatus,
                      backgroundColor: warrantyStatus.color + "20",
                      color: warrantyStatus.color,
                    }}>
                      {warrantyStatus.status}
                    </div>
                  </div>
                  <div style={styles.warrantyDetails}>
                    <div style={styles.warrantyRow}>
                      <span>🔢 Serial:</span>
                      <span>{sale.serialNumber}</span>
                    </div>
                    <div style={styles.warrantyRow}>
                      <span>📅 Sale Date:</span>
                      <span>{new Date(sale.soldDate).toLocaleDateString()}</span>
                    </div>
                    <div style={styles.warrantyRow}>
                      <span>⏰ Expires:</span>
                      <span>{new Date(sale.warrantyExpiry).toLocaleDateString()}</span>
                    </div>
                    <div style={styles.warrantyRow}>
                      <span>📞 Contact:</span>
                      <span>{sale.customerPhone || "N/A"}</span>
                    </div>
                    {warrantyStatus.status !== "Expired" && (
                      <div style={styles.warrantyDays}>
                        {warrantyStatus.days} days remaining
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div style={styles.analyticsContainer}>
          <div style={styles.analyticsGrid}>
            <div style={styles.analyticsCard}>
              <h3 style={styles.analyticsTitle}>📈 Sales Analytics</h3>
              <div style={styles.analyticsStats}>
                <div style={styles.analyticsStat}>
                  <span style={styles.analyticsNumber}>{sales.length}</span>
                  <span style={styles.analyticsLabel}>Total Sales</span>
                </div>
                <div style={styles.analyticsStat}>
                  <span style={styles.analyticsNumber}>Rs {totalRevenue.toLocaleString()}</span>
                  <span style={styles.analyticsLabel}>Total Revenue</span>
                </div>
                <div style={styles.analyticsStat}>
                  <span style={styles.analyticsNumber}>Rs {totalRevenue > 0 ? (totalRevenue / sales.length).toFixed(0) : 0}</span>
                  <span style={styles.analyticsLabel}>Average Sale</span>
                </div>
              </div>
            </div>

            <div style={styles.analyticsCard}>
              <h3 style={styles.analyticsTitle}>📦 Inventory Analytics</h3>
              <div style={styles.analyticsStats}>
                <div style={styles.analyticsStat}>
                  <span style={styles.analyticsNumber}>{products.length}</span>
                  <span style={styles.analyticsLabel}>Product Types</span>
                </div>
                <div style={styles.analyticsStat}>
                  <span style={styles.analyticsNumber}>{totalStock}</span>
                  <span style={styles.analyticsLabel}>Total Stock</span>
                </div>
                <div style={styles.analyticsStat}>
                  <span style={styles.analyticsNumber}>Rs {totalInvestment.toLocaleString()}</span>
                  <span style={styles.analyticsLabel}>Investment</span>
                </div>
              </div>
            </div>

            <div style={styles.analyticsCard}>
              <h3 style={styles.analyticsTitle}>🛡️ Warranty Analytics</h3>
              <div style={styles.analyticsStats}>
                <div style={styles.analyticsStat}>
                  <span style={styles.analyticsNumber}>
                    {sales.filter(s => getWarrantyStatus(s.warrantyExpiry).status === "Active").length}
                  </span>
                  <span style={styles.analyticsLabel}>Active Warranties</span>
                </div>
                <div style={styles.analyticsStat}>
                  <span style={styles.analyticsNumber}>
                    {sales.filter(s => getWarrantyStatus(s.warrantyExpiry).status === "Expiring Soon").length}
                  </span>
                  <span style={styles.analyticsLabel}>Expiring Soon</span>
                </div>
                <div style={styles.analyticsStat}>
                  <span style={styles.analyticsNumber}>
                    {sales.filter(s => getWarrantyStatus(s.warrantyExpiry).status === "Expired").length}
                  </span>
                  <span style={styles.analyticsLabel}>Expired</span>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.topProducts}>
            <h3 style={styles.listTitle}>🏆 Top Selling Products</h3>
            <div style={styles.topProductsList}>
              {products
                .map(product => ({
                  ...product,
                  soldCount: sales.filter(sale => sale.productName === product.name).length,
                  revenue: sales.filter(sale => sale.productName === product.name)
                    .reduce((sum, sale) => sum + parseFloat(sale.soldPrice), 0)
                }))
                .filter(product => product.soldCount > 0)
                .sort((a, b) => b.soldCount - a.soldCount)
                .slice(0, 5)
                .map((product, index) => (
                  <div key={product.id} style={styles.topProductItem}>
                    <div style={styles.topProductRank}>#{index + 1}</div>
                    <div style={styles.topProductInfo}>
                      <h4>{product.name}</h4>
                      <p>{product.model}</p>
                    </div>
                    <div style={styles.topProductStats}>
                      <span>{product.soldCount} sold</span>
                      <span>Rs {product.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && currentReceipt && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>📄 Sales Receipt</h2>
              <button
                onClick={() => setShowReceiptModal(false)}
                style={styles.closeButton}
              >
                ×
              </button>
            </div>
            
            <div ref={receiptRef} style={styles.receipt}>
              <div style={styles.receiptHeader}>
                <div style={styles.receiptLogo}>
                  <img 
                    src="/assets/logo.png" 
                    alt="Company Logo" 
                    style={styles.logo}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div style={{...styles.logoPlaceholder, display: 'none'}}>
                    ☀️ {companyInfo.name}
                  </div>
                </div>
                <div style={styles.receiptCompanyInfo}>
                  <h1 style={styles.receiptCompanyName}>{companyInfo.name}</h1>
                  <p>{companyInfo.address}</p>
                  <p>Phone: {companyInfo.phone}</p>
                  <p>Email: {companyInfo.email}</p>
                  <p>Website: {companyInfo.website}</p>
                  <p>License: {companyInfo.license}</p>
                </div>
              </div>

              <div style={styles.receiptDivider}></div>

              <div style={styles.receiptInfo}>
                <div style={styles.receiptInfoRow}>
                  <div>
                    <strong>Receipt #:</strong> {currentReceipt.receiptNumber}
                  </div>
                  <div>
                    <strong>Date:</strong> {new Date(currentReceipt.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={styles.receiptCustomer}>
                <h3>Bill To:</h3>
                <p><strong>{currentReceipt.customer.name}</strong></p>
                <p>{currentReceipt.customer.phone}</p>
                <p>{currentReceipt.customer.address}</p>
              </div>

              <table style={styles.receiptTable}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Serial Number</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReceipt.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName}</td>
                      <td>{item.serialNumber}</td>
                      <td>{item.quantity}</td>
                      <td>Rs {item.unitPrice.toLocaleString()}</td>
                      <td>Rs {item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={styles.receiptTotals}>
                <div style={styles.receiptTotalRow}>
                  <span>Subtotal:</span>
                  <span>Rs {currentReceipt.subtotal.toLocaleString()}</span>
                </div>
                <div style={styles.receiptTotalRow}>
                  <span>Tax:</span>
                  <span>Rs {currentReceipt.tax.toLocaleString()}</span>
                </div>
                <div style={styles.receiptTotalRowFinal}>
                  <span>Total:</span>
                  <span>Rs {currentReceipt.total.toLocaleString()}</span>
                </div>
              </div>

              <div style={styles.receiptWarranty}>
                <h3>🛡️ Warranty Information</h3>
                {currentReceipt.items.map((item, index) => (
                  <div key={index} style={styles.warrantyItem}>
                    <p><strong>{item.productName}</strong> (S/N: {item.serialNumber})</p>
                    <p>Warranty Period: {item.warrantyPeriod} months</p>
                    <p>Warranty Expires: {new Date(item.warrantyExpiry).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>

              <div style={styles.receiptFooter}>
                <p><strong>Terms & Conditions:</strong></p>
                <p>• Warranty is valid from the date of purchase</p>
                <p>• Keep this receipt for warranty claims</p>
                <p>• Product must be in original condition for warranty</p>
                <p>• Installation must be done by certified technicians</p>
                <p style={styles.receiptThankYou}>
                  Thank you for choosing {companyInfo.name}!
                </p>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button onClick={printReceipt} style={styles.printButton}>
                🖨️ Print Receipt
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                style={styles.cancelButton}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    background: "linear-gradient(135deg, #FFF8F0 0%, #FFEBDD 100%)",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },

  header: {
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "30px",
    color: "white",
    boxShadow: "0 10px 30px rgba(255, 107, 53, 0.3)",
  },

  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  backButton: {
    padding: "10px 20px",
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
  },

  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    margin: "0 0 10px 0",
    textShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },

  subtitle: {
    fontSize: "1.1rem",
    opacity: "0.9",
    margin: 0,
    fontWeight: "300",
  },

  statsContainer: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },

  statItem: {
    textAlign: "center",
    background: "rgba(255, 255, 255, 0.1)",
    padding: "15px 20px",
    borderRadius: "15px",
    backdropFilter: "blur(10px)",
  },

  statValue: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "5px",
  },

  statLabel: {
    fontSize: "0.9rem",
    opacity: "0.8",
  },

  warrantAlert: {
    background: "linear-gradient(135deg, #f39c12, #e67e22)",
    color: "white",
    padding: "15px",
    borderRadius: "15px",
    marginBottom: "20px",
    boxShadow: "0 5px 15px rgba(243, 156, 18, 0.3)",
  },

  alertContent: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  alertIcon: {
    fontSize: "1.5rem",
  },

  alertClose: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    color: "white",
    fontSize: "1.5rem",
    cursor: "pointer",
  },

  tabContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "30px",
    background: "white",
    padding: "10px",
    borderRadius: "15px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  },

  tab: {
    padding: "12px 24px",
    background: "transparent",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    color: "#666",
    transition: "all 0.3s ease",
  },

  activeTab: {
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    color: "white",
    boxShadow: "0 3px 10px rgba(255, 107, 53, 0.3)",
  },

  searchContainer: {
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  searchBox: {
    flex: 1,
    minWidth: "300px",
  },

  searchInput: {
    width: "100%",
    padding: "15px 20px",
    border: "2px solid #FFE0CC",
    borderRadius: "15px",
    fontSize: "1rem",
    background: "white",
    transition: "all 0.3s ease",
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
  },

  filterSelect: {
    padding: "15px 20px",
    border: "2px solid #FFE0CC",
    borderRadius: "15px",
    fontSize: "1rem",
    background: "white",
    cursor: "pointer",
    minWidth: "150px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
  },

  formCard: {
    background: "white",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "30px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    border: "1px solid #FFE0CC",
  },

  formTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "25px",
    color: "#E65100",
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
  },

  formGroupFull: {
    display: "flex",
    flexDirection: "column",
    gridColumn: "1 / -1",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#333",
  },

  input: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #FFE0CC",
    borderRadius: "10px",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    background: "white",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #FFE0CC",
    borderRadius: "10px",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    background: "white",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },

  salePreview: {
    background: "#f8f9fa",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
    border: "1px solid #e9ecef",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px",
  },

  submitButton: {
    padding: "15px 30px",
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    boxShadow: "0 5px 15px rgba(255, 107, 53, 0.3)",
  },

  cancelButton: {
    padding: "15px 30px",
    background: "linear-gradient(135deg, #95a5a6, #7f8c8d)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    boxShadow: "0 5px 15px rgba(149, 165, 166, 0.3)",
  },

  listCard: {
    background: "white",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "30px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    border: "1px solid #FFE0CC",
  },

  listTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "25px",
    color: "#E65100",
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "20px",
  },

  productCard: {
    background: "#FFF8F0",
    border: "2px solid #FFE0CC",
    borderRadius: "15px",
    padding: "20px",
    transition: "all 0.3s ease",
  },

  productHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "15px",
  },

  productIcon: {
    fontSize: "2rem",
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    borderRadius: "12px",
    color: "white",
  },

  productInfo: {
    flex: 1,
  },

  productName: {
    margin: "0 0 5px 0",
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#333",
  },

  productModel: {
    margin: 0,
    color: "#666",
    fontSize: "0.9rem",
  },

  stockBadge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "linear-gradient(135deg, #FFAB00, #FFC107)",
    color: "white",
    padding: "8px 12px",
    borderRadius: "10px",
    minWidth: "60px",
  },

  stockNumber: {
    fontSize: "1.5rem",
    fontWeight: "700",
    lineHeight: 1,
  },

  stockLabel: {
    fontSize: "0.7rem",
    opacity: "0.9",
  },

  productDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "15px",
  },

  productRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.9rem",
  },

  productActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },

  editButton: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #3498db, #2980b9)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },

  deleteButton: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #e74c3c, #c0392b)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },

  salesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "20px",
  },

  saleCard: {
    background: "#FFF8F0",
    border: "2px solid #FFE0CC",
    borderRadius: "15px",
    padding: "20px",
    transition: "all 0.3s ease",
  },

  saleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  saleInfo: {
    flex: 1,
  },

  saleName: {
    margin: "0 0 5px 0",
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#333",
  },

  saleCustomer: {
    margin: 0,
    color: "#666",
    fontSize: "0.9rem",
  },

  salePrice: {
    fontSize: "1.3rem",
    fontWeight: "700",
    color: "#27ae60",
    background: "rgba(39, 174, 96, 0.1)",
    padding: "8px 15px",
    borderRadius: "10px",
  },

  saleDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "15px",
  },

  saleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.9rem",
  },

  saleActions: {
    display: "flex",
    justifyContent: "flex-end",
  },

  receiptButton: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #9b59b6, #8e44ad)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },

  warrantyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "20px",
  },

  warrantyCard: {
    background: "#FFF8F0",
    border: "2px solid #FFE0CC",
    borderRadius: "15px",
    padding: "20px",
    transition: "all 0.3s ease",
  },

  warrantyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  warrantyInfo: {
    flex: 1,
  },

  warrantyProduct: {
    margin: "0 0 5px 0",
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#333",
  },

  warrantyCustomer: {
    margin: 0,
    color: "#666",
    fontSize: "0.9rem",
  },

  warrantyStatus: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  warrantyDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  warrantyRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.9rem",
  },

  warrantyDays: {
    textAlign: "center",
    marginTop: "10px",
    padding: "8px",
    background: "rgba(255, 171, 0, 0.1)",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#FFAB00",
  },

  analyticsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },

  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },

  analyticsCard: {
    background: "white",
    borderRadius: "20px",
    padding: "25px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    border: "1px solid #FFE0CC",
  },

  analyticsTitle: {
    fontSize: "1.3rem",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#E65100",
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  analyticsStats: {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: "15px",
  },

  analyticsStat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    minWidth: "80px",
  },

  analyticsNumber: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#FF6B35",
    marginBottom: "5px",
  },

  analyticsLabel: {
    fontSize: "0.9rem",
    color: "#666",
    fontWeight: "600",
  },

  topProducts: {
    background: "white",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    border: "1px solid #FFE0CC",
  },

  topProductsList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  topProductItem: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "15px",
    background: "#FFF8F0",
    borderRadius: "12px",
    border: "1px solid #FFE0CC",
  },

  topProductRank: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#FF6B35",
    width: "40px",
    textAlign: "center",
  },

  topProductInfo: {
    flex: 1,
  },

  topProductStats: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "5px",
    fontSize: "0.9rem",
    color: "#666",
  },

  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modalContent: {
    background: "white",
    borderRadius: "20px",
    padding: "30px",
    maxWidth: "800px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "2px solid #FFE0CC",
  },

  closeButton: {
    background: "none",
    border: "none",
    fontSize: "2rem",
    cursor: "pointer",
    color: "#666",
    padding: "5px",
  },

  receipt: {
    background: "white",
    padding: "30px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    marginBottom: "20px",
    fontFamily: "Arial, sans-serif",
  },

  receiptHeader: {
    display: "flex",
    alignItems: "center",
    gap: "30px",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "2px solid #333",
  },

  receiptLogo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    maxWidth: "120px",
    maxHeight: "120px",
    objectFit: "contain",
  },

  logoPlaceholder: {
    fontSize: "3rem",
    fontWeight: "700",
    color: "#FF6B35",
    textAlign: "center",
  },

  receiptCompanyInfo: {
    flex: 1,
  },

  receiptCompanyName: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#FF6B35",
    margin: "0 0 10px 0",
  },

  receiptDivider: {
    height: "2px",
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    margin: "20px 0",
  },

  receiptInfo: {
    marginBottom: "20px",
  },

  receiptInfoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  receiptCustomer: {
    marginBottom: "30px",
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "8px",
  },

  receiptTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
    border: "1px solid #ddd",
  },

  receiptTotals: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "10px",
    marginBottom: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #ddd",
  },

  receiptTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    minWidth: "200px",
    fontSize: "1rem",
  },

  receiptTotalRowFinal: {
    display: "flex",
    justifyContent: "space-between",
    minWidth: "200px",
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#FF6B35",
    borderTop: "2px solid #FF6B35",
    paddingTop: "10px",
  },

  receiptWarranty: {
    marginBottom: "30px",
    padding: "20px",
    background: "#f0f8ff",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },

  warrantyItem: {
    marginBottom: "15px",
    paddingBottom: "15px",
    borderBottom: "1px solid #e0e0e0",
  },

  receiptFooter: {
    borderTop: "2px solid #333",
    paddingTop: "20px",
    fontSize: "0.9rem",
    color: "#666",
  },

  receiptThankYou: {
    textAlign: "center",
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#FF6B35",
    marginTop: "20px",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px",
  },

  printButton: {
    padding: "15px 30px",
    background: "linear-gradient(135deg, #27ae60, #2ecc71)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    boxShadow: "0 5px 15px rgba(39, 174, 96, 0.3)",
  },
};

// Add CSS for table styling
const tableStyles = `
  .receipt table th,
  .receipt table td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
  }
  
  .receipt table th {
    background-color: #f2f2f2;
    font-weight: 600;
  }
  
  .receipt table tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

// Inject styles for table
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('receipt-table-styles');
  if (!existingStyle) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'receipt-table-styles';
    styleSheet.innerText = tableStyles;
    document.head.appendChild(styleSheet);
  }
}

export default ProductsPage;