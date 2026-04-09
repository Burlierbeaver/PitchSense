import Link from "next/link";
import { ArrowRight, Mic, FileText, TrendingUp, Users } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <span className="text-xl font-bold text-brand-700">PitchSense</span>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
          <Link href="/sign-up" className="btn-primary">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          AI-powered pitch coaching
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Get grilled by AI investors
          <br />
          <span className="text-brand-600">before the real thing.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Upload your pitch deck, record yourself, or paste a transcript. PitchSense scores
          your pitch, finds the gaps, and simulates hard investor questions — so you walk in
          ready.
        </p>
        <Link href="/sign-up" className="btn-primary text-base px-8 py-3.5">
          Analyze my pitch free <ArrowRight size={18} />
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: <FileText size={20} />,
            title: "Any format",
            desc: "Upload a PDF deck, drop in slides, or record your live pitch — we handle it all.",
          },
          {
            icon: <TrendingUp size={20} />,
            title: "Fundability score",
            desc: "Get a 0–100 score across narrative, market size, team, traction, and financials.",
          },
          {
            icon: <Users size={20} />,
            title: "VC persona simulator",
            desc: "Choose your investor archetype — growth, deep-tech, seed-stage — and get grilled.",
          },
          {
            icon: <Mic size={20} />,
            title: "Audio coaching",
            desc: "Record your pitch and get feedback on pacing, filler words, and confidence signals.",
          },
        ].map((f) => (
          <div key={f.title} className="card p-6">
            <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              {f.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
