import React, { useState, useEffect, useRef } from "react";
import { supabase } from '../supabaseClient.js';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [showWarrantyAlert, setShowWarrantyAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    serialNumber: "",
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

  // Company Information
  const companyInfo = {
    name: "Syed Solar Energy Pvt Ltd.",
    address: "Jalil Market Umar Gull Chwock Bara Road Near Bacha Khan International Airport, Peshawar",
    phone: "03075596695",
    phone2: "03044678929",
    website: "www.syedsolarenergy.com",
    app: "Solar Olagawa",
    logo: "logo.png",
  };

  // Load data from Supabase on component mount
  useEffect(() => {
    loadProducts();
    loadSales();
    const cleanup = setupRealtimeSubscriptions();
    return cleanup;
  }, []);

  useEffect(() => {
    checkWarrantyExpiration(sales);
  }, [sales]);

  const loadProducts = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('products_next')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert database format to component format
      const formattedProducts = data.map(product => ({
        id: product.id,
        name: product.name_next,
        model: product.model_next,
        purchaseDate: product.purchase_date_next,
        purchasePrice: product.purchase_price_next,
        type: product.type_next,
        quantity: product.quantity_next,
        supplier: product.supplier_next,
        warrantyPeriod: product.warranty_period_next,
        specifications: product.specifications_next,
        serialNumber: product.serial_number_next,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      }));
      
      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_next')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert database format to component format
      const formattedSales = data.map(sale => ({
        saleId: sale.sale_id_next,
        productName: sale.product_name_next,
        soldPrice: sale.sold_price_next,
        soldDate: sale.sold_date_next,
        customerName: sale.customer_name_next,
        customerPhone: sale.customer_phone_next,
        customerAddress: sale.customer_address_next,
        serialNumber: sale.serial_number_next,
        additionalInfo: sale.additional_info_next,
        quantity: sale.quantity_next,
        warrantyExpiry: sale.warranty_expiry_next,
        warrantyPeriod: sale.warranty_period_next,
        productType: sale.product_type_next,
        timestamp: sale.timestamp_next,
      }));
      
      setSales(formattedSales);
    } catch (error) {
      console.error('Error loading sales:', error);
      setError('Failed to load sales: ' + error.message);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to products changes
    const productsSubscription = supabase
      .channel('products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products_next' }, (payload) => {
        console.log('Products change received!', payload);
        loadProducts();
      })
      .subscribe();

    // Subscribe to sales changes
    const salesSubscription = supabase
      .channel('sales_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_next' }, (payload) => {
        console.log('Sales change received!', payload);
        loadSales();
      })
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(productsSubscription);
      supabase.removeChannel(salesSubscription);
    };
  };

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
        serialNumber: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      // Auto-generate serial number for inverters if not provided
      let finalFormData = { ...formData };
      if (formData.type === "inverter" && !formData.serialNumber.trim()) {
        finalFormData.serialNumber = generateSerialNumber("inverter");
      }
      
      // Convert to database format
      const dbData = {
        name_next: finalFormData.name,
        model_next: finalFormData.model,
        purchase_date_next: finalFormData.purchaseDate,
        purchase_price_next: parseFloat(finalFormData.purchasePrice),
        type_next: finalFormData.type,
        quantity_next: parseInt(finalFormData.quantity),
        supplier_next: finalFormData.supplier,
        warranty_period_next: parseInt(finalFormData.warrantyPeriod),
        specifications_next: finalFormData.specifications,
        serial_number_next: finalFormData.serialNumber,
      };

      let result;
      if (isExistingProduct && finalFormData.id) {
        // Update existing product
        result = await supabase
          .from('products_next')
          .update(dbData)
          .eq('id', finalFormData.id);
      } else {
        // Insert new product
        result = await supabase
          .from('products_next')
          .insert([dbData]);
      }

      if (result.error) throw result.error;

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
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Error saving product: ' + error.message);
    }
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
      serialNumber: "",
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

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        setError(null);
        const { error } = await supabase
          .from('products_next')
          .delete()
          .eq('id', productId);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Error deleting product: ' + error.message);
      }
    }
  };

  const extendWarranty = async (saleId, additionalMonths) => {
    try {
      setError(null);
      
      // Find the sale
      const sale = sales.find(s => s.saleId === saleId);
      if (!sale) return;

      const currentExpiry = new Date(sale.warrantyExpiry);
      currentExpiry.setMonth(currentExpiry.getMonth() + additionalMonths);
      
      const { error } = await supabase
        .from('sales_next')
        .update({
          warranty_expiry_next: currentExpiry.toISOString().split('T')[0],
          warranty_period_next: parseInt(sale.warrantyPeriod) + additionalMonths,
        })
        .eq('sale_id_next', saleId);

      if (error) throw error;
    } catch (error) {
      console.error('Error extending warranty:', error);
      setError('Error extending warranty: ' + error.message);
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

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      
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

      // Update product quantity
      const { error: updateError } = await supabase
        .from('products_next')
        .update({ quantity_next: product.quantity - saleQuantity })
        .eq('id', product.id);

      if (updateError) throw updateError;

      // Create sale entries
      const saleEntries = [];
      for (let i = 0; i < saleQuantity; i++) {
        const serialNumber = saleData.serialNumber || generateSerialNumber(product.type);
        const warrantyPeriod = parseInt(product.warrantyPeriod) || 12;
        const warrantyExpiry = calculateWarrantyExpiry(saleData.soldDate, warrantyPeriod);
        const saleId = Date.now() + i;

        const saleEntry = {
          sale_id_next: saleId,
          product_name_next: saleData.productName,
          sold_price_next: parseFloat(saleData.soldPrice),
          sold_date_next: saleData.soldDate,
          customer_name_next: saleData.customerName,
          customer_phone_next: saleData.customerPhone,
          customer_address_next: saleData.customerAddress,
          serial_number_next: serialNumber + (i > 0 ? `-${i + 1}` : ''),
          additional_info_next: saleData.additionalInfo,
          quantity_next: 1,
          warranty_expiry_next: warrantyExpiry,
          warranty_period_next: warrantyPeriod,
          product_type_next: product.type,
          timestamp_next: new Date().toISOString(),
        };

        saleEntries.push(saleEntry);
      }

      // Insert sales
      const { error: salesError } = await supabase
        .from('sales_next')
        .insert(saleEntries);

      if (salesError) throw salesError;

      // Generate and show receipt
      const formattedSaleEntries = saleEntries.map(entry => ({
        productName: entry.product_name_next,
        soldPrice: entry.sold_price_next,
        customerName: entry.customer_name_next,
        customerPhone: entry.customer_phone_next,
        customerAddress: entry.customer_address_next,
        serialNumber: entry.serial_number_next,
        quantity: entry.quantity_next,
        warrantyExpiry: entry.warranty_expiry_next,
        warrantyPeriod: entry.warranty_period_next,
      }));

      const receiptData = generateReceipt(formattedSaleEntries);
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
    } catch (error) {
      console.error('Error recording sale:', error);
      setError('Error recording sale: ' + error.message);
    }
  };

  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${currentReceipt.receiptNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
              line-height: 1.4;
            }
            .receipt-container { 
              max-width: 600px; 
              margin: 0 auto; 
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #FF6B35; 
              padding-bottom: 20px; 
              margin-bottom: 20px; 
            }
            .company-logo { 
              width: 100px; 
              height: 100px; 
              margin: 0 auto 15px; 
              background: #FF6B35; 
              border-radius: 100%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
            }
            .company-logo img {
              width: 80px;
              height: 80px;
              object-fit: contain;
              border-radius: 50%;
            }
            .company-logo-fallback {
              color: white; 
              font-size: 2.5rem;
              font-weight: bold;
            }
            .company-info { 
              margin: 10px 0; 
              font-size: 14px;
            }
            .company-name { 
              font-size: 28px; 
              font-weight: bold; 
              color: #FF6B35; 
              margin-bottom: 15px; 
              text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            .receipt-info {
              display: flex;
              justify-content: space-between;
              margin: 20px 0;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 8px;
              font-weight: bold;
            }
            .customer-section {
              background: linear-gradient(135deg, #f8f9fa, #e9ecef);
              padding: 20px;
              border-radius: 12px;
              margin: 20px 0;
              border-left: 5px solid #FF6B35;
            }
            .customer-section h3 {
              margin-top: 0;
              color: #FF6B35;
              font-size: 18px;
            }
            .table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
              border: 2px solid #FF6B35;
              border-radius: 8px;
              overflow: hidden;
            }
            .table th, .table td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            .table th { 
              background: linear-gradient(135deg, #FF6B35, #F7931E); 
              color: white; 
              font-weight: bold;
            }
            .table tbody tr:nth-child(even) {
              background-color: rgba(255, 107, 53, 0.05);
            }
            .totals-section {
              text-align: right;
              margin: 25px 0;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .total-row {
              margin: 8px 0;
              font-size: 16px;
            }
            .total-final { 
              font-weight: bold; 
              font-size: 24px; 
              color: #FF6B35; 
              border-top: 3px solid #FF6B35;
              padding-top: 15px;
              margin-top: 15px;
            }
            .warranty-info { 
              background: linear-gradient(135deg, #e3f2fd, #bbdefb);
              padding: 20px; 
              border-radius: 12px; 
              margin: 20px 0; 
              border: 2px solid #2196F3;
            }
            .warranty-info h3 {
              color: #1976D2;
              margin-top: 0;
              font-size: 18px;
            }
            .warranty-item {
              margin-bottom: 15px;
              padding: 15px;
              background: rgba(255,255,255,0.7);
              border-radius: 8px;
              border-left: 4px solid #2196F3;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding: 20px;
              border-top: 2px solid #FF6B35;
            }
            .terms-list {
              list-style: none;
              padding: 0;
              text-align: left;
            }
            .terms-list li {
              margin: 8px 0;
              padding-left: 25px;
              position: relative;
            }
            .terms-list li:before {
              content: "✓";
              position: absolute;
              left: 0;
              color: #27ae60;
              font-weight: bold;
            }
            .thank-you {
              background: linear-gradient(135deg, #FF6B35, #F7931E);
              color: white;
              padding: 20px;
              border-radius: 12px;
              margin-top: 20px;
              font-size: 18px;
              font-weight: bold;
            }
            @media print { 
              body { margin: 0; }
              .receipt-container { max-width: none; }
              .no-print { display: none; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="company-logo">
                <img src="logo.png" alt="${companyInfo.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div class="company-logo-fallback" style="display:none;">☀️</div>
              </div>
              <div class="company-name">${companyInfo.name}</div>
              <div class="company-info">
                <p><strong>${companyInfo.address}</strong></p>
                <p>📞 ${companyInfo.phone} | ${companyInfo.phone2}</p>
                <p>🌐 ${companyInfo.website}</p>
                <p>📱 App: ${companyInfo.app}</p>
              </div>
            </div>

            <div class="receipt-info">
              <div><strong>Receipt #:</strong> ${currentReceipt.receiptNumber}</div>
              <div><strong>Date:</strong> ${new Date(currentReceipt.date).toLocaleDateString()}</div>
            </div>

            <div class="customer-section">
              <h3>📋 Bill To:</h3>
              <p><strong>${currentReceipt.customer.name}</strong></p>
              <p>📞 ${currentReceipt.customer.phone}</p>
              <p>📍 ${currentReceipt.customer.address}</p>
            </div>

            <table class="table">
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
                ${currentReceipt.items.map(item => `
                  <tr>
                    <td><strong>${item.productName}</strong></td>
                    <td>${item.serialNumber}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">Rs ${item.unitPrice.toLocaleString()}</td>
                    <td style="text-align: right;"><strong>Rs ${item.totalPrice.toLocaleString()}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals-section">
              <div class="total-row">Subtotal: <strong>Rs ${currentReceipt.subtotal.toLocaleString()}</strong></div>
              <div class="total-row">Tax: <strong>Rs ${currentReceipt.tax.toLocaleString()}</strong></div>
              <div class="total-final">
                Total: Rs ${currentReceipt.total.toLocaleString()}
              </div>
            </div>

            <div class="warranty-info">
              <h3>🛡️ Warranty Information</h3>
              ${currentReceipt.items.map(item => `
                <div class="warranty-item">
                  <div style="font-weight: bold; margin-bottom: 8px;">${item.productName}</div>
                  <div style="color: #666; font-size: 14px;">Serial Number: ${item.serialNumber}</div>
                  <div style="margin-top: 8px;">
                    <span style="display: inline-block; margin-right: 20px;">⏰ Warranty: ${item.warrantyPeriod} months</span>
                    <span>📅 Expires: ${new Date(item.warrantyExpiry).toLocaleDateString()}</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="footer">
              <h4 style="color: #FF6B35; margin-bottom: 15px;">📋 Terms & Conditions</h4>
              <ul class="terms-list">
                <li>Warranty is valid from the date of purchase</li>
                <li>Keep this receipt for warranty claims</li>
                <li>Product must be in original condition for warranty</li>
                <li>Installation must be done by certified technicians</li>
                <li>Company not responsible for misuse or accidental damage</li>
              </ul>
              
              <div class="thank-you">
                🙏 Thank you for choosing ${companyInfo.name}!<br>
                Your trust in solar energy helps build a sustainable future 🌱
              </div>
            </div>
          </div>
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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem',
        color: '#FF6B35'
      }}>
        <div style={{
          animation: 'spin 1s linear infinite',
          width: '50px',
          height: '50px',
          border: '4px solid #FFE0CC',
          borderTop: '4px solid #FF6B35',
          borderRadius: '50%',
          marginRight: '15px'
        }}></div>
        Loading Solar Management System...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Error Display */}
      {error && (
        <div style={styles.errorAlert}>
          <div style={styles.errorContent}>
            <span style={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError(null)} style={styles.errorClose}>×</button>
          </div>
        </div>
      )}

      {/* Supabase Connection Status */}
      <div style={styles.connectionStatus}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '25px',
          fontSize: '0.9rem',
          fontWeight: '600',
          boxShadow: '0 3px 10px rgba(39, 174, 96, 0.3)'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: 'white',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
          Real-time Database Connected ⚡
        </div>
      </div>

      {/* Professional Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.companyLogo}>☀️</div>
            <div>
              <h1 style={styles.title}>{companyInfo.name}</h1>
              <p style={styles.subtitle}>
                Professional Solar Products Management System
              </p>
              <p style={styles.companyDetails}>
                {companyInfo.address} | {companyInfo.phone} | {companyInfo.website}
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

      {/* Real-time Warranty Alert */}
      {showWarrantyAlert && (
        <div style={styles.warrantAlert}>
          <div style={styles.alertContent}>
            <span style={styles.alertIcon}>⚠️</span>
            <span>You have {sales.filter(s => getWarrantyStatus(s.warrantyExpiry).status === "Expiring Soon").length} warranties expiring within 30 days!</span>
            <button onClick={() => setActiveTab("warranty")} style={styles.alertButton}>View Details</button>
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
          🛡️ Warranty Management
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
                  <label style={styles.label}>Serial Number {formData.type === "inverter" ? "(Auto-generated if empty)" : ""}</label>
                  <input
                    name="serialNumber"
                    type="text"
                    placeholder={formData.type === "inverter" ? "Will auto-generate if empty" : "Enter serial number"}
                    value={formData.serialNumber}
                    onChange={handleInputChange}
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
            <h3 style={styles.listTitle}>📋 Products Inventory ({filteredProducts.length} items)</h3>
            <div style={styles.productGrid}>
              {filteredProducts.map((product) => (
                <div key={product.id} style={styles.productCard} className="product-card">
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
                      <span>🔢 Serial:</span>
                      <span>{product.serialNumber || "N/A"}</span>
                    </div>
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
            {filteredProducts.length === 0 && (
              <div style={styles.emptyState}>
                <p>No products found. Add your first product to get started!</p>
              </div>
            )}
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

                <div style={styles.formGroup}>
                  <label style={styles.label}>Serial Number (Optional)</label>
                  <input
                    name="serialNumber"
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={saleData.serialNumber}
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
            <h3 style={styles.listTitle}>📊 Sales History ({filteredSales.length} sales)</h3>
            <div style={styles.salesGrid}>
              {filteredSales.map((sale) => {
                const warrantyStatus = getWarrantyStatus(sale.warrantyExpiry);
                return (
                  <div key={sale.saleId} style={styles.saleCard} className="sale-card">
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
                          {warrantyStatus.status} ({warrantyStatus.days} days)
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
            {filteredSales.length === 0 && (
              <div style={styles.emptyState}>
                <p>No sales recorded yet. Record your first sale to get started!</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "warranty" && (
        <div style={styles.listCard}>
          <h3 style={styles.listTitle}>🛡️ Real-Time Warranty Management</h3>
          <div style={styles.warrantyStats}>
            <div style={styles.warrantyStatItem}>
              <span style={styles.warrantyStatNumber}>
                {sales.filter(s => getWarrantyStatus(s.warrantyExpiry).status === "Active").length}
              </span>
              <span style={styles.warrantyStatLabel}>Active Warranties</span>
            </div>
            <div style={styles.warrantyStatItem}>
              <span style={styles.warrantyStatNumber}>
                {sales.filter(s => getWarrantyStatus(s.warrantyExpiry).status === "Expiring Soon").length}
              </span>
              <span style={styles.warrantyStatLabel}>Expiring Soon</span>
            </div>
            <div style={styles.warrantyStatItem}>
              <span style={styles.warrantyStatNumber}>
                {sales.filter(s => getWarrantyStatus(s.warrantyExpiry).status === "Expired").length}
              </span>
              <span style={styles.warrantyStatLabel}>Expired</span>
            </div>
          </div>
          
          <div style={styles.warrantyGrid}>
            {sales.map((sale) => {
              const warrantyStatus = getWarrantyStatus(sale.warrantyExpiry);
              return (
                <div key={sale.saleId} style={styles.warrantyCard} className="warranty-card">
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
                    <div style={styles.warrantyRow}>
                      <span>⏱️ Days Left:</span>
                      <span style={{ color: warrantyStatus.color, fontWeight: 'bold' }}>
                        {warrantyStatus.status === "Expired" ? `Expired ${warrantyStatus.days} days ago` : `${warrantyStatus.days} days`}
                      </span>
                    </div>
                  </div>
                  <div style={styles.warrantyActions}>
                    <button
                      onClick={() => extendWarranty(sale.saleId, 6)}
                      style={styles.extendButton}
                    >
                      +6 Months
                    </button>
                    <button
                      onClick={() => extendWarranty(sale.saleId, 12)}
                      style={styles.extendButton}
                    >
                      +12 Months
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {sales.length === 0 && (
            <div style={styles.emptyState}>
              <p>No sales with warranty information found.</p>
            </div>
          )}
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
            {products.filter(p => sales.filter(s => s.productName === p.name).length > 0).length === 0 && (
              <div style={styles.emptyState}>
                <p>No sales data available for analytics.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Professional Receipt Modal */}
      {showReceiptModal && currentReceipt && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>📄 Professional Sales Receipt</h2>
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
                  <div style={styles.logoCircle}>
                    <img 
                      src="logo.png" 
                      alt={companyInfo.name}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'contain',
                        borderRadius: '50%'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div style={{
                      display: 'none',
                      fontSize: '3rem',
                      color: 'white',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>☀️</div>
                  </div>
                </div>
                <div style={styles.receiptCompanyInfo}>
                  <h1 style={styles.receiptCompanyName}>{companyInfo.name}</h1>
                  <p style={styles.receiptAddress}>{companyInfo.address}</p>
                  <div style={styles.receiptContacts}>
                    <p>📞 {companyInfo.phone} | {companyInfo.phone2}</p>
                    <p>🌐 {companyInfo.website}</p>
                    <p>📱 App: {companyInfo.app}</p>
                  </div>
                </div>
              </div>

              <div style={styles.receiptDivider}></div>

              <div style={styles.receiptInfo}>
                <div style={styles.receiptInfoRow}>
                  <div style={styles.receiptInfoItem}>
                    <strong>Receipt #:</strong> {currentReceipt.receiptNumber}
                  </div>
                  <div style={styles.receiptInfoItem}>
                    <strong>Date:</strong> {new Date(currentReceipt.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={styles.receiptCustomer}>
                <h3 style={styles.receiptSectionTitle}>📋 Bill To:</h3>
                <div style={styles.customerInfo}>
                  <p><strong>{currentReceipt.customer.name}</strong></p>
                  <p>📞 {currentReceipt.customer.phone}</p>
                  <p>📍 {currentReceipt.customer.address}</p>
                </div>
              </div>

              <table style={styles.receiptTable}>
                <thead>
                  <tr style={styles.receiptTableHeader}>
                    <th style={styles.receiptTableHeaderCell}>Product</th>
                    <th style={styles.receiptTableHeaderCell}>Serial Number</th>
                    <th style={styles.receiptTableHeaderCell}>Qty</th>
                    <th style={styles.receiptTableHeaderCell}>Unit Price</th>
                    <th style={styles.receiptTableHeaderCell}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReceipt.items.map((item, index) => (
                    <tr key={index} style={styles.receiptTableRow}>
                      <td style={styles.receiptTableCell}>{item.productName}</td>
                      <td style={styles.receiptTableCell}>{item.serialNumber}</td>
                      <td style={styles.receiptTableCell}>{item.quantity}</td>
                      <td style={styles.receiptTableCell}>Rs {item.unitPrice.toLocaleString()}</td>
                      <td style={styles.receiptTableCell}>Rs {item.totalPrice.toLocaleString()}</td>
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
                <h3 style={styles.receiptSectionTitle}>🛡️ Warranty Information</h3>
                {currentReceipt.items.map((item, index) => (
                  <div key={index} style={styles.warrantyItem}>
                    <div style={styles.warrantyItemHeader}>
                      <strong>{item.productName}</strong> (S/N: {item.serialNumber})
                    </div>
                    <div style={styles.warrantyItemDetails}>
                      <span>⏰ Warranty Period: {item.warrantyPeriod} months</span>
                      <span>📅 Warranty Expires: {new Date(item.warrantyExpiry).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.receiptFooter}>
                <div style={styles.receiptTerms}>
                  <h4 style={styles.receiptSectionTitle}>📋 Terms & Conditions:</h4>
                  <ul style={styles.receiptTermsList}>
                    <li>✅ Warranty is valid from the date of purchase</li>
                    <li>✅ Keep this receipt for warranty claims</li>
                    <li>✅ Product must be in original condition for warranty</li>
                    <li>✅ Installation must be done by certified technicians</li>
                    <li>✅ Company not responsible for misuse or accidental damage</li>
                  </ul>
                </div>
                <div style={styles.receiptThankYou}>
                  <p>🙏 Thank you for choosing {companyInfo.name}!</p>
                  <p>Your trust in solar energy helps build a sustainable future 🌱</p>
                </div>
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

  errorAlert: {
    background: "linear-gradient(135deg, #e74c3c, #c0392b)",
    color: "white",
    padding: "15px",
    borderRadius: "15px",
    marginBottom: "20px",
    boxShadow: "0 5px 15px rgba(231, 76, 60, 0.3)",
  },

  errorContent: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  errorIcon: {
    fontSize: "1.5rem",
  },

  errorClose: {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "0 10px",
    marginLeft: "auto",
  },

  connectionStatus: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px',
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

  companyLogo: {
    width: "80px",
    height: "80px",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2.5rem",
    backdropFilter: "blur(10px)",
  },

  title: {
    fontSize: "2.2rem",
    fontWeight: "700",
    margin: "0 0 10px 0",
    textShadow: "0 2px 10px rgba(0,0,0,0.2)",
  },

  subtitle: {
    fontSize: "1.1rem",
    opacity: "0.9",
    margin: "0 0 5px 0",
    fontWeight: "300",
  },

  companyDetails: {
    fontSize: "0.9rem",
    opacity: "0.8",
    margin: 0,
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
    minWidth: "120px",
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
    animation: "pulse 2s infinite",
  },

  alertContent: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  alertIcon: {
    fontSize: "1.5rem",
  },

  alertButton: {
    marginLeft: "auto",
    padding: "8px 16px",
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  alertClose: {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "0 10px",
  },

  tabContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "30px",
    background: "white",
    padding: "10px",
    borderRadius: "15px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    flexWrap: "wrap",
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
    whiteSpace: "nowrap",
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
    boxSizing: "border-box",
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
    flexWrap: "wrap",
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

  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#666",
    fontSize: "1.1rem",
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

  warrantyStats: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  warrantyStatItem: {
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    color: "white",
    padding: "20px",
    borderRadius: "15px",
    textAlign: "center",
    minWidth: "150px",
    flex: 1,
  },

  warrantyStatNumber: {
    display: "block",
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "8px",
  },

  warrantyStatLabel: {
    fontSize: "0.9rem",
    opacity: "0.9",
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
    marginBottom: "15px",
  },

  warrantyRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.9rem",
  },

  warrantyActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },

  extendButton: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #27ae60, #2ecc71)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
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
    padding: "20px",
  },

  modalContent: {
    background: "white",
    borderRadius: "20px",
    padding: "30px",
    maxWidth: "900px",
    width: "100%",
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
    padding: "40px",
    border: "2px solid #FF6B35",
    borderRadius: "15px",
    marginBottom: "20px",
    fontFamily: "Arial, sans-serif",
  },

  receiptHeader: {
    display: "flex",
    alignItems: "center",
    gap: "30px",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "3px solid #FF6B35",
  },

  receiptLogo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  logoCircle: {
    width: "100px",
    height: "100px",
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "3rem",
    color: "white",
    boxShadow: "0 5px 15px rgba(255, 107, 53, 0.3)",
  },

  receiptCompanyInfo: {
    flex: 1,
  },

  receiptCompanyName: {
    fontSize: "2.2rem",
    fontWeight: "700",
    color: "#FF6B35",
    margin: "0 0 15px 0",
  },

  receiptAddress: {
    fontSize: "1.1rem",
    color: "#333",
    margin: "0 0 15px 0",
    fontWeight: "500",
  },

  receiptContacts: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  receiptDivider: {
    height: "3px",
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    margin: "20px 0",
    borderRadius: "2px",
  },

  receiptInfo: {
    marginBottom: "25px",
  },

  receiptInfoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    flexWrap: "wrap",
    gap: "15px",
  },

  receiptInfoItem: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#333",
  },

  receiptCustomer: {
    marginBottom: "30px",
    padding: "20px",
    background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
    borderRadius: "12px",
    border: "1px solid #dee2e6",
  },

  receiptSectionTitle: {
    margin: "0 0 15px 0",
    fontSize: "1.3rem",
    fontWeight: "700",
    color: "#FF6B35",
  },

  customerInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  receiptTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "25px",
    border: "2px solid #FF6B35",
    borderRadius: "10px",
    overflow: "hidden",
  },

  receiptTableHeader: {
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
  },

  receiptTableHeaderCell: {
    padding: "15px 12px",
    color: "white",
    fontWeight: "700",
    textAlign: "left",
    fontSize: "1rem",
  },

  receiptTableRow: {
    borderBottom: "1px solid #e9ecef",
  },

  receiptTableCell: {
    padding: "12px",
    border: "1px solid #e9ecef",
    fontSize: "0.95rem",
  },

  receiptTotals: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "10px",
    marginBottom: "30px",
    paddingTop: "20px",
    borderTop: "2px solid #e9ecef",
  },

  receiptTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    minWidth: "250px",
    fontSize: "1.1rem",
    fontWeight: "500",
  },

  receiptTotalRowFinal: {
    display: "flex",
    justifyContent: "space-between",
    minWidth: "250px",
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#FF6B35",
    borderTop: "3px solid #FF6B35",
    paddingTop: "15px",
    background: "rgba(255, 107, 53, 0.05)",
    padding: "15px",
    borderRadius: "8px",
  },

  receiptWarranty: {
    marginBottom: "30px",
    padding: "25px",
    background: "linear-gradient(135deg, #f0f8ff, #e6f3ff)",
    borderRadius: "12px",
    border: "2px solid #4a90e2",
  },

  warrantyItem: {
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid #dee2e6",
  },

  warrantyItemHeader: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#333",
    marginBottom: "10px",
  },

  warrantyItemDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    color: "#666",
  },

  receiptFooter: {
    borderTop: "3px solid #FF6B35",
    paddingTop: "25px",
  },

  receiptTerms: {
    marginBottom: "25px",
  },

  receiptTermsList: {
    paddingLeft: "0",
    listStyle: "none",
    margin: "15px 0",
  },

  receiptThankYou: {
    textAlign: "center",
    padding: "20px",
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    color: "white",
    borderRadius: "12px",
    fontSize: "1.2rem",
    fontWeight: "600",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px",
    flexWrap: "wrap",
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

// Add CSS keyframes for animations
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .receipt table tr:nth-child(even) {
    background-color: rgba(255, 107, 53, 0.05);
  }
  
  .receipt ul li {
    margin-bottom: 8px;
    padding-left: 20px;
    position: relative;
  }

  input:focus, select:focus, textarea:focus {
    border-color: #FF6B35 !important;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1) !important;
    outline: none !important;
  }

  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }

  .product-card:hover, .sale-card:hover, .warranty-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  }

  @media (max-width: 768px) {
    .container {
      padding: 10px;
    }
    
    .headerContent {
      flex-direction: column;
      text-align: center;
    }
    
    .statsContainer {
      justify-content: center;
    }
    
    .formGrid {
      grid-template-columns: 1fr;
    }
    
    .productGrid, .salesGrid, .warrantyGrid {
      grid-template-columns: 1fr;
    }
    
    .analyticsGrid {
      grid-template-columns: 1fr;
    }
    
    .searchContainer {
      flex-direction: column;
    }
    
    .searchBox {
      min-width: auto;
    }
    
    .tabContainer {
      justify-content: center;
    }
    
    .modalContent {
      margin: 10px;
      padding: 20px;
    }
    
    .receiptHeader {
      flex-direction: column;
      text-align: center;
    }
    
    .receiptInfoRow {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;

if (document.head) {
  document.head.appendChild(styleSheet);
}

export default ProductsPage;