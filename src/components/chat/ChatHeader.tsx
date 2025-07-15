"use client";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

export default function ChatHeader({ toggleFeature }: { toggleFeature: (f: string) => void }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
      <button onClick={() => router.back()} className="hover:text-gray-100">
        <FiArrowLeft size={20} />
      </button>
      <h2 className="text-lg font-semibold text-center flex-1">Chat Room</h2>
      <div className="flex gap-4 items-center">
        <button onClick={() => toggleFeature("call")} title="Voice Call">
          <img src="/microphone.png" alt="voice" className="w-5 h-5" />
        </button>
        <button onClick={() => toggleFeature("screen")} title="Share Screen">
          <img src="/present.png" alt="screen share" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
