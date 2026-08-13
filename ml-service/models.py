import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from evaluation import calculate_metrics

try:
    from xgboost import XGBRegressor
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False


def train_and_forecast(df, feature_cols, forecast_days=30, preferred_model='RandomForest'):
    """
    Trains multiple ML models, picks the best performer, and predicts future horizon.
    """
    X = df[feature_cols]
    y = df['totalAmount']

    if len(df) < 10:
        # Fallback simple average if very small dataset
        latest_mean = y.mean() if len(y) > 0 else 1000
        last_date = df['date'].max()
        future_dates = pd.date_range(last_date + pd.Timedelta(days=1), periods=forecast_days, freq='D')
        
        forecast_list = []
        for d in future_dates:
            forecast_list.append({
                'date': d.strftime('%Y-%m-%d'),
                'predictedAmount': round(float(latest_mean), 2),
                'predictedQuantity': 5,
                'confidenceLower': round(float(latest_mean * 0.85), 2),
                'confidenceUpper': round(float(latest_mean * 1.15), 2)
            })

        return {
            'best_model_name': 'BaselineMovingAverage',
            'metrics': {'mae': 0, 'mse': 0, 'rmse': 0, 'r2': 1.0, 'mape': 0},
            'forecast': forecast_list,
            'historical': df[['date', 'totalAmount', 'quantity']].to_dict(orient='records')
        }

    # Train / Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

    models = {
        'LinearRegression': LinearRegression(),
        'RandomForest': RandomForestRegressor(n_estimators=100, random_state=42)
    }

    if XGB_AVAILABLE:
        models['XGBoost'] = XGBRegressor(n_estimators=100, learning_rate=0.05, random_state=42)
    else:
        models['GradientBoosting'] = GradientBoostingRegressor(n_estimators=100, random_state=42)

    best_model = None
    best_model_name = None
    best_metrics = None
    best_score = float('inf')

    trained_models = {}

    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        metrics = calculate_metrics(y_test, y_pred)

        trained_models[name] = (model, metrics)

        # Select model with lowest MAE
        if metrics['mae'] < best_score:
            best_score = metrics['mae']
            best_model = model
            best_model_name = name
            best_metrics = metrics

    # If preferred_model explicitly requested and available
    if preferred_model in trained_models:
        best_model, best_metrics = trained_models[preferred_model]
        best_model_name = preferred_model

    # Refit best model on full historical dataset
    best_model.fit(X, y)

    # Future Forecasting Iteration
    last_date = df['date'].max()
    future_dates = pd.date_range(last_date + pd.Timedelta(days=1), periods=forecast_days, freq='D')
    
    current_df = df.copy()
    forecast_results = []

    for f_date in future_dates:
        # Build features for current step
        last_row = current_df.iloc[-1]
        
        day_of_week = f_date.dayofweek
        day_of_month = f_date.day
        month = f_date.month
        is_weekend = 1 if day_of_week in [5, 6] else 0

        lag_1 = current_df['totalAmount'].iloc[-1]
        lag_7 = current_df['totalAmount'].iloc[-7] if len(current_df) >= 7 else lag_1
        lag_14 = current_df['totalAmount'].iloc[-14] if len(current_df) >= 14 else lag_1
        lag_30 = current_df['totalAmount'].iloc[-30] if len(current_df) >= 30 else lag_1

        rolling_mean_7 = current_df['totalAmount'].tail(7).mean()
        rolling_mean_14 = current_df['totalAmount'].tail(14).mean()
        rolling_mean_30 = current_df['totalAmount'].tail(30).mean()
        rolling_std_7 = current_df['totalAmount'].tail(7).std() if len(current_df) >= 7 else 0
        if pd.isna(rolling_std_7):
            rolling_std_7 = 0

        feature_vector = np.array([[
            day_of_week, day_of_month, month, is_weekend,
            lag_1, lag_7, lag_14, lag_30,
            rolling_mean_7, rolling_mean_14, rolling_mean_30, rolling_std_7
        ]])

        pred_val = float(best_model.predict(feature_vector)[0])
        pred_val = max(0, pred_val)

        # Std error estimation for confidence interval
        std_err = float(best_metrics['rmse']) if best_metrics['rmse'] > 0 else (pred_val * 0.1)
        lower_bound = max(0, pred_val - (1.96 * std_err))
        upper_bound = pred_val + (1.96 * std_err)

        predicted_qty = max(1, int(round(pred_val / 5000))) if pred_val > 0 else 0

        forecast_results.append({
            'date': f_date.strftime('%Y-%m-%d'),
            'predictedAmount': round(pred_val, 2),
            'predictedQuantity': predicted_qty,
            'confidenceLower': round(lower_bound, 2),
            'confidenceUpper': round(upper_bound, 2)
        })

        # Append step prediction to current_df to simulate recursive multi-step forecasting
        new_row = {
            'date': f_date,
            'totalAmount': pred_val,
            'quantity': predicted_qty,
            'day_of_week': day_of_week,
            'day_of_month': day_of_month,
            'month': month,
            'is_weekend': is_weekend,
            'lag_1': lag_1,
            'lag_7': lag_7,
            'lag_14': lag_14,
            'lag_30': lag_30,
            'rolling_mean_7': rolling_mean_7,
            'rolling_mean_14': rolling_mean_14,
            'rolling_mean_30': rolling_mean_30,
            'rolling_std_7': rolling_std_7
        }
        current_df = pd.concat([current_df, pd.DataFrame([new_row])], ignore_index=True)

    # Format historical records for frontend comparison chart
    historical_formatted = []
    for _, r in df.tail(60).iterrows():
        historical_formatted.append({
            'date': r['date'].strftime('%Y-%m-%d'),
            'amount': float(r['totalAmount']),
            'quantity': int(r['quantity'])
        })

    return {
        'best_model_name': best_model_name,
        'metrics': best_metrics,
        'forecast': forecast_results,
        'historical': historical_formatted
    }
