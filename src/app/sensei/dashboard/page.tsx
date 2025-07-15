"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthUser from "@/hooks/useAuthUser";

export default function SenseiDashboard() {
  const { user, loading } = useAuthUser();
  const router = useRouter();

  const [pending, setPending] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);
  const [rejected, setRejected] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "sensei")) {
      router.push("/auth/login");
    }

    async function fetchData() {
      try {
        const res = await fetch("/api/sensei/dashboard");
        const data = await res.json();
        setPending(data.pendingRequests || []);
        setUpcoming(data.upcomingSessions || []);
        setPast(data.pastSessions || []);
        setRejected(data.rejectedRequests || []);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    }

    if (user?.role === "sensei") fetchData();
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center text-lg font-medium">
        Loading...
      </div>
    );
  }

  const total = pending.length + upcoming.length + past.length + rejected.length;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-10 text-indigo-800 flex items-center gap-2">
          📘 Sensei Dashboard
        </h1>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <MetricCard title="Total Sessions" value={total} />
          <MetricCard title="Pending" value={pending.length} />
          <MetricCard title="Upcoming" value={upcoming.length} />
          <MetricCard title="Past / Rejected" value={past.length + rejected.length} />
        </div>

        {/* Sections */}
        <DashboardSection title="🕒 Pending Requests" items={pending}>
          {(r) => (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{r.gakusei?.name || "Unknown Gakusei"}</p>
                <p className="text-sm text-gray-600">
                  {new Date(r.preferredDate).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  label="Accept"
                  color="green"
                  onClick={async () => {
                    await fetch(`/api/sessions/${r._id}/accept`, { method: "PUT" });
                    window.location.reload();
                  }}
                />
                <ActionButton
                  label="Reject"
                  color="red"
                  onClick={async () => {
                    await fetch(`/api/sessions/${r._id}/reject`, { method: "PUT" });
                    window.location.reload();
                  }}
                />
              </div>
            </div>
          )}
        </DashboardSection>

        <DashboardSection title="📅 Upcoming Sessions" items={upcoming}>
  {(s) => {
    const now = new Date();
    const sessionStart = new Date(s.startTime);
    const isSessionLive =
      now >= sessionStart &&
      !s.isCompletedBySensei &&
      !s.isCompletedByGakusei;

      console.log("🧠 Full session object (s):", s);


      const joinChat = async () => {
        try {
          console.log("🧠 Full session object (s):", s);
          console.log("👉 s._id:", s._id);
          console.log("👉 s.session?._id:", s.session?._id);
      
          const sessionId = s.session?._id || s._id; // fallback logic
          console.log("✅ Using sessionId:", sessionId);
      
          const res = await fetch("/api/chat/room", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
      
          const data = await res.json();
          if (res.ok && data.roomId) {
            router.push(`/chat/${data.roomId}`);
          } else {
            alert(data.error || "Chat unavailable.");
          }
        } catch (err) {
          console.error("Chat error:", err);
          alert("Something went wrong");
        }
      };
      

    return (
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold">{s.gakusei?.name || "Unknown Gakusei"}</p>
          <p className="text-sm text-gray-600">{sessionStart.toLocaleString()}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge color="blue" text={s.status || "Upcoming"} />
          {isSessionLive ? (
            <button
              onClick={joinChat}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5 rounded-md shadow transition"
              title="Join Chat"
            >
              💬 Join Chat
            </button>
          ) : (
            <p className="text-xs text-yellow-600 mt-1">Chat available once session starts</p>
          )}
        </div>
      </div>
    );
  }}
</DashboardSection>


        <DashboardSection title="📚 Past Sessions" items={past}>
          {(s) => (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{s.gakusei?.name || "Unknown Gakusei"}</p>
                <p className="text-sm text-gray-600">
                  {new Date(s.startTime).toLocaleString()}
                </p>
              </div>
              <Badge color="gray" text={s.status || "Completed"} />
            </div>
          )}
        </DashboardSection>

        <DashboardSection title="❌ Rejected Requests" items={rejected}>
          {(s) => (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{s.gakusei?.name || "Unknown Gakusei"}</p>
                <p className="text-sm text-gray-600">
                  {new Date(s.preferredDate).toLocaleString()}
                </p>
              </div>
              <Badge color="red" text="Rejected" />
            </div>
          )}
        </DashboardSection>
      </div>
    </main>
  );
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white shadow p-5 rounded-xl text-center border">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-3xl font-bold mt-1 text-indigo-800">{value}</p>
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
    <section className="bg-white rounded-xl p-6 shadow-sm mb-10 border">
      <h2 className="text-xl font-semibold mb-4 text-indigo-700">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No records found.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item._id} className="bg-gray-50 p-4 rounded-md border hover:shadow transition">
              {children(item)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ActionButton({
  label,
  color,
  onClick,
}: {
  label: string;
  color: "green" | "red";
  onClick: () => void;
}) {
  const styles = {
    green: "bg-green-600 hover:bg-green-700",
    red: "bg-red-600 hover:bg-red-700",
  };
  return (
    <button
      onClick={onClick}
      className={`text-white px-4 py-1.5 rounded-md text-sm font-medium ${styles[color]}`}
    >
      {label}
    </button>
  );
}

function Badge({ text, color }: { text: string; color: "blue" | "gray" | "red" }) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-800",
    gray: "bg-gray-200 text-gray-800",
    red: "bg-red-200 text-red-800",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorMap[color]}`}>
      {text}
    </span>
  );
}
