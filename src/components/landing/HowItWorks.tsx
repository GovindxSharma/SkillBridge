// src/components/HowItWorks.tsx
import { howItWorks } from "@/lib/data";

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white text-center border-t border-gray-200">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-16">
      How It Works
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto px-6">
        {howItWorks.map((step, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-8 shadow-md hover:shadow-2xl border border-gray-100 transition-all text-left"
          >
            <div className="w-12 h-12 mb-4 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-heading text-lg font-bold">
              {idx + 1}
            </div>
            <h3 className="text-xl font-semibold text-indigo-700 font-heading mb-3">
              Step {idx + 1}
            </h3>
            <p className="text-gray-800 leading-relaxed font-body text-base">
              {step}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
