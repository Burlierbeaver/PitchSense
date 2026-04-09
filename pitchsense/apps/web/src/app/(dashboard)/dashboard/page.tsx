import Link from "next/link";
import { ArrowRight, TrendingUp, Clock, Target } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Your pitch coaching hub.</p>
      </div>

      {/* CTA card */}
      <div className="card p-8 bg-gradient-to-br from-brand-600 to-brand-700 text-white mb-8 border-0">
        <h2 className="text-xl font-semibold mb-2">Ready to pitch?</h2>
        <p className="text-brand-100 text-sm mb-6 max-w-md">
          Upload a deck, record yourself, or paste your script — and get a full AI analysis in
          under 2 minutes.
        </p>
        <Link
          href="/dashboard/new-pitch"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-50 transition-colors"
        >
          Start new pitch <ArrowRight size={16} />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Pitches analyzed", value: "0", icon: Target },
          { label: "Avg. fundability score", value: "—", icon: TrendingUp },
          { label: "Time coached", value: "0 min", icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-medium">{label}</span>
              <Icon size={15} className="text-gray-300" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{value}</span>
          </div>
        ))}
      </div>

      {/* Empty state for history */}
      <div className="card p-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Clock size={20} className="text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">No pitches yet</h3>
        <p className="text-sm text-gray-500">
          Your past pitches and scores will appear here.
        </p>
      </div>
    </div>
  );
}
