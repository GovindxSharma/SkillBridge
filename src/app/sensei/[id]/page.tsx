"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function SenseiProfilePage() {
  const { id } = useParams();
  const [sensei, setSensei] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [hasConfirmedSession, setHasConfirmedSession] = useState(false);
  const [requestStatus, setRequestStatus] = useState<"none" | "pending" | "accepted" | "rejected">("none");
  const [canRequest, setCanRequest] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const senseiRes = await fetch(`/api/sensei/${id}`);
        const senseiData = await senseiRes.json();
        setSensei(senseiData?.sensei || null);

        const userRes = await fetch("/api/user/me");
        const userData = await userRes.json();

        if (userData?.user) {
          setUser(userData.user);

          // Confirmed session check
          const sessionRes = await fetch(
            `/api/sessions/check?userId=${userData.user._id}&senseiId=${id}`
          );
          const sessionData = await sessionRes.json();
          setHasConfirmedSession(sessionData?.confirmed || false);

          // Request status check
          const statusRes = await fetch("/api/sessions/request?senseiId=${id}", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senseiId: id }),
          });

          const statusData = await statusRes.json();
          setRequestStatus(statusData.status);

          if (
            statusData.status === "pending" ||
            statusData.status === "accepted" ||
            (statusData.status === "rejected" && statusData.hoursSince < 24)
          ) {
            setCanRequest(false);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    if (id) fetchInitialData();
  }, [id]);

  if (!sensei) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-50 text-gray-700">
        Loading profile...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#edf0ff] to-[#fefeff] py-12 px-4 text-black">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-indigo-100 p-8 md:p-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0 w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden ring-4 ring-indigo-200 shadow-lg border-2 border-indigo-300 mx-auto md:mx-0">
            <Image
              src={sensei.profileImage || "/Hero.png"}
              alt={sensei.name}
              width={200}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-indigo-700">{sensei.name}</h1>
            <p className="text-gray-600 text-sm">{sensei.experience || "Experience not provided"}</p>
            <p className="text-gray-700 leading-relaxed">{sensei.bio || "No bio available at the moment."}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-block bg-indigo-100 text-indigo-700 text-sm px-4 py-1 rounded-full font-medium shadow">
                ₹ {sensei.hourlyRate}/hr
              </span>
              <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                Verified Sensei
              </span>
            </div>

            <div className="mt-6 flex gap-4 flex-wrap">
              {/* Request Button */}
              {user ? (
                <button
                  disabled={!canRequest}
                  onClick={() => {
                    if (canRequest) {
                      window.location.href = `/sessions/request/${sensei._id}`;
                    }
                  }}
                  className={`px-6 py-3 rounded-xl font-medium shadow-md transition ${
                    canRequest
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {canRequest
                    ? "Request a Session"
                    : requestStatus === "pending"
                    ? "Request Pending"
                    : requestStatus === "accepted"
                    ? "Session Already Accepted"
                    : "Wait 24h to Re-request"}
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-block px-6 py-3 text-white bg-gray-400 hover:bg-gray-500 transition rounded-xl font-medium shadow-md"
                >
                  Login to Request
                </Link>
              )}

              {/* Chat Button */}
              <button
                disabled={!hasConfirmedSession}
                className={`px-6 py-3 rounded-xl font-medium border ${
                  hasConfirmedSession
                    ? "text-indigo-600 border-indigo-300 hover:border-indigo-500"
                    : "text-gray-400 border-gray-200 cursor-not-allowed"
                } transition`}
                onClick={() => {
                  if (hasConfirmedSession) {
                    window.location.href = `/chat?sensei=${sensei._id}`;
                  }
                }}
              >
                {hasConfirmedSession ? "Start Chat" : "Chat (Session Pending)"}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Reviews</h2>
          <p className="text-sm text-gray-500 italic">
            No reviews yet. Be the first to leave one after a session!
          </p>
        </div>
      </div>
    </main>
  );
}
