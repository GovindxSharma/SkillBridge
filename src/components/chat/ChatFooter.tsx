"use client";

import { useEffect } from "react";

interface Props {
  input: string;
  setInput: (v: string) => void;
  sendMessage: () => void;
  onKey: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  toggleFeature: (f: string) => void;
  socket: any;
  roomId: string;
  activeFeature: string | null;
  selectedFile: File | null;
  handleFileUpload: () => void;
}

export default function ChatFooter({
  input,
  setInput,
  sendMessage,
  onKey,
  toggleFeature,
  socket,
  roomId,
  activeFeature,
  selectedFile,
  handleFileUpload,
}: Props) {
  // Automatically send file on Enter if in upload mode
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && activeFeature === "upload" && selectedFile) {
        e.preventDefault();
        handleFileUpload();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeFeature, selectedFile, handleFileUpload]);

  const handleSend = () => {
    if (activeFeature === "upload" && selectedFile) {
      handleFileUpload();
      return;
    }

    if (input.trim()) {
      sendMessage();
    }
  };

  return (
    <div className="px-6 py-4 bg-white border-t flex items-center space-x-3">
      {/* Upload Button */}
      <button onClick={() => toggleFeature("upload")} title="Upload File or Image">
        <img src="/data-sharing.png" alt="upload" className="w-6 h-6" />
      </button>

      {/* Message Input */}
      <textarea
        rows={1}
        className="flex-1 p-2 text-base text-gray-800 bg-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Type a message…"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          socket.emit("typing", roomId);
        }}
        onBlur={() => socket.emit("stop-typing", roomId)}
        onKeyDown={onKey}
      />

      {/* Send Button */}
      <button
        onClick={handleSend}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
      >
        ➤
      </button>
    </div>
  );
}
