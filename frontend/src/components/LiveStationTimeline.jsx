import { useEffect, useMemo, useRef, useState } from "react";

function formatDelay(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  return number.toFixed(2);
}

function formatTime(value) {
  if (!value) return "--:--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStationCode(station) {
  return (
    station?.code ||
    station?.stationCode ||
    station?.station ||
    station?.station_name ||
    station?.stationName ||
    "Unknown"
  );
}

function getStationName(station) {
  return (
    station?.stationName ||
    station?.station_name ||
    station?.name ||
    station?.station ||
    getStationCode(station)
  );
}

function getScheduledTime(station) {
  return (
    station?.scheduled_time ||
    station?.scheduled_arrival ||
    station?.scheduled_departure ||
    null
  );
}

function getActualTime(station) {
  return (
    station?.actual_time ||
    station?.actual_arrival ||
    station?.actual_departure ||
    null
  );
}

function getPredictedTime(station) {
  return (
    station?.predicted_time ||
    getScheduledTime(station)
  );
}

function getDelay(station) {
  return Number(
    station?.predicted_delay ??
    station?.delay ??
    0
  );
}

export default function LiveStationTimeline({
  stations = [],
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchText, setSearchText] = useState("");

  const timelineRef = useRef(null);
  const stationRefs = useRef([]);


  const stationList = Array.isArray(stations)
    ? stations
    : [];

  const selectedStation =
    stationList[selectedIndex] || null;

  const handleSearch = () => {
    const query = searchText
      .trim()
      .toLowerCase();

    if (!query) return;

    const index = stationList.findIndex(
      (station) => {
        const code =
          getStationCode(station).toLowerCase();

        const name =
          getStationName(station).toLowerCase();

        return (
          code.includes(query) ||
          name.includes(query)
        );
      }
    );

    if (index === -1) {
      alert("Station not found.");
      return;
    }

    setSelectedIndex(index);

    setTimeout(() => {
      stationRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }, 50);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const selectStation = (index) => {
    setSelectedIndex(index);

    setTimeout(() => {
      stationRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }, 50);
  };

  useEffect(() => {
    if (stationList.length > 0) {
      setSelectedIndex(0);
    }
  }, [stationList.length]);

  const selectedDelay = selectedStation
    ? getDelay(selectedStation)
    : 0;

  const totalStations = stationList.length;


  if (totalStations === 0) {
    return (
      <div className="bg-white rounded-3xl border shadow-sm p-8">

        <h2 className="text-2xl font-bold text-slate-800">
          🚆 Train Journey Timeline
        </h2>

        <p className="text-slate-500 mt-2">
          No station prediction data available.
        </p>

      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">

      <div className="p-6 border-b">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>

            <h2 className="text-3xl font-bold text-slate-800">
              🚆 Journey Timeline
            </h2>

            <p className="text-slate-500 mt-1">
              Live railway status and AI-based ETA
            </p>

          </div>

          <div className="flex items-center gap-2">

            <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">
              {totalStations} stations
            </div>

          </div>

        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">

          <div className="relative flex-1">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔎
            </span>

            <input
              type="text"
              value={searchText}
              onChange={(e) =>
                setSearchText(e.target.value)
              }
              onKeyDown={handleSearchKeyDown}
              placeholder="Search station code or name..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-slate-300"
            />

          </div>

          <button
            onClick={handleSearch}
            className="px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-900 transition"
          >
            Search Station
          </button>

        </div>

      </div>

      <div className="px-6 pt-7">

        <div
          ref={timelineRef}
          className="overflow-x-auto pb-5"
          style={{
            scrollbarWidth: "thin",
          }}
        >

          <div className="relative min-w-max px-8">

            {/* CONNECTING LINE */}

            <div className="absolute left-12 right-12 top-5 h-1 bg-slate-200 rounded-full" />

            {/* STATIONS */}

            <div className="relative flex items-start gap-10">

              {stationList.map(
                (station, index) => {

                  const code =
                    getStationCode(station);

                  const delay =
                    getDelay(station);

                  const isSelected =
                    selectedIndex === index;

                  return (
                    <button
                      key={
                        station?.sequence ??
                        code ??
                        index
                      }
                      ref={(element) => {
                        stationRefs.current[index] =
                          element;
                      }}
                      onClick={() =>
                        selectStation(index)
                      }
                      className="relative flex flex-col items-center min-w-[90px] group"
                    >

                      {/* NODE */}

                      <div
                        className={`relative z-10 w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-slate-800 border-slate-800 scale-125 shadow-lg"
                            : delay > 0
                              ? "bg-red-500 border-white shadow-md"
                              : "bg-green-500 border-white shadow-md"
                        }`}
                      >

                        {isSelected && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full" />
                        )}

                      </div>

                      {/* STATION CODE */}

                      <span
                        className={`mt-3 text-sm font-bold ${
                          isSelected
                            ? "text-slate-900"
                            : "text-slate-500"
                        }`}
                      >
                        {code}
                      </span>

                      {/* DELAY */}

                      <span
                        className={`mt-1 text-xs ${
                          delay > 0
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {delay > 0
                          ? `+${formatDelay(delay)}m`
                          : "On time"}
                      </span>

                    </button>
                  );
                }
              )}

            </div>

          </div>

        </div>

      </div>

      {selectedStation && (

        <div className="p-6 pt-2">

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">

            {/* STATION HEADER */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>

                <div className="flex items-center gap-3">

                  <h3 className="text-3xl font-bold text-slate-800">
                    {getStationCode(
                      selectedStation
                    )}
                  </h3>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedDelay > 0
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {selectedDelay > 0
                      ? "DELAYED"
                      : "ON TIME"}
                  </span>

                </div>

                <p className="text-slate-500 mt-1">
                  {getStationName(
                    selectedStation
                  )}
                </p>

              </div>

              {/* DELAY */}

              <div className="text-right">

                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Expected Delay
                </p>

                <p
                  className={`text-3xl font-bold ${
                    selectedDelay > 0
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {selectedDelay > 0
                    ? `+${formatDelay(
                        selectedDelay
                      )}`
                    : "0.00"}{" "}
                  <span className="text-base">
                    min
                  </span>
                </p>

              </div>

            </div>

            {/* TIME INFORMATION */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

              {/* SCHEDULED */}

              <div className="bg-white rounded-xl border p-4">

                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Scheduled
                </p>

                <p className="text-2xl font-bold text-slate-800 mt-2">
                  {formatTime(
                    getScheduledTime(
                      selectedStation
                    )
                  )}
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  {formatDate(
                    getScheduledTime(
                      selectedStation
                    )
                  )}
                </p>

              </div>

              {/* ACTUAL */}

              <div className="bg-white rounded-xl border p-4">

                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Actual
                </p>

                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {getActualTime(
                    selectedStation
                  )
                    ? formatTime(
                        getActualTime(
                          selectedStation
                        )
                      )
                    : "--:--"}
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  {getActualTime(
                    selectedStation
                  )
                    ? formatDate(
                        getActualTime(
                          selectedStation
                        )
                      )
                    : "Not available"}
                </p>

              </div>

              {/* PREDICTED */}

              <div className="bg-white rounded-xl border p-4">

                <p className="text-xs uppercase tracking-wide text-slate-400">
                  AI Predicted
                </p>

                <p className="text-2xl font-bold text-orange-500 mt-2">
                  {formatTime(
                    getPredictedTime(
                      selectedStation
                    )
                  )}
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  {formatDate(
                    getPredictedTime(
                      selectedStation
                    )
                  )}
                </p>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}