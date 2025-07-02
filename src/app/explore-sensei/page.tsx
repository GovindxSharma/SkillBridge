"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useAuthUser from "@/hooks/useAuthUser";

export default function ExploreSenseiPage() {
  const { user, loading } = useAuthUser();
  const router = useRouter();

  const [senseis, setSenseis] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [showModal, setShowModal] = useState(false);

  // 🔒 Restrict route access to only gakusei and admin
  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast.error("Please login first");
        router.push("/auth/login");
      } else if (user.role === "sensei") {
        toast.error("Access denied");
        router.push("/");
      }
    }
  }, [loading, user, router]);

  // ✅ Fetch senseis only when user is authorized
  useEffect(() => {
    if (!loading && user && user.role !== "sensei") {
      const fetchSenseis = async () => {
        const res = await fetch("/api/sensei/all");
        const data = await res.json();
        setSenseis(data.senseis || []);
        setFiltered(data.senseis || []);
      };
      fetchSenseis();
    }
  }, [loading, user]);

  const handleSearch = () => {
    let result = [...senseis];
    if (search.trim()) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sort === "lowToHigh") result.sort((a, b) => a.hourlyRate - b.hourlyRate);
    else if (sort === "highToLow") result.sort((a, b) => b.hourlyRate - a.hourlyRate);

    setFiltered(result);
    setShowModal(false);
  };

  if (loading || !user || user.role === "sensei") {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f5f6fa] via-[#eef1f7] to-[#e4eaf5] py-16 px-4 text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-indigo-800 mb-12 font-heading">
          Find Your Perfect Sensei
        </h1>

        {/* Search & Filter Trigger */}
        <div className="flex justify-center mb-10">
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-yellow-500 text-white font-medium rounded-full shadow-md hover:shadow-lg hover:brightness-110 transition"
          >
            🔍 Search & Filter
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white/90 backdrop-blur-xl border-2 border-indigo-200 rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative ring-1 ring-white/10">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold text-black mb-6 text-center">
                Search Senseis
              </h2>

              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg shadow-inner text-sm focus:ring-2 focus:ring-indigo-500"
              />

              <div className="mb-6 flex flex-wrap gap-3 justify-center">
                {[
                  { label: "✨ Default", value: "default" },
                  { label: "⬇️ Low → High", value: "lowToHigh" },
                  { label: "⬆️ High → Low", value: "highToLow" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSort(option.value)}
                    className={`px-4 py-2 rounded-full text-sm border transition ${
                      sort === option.value
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-black border-gray-300 hover:bg-indigo-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-3 mb-4">
                {senseis
                  .filter((s) =>
                    s.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((s) => (
                    <Link
                      href={`/sensei/${s._id}`}
                      key={s._id}
                      onClick={() => setShowModal(false)}
                      className="flex items-center gap-4 border border-gray-200 rounded-lg px-4 py-2 bg-white/90 hover:bg-indigo-50 transition"
                    >
                      <Image
                        src={s.profileImage || "/profile.png"}
                        alt={s.name}
                        width={40}
                        height={40}
                        className="rounded-full border"
                      />
                      <div>
                        <p className="text-sm font-medium text-black">
                          {s.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ₹ {s.hourlyRate}/hr
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>

              <button
                onClick={handleSearch}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-yellow-500 text-white font-semibold hover:brightness-110 transition"
              >
                Search
              </button>
            </div>
          </div>
        )}

        {/* Final Result List */}
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            No mentors available currently.
          </p>
        ) : (
          <div className="grid gap-8">
            {filtered.map((sensei) => (
              <div
                key={sensei._id}
                className="bg-white border border-gray-200 rounded-3xl shadow-md hover:shadow-xl transition-all p-6 md:p-8 flex flex-col md:flex-row items-start gap-6"
              >
                <div className="relative w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-full border-4 border-indigo-300 shadow-md overflow-hidden ring-2 ring-indigo-100">
                  <Image
                    src={sensei.profileImage || "/profile.png"}
                    alt={sensei.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-black">
                    {sensei.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {sensei.experience || "No experience listed"}
                  </p>
                  <p className="text-gray-700 mt-3 text-sm leading-relaxed line-clamp-3">
                    {sensei.bio || "No bio available."}
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <span className="text-indigo-600 font-semibold text-sm bg-indigo-100 px-3 py-1 rounded-full">
                      ₹ {sensei.hourlyRate}/hr
                    </span>
                    <Link
                      href={`/sensei/${sensei._id}`}
                      className="mt-3 sm:mt-0 inline-block px-5 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow hover:from-indigo-600 hover:to-purple-700 transition"
                    >
                      View Profile →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
