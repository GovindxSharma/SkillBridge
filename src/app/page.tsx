// src/app/page.tsx
import Hero from "@/components/landing/Hero";
import Benefits from "@/components/landing/Benefits";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import CTAButtons from "@/components/landing/CTAButtons";

export default function Home() {
  return (
    <main>
      <Hero />
      <Benefits />
      <HowItWorks />
      <Testimonials />
      <CTAButtons />
    </main>
  );
}
