"use client";

import Link from "next/link";
import useAuthUser from "@/hooks/useAuthUser";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { user, loading } = useAuthUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dashboardPath = user ? `/${user.role}/dashboard` : "#";

  return (
    <header className="flex justify-between items-center px-6 py-4 shadow bg-white">
      {/* Logo */}
      <Link href="/" className="text-2xl font-bold text-blue-600">
        SkillBridge
      </Link>

      {/* Public Links */}
      <nav className="hidden md:flex space-x-6 text-gray-700">
        <Link href="/">Home</Link>
        {(!user || user.role === "gakusei" || user.role === "admin") && (
          <Link href="/explore-sensei">Explore</Link>
        )}
        <Link href="/blogs">Blog</Link>
        <Link href="/about">About</Link>
      </nav>

      {/* Auth Area */}
      {loading ? (
        <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
      ) : user ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
          >
            <span>{user.name.split(" ")[0]}</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border z-50">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </Link>
              <Link
                href={dashboardPath}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-x-3">
          <Link href="/auth/login" className="text-sm text-blue-600">
            Login
          </Link>
          <Link
            href="/auth/register"
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
