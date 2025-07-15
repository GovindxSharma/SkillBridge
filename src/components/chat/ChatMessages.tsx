"use client";
import Lottie from "lottie-react";
import typingAnimation from "@/animations/typing-indicator.json";

export default function ChatMessages({ messages, userId, typing, bottomRef }: {
  messages: any[];
  userId: string;
  typing: boolean;
  bottomRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="flex-1 px-4 py-4 space-y-3 bg-gray-50 custom-scrollbar overflow-y-auto">
      {messages.map((msg) => {
        const me = msg.sender === userId;
        const isFileMessage = msg.content.includes("::");
        const [filename, url] = msg.content.split("::");
        const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(filename);
        const isFile = /\.(zip|rar|7z|pdf|docx?|xlsx?)$/i.test(filename);

        return (
          <div key={msg._id} className={`flex ${me ? "justify-end" : "justify-start"} px-1`}>
            <div className={`flex flex-col items-${me ? "end" : "start"} space-y-1 max-w-[75%]`}>
              {isFileMessage && isImage && (
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <img src={url} alt={filename} className="rounded-xl max-w-[220px] max-h-[200px] object-contain" />
                </a>
              )}
              {isFileMessage && isFile && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white shadow text-sm border border-gray-200">
                  <span className="text-xl">📁</span>
                  <a href={url} target="_blank" rel="noopener noreferrer" download className="text-blue-600 font-medium underline truncate">
                    {filename}
                  </a>
                </div>
              )}
              {!isFileMessage && (
                <div className={`px-4 py-2 text-sm leading-snug shadow ${me ? "bg-blue-500 text-white rounded-2xl rounded-br-sm" : "bg-white text-gray-800 rounded-2xl rounded-bl-sm"}`}>
                  <p>{msg.content}</p>
                  <span className="block mt-1 text-xs text-right text-gray-300">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {typing && (
        <div className="flex items-center space-x-2">
          <div className="w-16 h-10">
            <Lottie animationData={typingAnimation} loop />
          </div>
          <span className="text-xs text-gray-500">Typing...</span>
        </div>
      )}
      <div ref={bottomRef}></div>
    </div>
  );
}
