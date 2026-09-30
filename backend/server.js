require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.RAILRADAR_API_KEY;

if (!API_KEY) {
  console.error("RAILRADAR_API_KEY is not set in .env");
  process.exit(1);
}

app.get("/", (req, res) => {
  res.send("TrainTrace API Running");
});

app.post("/predict-future-stations", async (req, res) => {
  try {
    const {
      trainNumber,
      journeyDate,
      from,
      to,
      searchMode
    } = req.body;

    if (!trainNumber || !journeyDate) {
      return res.status(400).json({
        error: "trainNumber and journeyDate are required"
      });
    }
    const url =
      `https://api.railradar.in/v1/trains/${encodeURIComponent(trainNumber)}/live`;

    console.log("Fetching live train:", trainNumber);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      },
      params: {
        date: journeyDate
      }
    });

    const liveData = response.data;

    if (!liveData.success || !liveData.data) {
      return res.status(502).json({
        error: "Invalid response from RailRadar",
        details: liveData
      });
    }

    let routeStations = liveData.data.route || [];

    console.log(
      "RailRadar route stations:",
      routeStations.length
    );

    if (searchMode === "stations" && from && to) {

      const startIndex = routeStations.findIndex(
        (s) => s.stationCode === from
      );

      const endIndex = routeStations.findIndex(
        (s) => s.stationCode === to
      );

      if (startIndex !== -1 && endIndex !== -1) {

        routeStations = routeStations.slice(
          startIndex,
          endIndex + 1
        );

      } else {

        console.log(
          "Could not find requested from/to in route"
        );

      }
    }

    console.log(
      "Route after filtering:",
      routeStations.length
    );

    const stations = routeStations.map(
      (station, index) => {

        const stationNo =
          Number(station.sequence) ||
          index + 1;

        let actualDelay = null;

        if (
          station.delayArrival !== null &&
          station.delayArrival !== undefined
        ) {

          actualDelay =
            Number(station.delayArrival);

        } else if (
          station.delayDeparture !== null &&
          station.delayDeparture !== undefined
        ) {

          actualDelay =
            Number(station.delayDeparture);

        }

        const scheduledArrival =
          station.scheduledArrival || null;

        const scheduledDeparture =
          station.scheduledDeparture || null;

        return {
          station:
            station.stationCode ||
            `ST-${index + 1}`,

          stationName:
            station.stationName ||
            station.stationCode ||
            `Station ${index + 1}`,

          sequence: stationNo,

          station_no: stationNo,

          is_origin:
            index === 0 ? 1 : 0,

          is_destination:
            index === routeStations.length - 1
              ? 1
              : 0,

          actual_delay: actualDelay,

          scheduled_time:
            scheduledArrival ||
            scheduledDeparture ||
            null,

          scheduled_arrival:
            scheduledArrival,

          scheduled_departure:
            scheduledDeparture,

          actual_arrival:
            station.actualArrival || null,

          actual_departure:
            station.actualDeparture || null,

          platform:
            station.platform || null,

          distance:
            station.distance || null,

          status:
            station.status || null
        };
      }
    );

    const journeyDateObj =
      new Date(`${journeyDate}T00:00:00`);

    const dayOfWeek =
      journeyDateObj.getDay();


    const inputData = {

      train_number:
        Number(trainNumber),

      day_of_week:
        dayOfWeek,

      stations
    };

    const tempFilePath =
      path.join(
        __dirname,
        `temp_prediction_${Date.now()}.json`
      );


    fs.writeFileSync(
      tempFilePath,
      JSON.stringify(inputData),
      "utf8"
    );

    exec(
      `python predict_xgb.py "${tempFilePath}"`,
      {
        cwd: __dirname,
        maxBuffer: 10 * 1024 * 1024
      },

      (error, stdout, stderr) => {

        if (
          fs.existsSync(tempFilePath)
        ) {
          fs.unlinkSync(tempFilePath);
        }

        if (error) {

          console.error(
            "Python prediction error:",
            error.message
          );

          console.error(
            "Python stderr:",
            stderr
          );

          return res.status(500).json({

            error:
              "Prediction failed",

            details:
              stderr ||
              error.message

          });
        }

        try {

          const result =
            JSON.parse(stdout);

          res.json(result);

        } catch (parseError) {

          console.error(
            "JSON parse error:",
            parseError.message
          );

          console.error(
            "Python stdout:",
            stdout
          );

          res.status(500).json({

            error:
              "Invalid prediction response",

            details:
              stdout

          });
        }
      }
    );


  } catch (err) {

    console.error(
      "Prediction route error:",
      err.response?.data ||
      err.message
    );

    res.status(
      err.response?.status || 500
    ).json({

      error:
        "Future prediction failed",

      details:
        err.response?.data ||
        err.message

    });
  }
});

app.post("/search-trains", async (req, res) => {
  try {
    const { from, to, date } = req.body;

    if (!from || !to) {
      return res.status(400).json({
        error: "from and to are required"
      });
    }

    const params = {};

    if (date) {
      params.date = date;
    }

    const url = `https://api.railradar.in/v1/trains/between/${encodeURIComponent(from)}/${encodeURIComponent(to)}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      },
      params
    });

    res.json(response.data);

  } catch (err) {
    console.error(
      "Search trains error:",
      err.response?.data || err.message
    );

    res.status(err.response?.status || 500).json({
      error: "Failed to fetch trains",
      details: err.response?.data || err.message
    });
  }
});

app.get("/search-stations", async (req, res) => {
  try {
    const query = String(req.query.query || "").trim();

    if (!query) {
      return res.json([]);
    }

    const url =
      "https://api.railradar.in/v1/lookup/search/stations";

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      },
      params: {
        q: query,
        limit: 10
      }
    });

    const stations =
      response.data?.data;

    if (!Array.isArray(stations)) {
      return res.json([]);
    }

    res.json(stations);

  } catch (err) {

    console.error(
      "Station search error:",
      err.response?.data || err.message
    );

    res.status(
      err.response?.status || 500
    ).json({
      error: "Failed to search stations",
      details:
        err.response?.data ||
        err.message
    });
  }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
