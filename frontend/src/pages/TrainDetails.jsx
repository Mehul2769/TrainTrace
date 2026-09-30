import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import Header from "../components/Header";
import LiveStationTimeline from "../components/LiveStationTimeline";
import DelayTrendChart from "../components/DelayTrendChart";

export default function TrainDetails() {

  const location = useLocation();

  const {
    train,
    from,
    to,
    journeyDate,
    searchMode
  } = location.state || {};

  const [
    stationPredictions,
    setStationPredictions
  ] = useState([]);

  const [
    confidence,
    setConfidence
  ] = useState(0);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const trainNumber =
    train?.trainNumber ||
    train?.train_number ||
    train?.number ||
    train?.train_no ||
    train?.train?.trainNumber ||
    train?.train?.train_number ||
    train?.train?.number ||
    train?.train?.train_no ||
    "";

  const trainName =
    train?.trainName ||
    train?.train_name ||
    train?.name ||
    train?.train?.trainName ||
    train?.train?.train_name ||
    train?.train?.name ||
    "Train";

  useEffect(() => {

    const fetchPrediction = async () => {

      if (!trainNumber) {

        setLoading(false);

        setError(
          "Train number could not be determined."
        );

        console.error(
          "Invalid train object:",
          train
        );

        return;
      }

      try {

        setLoading(true);
        setError("");

        console.log(
          "Requesting prediction for:",
          trainNumber
        );

        const response = await axios.post(
          "http://localhost:5000/predict-future-stations",
          {
            trainNumber: String(trainNumber),

            journeyDate,

            from,

            to,

            searchMode:
              searchMode || "stations"
          }
        );

        console.log(
          "Prediction response:",
          response.data
        );

        let predictions = [];

        if (
          Array.isArray(
            response.data?.predictions
          )
        ) {
          predictions =
            response.data.predictions;
        }

        else if (
          Array.isArray(
            response.data?.data?.predictions
          )
        ) {
          predictions =
            response.data.data.predictions;
        }

        const predictionConfidence =
          response.data?.confidence ??
          response.data?.data?.confidence ??
          0;

        setStationPredictions(
          predictions
        );

        setConfidence(
          Number(predictionConfidence) || 0
        );

        if (
          response.data?.success === false
        ) {
          setError(
            response.data?.error ||
            "Prediction failed."
          );
        }

      } catch (err) {

        console.error(
          "Prediction request failed:",
          err.response?.data ||
          err.message
        );

        setStationPredictions([]);
        setConfidence(0);

        setError(
          err.response?.data?.error ||
          "Unable to fetch AI prediction."
        );

      } finally {

        setLoading(false);

      }
    };

    fetchPrediction();

  }, [
    trainNumber,
    journeyDate,
    from,
    to,
    searchMode
  ]);

  return (

    <div className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-7xl mx-auto space-y-6">

        <Header />

        <div className="bg-white rounded-3xl border shadow-sm p-6">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">

            <div>

              <p className="text-slate-500 text-sm">
                Train Number
              </p>

              <h1 className="text-4xl font-bold text-slate-800">
                {trainNumber || "—"}
              </h1>

              <h2 className="text-lg text-slate-600 mt-1">
                {trainName}
              </h2>

            </div>

            <div>

              <p className="text-slate-500 text-sm">
                Route
              </p>

              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                {from || "—"} → {to || "—"}
              </h2>

            </div>

            <div>

              <p className="text-slate-500 text-sm">
                Journey Date
              </p>

              <h2 className="text-4xl font-bold text-orange-500 mt-2">
                {journeyDate || "—"}
              </h2>

            </div>

            <div>

              <p className="text-slate-500 text-sm">
                AI Prediction Confidence
              </p>

              <h2 className="text-4xl font-bold text-green-500 mt-2">
                {confidence}%
              </h2>

            </div>

          </div>

        </div>

        {loading && (

          <div className="bg-white rounded-3xl border shadow-sm p-10 text-center">

            <div className="text-2xl font-bold text-slate-700">
              Generating AI ETA prediction...
            </div>

            <p className="text-slate-500 mt-2">
              Fetching live railway data and
              forecasting future station delays.
            </p>

          </div>

        )}

        {!loading && error && (

          <div className="bg-red-50 border border-red-200 rounded-3xl p-6">

            <h2 className="text-xl font-bold text-red-700">
              Prediction Error
            </h2>

            <p className="text-red-600 mt-2">
              {error}
            </p>

          </div>

        )}

        {!loading &&
          !error &&
          stationPredictions.length > 0 && (

            <LiveStationTimeline
              stations={stationPredictions}
            />

          )}

        {!loading &&
          !error &&
          stationPredictions.length > 0 && (

            <DelayTrendChart
              stations={stationPredictions}
            />

          )}

        {!loading &&
          !error &&
          stationPredictions.length === 0 && (

            <div className="bg-white rounded-3xl border shadow-sm p-10 text-center">

              <h2 className="text-2xl font-bold text-slate-700">
                No prediction data available
              </h2>

              <p className="text-slate-500 mt-2">
                The live route did not return
                station prediction data.
              </p>

            </div>

          )}

      </div>

    </div>
  );
}