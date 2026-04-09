import { notFound } from "next/navigation";

async function getPitch(id: string) {
  // In real app, fetch from API with auth
  // const res = await fetch(`${process.env.API_URL}/pitches/${id}`, { ... });
  return null; // placeholder
}

export default async function PitchResultsPage({ params }: { params: { id: string } }) {
  const pitch = await getPitch(params.id);

  // Show loading skeleton while job processes (polling handled client-side in real impl)
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pitch analysis</h1>
        <p className="text-sm text-gray-400 mt-1">ID: {params.id}</p>
      </div>

      {/* Score card */}
      <div className="card p-8 mb-6 flex items-center gap-8">
        <div className="text-center">
          <div className="text-6xl font-bold text-brand-600">—</div>
          <div className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">
            Fundability score
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4">
          {["Narrative", "Market size", "Team credibility", "Traction", "Financials", "Ask clarity"].map((dim) => (
            <div key={dim} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{dim}</span>
              <div className="w-24 h-1.5 bg-gray-100 rounded-full">
                <div className="h-full bg-brand-400 rounded-full w-0" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback sections */}
      {["Strengths", "Critical gaps", "Investor questions"].map((section) => (
        <div key={section} className="card p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">{section}</h2>
          <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>
      ))}

      <p className="text-xs text-center text-gray-400 mt-8">
        Analysis is processed asynchronously — refresh if results aren't loaded yet.
      </p>
    </div>
  );
}
