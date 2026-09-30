import { TrainFront } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white rounded-3xl border shadow-sm px-7 py-5">

      <div className="flex items-center gap-4">

        <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-md">
          <TrainFront
            size={32}
            strokeWidth={2.2}
            className="text-white"
          />
        </div>

        <div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Train<span className="text-blue-600">Trace</span>
          </h1>

          <p className="text-slate-500 mt-1">
            Live Tracking • AI ETA Prediction
          </p>

        </div>

      </div>

    </header>
  );
}