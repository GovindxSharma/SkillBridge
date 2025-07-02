// src/components/Testimonials.tsx
import { testimonials } from "@/lib/data";

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-50 text-center border-t border-gray-200">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-16">
      What Our Users Say
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto px-6">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="bg-white p-8 rounded-3xl shadow-md hover:shadow-xl transition-all text-left border border-gray-100"
          >
            <p className="text-lg text-gray-800 italic leading-relaxed font-body mb-6">
              “{t.feedback}”
            </p>
            <div className="font-heading text-xl font-semibold text-indigo-700">
              {t.name}
            </div>
            <div className="text-sm text-gray-500 font-body">{t.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
