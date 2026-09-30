TrainTrace 🚆

Live Tracking • AI ETA Prediction

TrainTrace is an AI-powered railway monitoring and ETA forecasting
system designed to provide live train information, station-level delay
prediction, and dynamic future ETA estimation.

The system combines live railway data from the RailRadar API with an
XGBoost delay-delta model to estimate how a train’s delay may evolve
across upcoming stations.

🚀 Key Features

Live Train Search — Search trains between two railway stations
using live railway data.

Station Autocomplete — Search by station code or station name.

Live Train Tracking — View train number, name, route, and journey
date.

AI Delay Prediction — XGBoost regression predicts future delay
changes.

Dynamic ETA Forecasting — Converts predicted delay into expected
station arrival times.

Interactive Station Timeline — Horizontally scroll through
stations without scrolling the whole page.

Station Search — Search for a station and jump directly to its
prediction.

Delay Trend Analysis — Compare available live/actual delay
information with AI predictions.

Prediction Confidence — Displays the current prototype confidence
indicator.

🧠 How It Works

User Search
    ↓
React / Vite Frontend
    ↓
Node.js + Express Backend
    ↓
RailRadar Live API
    ↓
Live Route + Station Data
    ↓
Python XGBoost Prediction Engine
    ↓
Future Delay Delta
    ↓
Sequential ETA Forecast
    ↓
TrainTrace Dashboard

🏗️ System Architecture

┌─────────────────────────────┐
│       TrainTrace UI         │
│     React + Vite + Tailwind │
└──────────────┬──────────────┘
               │ REST
               ▼
┌─────────────────────────────┐
│    Node.js / Express API    │
└───────────┬─────────┬───────┘
            │         │
            ▼         ▼
    ┌────────────┐  ┌────────────────┐
    │ RailRadar  │  │ Python Engine  │
    │ Live API   │  │ XGBoost Model  │
    └─────┬──────┘  └───────┬────────┘
          │                  │
          └────────┬─────────┘
                   ▼
        ┌──────────────────────┐
        │ Station ETA Forecast │
        │ + Destination ETA    │
        └──────────────────────┘

🛠️ Technology Stack

Frontend

React

Vite

Tailwind CSS

React Router

Axios

Recharts

Lucide React

Backend

Node.js

Express.js

Axios

CORS

dotenv

AI / Machine Learning

Python

XGBoost

Pandas / Polars

NumPy

scikit-learn

Joblib

Data

RailRadar API for live railway information

Indian Railways delay dataset for model training

🤖 Machine Learning

TrainTrace uses an XGBoost regression model to predict the change in
delay between consecutive stations.

Target

target_delay_delta =
next_station_delay - current_station_delay

The predicted delay is propagated sequentially:

next_delay =
current_delay + predicted_delay_delta

Then:

predicted_ETA =
scheduled_time + predicted_delay

Current V2 Features

Feature

Description

station_no

Sequential station position

is_origin

Whether the station is the journey origin

is_destination

Whether the station is the destination

day_of_week

Day of the week

prev_delay_arrival

Previous delay

delay_trend

Recent delay movement

journey_max_delay_so_far

Maximum delay observed so far

journey_avg_delay_so_far

Average delay observed so far

📊 Dataset

The training dataset is not included in this repository because
combined_delay.csv is approximately 970 MB, which exceeds GitHub’s
normal 100 MB file limit.

Expected local structure:

Railway_dataset/
└── combined_delay.csv

The dataset used during development contains approximately:

38.4 million rows

7,000+ unique trains

121 station positions

Data covering February 2025 to February 2026

The CSV is intentionally excluded from Git using .gitignore.

📈 Model Training

Training script:

backend/train_model_v2.py

Pipeline:

Raw Dataset
    ↓
Remove Missing Delays
    ↓
Sort by Train / Date / Station
    ↓
Create Next-Station Delay
    ↓
Calculate Delay Delta
    ↓
Generate Journey Features
    ↓
Train XGBoost
    ↓
Save Model

Model artifact:

backend/models/best_model_v1.pkl

Development-time training metrics should not be treated as independent
validation performance. Final benchmarking should use a chronological
hold-out evaluation.

📁 Project Structure

TrainTrace/
│
├── backend/
│   ├── server.js
│   ├── predict_xgb.py
│   ├── predict.py
│   ├── predict_future_stations.py
│   ├── train_delay_delta_model.py
│   ├── train_model_v2.py
│   ├── validate_model.py
│   ├── package.json
│   └── models/
│       └── best_model_v1.pkl
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── TrainCard.jsx
│   │   │   ├── LiveStationTimeline.jsx
│   │   │   ├── DelayTrendChart.jsx
│   │   │   └── PredictionConfidence.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── TrainDetails.jsx
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── Railway_dataset/
│   └── combined_delay.csv
│
├── .gitignore
└── README.md

⚙️ Installation

1. Clone

git clone https://github.com/Mehul2769/TrainTrace.git
cd TrainTrace

2. Backend

cd backend
npm install

Install Python dependencies:

pip install pandas numpy scikit-learn xgboost joblib

If using the V2 training pipeline:

pip install polars pyarrow

3. API Key

Create:

backend/.env

Add:

RAILRADAR_API_KEY=YOUR_API_KEY

Never commit .env.

4. Start Backend

From backend:

node server.js

Backend:

http://localhost:5000

5. Frontend

Open another terminal:

cd frontend
npm install

Create frontend/.env if required:

VITE_API_URL=http://localhost:5000

Start:

npm run dev

Normally:

http://localhost:5173

🔌 API Endpoints

Search Stations

GET /search-stations?query=NDLS

Search Trains

POST /search-trains

Example:

{
  "from": "NDLS",
  "to": "CNB",
  "date": "2026-09-30"
}

Future Station Prediction

POST /predict-future-stations

Example:

{
  "trainNumber": "22436",
  "journeyDate": "2026-09-30",
  "from": "NDLS",
  "to": "CNB",
  "searchMode": "stations"
}

🖥️ User Flow

Open TrainTrace
      ↓
Enter FROM / TO
      ↓
Select Journey Date
      ↓
Search Trains
      ↓
Select Train
      ↓
Fetch Live Route
      ↓
Run AI Delay Forecast
      ↓
View Interactive Station Timeline
      ↓
Search / Select Station
      ↓
View Scheduled / Actual / Predicted Time
      ↓
View Destination ETA

📊 Dashboard

TrainTrace provides:

Train number and train name

Origin and destination

Journey date

AI prediction confidence

Station-by-station ETA

Scheduled time

Actual time when available

AI predicted time

Expected delay

Interactive station navigation

Delay trend visualization

Destination ETA

🔐 Security

Never commit:

.env
API keys
Large datasets
Private credentials
Temporary files

The large training CSV is excluded from Git.

⚠️ Current Limitations

Prediction quality depends on historical data quality and coverage.

The V2 training dataset does not contain every operational feature
that could affect train movement.

The current model uses derived journey-state features.

Prediction confidence is currently a prototype heuristic, not a
statistically calibrated probability.

Live information depends on the external RailRadar API.

Final model benchmarking should use chronological hold-out data.

Sequential prediction can accumulate errors across many future
stations.

🔮 Future Improvements

Chronological train-level validation

Better temporal forecasting models

Weather integration

Railway congestion features

Station dwell-time modeling

Train-specific historical patterns

Holiday and special-event effects

Track congestion indicators

Calibrated prediction intervals

Automatic real-time prediction refresh

ETA alerts

Mobile/PWA support

Model monitoring and drift detection

🏆 Project Goal

TrainTrace aims to go beyond simply reporting that a train is late.

The system combines:

Live Train State
      +
Historical Delay Patterns
      +
Journey State
      +
AI Delay Forecast
      ↓
Station-Level ETA
      ↓
Destination ETA

The goal is to provide a dynamic view of how a train’s delay may evolve
throughout its journey.

👨‍💻 Project

TrainTrace

Live Tracking • AI ETA Prediction

Developed as an AI/ML railway forecasting project for the Smart India
Hackathon.

📄 License

This project is intended for educational, research, and hackathon
development.

Review the licenses and terms of external APIs, datasets, libraries, and
data sources before redistribution or commercial deployment.