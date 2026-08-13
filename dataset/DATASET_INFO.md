# 🇮🇳 Open Source Indian Enterprise Sales & Analytics Dataset

## 📌 Dataset Overview
This dataset contains structured open-source data representing real-world commercial transactions, product catalogs, and corporate customer profiles for top **Indian Enterprises & Brands** (e.g., Tata Group, Reliance Industries, boAt, Havells, Godrej & Boyce, Wipro, Voltas, Prestige, Luminous, Microtek, TVS Electronics, etc.).

It is pre-configured for production demonstration and academic college projects for machine learning sales forecasting, inventory management, and business intelligence analytics.

---

## 📁 Dataset Folder Contents

| File Name | Format | Record Count | Description |
| :--- | :---: | :---: | :--- |
| `indian_products.json` | `JSON` | 15 Products | Product catalog with Indian Enterprise suppliers, pricing in INR (₹), categories, and stock thresholds. |
| `indian_products.csv` | `CSV` | 15 Products | Tabular CSV version of Indian product catalog. |
| `indian_customers.json` | `JSON` | 10 Enterprises | Major Indian corporate clients across major tech & industrial hubs (Mumbai, Bengaluru, Delhi NCR, Pune, Hyderabad, Chennai, Gurugram). |
| `indian_customers.csv` | `CSV` | 10 Enterprises | Tabular CSV version of enterprise customers. |
| `indian_sales_dataset.json` | `JSON` | 900+ Records | 365-day historical sales transaction ledger with daily seasonality, 18% GST (Indian Tax), discounts, payment methods, and sales reps. |
| `indian_sales_dataset.csv` | `CSV` | 900+ Records | Complete tabular CSV sales ledger ready for Python Pandas, scikit-learn, XGBoost, or Excel analytics. |

---

## 🔑 Product Catalog Highlights (INR Pricing)

1. **Tata Enterprise Cloud Server R750** – Enterprise IT (Supplier: Tata Communications Ltd)
2. **Reliance JioFi Enterprise 5G Mesh Router** – Networking (Supplier: Jio Platforms Ltd)
3. **boAt Commercial Wireless ANC Headset Pro** – Electronics (Supplier: Imagine Marketing Pvt Ltd)
4. **Havells Smart Pro High-Bay LED Bay 150W** – Smart Home & Electricals (Supplier: Havells India Ltd)
5. **Godrej Ergonomic Executive Mesh Chair Ultra** – Office Solutions (Supplier: Godrej & Boyce Mfg Co Ltd)
6. **Wipro Smart Commercial Switchboard 8-Gang** – Smart Electricals (Supplier: Wipro Consumer Care)
7. **Voltas Commercial Heavy Duty Inverter AC 2 Ton** – Consumer Durables (Supplier: Voltas Enterprise Ltd)
8. **Prestige Industrial Induction Cooktop 3000W** – Consumer Durables (Supplier: TTK Prestige Ltd)
9. **Zebronics 32" Curved 4K QHD Workstation Monitor** – Electronics (Supplier: Zebronics India Pvt Ltd)
10. **Luminous PowerX Heavy Commercial SineWave Inverter** – Electricals (Supplier: Luminous Power Tech)

---

## 🏢 Enterprise Customer Hubs

- **Reliance Retail Logistics Hub** (*Mumbai BKC HQ*)
- **Tata Consultancy Services (TCS Park)** (*Bengaluru Electronic City*)
- **Infosys Tech Campus Whitefield** (*Bengaluru Whitefield*)
- **Bharti Airtel Telecom HQ** (*Delhi NCR HQ*)
- **HDFC Bank Corporate Tech Center** (*Mumbai Lower Parel*)
- **Flipkart Fulfillment Center** (*Hyderabad Cyber City*)
- **Wipro Digital Hinjewadi Campus** (*Pune Hinjewadi*)
- **Mahindra & Mahindra Auto Division** (*Pune Chakan*)
- **Zomato & Blinkit Dark Store Network** (*Gurugram Hub*)
- **Titan Watch & Eyewear Retail Division** (*Chennai T. Nagar*)

---

## 💳 Payment Methods & GST Compliance

- **Payment Gateways / Methods:** `UPI (PhonePe/GPay/Paytm)`, `Net Banking (HDFC/ICICI/SBI)`, `Credit Card`, `Debit Card`, `Cash`
- **Taxation Standard:** 18% GST (Goods and Services Tax, India) applied to all B2B and retail transactions.
- **Sales Executive Team:** Rahul Sharma, Priya Patel, Amit Verma, Ananya Iyer, Vikram Singh.

---

## 🚀 How to Seed into MongoDB & ML Service

To seed this dataset directly into your SmartSalesAI application database:

```bash
cd server
npm run seed
```

Or start the Node.js server (it will automatically seed the in-memory or connected MongoDB instance):

```bash
cd server
npm start
```
