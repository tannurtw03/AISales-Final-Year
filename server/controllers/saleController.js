const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const SalesTarget = require('../models/SalesTarget');
const { emitEvent } = require('../services/socketService');

exports.getSales = async (req, res) => {
  try {
    const {
      search,
      category,
      productId,
      paymentMethod,
      startDate,
      endDate,
      page = 1,
      limit = 25,
      sort = '-date'
    } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { saleId: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { salesperson: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (productId) query.productId = productId;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count: sales.length,
      total,
      pages: Math.ceil(total / limit),
      page: Number(page),
      sales
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findOne({ saleId: req.params.id }) || await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale record not found' });
    }
    res.json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSale = async (req, res) => {
  try {
    const {
      productId,
      customerId,
      quantity,
      price,
      discount = 0,
      tax = 0,
      paymentMethod = 'Cash',
      salesperson = 'Sales User',
      branch = 'Main Branch',
      date
    } = req.body;

    const product = await Product.findOne({ productId }) || await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Selected product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient inventory for ${product.productName}. Requested: ${quantity}, Available: ${product.stock}`
      });
    }

    let customerName = 'Walk-in Customer';
    if (customerId) {
      const customer = await Customer.findOne({ customerId }) || await Customer.findById(customerId);
      if (customer) {
        customerName = customer.name;
        customer.totalPurchases += (price * quantity) - discount + tax;
        await customer.save();
      }
    }

    const totalAmount = Math.max(0, (price * quantity) - discount + tax);
    const saleId = 'SALE-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);

    const sale = await Sale.create({
      saleId,
      productId: product.productId,
      productName: product.productName,
      category: product.category,
      customerId: customerId || 'CUST-GENERIC',
      customerName,
      quantity: Number(quantity),
      price: Number(price),
      discount: Number(discount),
      tax: Number(tax),
      totalAmount: Number(totalAmount),
      paymentMethod,
      date: date ? new Date(date) : new Date(),
      salesperson,
      branch
    });

    // Update Product Stock
    product.stock -= Number(quantity);
    await product.save();

    // Check low stock alert
    if (product.stock <= product.minimumStock) {
      const notif = await Notification.create({
        title: `Stock Alert: ${product.productName}`,
        message: `Current stock dropped to ${product.stock} (Min threshold: ${product.minimumStock}).`,
        type: 'stock',
        link: '/inventory'
      });
      emitEvent('stock_alert', { product, notification: notif });
    }

    // Real-time sale notification
    const saleNotif = await Notification.create({
      title: `New Sale Recorded: ₹${totalAmount.toLocaleString()}`,
      message: `Item: ${product.productName} (x${quantity}) sold by ${salesperson}.`,
      type: 'sale',
      link: '/sales'
    });

    // Emit live Socket.IO events to all connected clients
    emitEvent('new_sale', { sale, notification: saleNotif });
    emitEvent('dashboard_update', { trigger: 'new_sale', saleId: sale.saleId, totalAmount });

    // Update Active Sales Targets
    const activeTargets = await SalesTarget.find({ status: 'In Progress' });
    for (let target of activeTargets) {
      target.currentAmount += totalAmount;
      if (target.currentAmount >= target.targetAmount) {
        target.status = 'Achieved';
        const targetNotif = await Notification.create({
          title: `🎯 Sales Target Achieved!`,
          message: `Target "${target.title}" achieved with ₹${target.currentAmount.toLocaleString()}!`,
          type: 'target',
          link: '/dashboard'
        });
        emitEvent('target_achieved', { target, notification: targetNotif });
      }
      await target.save();
    }

    res.status(201).json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id) || await Sale.findOne({ saleId: req.params.id });
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale record not found' });
    }

    Object.assign(sale, req.body);
    await sale.save();

    emitEvent('sale_updated', sale);
    emitEvent('dashboard_update', { trigger: 'sale_updated' });

    res.json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id) || await Sale.findOneAndDelete({ saleId: req.params.id });
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale record not found' });
    }

    // Revert Product Stock
    const product = await Product.findOne({ productId: sale.productId });
    if (product) {
      product.stock += sale.quantity;
      await product.save();
    }

    emitEvent('sale_deleted', req.params.id);
    emitEvent('dashboard_update', { trigger: 'sale_deleted' });

    res.json({ success: true, message: 'Sale record deleted and inventory restored.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
