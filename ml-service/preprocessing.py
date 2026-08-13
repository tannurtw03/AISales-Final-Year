import pandas as pd
import numpy as np

def prepare_time_series_features(sales_data):
    """
    Converts list of sales JSON dicts into a daily aggregated Pandas DataFrame
    and extracts lag features, rolling features, and calendar features.
    """
    df = pd.DataFrame(sales_data)
    if df.empty:
        return None, None

    # Ensure date parsing
    df['date'] = pd.to_datetime(df['date'])
    
    # Aggregate to daily total revenue and quantity
    daily_df = df.groupby('date').agg({
        'totalAmount': 'sum',
        'quantity': 'sum'
    }).reset_index()

    # Fill missing dates in timeline with 0 revenue
    min_date = daily_df['date'].min()
    max_date = daily_df['date'].max()
    full_idx = pd.date_range(min_date, max_date, freq='D')
    
    daily_df = daily_df.set_index('date').reindex(full_idx).fillna(0).reset_index()
    daily_df.rename(columns={'index': 'date'}, inplace=True)

    # Extract time/calendar features
    daily_df['day_of_week'] = daily_df['date'].dt.dayofweek
    daily_df['day_of_month'] = daily_df['date'].dt.day
    daily_df['month'] = daily_df['date'].dt.month
    daily_df['is_weekend'] = daily_df['day_of_week'].isin([5, 6]).astype(int)

    # Extract Lag features
    daily_df['lag_1'] = daily_df['totalAmount'].shift(1)
    daily_df['lag_7'] = daily_df['totalAmount'].shift(7)
    daily_df['lag_14'] = daily_df['totalAmount'].shift(14)
    daily_df['lag_30'] = daily_df['totalAmount'].shift(30)

    # Extract Rolling Statistics
    daily_df['rolling_mean_7'] = daily_df['totalAmount'].shift(1).rolling(window=7).mean()
    daily_df['rolling_mean_14'] = daily_df['totalAmount'].shift(1).rolling(window=14).mean()
    daily_df['rolling_mean_30'] = daily_df['totalAmount'].shift(1).rolling(window=30).mean()
    daily_df['rolling_std_7'] = daily_df['totalAmount'].shift(1).rolling(window=7).std()

    # Drop NA rows caused by lag shift
    clean_df = daily_df.dropna().reset_index(drop=True)

    feature_cols = [
        'day_of_week', 'day_of_month', 'month', 'is_weekend',
        'lag_1', 'lag_7', 'lag_14', 'lag_30',
        'rolling_mean_7', 'rolling_mean_14', 'rolling_mean_30', 'rolling_std_7'
    ]

    return clean_df, feature_cols
