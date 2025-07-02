"use client";

import useAuthUser from "@/hooks/useAuthUser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, loading, mutate } = useAuthUser();
  const router = useRouter();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    experience: "",
    hourlyRate: "",
    profileImage: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        experience: user.experience || "",
        hourlyRate: user.hourlyRate?.toString() || "",
        profileImage: user.profileImage || "",
      });
    }
  }, [loading, router, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);
    setUploading(true);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Image uploaded!");
      setFormData((prev) => ({ ...prev, profileImage: data.secure_url }));
    } else {
      toast.error(data.error || "Upload failed");
    }
    setUploading(false);
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        name: formData.name,
        profileImage: formData.profileImage,
        ...(user?.role === "sensei" && {
          bio: formData.bio,
          experience: formData.experience,
          hourlyRate: Number(formData.hourlyRate) || 0,
        }),
      };

      const res = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("Profile updated!");
      setEditMode(false);

      // Refresh user data so UI updates with new profile image etc.
      await mutate();
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-gray-600 text-lg animate-pulse">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen text-black bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-md">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 rounded-full border-4 border-indigo-500 overflow-hidden mb-3">
            <Image
              src={formData.profileImage || "/profile.png"}
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>

          {editMode && (
            <div className="mb-4 w-full flex flex-col items-center gap-2">
              <label
                htmlFor="fileUpload"
                className="cursor-pointer bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-sm px-4 py-1.5 rounded shadow-sm transition duration-150"
              >
                Choose Profile Image
              </label>
              <input
                id="fileUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {uploading && (
                <p className="text-xs text-gray-500">Uploading...</p>
              )}
            </div>
          )}

          {editMode ? (
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="text-xl font-semibold text-gray-800 text-center bg-gray-100 rounded px-2 py-1"
            />
          ) : (
            <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
          )}
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className="mt-2 inline-block bg-indigo-100 text-indigo-600 text-xs px-3 py-1 rounded-full capitalize">
            {user.role}
          </span>
        </div>

        <div className="mt-6 space-y-3 text-sm text-gray-700">
          {/* Show these fields only if user is sensei */}
          {user.role === "sensei" && (
            <>
              <div>
                <label className="font-medium">Bio:</label>
                {editMode ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full mt-1 border p-2 rounded bg-gray-50"
                  />
                ) : (
                  <p>{user.bio || "—"}</p>
                )}
              </div>

              <div>
                <label className="font-medium">Experience:</label>
                {editMode ? (
                  <input
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full mt-1 border p-2 rounded bg-gray-50"
                  />
                ) : (
                  <p>{user.experience || "—"}</p>
                )}
              </div>

              <div>
                <label className="font-medium">Hourly Rate (₹):</label>
                {editMode ? (
                  <input
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    className="w-full mt-1 border p-2 rounded bg-gray-50"
                  />
                ) : (
                  <p>{user.hourlyRate ? `₹${user.hourlyRate}/hr` : "—"}</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          {editMode ? (
            <>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm mr-2"
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md text-sm"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
