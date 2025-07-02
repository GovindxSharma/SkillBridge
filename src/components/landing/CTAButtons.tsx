// src/components/CTAButtons.tsx
export default function CTAButtons() {
    return (
      <section className="py-12 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Learn or Teach?</h2>
        <p className="mb-6">Join SkillBridge today and start your journey</p>
        <div className="flex justify-center gap-4">
          <a href="/signup" className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold">
            Sign Up
          </a>
          <a href="/login" className="px-6 py-3 border border-white rounded-lg font-semibold">
            Log In
          </a>
        </div>
      </section>
    );
  }
  