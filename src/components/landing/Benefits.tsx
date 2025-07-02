// src/components/Benefits.tsx
import { benefits } from "@/lib/data";

export default function Benefits() {
  return (
    <section className="py-24 bg-gray-50 text-center border-t border-gray-200">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-16">
        Why SkillBridge?
      </h2>
      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-left hover:shadow-xl transition">
          <h3 className="text-2xl font-semibold text-indigo-600 mb-6">
            For Sensei
          </h3>
          <ul className="space-y-4 text-gray-700 leading-relaxed">
            {benefits.sensei.map((point, idx) => (
              <li
                key={idx}
                className="border-l-4 border-indigo-500 pl-4 font-medium"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-left hover:shadow-xl transition">
          <h3 className="text-2xl font-semibold text-indigo-600 mb-6">
            For Gakusei
          </h3>
          <ul className="space-y-4 text-gray-700 leading-relaxed">
            {benefits.gakusei.map((point, idx) => (
              <li
                key={idx}
                className="border-l-4 border-indigo-500 pl-4 font-medium"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
