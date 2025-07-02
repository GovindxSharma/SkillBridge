// src/components/ui/Loader.tsx
import React from "react";

export default function Loader() {
  return (
    <div className="flex justify-center">
      <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
