"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthUser from "@/hooks/useAuthUser";
import Link from "next/link";

export default function GakuseiDashboard() {
  const { user, loading } = useAuthUser();
  const router = useRouter();

  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);

  const formatDate = (date: string | undefined | null) => {
    if (!date) return "Not scheduled";
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? "Invalid date" : parsed.toLocaleString();
  };

  const hasStarted = (date: string) => {
    const now = new Date();
    const sessionDate = new Date(date);
    return sessionDate <= now;
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== "gakusei")) {
      router.push("/auth/login");
    }

    const fetchData = async () => {
      try {
        const res = await fetch("/api/gakusei/dashboard");
        const data = await res.json();

        if (res.ok) {
          setUpcoming(data.upcomingSessions || []);
          setHistory(data.pastSessions || []);
          setRequests(data.sessionRequests || []);
        }

        const reviewRes = await fetch("/api/reviews/my-reviews");
        const reviewData = await reviewRes.json();
        if (reviewRes.ok) {
          setReviews(reviewData.reviews || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    if (user?.role === "gakusei") fetchData();
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-black text-lg">
        Loading dashboard...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6 text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">Gakusei Dashboard</h1>
        <p className="text-gray-600 mb-10">Manage your sessions and connect with mentors.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ✅ Upcoming Sessions */}
          <DashboardCard
            title="Upcoming Sessions"
            items={upcoming}
            render={(item: any) => (
              <>
                <p className="font-medium">Mentor: {item.sensei?.name || "N/A"}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(item.date || item.preferredDate)}
                </p>

                {hasStarted(item.date || item.preferredDate) ? (
                  <button
                    onClick={async () => {
                      const res = await fetch("/api/chat/room", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sessionId: item._id }),
                      });

                      const data = await res.json();
                      if (res.ok && data.roomId) {
                        router.push(`/chat/${data.roomId}`);
                      } else {
                        alert(data.error || "Chat unavailable.");
                      }
                    }}
                    className="mt-2 text-sm text-indigo-600 hover:underline"
                  >
                    Chat
                  </button>
                ) : (
                  <p className="text-xs text-yellow-600 mt-1">Chat available once session starts</p>
                )}
              </>
            )}
            emptyMessage="No upcoming sessions. Book one now!"
          />

          {/* ✅ Past Sessions */}
          <DashboardCard
            title="Past Sessions"
            items={history}
            render={(item: any) => (
              <>
                <p className="font-medium">Mentor: {item.sensei?.name || "N/A"}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(item.date || item.preferredDate)}
                </p>
              </>
            )}
            emptyMessage="No sessions completed yet."
          />

          {/* ✅ Session Requests */}
          <DashboardCard
            title="Session Requests"
            items={requests}
            render={(item: any) => {
              const color = {
                accepted: "text-green-600",
                rejected: "text-red-600",
                pending: "text-yellow-600",
              }[item.status] || "text-gray-600";

              return (
                <>
                  <p className="font-medium">Mentor: {item.sensei?.name || "N/A"}</p>
                  <p className="text-sm text-gray-600">
                    Preferred: {formatDate(item.preferredDate || item.date)}
                  </p>
                  <p className={`text-sm mt-1 font-medium ${color}`}>
                    {item.status?.toUpperCase() || "PENDING"}
                  </p>
                </>
              );
            }}
            emptyMessage="You haven't requested any sessions yet."
          />

          {/* ✅ Reviews */}
          <DashboardCard
            title="Your Reviews"
            items={reviews}
            render={(item: any) => (
              <>
                <p className="font-medium">To: {item.senseiName || "N/A"}</p>
                <p className="text-sm">"{item.comment || "No comment"}"</p>
                <p className="text-sm text-yellow-500">
                  Rating: {item.rating ? `${item.rating}/5` : "Not rated"}
                </p>
              </>
            )}
            emptyMessage="No reviews given yet."
          />
        </div>

        <div className="mt-12 bg-white p-6 rounded-md shadow text-center">
          <h2 className="text-xl font-semibold">Need guidance?</h2>
          <p className="text-gray-600 mt-1">Explore mentors and request sessions.</p>
          <Link
            href="/explore-sensei"
            className="inline-block mt-4 bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700"
          >
            Explore Mentors
          </Link>
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  items,
  render,
  emptyMessage,
}: {
  title: string;
  items: any[];
  render: (item: any) => JSX.Element;
  emptyMessage: string;
}) {
  return (
    <section className="bg-white p-5 rounded-md shadow text-black">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item._id} className="border p-4 bg-gray-50 hover:bg-gray-100 rounded">
              {render(item)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
