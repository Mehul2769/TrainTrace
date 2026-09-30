export default function TrainCard({
  train,
  from,
  to,
  trackTrain
}) {
  const trainNumber =
    train?.trainNumber ||
    train?.train_number ||
    train?.number ||
    train?.train_no ||
    train?.train?.trainNumber ||
    train?.train?.train_number ||
    train?.train?.number ||
    train?.train?.train_no ||
    "Unknown";

  const trainName =
    train?.trainName ||
    train?.train_name ||
    train?.name ||
    train?.train?.trainName ||
    train?.train?.train_name ||
    train?.train?.name ||
    "Train";

  return (
    <div className="bg-white rounded-3xl border shadow-sm p-6 flex justify-between items-center">

      <div>

        <div className="flex items-center gap-3">

          <h2 className="text-3xl font-bold text-slate-800">
            {trainNumber}
          </h2>

          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-xl text-sm font-bold">
            LIVE
          </div>

        </div>

        <p className="text-xl text-slate-600 mt-2">
          {trainName}
        </p>

        <p className="text-slate-400 mt-1">
          {from} → {to}
        </p>

      </div>

      <button
        onClick={() => trackTrain(train)}
        className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-900 transition-all"
      >
        Track
      </button>

    </div>
  );
}