const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'indian_products.json');
const customersPath = path.join(__dirname, 'indian_customers.json');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const customers = JSON.parse(fs.readFileSync(customersPath, 'utf8'));

const salesList = [];
const salespersons = [
  'Rahul Sharma (West Zone)',
  'Priya Patel (South Zone)',
  'Amit Verma (North Zone)',
  'Ananya Iyer (East Zone)',
  'Vikram Singh (Key Accounts)'
];

const paymentMethods = ['UPI', 'Net Banking', 'Credit Card', 'Debit Card', 'Cash'];

const today = new Date();

let saleIndex = 10001;

for (let dayOffset = 365; dayOffset >= 0; dayOffset--) {
  const currentDate = new Date(today);
  currentDate.setDate(currentDate.getDate() - dayOffset);

  const dayOfWeek = currentDate.getDay();
  // Seasonality: More transactions on weekdays (Mon-Fri) + monthly quarter-end boost
  let dailySalesCount = Math.floor(Math.random() * 2) + 1; // 1-2 per day
  if (dayOfWeek >= 1 && dayOfWeek <= 5) dailySalesCount += 1;
  if (dayOfWeek === 5) dailySalesCount += 1;
  if (currentDate.getDate() >= 25) dailySalesCount += 1; // Month-end purchase spike

  for (let s = 0; s < dailySalesCount; s++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    
    // Bulk corporate quantity logic
    const isBulk = Math.random() > 0.75;
    const quantity = isBulk ? Math.floor(Math.random() * 5) + 3 : Math.floor(Math.random() * 2) + 1;
    
    const basePrice = product.price;
    const grossAmount = basePrice * quantity;
    const discount = Math.random() > 0.6 ? Math.round(grossAmount * 0.08) : 0;
    const taxableAmount = grossAmount - discount;
    const tax = Math.round(taxableAmount * 0.18); // 18% GST in India
    const totalAmount = Math.max(0, taxableAmount + tax);

    salesList.push({
      saleId: `SALE-IND-${saleIndex++}`,
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
      date: currentDate.toISOString(),
      salesperson: salespersons[Math.floor(Math.random() * salespersons.length)],
      branch: customer.branch
    });
  }
}

// 1. Write Sales JSON
const salesJsonPath = path.join(__dirname, 'indian_sales_dataset.json');
fs.writeFileSync(salesJsonPath, JSON.stringify(salesList, null, 2));

// 2. Write Sales CSV
const salesCsvPath = path.join(__dirname, 'indian_sales_dataset.csv');
const salesCsvHeaders = 'saleId,productId,productName,category,customerId,customerName,quantity,price,discount,tax,totalAmount,paymentMethod,date,salesperson,branch\n';
const salesCsvRows = salesList.map(s => 
  `"${s.saleId}","${s.productId}","${s.productName.replace(/"/g, '""')}","${s.category}","${s.customerId}","${s.customerName.replace(/"/g, '""')}",${s.quantity},${s.price},${s.discount},${s.tax},${s.totalAmount},"${s.paymentMethod}","${s.date}","${s.salesperson}","${s.branch}"`
).join('\n');
fs.writeFileSync(salesCsvPath, salesCsvHeaders + salesCsvRows);

// 3. Write Products CSV
const productsCsvPath = path.join(__dirname, 'indian_products.csv');
const productsCsvHeaders = 'productId,productName,category,description,price,costPrice,stock,minimumStock,supplier,status\n';
const productsCsvRows = products.map(p =>
  `"${p.productId}","${p.productName.replace(/"/g, '""')}","${p.category}","${p.description.replace(/"/g, '""')}",${p.price},${p.costPrice},${p.stock},${p.minimumStock},"${p.supplier}","${p.status}"`
).join('\n');
fs.writeFileSync(productsCsvPath, productsCsvHeaders + productsCsvRows);

// 4. Write Customers CSV
const customersCsvPath = path.join(__dirname, 'indian_customers.csv');
const customersCsvHeaders = 'customerId,name,email,phone,branch,totalPurchases\n';
const customersCsvRows = customers.map(c =>
  `"${c.customerId}","${c.name.replace(/"/g, '""')}","${c.email}","${c.phone}","${c.branch}",${c.totalPurchases}`
).join('\n');
fs.writeFileSync(customersCsvPath, customersCsvHeaders + customersCsvRows);

console.log(`[Dataset Generator] Success! Generated:`);
console.log(`- Products: ${products.length} records -> indian_products.json & .csv`);
console.log(`- Customers: ${customers.length} records -> indian_customers.json & .csv`);
console.log(`- Historical Sales: ${salesList.length} records -> indian_sales_dataset.json & .csv`);
