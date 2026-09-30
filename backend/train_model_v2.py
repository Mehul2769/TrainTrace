import os
import polars as pl
import numpy as np
import joblib

from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATA_PATH = r"C:\Users\write\OneDrive\Desktop\SIH_Project\Railway-Delay-Prediction-System-main\Railway_dataset\combined_delay.csv"

MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "best_model_v1.pkl")

MAX_TRAIN_ROWS = 2_000_000

os.makedirs(MODEL_DIR, exist_ok=True)

print("=" * 60)
print("RAILTRACK AI - DELAY DELTA MODEL V2")
print("=" * 60)

print("\n[1/7] Reading dataset...")

df = pl.read_csv(
    DATA_PATH,
    schema_overrides={
        "train_no": pl.Int64,
        "station_no": pl.Int64,
        "delay": pl.Float64
    },
    try_parse_dates=True
)

print(f"Rows loaded: {df.height:,}")

print("\n[2/7] Cleaning data...")

df = (
    df
    .filter(pl.col("delay").is_not_null())
    .with_columns([
        pl.col("date").cast(pl.Date),
        pl.col("train_no").cast(pl.Int64),
        pl.col("station_no").cast(pl.Int64),
        pl.col("delay").cast(pl.Float64)
    ])
)

print(f"Rows after removing missing delays: {df.height:,}")

print("\n[3/7] Sorting train journeys...")

df = df.sort(
    ["train_no", "date", "station_no"]
)

print("\n[4/7] Creating sequential features...")

group = ["train_no", "date"]

df = df.with_columns([

    pl.col("delay")
    .shift(1)
    .over(group)
    .alias("prev_delay_arrival"),

    pl.col("delay")
    .shift(-1)
    .over(group)
    .alias("next_delay"),

    pl.col("date")
    .dt.weekday()
    .alias("day_of_week"),

    (pl.col("station_no") == 1)
    .cast(pl.Int8)
    .alias("is_origin"),

    (
        pl.col("station_no")
        ==
        pl.col("station_no").max().over(group)
    )
    .cast(pl.Int8)
    .alias("is_destination"),

    pl.col("delay")
    .cum_max()
    .over(group)
    .alias("journey_max_delay_so_far"),

    (
        pl.col("delay")
        .cum_sum()
        .over(group)
        /
        pl.col("delay")
        .cum_count()
        .over(group)
    ).alias("journey_avg_delay_so_far")
])

df = df.with_columns(
    (
        pl.col("delay") -
        pl.col("prev_delay_arrival")
    ).alias("delay_trend")
)

print("\n[5/7] Creating prediction target...")

df = df.with_columns(
    (
        pl.col("next_delay") -
        pl.col("delay")
    ).alias("target_delay_delta")
)

df = df.filter(
    pl.col("prev_delay_arrival").is_not_null()
    &
    pl.col("next_delay").is_not_null()
    &
    pl.col("target_delay_delta").is_not_null()
)

FEATURES = [
    "station_no",
    "is_origin",
    "is_destination",
    "day_of_week",
    "prev_delay_arrival",
    "delay_trend",
    "journey_max_delay_so_far",
    "journey_avg_delay_so_far"
]

TARGET = "target_delay_delta"


print("\nFeatures used:")

for feature in FEATURES:
    print("  -", feature)

print("\n[6/7] Preparing training data...")

df = df.select(FEATURES + [TARGET])

if df.height > MAX_TRAIN_ROWS:
    print(
        f"Sampling {MAX_TRAIN_ROWS:,} rows "
        f"from {df.height:,} available rows..."
    )

    df = df.sample(
        n=MAX_TRAIN_ROWS,
        seed=42
    )

data = df.to_pandas()

X = data[FEATURES]
y = data[TARGET]

print(f"Training rows: {len(data):,}")

print("\n[7/7] Training XGBoost...")

model = XGBRegressor(
    n_estimators=400,
    learning_rate=0.05,
    max_depth=7,
    min_child_weight=5,
    subsample=0.8,
    colsample_bytree=0.9,
    objective="reg:squarederror",
    tree_method="hist",
    n_jobs=-1,
    random_state=42
)

model.fit(X, y)

print("\nEvaluating model...")

predictions = model.predict(X)

mae = mean_absolute_error(y, predictions)
rmse = np.sqrt(mean_squared_error(y, predictions))
r2 = r2_score(y, predictions)

print("MODEL RESULTS")

print(f"MAE  : {mae:.4f} minutes")
print(f"RMSE : {rmse:.4f} minutes")
print(f"R²   : {r2:.4f}")

print("\nSaving model...")

joblib.dump(
    {
        "model": model,
        "features": FEATURES,
        "version": "v2",
        "target": TARGET
    },
    MODEL_PATH
)

print(f"\nModel saved to:")
print(os.path.abspath(MODEL_PATH))

print("\nDONE.")