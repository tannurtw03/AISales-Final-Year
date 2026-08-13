import numpy as np

def generate_ai_business_insights(historical_df, forecast_df, metrics, model_name):
    """
    Generates actionable business insights from ML forecast results.
    """
    insights = []

    if historical_df.empty or forecast_df.empty:
        return ["Insufficient data to generate full AI insights."]

    recent_avg_daily = historical_df['totalAmount'].tail(30).mean()
    forecast_avg_daily = forecast_df['predictedAmount'].mean()

    diff_pct = 0
    if recent_avg_daily > 0:
        diff_pct = ((forecast_avg_daily - recent_avg_daily) / recent_avg_daily) * 100

    forecast_30d_total = forecast_df['predictedAmount'].head(30).sum()

    # 1. Overall Forecast Trend Insight
    if diff_pct > 5:
        insights.append(
            f"Positive Sales Momentum: AI predicts daily revenue will increase by approximately {diff_pct:.1f}% over the next 30 days."
        )
    elif diff_pct < -5:
        insights.append(
            f"Sales Decline Notice: AI predicts a {abs(diff_pct):.1f}% decrease in average daily revenue. Consider launching promotional campaigns or flash sales."
        )
    else:
        insights.append(
            f"Steady Sales Trajectory: Projected revenue remains stable with smooth demand continuity across the target period."
        )

    # 2. Revenue Projection Insight
    insights.append(
        f"Revenue Target Projection: Expected 30-day cumulative revenue is estimated at ₹{forecast_30d_total:,.2f}."
    )

    # 3. Model Accuracy Insight
    insights.append(
        f"Model Performance: Model ({model_name}) achieved R² score of {metrics['r2']:.2f} with a Mean Absolute Error (MAE) of ₹{metrics['mae']:,.0f}."
    )

    # 4. Inventory & Operational Recommendation
    if diff_pct > 10:
        insights.append(
            "Inventory Replenishment Alert: Anticipating elevated product demand. We recommend increasing minimum stock levels by 15-20% for top-selling categories to prevent stockouts."
        )
    elif diff_pct < -10:
        insights.append(
            "Margin Optimization: Demand is expected to soften. Maintain lean stock levels to minimize holding costs and optimize cash flow."
        )

    return insights
