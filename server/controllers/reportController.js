const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Prediction = require('../models/Prediction');

exports.generateReport = async (req, res) => {
  try {
    const { reportType = 'sales', startDate, endDate, format = 'json' } = req.query;

    let query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (reportType === 'sales') {
      const sales = await Sale.find(query).sort({ date: -1 });
      const totalAmount = sales.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalQuantity = sales.reduce((sum, s) => sum + s.quantity, 0);

      if (format === 'csv') {
        let csv = 'Sale ID,Date,Product,Category,Quantity,Price,Discount,Tax,Total Amount,Payment Method,Salesperson\n';
        sales.forEach((s) => {
          csv += `"${s.saleId}","${s.date.toISOString().split('T')[0]}","${s.productName}","${s.category}",${s.quantity},${s.price},${s.discount},${s.tax},${s.totalAmount},"${s.paymentMethod}","${s.salesperson}"\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=sales_report_${Date.now()}.csv`);
        return res.send(csv);
      }

      return res.json({
        success: true,
        reportType: 'sales',
        summary: { totalAmount, totalQuantity, totalRecords: sales.length },
        sales
      });
    }

    if (reportType === 'inventory') {
      const products = await Product.find().sort({ stock: 1 });
      const totalStockValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

      if (format === 'csv') {
        let csv = 'Product ID,Product Name,Category,Price,Cost Price,Stock,Minimum Stock,Status,Supplier\n';
        products.forEach((p) => {
          csv += `"${p.productId}","${p.productName}","${p.category}",${p.price},${p.costPrice},${p.stock},${p.minimumStock},"${p.status}","${p.supplier}"\n`;
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=inventory_report_${Date.now()}.csv`);
        return res.send(csv);
      }

      return res.json({
        success: true,
        reportType: 'inventory',
        summary: { totalStockValue, totalProducts: products.length },
        products
      });
    }

    if (reportType === 'prediction') {
      const prediction = await Prediction.findOne().sort({ createdAt: -1 });
      return res.json({
        success: true,
        reportType: 'prediction',
        prediction
      });
    }

    res.status(400).json({ success: false, message: 'Invalid report type' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
