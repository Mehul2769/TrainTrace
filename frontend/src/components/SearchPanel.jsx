export default function SearchPanel({
  from,
  to,
  journeyDate,
  setFrom,
  setTo,
  setJourneyDate,
  searchTrains,
  loading
}) {

  return (

    <div className="bg-[#1e293b] rounded-3xl p-6 mb-6 border border-slate-700">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <input
          value={from}
          onChange={(e) =>
            setFrom(e.target.value)
          }
          placeholder="FROM"
          className="bg-[#0f172a] text-white p-4 rounded-2xl border border-slate-700 outline-none"
        />

        <input
          value={to}
          onChange={(e) =>
            setTo(e.target.value)
          }
          placeholder="TO"
          className="bg-[#0f172a] text-white p-4 rounded-2xl border border-slate-700 outline-none"
        />

        <input
          type="date"
          value={journeyDate}
          onChange={(e) =>
            setJourneyDate(
              e.target.value
            )
          }
          className="bg-[#0f172a] text-white p-4 rounded-2xl border border-slate-700 outline-none"
        />

        <button
          onClick={searchTrains}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all"
        >

          {
            loading
              ? "Searching..."
              : "Search Trains"
          }

        </button>

      </div>

    </div>

  );

}