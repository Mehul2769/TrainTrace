import pandas as pd
import joblib

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

df = pd.read_csv(
    "railway_ml_data.csv"
)

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

model = joblib.load(
    "models/best_model_v1.pkl"
)

predictions = model.predict(X)

mae = mean_absolute_error(
    y,
    predictions
)

rmse = mean_squared_error(
    y,
    predictions
) ** 0.5

r2 = r2_score(
    y,
    predictions
)

print("MODEL VALIDATION")


print(f"\nMAE: {mae:.2f}")

print(f"\nRMSE: {rmse:.2f}")

print(f"\nR² Score: {r2:.4f}")

print("MODEL QUALITY")


if r2 >= 0.80:

    print("\nExcellent Model")

elif r2 >= 0.65:

    print("\nGood Model")

elif r2 >= 0.50:

    print("\nAverage Model")

else:

    print("\nWeak Model")