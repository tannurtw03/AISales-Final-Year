import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd

from preprocessing import prepare_time_series_features
from models import train_and_forecast
from insights import generate_ai_business_insights

app = FastAPI(
    title="SmartSalesAI ML Engine",
    description="Microservice providing Time-Series Sales Forecasting and Machine Learning Business Analytics",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SaleRecord(BaseModel):
    saleId: Optional[str] = None
    date: str
    totalAmount: float
    quantity: int
    category: Optional[str] = None
    productId: Optional[str] = None
    price: Optional[float] = None

class TrainRequest(BaseModel):
    sales: List[SaleRecord]
    period: Optional[str] = '30d'
    modelType: Optional[str] = 'RandomForest'

@app.get("/")
def read_root():
    return {"status": "ok", "service": "SmartSalesAI ML Service", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/ml/train")
def train_model_endpoint(req: TrainRequest):
    if not req.sales or len(req.sales) == 0:
        raise HTTPException(status_code=400, detail="Sales dataset cannot be empty")

    sales_dicts = [s.model_dump() for s in req.sales]
    clean_df, feature_cols = prepare_time_series_features(sales_dicts)

    if clean_df is None or len(clean_df) < 5:
        raise HTTPException(
            status_code=400,
            detail="Insufficient clean historical sales points to train ML models. At least 5-7 days of daily records required."
        )

    # Determine forecast days from period horizon
    horizon_days = 30
    if req.period == '7d': horizon_days = 7
    elif req.period == '30d': horizon_days = 30
    elif req.period == '3m': horizon_days = 90
    elif req.period == '6m': horizon_days = 180

    # Execute Model Training and Forecasting
    result = train_and_forecast(clean_df, feature_cols, forecast_days=horizon_days, preferred_model=req.modelType)

    # Generate AI Insights
    forecast_df = pd.DataFrame(result['forecast'])
    insights = generate_ai_business_insights(
        clean_df, forecast_df, result['metrics'], result['best_model_name']
    )

    return {
        "success": True,
        "modelUsed": result['best_model_name'],
        "metrics": result['metrics'],
        "forecastData": result['forecast'],
        "historicalData": result['historical'],
        "insights": insights
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
