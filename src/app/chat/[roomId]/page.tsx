"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import socket from "@/lib/socket";
import useAuthUser from "@/hooks/useAuthUser";
import Lottie from "lottie-react";
import typingAnimation from "@/animations/typing-indicator.json";
import { FiArrowLeft } from "react-icons/fi";

type FeaturePanel = "upload" | "screen" | "call" | null;

export default function ChatRoom() {
  const { roomId } = useParams() as { roomId: string };
  const router = useRouter();
  const { user, loading } = useAuthUser();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [activeFeature, setActiveFeature] = useState<FeaturePanel>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [otherEnded, setOtherEnded] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const senderVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);

  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isReceivingScreen, setIsReceivingScreen] = useState(false);

  const [callStream, setCallStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!roomId || !user || loading) return;

    socket.connect();
    socket.emit("join-room", roomId);

    socket.on("chat-history", setMessages);
    socket.on("receive-message", msg => setMessages(prev => [...prev, msg]));
    socket.on("typing", () => handleTyping(true));
    socket.on("stop-typing", () => handleTyping(false));
    socket.on("incoming-call", () => setIncomingCall(true));
    socket.on("chat-ended", () => setOtherEnded(true));

    return () => {
      socket.disconnect();
      socket.off("chat-history");
      socket.off("receive-message");
      socket.off("typing");
      socket.off("stop-typing");
      socket.off("incoming-call");
      socket.off("chat-ended");
    };
  }, [roomId, user, loading]);

  const handleTyping = (val: boolean) => {
    setTyping(val);
    clearTimeout(typingTimeout.current!);
    if (val) {
      typingTimeout.current = setTimeout(() => setTyping(false), 2000);
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || !user) return;

    if (selectedFile) {
      const form = new FormData();
      form.append("file", selectedFile);
      try {
        const res = await fetch("/api/chat-upload", { method: "POST", body: form });
        const data = await res.json();
        if (!data.secure_url) throw new Error("Upload failed");
        socket.emit("send-message", {
          roomId,
          message: `${selectedFile.name}::${data.secure_url}`,
          userId: user._id,
        });
      } catch (err) {
        alert("Upload failed");
      } finally {
        setSelectedFile(null);
        setActiveFeature(null);
      }
    }

    if (input.trim()) {
      socket.emit("send-message", { roomId, message: input.trim(), userId: user._id });
    }

    setInput("");
    socket.emit("stop-typing", roomId);
  };

  const endChat = () => {
    setChatEnded(true);
    socket.emit("chat-ended", { roomId });
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleFeature = (feature: FeaturePanel) => {
    if (feature === "call") {
      if (callStream) stopVoiceCall();
      else {
        startVoiceCall();
        socket.emit("incoming-call", { roomId });
      }
    } else if (feature === "screen") {
      alert("Screen sharing is temporarily disabled.");
      return;
    } else {
      setActiveFeature(prev => (prev === feature ? null : feature));
    }
  };

  const startVoiceCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setCallStream(stream);
      setCallStartTime(new Date());
      setActiveFeature("call");
    } catch {
      alert("Microphone access denied.");
    }
  };

  const stopVoiceCall = () => {
    callStream?.getTracks().forEach(track => track.stop());
    setCallStream(null);
    setCallStartTime(null);
    setActiveFeature(null);
  };

  const toggleMute = () => {
    if (!callStream) return;
    callStream.getAudioTracks().forEach(track => (track.enabled = isMuted));
    setIsMuted(prev => !prev);
  };

  const getCallDuration = () => {
    if (!callStartTime) return "00:00";
    const now = new Date();
    const diff = Math.floor((now.getTime() - callStartTime.getTime()) / 1000);
    const mins = String(Math.floor(diff / 60)).padStart(2, "0");
    const secs = String(diff % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  if (loading) return null;
  if (!user) return <p className="text-center py-6">Unauthorized</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-6 px-4">
      <div className="w-full max-w-4xl h-[90vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between bg-blue-600 text-white px-6 py-4">
          <button onClick={() => router.back()}><FiArrowLeft /></button>
          <h2 className="text-lg font-semibold">Chat Room</h2>
          <div className="flex gap-3">
            <button onClick={() => toggleFeature("call")}><img src="/microphone.png" className="w-5 h-5" /></button>
            <button onClick={() => toggleFeature("screen")}><img src="/present.png" className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 px-6 py-5 space-y-4 overflow-y-auto bg-gray-50 custom-scrollbar">
          {messages.map((msg) => {
            const me = msg.sender === user._id;
            const [filename, url] = msg.content.includes("::") ? msg.content.split("::") : [null, null];
            const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(filename || "");
            const isFile = /\.(zip|rar|7z|pdf|docx?|xlsx?)$/i.test(filename || "");

            return (
              <div key={msg._id} className={`flex ${me ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[70%] space-y-1">
                  {filename && isImage && (
                    <a onClick={() => setModalImage(url)} className="cursor-zoom-in">
                      <img src={url} alt={filename} className="rounded-md max-w-[200px]" />
                    </a>
                  )}
                  {filename && isFile && (
                    <a href={url} download className="text-blue-600 underline truncate block">{filename}</a>
                  )}
                  {!filename && (
                    <div className={`px-4 py-2 rounded-lg text-sm shadow ${me ? "bg-blue-500 text-white" : "bg-white text-gray-800"}`}>
                      <p>{msg.content}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {typing && (
            <div className="flex items-center space-x-2">
              <Lottie animationData={typingAnimation} loop className="w-14 h-10" />
              <span className="text-xs text-gray-500">Typing…</span>
            </div>
          )}
          <div ref={bottomRef}></div>
        </div>

        {/* Upload Panel */}
        {activeFeature === "upload" && (
          <div className="px-6 py-3 bg-white border-t">
            <label className="cursor-pointer bg-black text-white px-4 py-2 rounded-md inline-block hover:bg-gray-800 transition">
              {selectedFile ? selectedFile.name : "Choose File"}
              <input
                type="file"
                accept=".zip,.rar,.7z,image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 50 * 1024 * 1024) {
                    alert("Max 50MB allowed.");
                    return;
                  }
                  setSelectedFile(file);
                }}
              />
            </label>
          </div>
        )}

        {/* Voice Call Panel */}
        {activeFeature === "call" && callStream && (
          <div className="px-6 py-3 bg-white border-t flex justify-between items-center text-sm">
            <div>🕒 {getCallDuration()}</div>
            <div className="flex gap-3">
              <button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</button>
              <button onClick={stopVoiceCall} className="text-red-600">End</button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t flex items-center gap-3">
          <button onClick={() => toggleFeature("upload")}><img src="/data-sharing.png" className="w-6 h-6" /></button>
          {!chatEnded && !otherEnded ? (
            <>
              <textarea
                rows={1}
                className="flex-1 text-sm bg-gray-100 p-2 rounded-md resize-none focus:ring-2 focus:ring-blue-400"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  socket.emit("typing", roomId);
                }}
                onBlur={() => socket.emit("stop-typing", roomId)}
                onKeyDown={onKey}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                ➤
              </button>
              <button
                onClick={endChat}
                className="bg-red-500 text-white px-3 py-2 rounded-md text-xs"
              >
                End Chat
              </button>
            </>
          ) : (
            <div className="text-center text-gray-500 text-sm py-4 w-full">
              Chat has ended.
            </div>
          )}
        </div>

        {/* Image Modal */}
        {modalImage && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50" onClick={() => setModalImage(null)}>
            <img src={modalImage} className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-xl" />
          </div>
        )}

        {/* Incoming Call Popup */}
        {incomingCall && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-lg font-semibold mb-4">Incoming Call</h2>
              <div className="flex gap-4 justify-center">
                <button onClick={() => { startVoiceCall(); setIncomingCall(false); }} className="bg-green-500 text-white px-4 py-2 rounded">Accept</button>
                <button onClick={() => setIncomingCall(false)} className="bg-red-500 text-white px-4 py-2 rounded">Reject</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
