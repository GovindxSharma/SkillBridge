// app/sessions/request/[senseiId]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function RequestSessionPage() {
  const { senseiId } = useParams();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!date) {
      toast.error("Please select a session date");
      return;
    }
  
    setLoading(true);
    try {
      const res = await fetch("/api/sessions/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senseiId, date, message }),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request session");
  
      toast.success("Session request sent!");
      router.push("/gakusei/sessions/my-requests"); // ✅ Updated path
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-bold text-indigo-700">Request a Session</h1>

        <label className="block text-sm font-medium text-gray-700">Session Date & Time</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />

        <label className="block text-sm font-medium text-gray-700">Optional Message</label>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Mention any topic, doubts, etc."
        />

        <button
          onClick={handleSubmit}
          className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          disabled={loading}
        >
          {loading ? "Sending..." : "Request Session"}
        </button>
      </div>
    </div>
  );
}
