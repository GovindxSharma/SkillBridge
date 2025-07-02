"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);

  const fetchMyRequests = async () => {
    try {
      const res = await fetch("/api/sessions/my-requests");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRequests(data.requests);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  return (
    <main className="min-h-screen p-6 bg-indigo-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-800 mb-6">My Session Requests</h1>
        {requests.length === 0 ? (
          <p className="text-gray-500">You haven't requested any sessions yet.</p>
        ) : (
          <ul className="space-y-4">
            {requests.map((req) => (
              <li key={req._id} className="bg-white rounded-lg p-4 shadow flex items-center gap-4">
                <Image
                  src={req.sensei?.profileImage || "/profile.png"}
                  alt="Sensei"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <p className="font-medium">{req.sensei?.name}</p>
                  <p className="text-sm text-gray-600">
                    Preferred time: {new Date(req.preferredDate).toLocaleString()}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor:
                      req.status === "pending"
                        ? "#FFEBCC"
                        : req.status === "accepted"
                        ? "#CCFFCC"
                        : "#FFCCCC",
                    color:
                      req.status === "pending"
                        ? "#996600"
                        : req.status === "accepted"
                        ? "#006600"
                        : "#660000",
                  }}>
                  {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
