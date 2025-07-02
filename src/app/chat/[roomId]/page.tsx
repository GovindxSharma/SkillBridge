"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // TODO: fetch previous messages
    // fetch(`/api/chat/messages?roomId=${roomId}`)
    //   .then(res => res.json())
    //   .then(data => setMessages(data.messages || []));
  }, [roomId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, content: input }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.message]);
        setInput("");
      } else {
        alert(data.error || "Failed to send");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="h-screen w-full bg-[#f8f9fb] flex justify-center items-center px-4 py-6">
      <div className="w-full max-w-3xl h-full bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b bg-white flex items-center justify-between">
          <h1 className="text-xl font-bold">💬 Chat Room</h1>
          <div className="flex gap-2 text-sm">
            <FeatureButton label="Send File" icon="📁" />
            <FeatureButton label="Whiteboard" icon="🖌️" />
            <FeatureButton label="Start Call" icon="📞" />
            <FeatureButton label="Share Screen" icon="📤" />
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50 space-y-3 scroll-smooth">
          {messages.length === 0 && (
            <div className="text-center mt-10 text-sm italic text-gray-400">
              👋 Welcome to the chat. Start messaging now.
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.isSelf ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg text-sm shadow ${
                  msg.isSelf
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                <p>{msg.content}</p>
                <p className="text-xs mt-1 opacity-70 text-right">
                  {new Date(msg.createdAt || Date.now()).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="p-4 border-t bg-white flex items-center gap-3">
          <input
            className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
          />
          <button
            onClick={handleSend}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}

function FeatureButton({ label, icon }: { label: string; icon: string }) {
  return (
    <button
      title={label}
      className="bg-gray-100 text-lg rounded px-2 py-1 hover:bg-gray-200 transition"
    >
      {icon}
    </button>
  );
}
