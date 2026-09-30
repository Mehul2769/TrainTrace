import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_absolute_error,
    r2_score,
    mean_squared_error
)

from xgboost import XGBRegressor

df = pd.read_csv(
    "railway_ml_data.csv"
)

print("\nDataset Loaded")
print(df.shape)

df = df.sort_values(
    by=[
        "train_number",
        "date",
        "sequence"
    ]
)

df["next_delay"] = (

    df.groupby(
        ["train_number", "date"]
    )["delay_arrival_minutes"]

    .shift(-1)

)

df["target_delay_delta"] = (

    df["next_delay"]

    -

    df["delay_arrival_minutes"]

)

df = df.dropna(
    subset=[
        "target_delay_delta"
    ]
)

df = df.fillna(0)

df = df.drop_duplicates()

FEATURES = [

    "sequence",

    "is_origin",

    "is_destination",

    "scheduled_hour",

    "scheduled_departure_hour",

    "actual_hour",

    "day_of_week",

    "dwell_time_scheduled_mins",

    "inter_station_scheduled_mins",

    "platform_num",

    "prev_delay_arrival",

    "prev_delay_departure",

    "delay_trend",

    "journey_max_delay_so_far",

    "journey_avg_delay_so_far"

]

TARGET = "target_delay_delta"

X = df[FEATURES]

y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,

    test_size=0.2,

    random_state=42

)

model = XGBRegressor(

    n_estimators=300,

    learning_rate=0.05,

    max_depth=6,

    subsample=0.8,

    colsample_bytree=0.8,

    objective="reg:squarederror",

    random_state=42

)

print("\nTraining Optimized XGBoost...\n")

model.fit(
    X_train,
    y_train
)

predictions = model.predict(
    X_test
)

mae = mean_absolute_error(
    y_test,
    predictions
)

rmse = mean_squared_error(
    y_test,
    predictions
) ** 0.5

r2 = r2_score(
    y_test,
    predictions
)

print("OPTIMIZED MODEL RESULTS")

print(f"\nMAE: {mae:.2f}")

print(f"\nRMSE: {rmse:.2f}")

print(f"\nR² Score: {r2:.4f}")

importance = pd.DataFrame({

    "Feature": FEATURES,

    "Importance":
        model.feature_importances_

})

importance = importance.sort_values(

    by="Importance",

    ascending=False

)

print("FEATURE IMPORTANCE")

print(importance)

joblib.dump(

    model,

    "delay_delta_xgb_model.pkl"

)

print("\nOptimized Model Saved")
print("delay_delta_xgb_model.pkl")