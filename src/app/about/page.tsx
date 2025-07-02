// app/about/page.tsx
import { BriefcaseIcon, GlobeAltIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

const features = [
  {
    icon: <BriefcaseIcon className="h-8 w-8 text-indigo-600" />,
    title: "Our Mission",
    desc: "To create a trusted learning ecosystem where learners and experts connect to unlock new opportunities through mentorship.",
  },
  {
    icon: <GlobeAltIcon className="h-8 w-8 text-indigo-600" />,
    title: "Global Vision",
    desc: "We envision a world where distance and background are no longer barriers to accessing high-quality mentorship.",
  },
  {
    icon: <AcademicCapIcon className="h-8 w-8 text-indigo-600" />,
    title: "Smart Learning",
    desc: "From AI-powered match-making to interactive learning tools — we empower learners to grow efficiently and meaningfully.",
  },
];

export default function AboutPage() {
  return (
    <section className="min-h-screen bg-white px-6 py-20 text-gray-800">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-indigo-700 mb-8">
          About SkillBridge
        </h1>

        <p className="text-lg text-center text-gray-600 max-w-3xl mx-auto mb-16">
          SkillBridge is a platform built to bridge the gap between knowledge seekers and experienced mentors. Whether you're looking to learn, teach, or grow professionally — we’re here to facilitate real, one-on-one guidance.
        </p>

        <div className="grid md:grid-cols-3 gap-10">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="bg-indigo-50 p-6 rounded-xl shadow-sm hover:shadow-md transition duration-200"
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold text-indigo-800 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Why Choose SkillBridge?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            SkillBridge empowers students (Gakusei) and mentors (Sensei) through a seamless platform offering verified sessions, secured payments, and advanced collaborative tools like whiteboards, file sharing, and more.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <span className="inline-block px-5 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              Verified Mentors
            </span>
            <span className="inline-block px-5 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              Secure Payments
            </span>
            <span className="inline-block px-5 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              AI-Powered Matching
            </span>
            <span className="inline-block px-5 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              Real-Time Collaboration Tools
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
