const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { emitEvent } = require('../services/socketService');

exports.getProducts = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 50, sort = '-createdAt' } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { productId: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / limit),
      page: Number(page),
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.id }) || await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { productId, productName, category, description, price, costPrice, stock, minimumStock, supplier } = req.body;

    const existing = await Product.findOne({ productId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product ID already exists' });
    }

    const product = await Product.create({
      productId,
      productName,
      category,
      description,
      price,
      costPrice,
      stock,
      minimumStock,
      supplier
    });

    emitEvent('product_updated', product);

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id) || await Product.findOne({ productId: req.params.id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    Object.assign(product, req.body);
    await product.save();

    // Check low stock alert
    if (product.stock <= product.minimumStock) {
      const notif = await Notification.create({
        title: `⚠️ Stock Alert: ${product.productName}`,
        message: `Current stock (${product.stock}) is below minimum stock level (${product.minimumStock}).`,
        type: 'stock',
        link: '/products'
      });
      emitEvent('stock_alert', { product, notification: notif });
    }

    emitEvent('product_updated', product);

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id) || await Product.findOneAndDelete({ productId: req.params.id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    emitEvent('product_deleted', req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInventorySummary = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const inStock = await Product.countDocuments({ status: 'In Stock' });
    const lowStock = await Product.countDocuments({ status: 'Low Stock' });
    const outOfStock = await Product.countDocuments({ status: 'Out of Stock' });

    const totalStockValue = await Product.aggregate([
      { $group: { _id: null, totalValue: { $sum: { $multiply: ['$stock', '$price'] } } } }
    ]);

    const lowStockItems = await Product.find({ status: { $in: ['Low Stock', 'Out of Stock'] } }).limit(10);

    res.json({
      success: true,
      summary: {
        totalProducts,
        inStock,
        lowStock,
        outOfStock,
        totalValue: totalStockValue[0]?.totalValue || 0
      },
      lowStockItems
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
