"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthUser from "@/hooks/useAuthUser";

export default function SenseiDashboard() {
  const { user, loading } = useAuthUser();
  const router = useRouter();

  const [sessions, setSessions] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "sensei")) {
      router.push("/auth/login");
    }

    const fetchData = async () => {
      try {
        const [sessionsRes, reviewsRes] = await Promise.all([
          fetch("/api/sensei/sessions").then((r) => r.json()),
          fetch("/api/sensei/reviews").then((r) => r.json()),
        ]);

        setSessions(sessionsRes.sessions || []);
        setReviews(reviewsRes.reviews || []);
      } catch (err) {
        console.error("Sensei dashboard error:", err);
      }
    };

    if (user?.role === "sensei") fetchData();
  }, [loading, user, router]);

  const pendingSessions = sessions.filter(s => s.status === "pending");
  const acceptedSessions = sessions.filter(s => s.status === "accepted");
  const rejectedSessions = sessions.filter(s => s.status === "rejected");
  const pastSessions = sessions.filter(s => new Date(s.startTime) < new Date());

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">📘 Sensei Dashboard</h1>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard title="Total Sessions" value={sessions.length} />
          <MetricCard title="Pending" value={pendingSessions.length} />
          <MetricCard title="Accepted" value={acceptedSessions.length} />
          <MetricCard title="Rejected" value={rejectedSessions.length} />
        </div>

        {/* Pending Sessions */}
        <DashboardSection title="🕓 Pending Session Requests" items={pendingSessions}>
          {(session) => (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{session.gakusei?.name}</p>
                <p className="text-sm text-gray-600">{new Date(session.startTime).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <SessionActionButton
                  label="Accept"
                  color="green"
                  onClick={async () => {
                    await fetch(`/api/sensei/session-status?id=${session._id}&action=accept`, { method: "PUT" });
                    window.location.reload();
                  }}
                />
                <SessionActionButton
                  label="Reject"
                  color="red"
                  onClick={async () => {
                    await fetch(`/api/sensei/session-status?id=${session._id}&action=reject`, { method: "PUT" });
                    window.location.reload();
                  }}
                />
              </div>
            </div>
          )}
        </DashboardSection>

        {/* Session History */}
        <DashboardSection title="📜 Past Sessions" items={pastSessions.slice(0, 5)}>
          {(s) => (
            <div>
              <p className="font-medium">
                {s.gakusei?.name} — {new Date(s.startTime).toLocaleString()}
              </p>
              <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full capitalize">
                {s.status}
              </span>
            </div>
          )}
        </DashboardSection>

        {/* Reviews */}
        <DashboardSection title="🌟 Reviews Received" items={reviews}>
          {(r) => (
            <div>
              <p className="font-medium">{r.reviewer?.name}</p>
              <p className="text-sm text-gray-600">Rating: {r.rating}/5</p>
              <p className="text-sm italic text-gray-700">{r.comment}</p>
            </div>
          )}
        </DashboardSection>
      </div>
    </main>
  );
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white shadow-sm p-5 rounded-xl text-center border border-gray-100">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-black mt-1">{value}</p>
    </div>
  );
}

function DashboardSection({
  title,
  items,
  children,
}: {
  title: string;
  items: any[];
  children: (item: any) => JSX.Element;
}) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm mb-10">
      <h2 className="text-xl font-semibold text-black mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No records found.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item._id} className="p-4 rounded bg-gray-50">
              {children(item)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SessionActionButton({
  label,
  color,
  onClick,
}: {
  label: string;
  color: "green" | "red";
  onClick: () => void;
}) {
  const colorMap = {
    green: "bg-green-600 hover:bg-green-700",
    red: "bg-red-600 hover:bg-red-700",
  };

  return (
    <button
      onClick={onClick}
      className={`text-white px-4 py-1.5 rounded-md text-sm font-medium ${colorMap[color]} transition`}
    >
      {label}
    </button>
  );
}
