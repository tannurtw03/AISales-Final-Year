const SalesTarget = require('../models/SalesTarget');
const Sale = require('../models/Sale');
const { emitEvent } = require('../services/socketService');

exports.getTargets = async (req, res) => {
  try {
    const targets = await SalesTarget.find().sort({ createdAt: -1 });

    // Recalculate progress for active targets from current sales
    for (let target of targets) {
      if (target.status === 'In Progress') {
        const salesAgg = await Sale.aggregate([
          { $match: { date: { $gte: target.startDate, $lte: target.endDate } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        target.currentAmount = salesAgg[0]?.total || 0;
        if (target.currentAmount >= target.targetAmount) {
          target.status = 'Achieved';
        }
        await target.save();
      }
    }

    res.json({ success: true, targets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTarget = async (req, res) => {
  try {
    const { title, targetAmount, startDate, endDate, branch } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const salesAgg = await Sale.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const currentAmount = salesAgg[0]?.total || 0;

    const target = await SalesTarget.create({
      title,
      targetAmount,
      currentAmount,
      startDate: start,
      endDate: end,
      branch: branch || 'All Branches',
      status: currentAmount >= targetAmount ? 'Achieved' : 'In Progress'
    });

    emitEvent('target_created', target);
    res.status(201).json({ success: true, target });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTarget = async (req, res) => {
  try {
    const target = await SalesTarget.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, target });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTarget = async (req, res) => {
  try {
    await SalesTarget.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Sales target deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
