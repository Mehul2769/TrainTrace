import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import TrainCard from "../components/TrainCard";

export default function Home() {
  const navigate = useNavigate();

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [journeyDate, setJourneyDate] = useState(today);

  const [trains, setTrains] = useState([]);

  const [loading, setLoading] = useState(false);

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);

  const searchStations = async (value, type) => {
    const query = value.trim();

    if (!query) {
      if (type === "from") {
        setFromSuggestions([]);
      } else {
        setToSuggestions([]);
      }

      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/search-stations`,
        {
          params: {
            query: query,
          },
        }
      );

      let stations = [];

      if (Array.isArray(response.data)) {
        stations = response.data;
      } else if (
        response.data &&
        Array.isArray(response.data.data)
      ) {
        stations = response.data.data;
      } else if (
        response.data &&
        Array.isArray(response.data.stations)
      ) {
        stations = response.data.stations;
      }
      if (!Array.isArray(stations)) {
        stations = [];
      }

      if (type === "from") {
        setFromSuggestions(stations);
      } else {
        setToSuggestions(stations);
      }
    } catch (err) {
      console.error(
        "Station search error:",
        err.response?.data || err.message
      );

      if (type === "from") {
        setFromSuggestions([]);
      } else {
        setToSuggestions([]);
      }
    }
  };

  const searchTrains = async () => {

    if (!from.trim() || !to.trim()) {
      alert("Please select both FROM and TO stations.");
      return;
    }

    if (!journeyDate) {
      alert("Please select a journey date.");
      return;
    }

    try {
      setLoading(true);

      setTrains([]);

      setFromSuggestions([]);
      setToSuggestions([]);

      const response = await axios.post(
        `${API_URL}/search-trains`,
        {
          from: from.trim().toUpperCase(),
          to: to.trim().toUpperCase(),
          date: journeyDate,
        }
      );

      console.log("Train search response:", response.data);

      let trainData = [];

      if (
        response.data?.data?.trains &&
        Array.isArray(response.data.data.trains)
      ) {
        trainData = response.data.data.trains;
      }

      else if (
        response.data?.trains &&
        Array.isArray(response.data.trains)
      ) {
        trainData = response.data.trains;
      }

      else if (
        Array.isArray(response.data?.data)
      ) {
        trainData = response.data.data;
      }
      else if (
        Array.isArray(response.data)
      ) {
        trainData = response.data;
      }

      if (!Array.isArray(trainData)) {
        trainData = [];
      }

      setTrains(trainData);

      console.log(
        `Found ${trainData.length} trains`
      );
    } catch (err) {
      console.error(
        "Train search error:",
        err.response?.data || err.message
      );

      setTrains([]);

      alert(
        err.response?.data?.error ||
          "Failed to fetch trains. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const trackTrain = (train) => {
  const trainNumber =
    train?.trainNumber ||
    train?.train_number ||
    train?.number ||
    train?.train_no ||
    train?.train?.trainNumber ||
    train?.train?.train_number ||
    train?.train?.number ||
    train?.train?.train_no;

  if (!trainNumber) {
    console.error(
      "Unable to determine train number:",
      train
    );

    alert("Train number not found.");
    return;
  }

  console.log(
    "Tracking train:",
    trainNumber,
    train
  );

  navigate(
    `/train/${trainNumber}`,
    {
      state: {
        train,
        from,
        to,
        journeyDate,

        searchMode: "stations"
      }
    }
  );
};

  const selectFromStation = (station) => {
    if (!station) return;

    setFrom(station.code || "");

    setFromSuggestions([]);
  };

  const selectToStation = (station) => {
    if (!station) return;

    setTo(station.code || "");

    setToSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-7xl mx-auto space-y-6">

        <Header />

        <div className="bg-white rounded-3xl border shadow-sm p-6">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            <div className="relative">

              <input
                value={from}
                onChange={(e) => {
                  const value = e.target.value;

                  setFrom(value);

                  searchStations(
                    value,
                    "from"
                  );
                }}
                placeholder="FROM"
                className="border rounded-2xl p-4 outline-none w-full"
                autoComplete="off"
              />

              {Array.isArray(fromSuggestions) &&
                fromSuggestions.length > 0 && (

                  <div className="absolute z-50 bg-white border rounded-2xl shadow-lg mt-2 w-full max-h-60 overflow-y-auto">

                    {fromSuggestions.map(
                      (station, index) => (

                        <div
                          key={
                            station?.code ||
                            index
                          }
                          onClick={() =>
                            selectFromStation(
                              station
                            )
                          }
                          className="p-3 hover:bg-slate-100 cursor-pointer border-b last:border-b-0"
                        >

                          <div className="font-semibold">

                            {station?.code ||
                              "Unknown"}

                          </div>

                          <div className="text-sm text-slate-500">

                            {station?.name ||
                              "Unknown station"}

                          </div>

                          {station?.city && (

                            <div className="text-xs text-slate-400">

                              {station.city}

                            </div>

                          )}

                        </div>
                      )
                    )}

                  </div>
                )}

            </div>

            <div className="relative">

              <input
                value={to}
                onChange={(e) => {
                  const value = e.target.value;

                  setTo(value);

                  searchStations(
                    value,
                    "to"
                  );
                }}
                placeholder="TO"
                className="border rounded-2xl p-4 outline-none w-full"
                autoComplete="off"
              />

              {Array.isArray(toSuggestions) &&
                toSuggestions.length > 0 && (

                  <div className="absolute z-50 bg-white border rounded-2xl shadow-lg mt-2 w-full max-h-60 overflow-y-auto">

                    {toSuggestions.map(
                      (station, index) => (

                        <div
                          key={
                            station?.code ||
                            index
                          }
                          onClick={() =>
                            selectToStation(
                              station
                            )
                          }
                          className="p-3 hover:bg-slate-100 cursor-pointer border-b last:border-b-0"
                        >

                          <div className="font-semibold">

                            {station?.code ||
                              "Unknown"}

                          </div>

                          <div className="text-sm text-slate-500">

                            {station?.name ||
                              "Unknown station"}

                          </div>

                          {station?.city && (

                            <div className="text-xs text-slate-400">

                              {station.city}

                            </div>

                          )}

                        </div>
                      )
                    )}

                  </div>
                )}

            </div>

            <input
              type="date"
              value={journeyDate}
              onChange={(e) =>
                setJourneyDate(
                  e.target.value
                )
              }
              className="border rounded-2xl p-4 outline-none"
            />

            <button
              onClick={searchTrains}
              disabled={loading}
              className="bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >

              {loading
                ? "Searching..."
                : "Search Trains"}

            </button>

          </div>

        </div>

        <div className="text-slate-600 font-semibold">

          Total Trains:{" "}

          {Array.isArray(trains)
            ? trains.length
            : 0}

        </div>

        <div className="space-y-4">

          {Array.isArray(trains) &&
            trains.length > 0 &&
            trains.map(
              (train, index) => (

                <TrainCard
                  key={
                    train?.trainNumber ||
                    train?.number ||
                    index
                  }
                  train={train}
                  from={from}
                  to={to}
                  trackTrain={trackTrain}
                />

              )
            )}

          {!loading &&
            Array.isArray(trains) &&
            trains.length === 0 &&
            from &&
            to && (

              <div className="bg-white rounded-2xl border p-8 text-center text-slate-500">

                No trains found for this
                route and date.

              </div>

            )}

        </div>

      </div>

    </div>
  );
}