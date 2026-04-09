"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Mic, FileText, Type, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

type InputMode = "file" | "audio" | "text";

export default function NewPitchPage() {
  const router = useRouter();
  const [mode, setMode] = useState<InputMode>("file");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "audio/*": [".mp3", ".wav", ".m4a", ".webm"],
    },
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted[0]) setFile(accepted[0]);
    },
  });

  const handleSubmit = async () => {
    if (mode === "text" && !text.trim()) {
      toast.error("Please paste your pitch script.");
      return;
    }
    if (mode !== "text" && !file) {
      toast.error("Please upload a file.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("mode", mode);
      if (file) formData.append("file", file);
      if (text) formData.append("text", text);

      const res = await fetch("/api/pitches", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to submit pitch");
      const { pitchId } = await res.json();
      router.push(`/dashboard/pitch/${pitchId}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const modes: { id: InputMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "file", label: "Pitch deck", icon: <FileText size={18} />, desc: "PDF or slides" },
    { id: "audio", label: "Audio pitch", icon: <Mic size={18} />, desc: "MP3, WAV, M4A" },
    { id: "text", label: "Script / transcript", icon: <Type size={18} />, desc: "Paste text" },
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">New pitch</h1>
      <p className="text-gray-500 text-sm mb-8">
        Choose how you want to submit your pitch for analysis.
      </p>

      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {modes.map(({ id, label, icon, desc }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`card p-4 text-left transition-all ${
              mode === id ? "ring-2 ring-brand-500 border-brand-100" : "hover:border-gray-200"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                mode === id ? "bg-brand-100 text-brand-600" : "bg-gray-100 text-gray-500"
              }`}
            >
              {icon}
            </div>
            <p className="text-sm font-medium text-gray-900">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
          </button>
        ))}
      </div>

      {/* Input area */}
      {mode === "text" ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder="Paste your pitch script or transcript here..."
          className="input resize-none mb-6"
        />
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors mb-6 ${
            isDragActive ? "border-brand-400 bg-brand-50" : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Upload size={20} className="text-gray-400" />
          </div>
          {file ? (
            <>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {(file.size / 1024 / 1024).toFixed(1)} MB — click to replace
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">
                {isDragActive ? "Drop it here" : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {mode === "file" ? "PDF up to 50 MB" : "MP3, WAV, M4A up to 200 MB"}
              </p>
            </>
          )}
        </div>
      )}

      <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full justify-center py-3">
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Analyzing…
          </>
        ) : (
          "Analyze my pitch →"
        )}
      </button>
    </div>
  );
}
