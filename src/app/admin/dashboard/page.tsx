"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthUser from "@/hooks/useAuthUser";

export default function AdminDashboard() {
  const { user, loading } = useAuthUser();
  const router = useRouter();

  const [pendingSenseis, setPendingSenseis] = useState([]);
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/auth/login");
    }

    const fetchData = async () => {
      try {
        const [
          senseisRes,
          usersRes,
          sessionsRes,
          reviewsRes,
          reportsRes,
        ] = await Promise.all([
          fetch("/api/admin/verify-sensei").then((r) => r.json()),
          fetch("/api/admin/users").then((r) => r.json()),
          fetch("/api/admin/sessions").then((r) => r.json()),
          fetch("/api/admin/reviews").then((r) => r.json()),
          fetch("/api/admin/reports").then((r) => r.json()),
        ]);

        setPendingSenseis(senseisRes.pending || []);
        setUsers(usersRes.users || []);
        setSessions(sessionsRes.sessions || []);
        setReviews(reviewsRes.reviews || []);
        setReports(reportsRes.reports || []);
      } catch (err) {
        console.error("Admin dashboard error:", err);
      }
    };

    if (user?.role === "admin") fetchData();
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="h-screen flex justify-center items-center text-gray-600">
        Loading Admin Dashboard...
      </div>
    );
  }

  const totalSenseis = users.filter((u) => u.role === "sensei").length;
  const totalGakusei = users.filter((u) => u.role === "gakusei").length;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🛠 Admin Dashboard</h1>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <MetricCard title="Total Users" value={users.length} />
          <MetricCard title="Senseis" value={totalSenseis} />
          <MetricCard title="Gakuseis" value={totalGakusei} />
          <MetricCard title="Sessions" value={sessions.length} />
          <MetricCard title="Reports" value={reports.length} />
        </div>

        {/* Pending Senseis */}
        <DashboardSection title="📝 Pending Sensei Verifications" items={pendingSenseis}>
          {(sensei) => (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-black">{sensei.name}</p>
                <p className="text-sm text-gray-700">{sensei.email}</p>
              </div>
              <div className="flex gap-2">
                <AdminActionButton
                  label="Verify"
                  color="green"
                  onClick={async () => {
                    await fetch(`/api/admin/verify-sensei?id=${sensei._id}&action=approve`, {
                      method: "PUT",
                    });
                    window.location.reload();
                  }}
                />
                <AdminActionButton
                  label="Reject"
                  color="red"
                  onClick={async () => {
                    await fetch(`/api/admin/verify-sensei?id=${sensei._id}&action=reject`, {
                      method: "PUT",
                    });
                    window.location.reload();
                  }}
                />
              </div>
            </div>
          )}
        </DashboardSection>

        {/* Sessions */}
        <DashboardSection title="📆 Recent Sessions" items={sessions.slice(0, 5)}>
          {(session) => (
            <div>
              <p className="font-semibold text-black">
                {session.gakusei?.name} → {session.sensei?.name}
              </p>
              <p className="text-sm text-gray-700">
                {new Date(session.startTime).toLocaleString()}
              </p>
              <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                {session.status}
              </span>
            </div>
          )}
        </DashboardSection>

        {/* Users */}
        <DashboardSection title="👥 All Users" items={users.slice(0, 10)}>
          {(u) => (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-black">{u.name}</p>
                <p className="text-sm text-gray-700">{u.email}</p>
              </div>
              <span className="text-xs font-medium bg-gray-100 px-3 py-1 rounded-full capitalize text-gray-800">
                {u.role}
              </span>
            </div>
          )}
        </DashboardSection>

        {/* Reviews */}
        <DashboardSection title="⭐ User Reviews" items={reviews.slice(0, 5)}>
          {(review) => (
            <div className="flex justify-between items-center">
              <div>
                <p>
                  <strong>{review.reviewer?.name}</strong> → {review.reviewee?.name}
                </p>
                <p className="text-sm text-gray-700">Rating: {review.rating}/5</p>
                <p className="text-sm text-gray-500 italic">{review.comment || "No comment"}</p>
              </div>
              <AdminActionButton
                label="Delete"
                color="red"
                onClick={async () => {
                  await fetch("/api/admin/reviews", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: review._id }),
                  });
                  window.location.reload();
                }}
              />
            </div>
          )}
        </DashboardSection>

        {/* Reports */}
        <DashboardSection title="🚨 User Reports" items={reports.slice(0, 5)}>
          {(report) => (
            <div>
              <p className="font-semibold text-black">{report.reason}</p>
              <p className="text-sm text-gray-700">
                {report.reportedBy?.name} reported {report.reportedUser?.name}
              </p>
              <p className="text-sm text-gray-500 italic">{report.description}</p>
              <div className="mt-2 flex gap-2">
                {["reviewed", "resolved"].map((status) => (
                  <AdminActionButton
                    key={status}
                    label={`Mark ${status}`}
                    color="green"
                    onClick={async () => {
                      await fetch("/api/admin/reports", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: report._id, status }),
                      });
                      window.location.reload();
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </DashboardSection>
      </div>
    </main>
  );
}

// COMPONENTS
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

function AdminActionButton({
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

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white shadow-sm p-5 rounded-xl text-center border border-gray-100">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-black mt-1">{value}</p>
    </div>
  );
}
