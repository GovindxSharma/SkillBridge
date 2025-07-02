"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const Loader = () => (
  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
);

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "gakusei",
    bio: "",
    experience: "",
    hourlyRate: "", // string, convert before sending
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectRole = (role: string) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        hourlyRate:
          formData.role === "sensei"
            ? Number(formData.hourlyRate) || 0
            : undefined,
      };

      // Remove confirmPassword from payload
      delete payload.confirmPassword;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
      } else {
        toast.success("Welcome, you're in!");
        router.push("/");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-black flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full space-y-6">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center font-heading">
          Create your account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 font-body">
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-lg text-sm"
          />
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-lg text-sm"
          />

          {/* Password Field with toggle */}
          <div className="relative">
            <input
              name="password"
              type={passwordVisible ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
              aria-label={passwordVisible ? "Hide password" : "Show password"}
            >
              {passwordVisible ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.958 9.958 0 013.181-7.199M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-1.054 0-2.068-.208-3.002-.594"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Confirm Password Field with toggle */}
          <div className="relative">
            <input
              name="confirmPassword"
              type={confirmPasswordVisible ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={clsx(
                "w-full px-4 py-3 border rounded-lg text-sm pr-10",
                passwordError ? "border-red-500" : "border-gray-300"
              )}
            />
            <button
              type="button"
              onClick={() =>
                setConfirmPasswordVisible(!confirmPasswordVisible)
              }
              className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
              aria-label={
                confirmPasswordVisible
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {confirmPasswordVisible ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.958 9.958 0 013.181-7.199M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-1.054 0-2.068-.208-3.002-.594"
                  />
                </svg>
              )}
            </button>
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>

          {/* Role Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Choose your role:</label>
            <div className="flex gap-4">
              {["gakusei", "sensei"].map((roleOption) => (
                <button
                  key={roleOption}
                  type="button"
                  onClick={() => selectRole(roleOption)}
                  className={clsx(
                    "flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all",
                    formData.role === roleOption
                      ? "bg-indigo-600 text-white border-indigo-600 shadow"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                  )}
                >
                  {roleOption === "gakusei" ? "🎓 Gakusei" : "🧑‍🏫 Sensei"}
                </button>
              ))}
            </div>
          </div>

          {/* Sensei Extra Fields */}
          {formData.role === "sensei" && (
            <div className="space-y-3">
              <textarea
                name="bio"
                placeholder="Your bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border rounded-lg text-sm"
              />
              <input
                name="experience"
                type="text"
                placeholder="Years of experience or short desc"
                value={formData.experience}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg text-sm"
              />
              <input
                name="hourlyRate"
                type="number"
                placeholder="Hourly Rate (in ₹)"
                value={formData.hourlyRate}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg text-sm"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader /> Creating...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="text-sm text-center text-gray-500 font-body">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-indigo-600 hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
