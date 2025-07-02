"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthUser from "@/hooks/useAuthUser";

export default function SenseiDashboard() {
  const { user, loading } = useAuthUser();
  const router = useRouter();
  const [pending, setPending] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "sensei")) {
      router.push("/auth/login");
    }

    const fetchData = async () => {
      try {
        const res = await fetch("/api/sensei/dashboard");
        const data = await res.json();
        setPending(data.pendingRequests || []);
        setUpcoming(data.upcomingSessions || []);
        setHistory(data.pastSessions || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    if (user?.role === "sensei") fetchData();
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500 text-lg">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4 md:px-10 text-black">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📘 Sensei Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage session requests and track your mentoring history.
          </p>
        </header>

        <DashboardSection title="🕒 Pending Requests" items={pending}>
          {(item) => (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">{item.gakusei?.name}</p>
                  <p className="text-sm text-gray-600">{new Date(item.date).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <ActionButton
                    label="Accept"
                    color="green"
                    onClick={async () => {
                      await fetch(`/api/sessions/${item._id}/accept`, { method: "PUT" });
                      window.location.reload();
                    }}
                  />
                  <ActionButton
                    label="Reject"
                    color="red"
                    onClick={async () => {
                      await fetch(`/api/sessions/${item._id}/reject`, { method: "PUT" });
                      window.location.reload();
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </DashboardSection>

        <DashboardSection title="📅 Upcoming Sessions" items={upcoming}>
          {(item) => (
            <>
              <p className="font-semibold">{item.gakusei?.name}</p>
              <p className="text-sm text-gray-600">{new Date(item.date).toLocaleString()}</p>
            </>
          )}
        </DashboardSection>

        <DashboardSection title="📚 Past Sessions" items={history}>
          {(item) => (
            <>
              <p className="font-semibold">{item.gakusei?.name}</p>
              <p className="text-sm text-gray-600">{new Date(item.date).toLocaleString()}</p>
            </>
          )}
        </DashboardSection>
      </div>
    </main>
  );
}

// Reusable Section Component
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
    <section className="bg-white rounded-lg p-6 shadow mb-10">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No items</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item._id} className="bg-gray-50 p-4 rounded border">
              {children(item)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Reusable Action Button
function ActionButton({
  label,
  color,
  onClick,
}: {
  label: string;
  color: "green" | "red";
  onClick: () => void;
}) {
  const colorClass = {
    green: "bg-green-600 hover:bg-green-700",
    red: "bg-red-600 hover:bg-red-700",
  }[color];

  return (
    <button
      onClick={onClick}
      className={`text-white px-4 py-1.5 rounded-md text-sm font-medium ${colorClass} transition`}
    >
      {label}
    </button>
  );
}
