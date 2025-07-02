import Image from 'next/image';
import Link from 'next/link'; // ← Import Link

// components/Hero.tsx
export default function Hero() {
  return (
    <section className="bg-white py-20 px-6 md:px-16 lg:px-32">
      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-12">
        
        {/* Left: Text Content */}
        <div className="text-center md:text-left max-w-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Peer learning & <br /> mentorship
          </h1>
          <p className="text-gray-700 text-lg mb-8">
            Master new skills with expert mentors and grow faster with real guidance and support.
          </p>
          <Link href="/explore-sensei">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-lg transition">
              Explore Mentors
            </button>
          </Link>
        </div>

        {/* Right: Hero Image */}
        <div className="w-full md:w-1/2 lg:w-[550px] relative h-[350px] md:h-[450px] lg:h-[500px]">
          <Image
              src="/Hero.png"
              alt="Mentorship illustration"
              fill
              className="object-contain"
              priority
          />
        </div>
      </div>
    </section>
  );
}
