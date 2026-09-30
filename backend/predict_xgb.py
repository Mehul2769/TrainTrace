import sys
import json
import joblib
import numpy as np
import os


MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "models",
    "best_model_v1.pkl"
)
model_data = joblib.load(MODEL_PATH)

if isinstance(model_data, dict):
    model = model_data["model"]
    FEATURES = model_data["features"]
else:
    model = model_data

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

if len(sys.argv) < 2:
    print(json.dumps({
        "error": "Input JSON file required"
    }))
    sys.exit(1)


input_file = sys.argv[1]

with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)


stations = data.get("stations", [])
day_of_week = data.get("day_of_week", 0)


if not stations:
    print(json.dumps({
        "error": "No station data provided"
    }))
    sys.exit(1)

predictions = []

current_delay = 0.0
previous_delay = 0.0

delay_history = []


for i, station in enumerate(stations):

    station_no = station.get(
        "station_no",
        station.get("sequence", i + 1)
    )

    actual_delay = station.get("actual_delay")

    if actual_delay is not None:

        try:
            current_delay = float(actual_delay)
        except(TypeError, ValueError):
            current_delay = previous_delay

        delay_history.append(current_delay)

        result = {
            **station,
            "type": "real",
            "delay": current_delay,
            "predicted_delay": current_delay,
            "predicted_time": station.get("scheduled_time")
        }

        predictions.append(result)

        previous_delay = current_delay

        continue

    if len(delay_history) > 0:

        journey_max_delay = max(delay_history)
        journey_avg_delay = sum(delay_history) / len(delay_history)

    else:

        journey_max_delay = current_delay
        journey_avg_delay = current_delay


    delay_trend = current_delay - previous_delay
    is_origin = 1 if station_no == 1 else 0

    max_station_no = max(
        s.get("station_no", s.get("sequence", 0))
        for s in stations
    )

    is_destination = (
        1 if station_no == max_station_no else 0
    )

    features = {
        "station_no": station_no,
        "is_origin": is_origin,
        "is_destination": is_destination,
        "day_of_week": day_of_week,
        "prev_delay_arrival": previous_delay,
        "delay_trend": delay_trend,
        "journey_max_delay_so_far": journey_max_delay,
        "journey_avg_delay_so_far": journey_avg_delay
    }


    X = np.array([
        [features[f] for f in FEATURES]
    ])

    predicted_delta = float(
        model.predict(X)[0]
    )


    predicted_delay = (
        current_delay +
        predicted_delta
    )

    predicted_delay = max(
        -30.0,
        predicted_delay
    )

    predicted_time = None

    scheduled_time = station.get("scheduled_time")

    if scheduled_time:

        try:

            from datetime import datetime, timedelta

            dt = datetime.fromisoformat(
                scheduled_time.replace("Z", "+00:00")
            )

            predicted_dt = dt + timedelta(
                minutes=predicted_delay
            )

            predicted_time = predicted_dt.isoformat()

        except Exception:

            predicted_time = None


    result = {
        **station,

        "type": "predicted",

        "delay": current_delay,

        "predicted_delay": round(
            predicted_delay,
            2
        ),

        "delta": round(
            predicted_delta,
            2
        ),

        "predicted_time": predicted_time
    }


    predictions.append(result)

    previous_delay = predicted_delay
    current_delay = predicted_delay

    delay_history.append(predicted_delay)

deltas = [
    abs(
        p.get("delta", 0)
    )
    for p in predictions
    if p.get("type") == "predicted"
]


if deltas:

    avg_delta = sum(deltas) / len(deltas)

    confidence = max(
        50,
        min(
            95,
            100 - avg_delta
        )
    )

else:

    confidence = 95

destination_eta = None

for p in reversed(predictions):

    if p.get("type") == "predicted":

        destination_eta = p.get(
            "predicted_time"
        )

        break

output = {
    "success": True,

    "model": "RailTrack AI XGBoost Delay Delta V2",

    "confidence": round(
        confidence,
        2
    ),

    "destination_eta": destination_eta,

    "predictions": predictions
}


print(
    json.dumps(
        output,
        default=str
    )
)