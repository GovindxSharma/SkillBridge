"use client";

import React from "react";
import Link from "next/link";

const blogs = [
  {
    id: 1,
    title: "Why Mentorship Matters in 2025",
    description:
      "Discover how a mentor can accelerate your career, provide clarity, and help you make smarter decisions in your academic and professional journey.",
    author: "SkillBridge Team",
    date: "June 26, 2025",
  },
  {
    id: 2,
    title: "Top Skills in Demand: What to Learn Next",
    description:
      "Explore the most in-demand technical and soft skills employers are looking for — and how you can start mastering them today.",
    author: "Career Experts",
    date: "June 18, 2025",
  },
  {
    id: 3,
    title: "How to Prepare for Remote Interviews",
    description:
      "Step-by-step guidance on acing virtual interviews with confidence — from setting up your space to mastering common questions.",
    author: "Recruitment Specialists",
    date: "June 10, 2025",
  },
];

export default function BlogsPage() {
  return (
    <section className="min-h-screen bg-gray-50 py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">SkillBridge Blogs</h1>
        <p className="text-gray-600 text-lg mb-12">
          Thoughtful insights, career tips, and mentorship advice to help you grow.
        </p>

        <div className="space-y-8 text-left">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white shadow-md rounded-lg p-6 border border-gray-100 hover:shadow-lg transition"
            >
              <h2 className="text-2xl font-semibold text-indigo-700 mb-2">{blog.title}</h2>
              <p className="text-gray-600 mb-3">{blog.description}</p>
              <div className="text-sm text-gray-500 flex justify-between items-center">
                <span>By {blog.author}</span>
                <span>{blog.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <Link
            href="/"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md text-sm hover:bg-indigo-700 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
