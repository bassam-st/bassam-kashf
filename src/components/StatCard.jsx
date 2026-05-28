export default function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  )
}
