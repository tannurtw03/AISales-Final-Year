
# SmartSales AI – Real-Time Sales Prediction & Business Analytics

SmartSales AI is an enterprise-grade AI-powered business analytics and sales forecasting platform. Built with React (Vite), Tailwind CSS, Node.js (Express), Socket.IO real-time data streaming, Python Machine Learning service (scikit-learn / XGBoost), and MongoDB Atlas.

---

## 🔑 Demo Account Credentials (ID & Passwords)

You can sign in to the application using any of the pre-configured demo user accounts below:

| Role | Username | Email / ID | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin@smartsales.ai` | `password123` | Full System Access + User Management |
| **Manager** | `manager` | `manager@smartsales.ai` | `password123` | Sales Analytics, Reports, Targets, AI Forecasts |
| **Sales User** | `salesuser` | `sales@smartsales.ai` | `password123` | Standard Sales & Product Entry |

> **Note:** Password for all pre-seeded demo accounts is: `password123`

---

## 🚀 Key Features

- **🤖 AI & ML Sales Forecasting:** Time-series regression models (RandomForest, XGBoost, Linear Regression) trained on 800+ historical sales records.
- **⚡ Real-Time Socket.IO Updates:** Live data synchronization across sales, inventory, and target progress.
- **📊 Business Analytics Dashboard:** Interactive Recharts graphs for sales trends, top-selling products, and category distributions.
- **📦 Inventory & Product Management:** Low stock alerts, stock replenishment, and category tracking.
- **🎯 Sales Targets Tracker:** Monthly revenue goal progress bars with automated achievement status.
- **👤 User Profile & Settings:** Profile updates, password modification, and role-based permissions.
- **📄 Reports Export:** PDF and CSV exports for sales summaries.

---

## 🛠️ Project Structure

```text
SmartSalesAI/
├── dataset/         # 🇮🇳 Open Source Indian Enterprise Sales & Product Dataset (JSON & CSV)
├── client/          # React + Vite Frontend (Tailwind CSS, Lucide Icons, Recharts)
├── server/          # Node.js + Express API Backend (MongoDB Mongoose, JWT Auth, Socket.IO)
└── ml-service/      # Python Machine Learning Microservice (FastAPI/Flask, scikit-learn)
```

---

## 🇮🇳 Open-Source Indian Enterprise Dataset

The project is pre-loaded with an open-source **Indian Enterprise Dataset** (`dataset/`) containing:
- **15 Indian Corporate Products** (Tata Cloud Servers, JioFi 5G Routers, boAt Headsets, Havells Lighting, Godrej Executive Chairs, Voltas ACs, Prestige Induction, Luminous Inverters, etc.) with Indian Rupee (₹) pricing.
- **10 Major Indian Enterprise Clients & Hubs** (Reliance Retail, TCS, Infosys, Bharti Airtel, HDFC Bank, Flipkart, Wipro, Mahindra & Mahindra, Zomato, Titan).
- **950+ Historical Sales Ledger Records** (365 days timeline, 18% GST tax, UPI/Net Banking/Cards payment options, Indian regional sales reps).
- **Available Formats:** Both `JSON` and `CSV` files in `dataset/` for python data science and web backend integration.

### Re-seeding Database manually:
```bash
cd server
npm run seed
```

---

## 💻 How to Run the Project Locally

### 1. Start Node.js Backend Server
```bash
cd server
npm install
npm start
```
*Backend runs at `http://localhost:5000` (auto-seeds 800+ demo sales records on first run).* 

### 2. Start React Frontend Client
```bash
cd client
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

### 3. Start Python ML Microservice (Optional for ML Retraining)
```bash
cd ml-service
pip install -r requirements.txt
python main.py
```
*ML Service runs at `http://localhost:8000`.*

---

## 🔒 License & Credits

Developed with modern web & machine learning stack by Google DeepMind team pair programming guidelines.
