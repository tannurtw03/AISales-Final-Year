const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Prediction = require('../models/Prediction');

exports.getSummary = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();

    // Aggregating Total Revenue & Total Orders
    const revenueAgg = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalSales: { $sum: 1 },
          totalItemsSold: { $sum: '$quantity' }
        }
      }
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const totalSales = revenueAgg[0]?.totalSales || 0;
    const totalOrders = totalSales;

    // Today's Sales
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayAgg = await Sale.aggregate([
      { $match: { date: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);
    const todaySales = todayAgg[0]?.total || 0;

    // This Month's Sales
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const thisMonthAgg = await Sale.aggregate([
      { $match: { date: { $gte: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const thisMonthSales = thisMonthAgg[0]?.total || 0;

    const lastMonthAgg = await Sale.aggregate([
      { $match: { date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const lastMonthSales = lastMonthAgg[0]?.total || 0;

    let growthPercentage = 0;
    if (lastMonthSales > 0) {
      growthPercentage = (((thisMonthSales - lastMonthSales) / lastMonthSales) * 100).toFixed(1);
    } else if (thisMonthSales > 0) {
      growthPercentage = 100;
    }

    // Latest ML Prediction for Next Month
    const latestPred = await Prediction.findOne({ forecastType: 'overall' }).sort('-createdAt');
    let predictedNextMonthSales = 0;

    if (latestPred && latestPred.forecastData && latestPred.forecastData.length > 0) {
      // Sum predicted amounts for next 30 days
      predictedNextMonthSales = latestPred.forecastData
        .slice(0, 30)
        .reduce((sum, item) => sum + (item.predictedAmount || 0), 0);
    } else {
      // Simple baseline fallback estimate if ML model hasn't been trained yet
      predictedNextMonthSales = Math.round(thisMonthSales * 1.08);
    }

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalSales,
        totalOrders,
        totalProducts,
        todaySales,
        thisMonthSales,
        lastMonthSales,
        predictedNextMonthSales,
        growthPercentage: Number(growthPercentage)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSalesTrend = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    let startDate = new Date();

    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '3m') startDate.setMonth(startDate.getMonth() - 3);
    else if (period === '6m') startDate.setMonth(startDate.getMonth() - 6);
    else if (period === '1y') startDate.setFullYear(startDate.getFullYear() - 1);

    const trend = await Sale.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          quantity: { $sum: '$quantity' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, trend });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const topProducts = await Sale.aggregate([
      {
        $group: {
          _id: '$productId',
          productName: { $first: '$productName' },
          category: { $first: '$category' },
          totalRevenue: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
          salesCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit }
    ]);

    res.json({ success: true, topProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCategoryPerformance = async (req, res) => {
  try {
    const categoryStats = await Sale.aggregate([
      {
        $group: {
          _id: '$category',
          totalRevenue: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
          salesCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({ success: true, categoryStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
