"use client";
import { useRef, useEffect } from "react";

export default function ScreenViewer({ isReceiving }: { isReceiving: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={`w-full max-h-64 bg-black rounded-md transition-all duration-300 ${isReceiving ? "block" : "hidden"}`}
    />
  );
}
