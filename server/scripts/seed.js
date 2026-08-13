const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const Prediction = require('../models/Prediction');
const Notification = require('../models/Notification');
const SalesTarget = require('../models/SalesTarget');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartsalesai';

const seedDatabase = async () => {
  try {
    console.log('[Seed Script] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed Script] Connected successfully.');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Sale.deleteMany({});
    await Prediction.deleteMany({});
    await Notification.deleteMany({});
    await SalesTarget.deleteMany({});

    console.log('[Seed Script] Existing database collections cleared.');

    // 1. Create Default Users
    await User.create([
      { username: 'admin', email: 'admin@smartsales.ai', password: 'password123', role: 'Admin' },
      { username: 'manager', email: 'manager@smartsales.ai', password: 'password123', role: 'Manager' },
      { username: 'salesuser', email: 'sales@smartsales.ai', password: 'password123', role: 'Sales User' }
    ]);
    console.log('[Seed Script] Default Admin, Manager, and Sales Accounts created.');

    // Paths to Indian dataset JSON files
    const datasetDir = path.join(__dirname, '../../dataset');
    const productsFilePath = path.join(datasetDir, 'indian_products.json');
    const customersFilePath = path.join(datasetDir, 'indian_customers.json');
    const salesFilePath = path.join(datasetDir, 'indian_sales_dataset.json');

    // 2. Seed Products
    let productsData = [];
    if (fs.existsSync(productsFilePath)) {
      productsData = JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));
      console.log(`[Seed Script] Loading products dataset from ${productsFilePath}`);
    } else {
      console.log('[Seed Script] Using fallback products catalog.');
      productsData = [
        { productId: 'PRD-IND-101', productName: 'Tata Enterprise Cloud Server R750', category: 'Enterprise IT', price: 185000, costPrice: 140000, stock: 35, minimumStock: 10, supplier: 'Tata Communications Ltd' },
        { productId: 'PRD-IND-102', productName: 'Reliance JioFi Enterprise 5G Mesh Router', category: 'Networking', price: 12499, costPrice: 7800, stock: 85, minimumStock: 15, supplier: 'Jio Platforms Ltd' },
        { productId: 'PRD-IND-103', productName: 'boAt Commercial Wireless ANC Headset Pro', category: 'Electronics', price: 4999, costPrice: 2600, stock: 140, minimumStock: 20, supplier: 'Imagine Marketing Pvt Ltd (boAt)' },
        { productId: 'PRD-IND-104', productName: 'Havells Smart Pro High-Bay LED Bay 150W', category: 'Smart Home & Electricals', price: 8500, costPrice: 5200, stock: 8, minimumStock: 12, supplier: 'Havells India Ltd' }
      ];
    }
    const insertedProducts = await Product.insertMany(productsData);
    console.log(`[Seed Script] Successfully seeded ${insertedProducts.length} Indian Enterprise Products.`);

    // 3. Seed Customers
    let customersData = [];
    if (fs.existsSync(customersFilePath)) {
      customersData = JSON.parse(fs.readFileSync(customersFilePath, 'utf8'));
      console.log(`[Seed Script] Loading customers dataset from ${customersFilePath}`);
    } else {
      customersData = [
        { customerId: 'CUST-IND-001', name: 'Reliance Retail Logistics Hub', email: 'procurement@relianceretail.in', phone: '+91 98200 12345', branch: 'Mumbai BKC HQ' },
        { customerId: 'CUST-IND-002', name: 'Tata Consultancy Services (TCS Park)', email: 'vendor.desk@tcs.com', phone: '+91 98450 67890', branch: 'Bengaluru Electronic City' }
      ];
    }
    const insertedCustomers = await Customer.insertMany(customersData);
    console.log(`[Seed Script] Successfully seeded ${insertedCustomers.length} Indian Corporate Clients.`);

    // 4. Seed Historical Sales Dataset
    let salesList = [];
    if (fs.existsSync(salesFilePath)) {
      const rawSales = JSON.parse(fs.readFileSync(salesFilePath, 'utf8'));
      console.log(`[Seed Script] Loading historical sales dataset from ${salesFilePath}`);
      salesList = rawSales.map(s => ({
        ...s,
        date: new Date(s.date)
      }));
    } else {
      console.log('[Seed Script] Generating dynamic historical sales dataset...');
      const salespersons = ['Rahul Sharma', 'Priya Patel', 'Amit Verma', 'Ananya Iyer', 'Vikram Singh'];
      const paymentMethods = ['UPI', 'Net Banking', 'Credit Card', 'Debit Card', 'Cash'];
      const today = new Date();

      for (let dayOffset = 365; dayOffset >= 0; dayOffset--) {
        const currentDate = new Date(today);
        currentDate.setDate(currentDate.getDate() - dayOffset);

        const dayOfWeek = currentDate.getDay();
        let dailySalesCount = Math.floor(Math.random() * 2) + 1;
        if (dayOfWeek >= 1 && dayOfWeek <= 5) dailySalesCount += 1;

        for (let s = 0; s < dailySalesCount; s++) {
          const product = insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
          const customer = insertedCustomers[Math.floor(Math.random() * insertedCustomers.length)];
          const quantity = Math.floor(Math.random() * 3) + 1;
          const discount = Math.random() > 0.7 ? Math.round(product.price * 0.05 * quantity) : 0;
          const tax = Math.round((product.price * quantity - discount) * 0.18);
          const totalAmount = Math.max(0, product.price * quantity - discount + tax);

          salesList.push({
            saleId: `SALE-IND-${10000 + salesList.length}`,
            productId: product.productId,
            productName: product.productName,
            category: product.category,
            customerId: customer.customerId,
            customerName: customer.name,
            quantity,
            price: product.price,
            discount,
            tax,
            totalAmount,
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            date: currentDate,
            salesperson: salespersons[Math.floor(Math.random() * salespersons.length)],
            branch: customer.branch
          });
        }
      }
    }

    await Sale.insertMany(salesList);
    console.log(`[Seed Script] Successfully seeded ${salesList.length} Indian Enterprise Sales Transactions!`);

    // 5. Create Monthly Sales Target
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlySalesSum = salesList
      .filter((s) => new Date(s.date) >= startOfMonth)
      .reduce((sum, s) => sum + s.totalAmount, 0);

    await SalesTarget.create({
      title: 'Indian Market Monthly Revenue Goal',
      targetAmount: 2500000,
      currentAmount: monthlySalesSum,
      startDate: startOfMonth,
      endDate: endOfMonth,
      status: monthlySalesSum >= 2500000 ? 'Achieved' : 'In Progress'
    });

    // 6. System Notifications
    await Notification.create({
      title: '🇮🇳 Indian Enterprise Dataset Seeded',
      message: `System initialized with open-source dataset: ${salesList.length} sales ledger records, ${insertedProducts.length} top Indian enterprise products, and Indian payment gateways.`,
      type: 'system'
    });

    await Notification.create({
      title: '⚠️ Stock Alert: Zebronics 32" Curved 4K Monitor',
      message: 'Current stock (5 units) is below minimum threshold (10 units). Supplier: Zebronics India Pvt Ltd.',
      type: 'stock',
      link: '/inventory'
    });

    console.log('✅ [Seed Script] Open-source Indian Company Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed Script Error]', error);
    process.exit(1);
  }
};

seedDatabase();
