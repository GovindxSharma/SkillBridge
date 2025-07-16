"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import socket from "@/lib/socket";
import useAuthUser from "@/hooks/useAuthUser";
import Lottie from "lottie-react";
import typingAnimation from "@/animations/typing-indicator.json";
import { FiArrowLeft } from "react-icons/fi";

interface MessageType {
  _id: string;
  sender: string;
  content: string;
  createdAt: string;
}

type FeaturePanel = "upload" | "screen" | "call" | null;

export default function ChatRoom() {
  const { roomId } = useParams() as { roomId: string };
  const router = useRouter();
  const { user, loading } = useAuthUser();

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [activeFeature, setActiveFeature] = useState<FeaturePanel>(null);
  const [isReceivingScreen, setIsReceivingScreen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);

  const [callStream, setCallStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [screenEnded, setScreenEnded] = useState(false);


  useEffect(() => {
    if (!roomId || !user || loading) return;
  
    socket.connect();
    socket.emit("join-room", roomId);
    console.log("✅ Joined room:", roomId);
  
    // 📨 Chat & typing
    socket.on("chat-history", (hist: MessageType[]) => {
      console.log("📜 Chat history received:", hist);
      setMessages(hist);
    });
  
    socket.on("receive-message", (msg) => {
      console.log("📨 Message received:", msg);
      setMessages(prev => [...prev, msg]);
    });
  
    socket.on("typing", () => handleTyping(true));
    socket.on("stop-typing", () => handleTyping(false));
  
    // 📺 Receiving screen share offer
    socket.on("screen-offer", async ({ offer }) => {
      console.log("📺 Received screen offer");
  
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      peerRef.current = pc;
  
      pc.ontrack = (event) => {
        console.log("🎥 Received remote screen stream");
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setIsReceivingScreen(true);
        }
      };
  
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("📤 Sending ICE candidate (answerer)", event.candidate);
          socket.emit("ice-candidate", { roomId, candidate: event.candidate });
        }
      };
  
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
  
      console.log("📡 Emitting screen-answer");
      socket.emit("screen-answer", { roomId, answer });
    });
  
    // 📩 Receiving screen answer
    socket.on("screen-answer", async ({ answer }) => {
      console.log("📩 Received screen answer");
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("✅ Set remote description from screen-answer");
      }
    });
  
    // ❄️ Receiving ICE candidate
    socket.on("ice-candidate", async ({ candidate }) => {
      console.log("❄️ Received ICE candidate");
      if (peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("✅ ICE candidate added");
        } catch (err) {
          console.error("🚫 Failed to add ICE candidate:", err);
        }
      }
    });
  
    // 🛑 Stop screen sharing (from remote peer)
    socket.on("stop-screen", () => {
      console.log("🛑 Received stop-screen event");
    
      if (remoteVideoRef.current) {
        const videoEl = remoteVideoRef.current;
        videoEl.pause();
        videoEl.srcObject = null;
        videoEl.removeAttribute("src");
        videoEl.load();
      }
      
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
    
      setIsReceivingScreen(false);
      setScreenEnded(true); // 👈 NEW
    });
    
    
    
  
    return () => {
      socket.disconnect();
  
      socket.off("chat-history");
      socket.off("receive-message");
      socket.off("typing");
      socket.off("stop-typing");
      socket.off("screen-offer");
      socket.off("screen-answer");
      socket.off("ice-candidate");
      socket.off("stop-screen");
  
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
  
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
  
      setIsReceivingScreen(false);
    };
  }, [roomId, user, loading]);
  
  
  

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = (val: boolean) => {
    setTyping(val);
    clearTimeout(typingTimeout.current!);
    if (val) {
      typingTimeout.current = setTimeout(() => setTyping(false), 2000);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !user) return;
    socket.emit("send-message", { roomId, message: input.trim(), userId: user._id });
    setInput("");
    socket.emit("stop-typing", roomId);
  };

  const sendUploadedFile = async () => {
    if (!selectedFile || !user) return;
  
    const formData = new FormData();
    formData.append("file", selectedFile);
  
    try {
      const res = await fetch("/api/chat-upload", {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
  
      if (!data.secure_url) throw new Error("Upload failed");
  
      socket.emit("send-message", {
        roomId,
        message: `📎 ${selectedFile.name}::${data.secure_url}`,
        userId: user._id,
      });
  
      setSelectedFile(null);
      setActiveFeature(null);
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("File upload failed. Please try again.");
    }
  };
  
  const stopScreenShare = () => {
    screenStream?.getTracks().forEach(track => track.stop());
    setScreenStream(null);
  
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
  
    // Only clear if the viewer (receiver)
    if (isReceivingScreen && remoteVideoRef.current) {
      const videoEl = remoteVideoRef.current;
      videoEl.pause();
      videoEl.srcObject = null;
      videoEl.removeAttribute("src");
      videoEl.load();
    }
  
    socket.emit("stop-screen", { roomId });
  
    setIsReceivingScreen(false);
    setActiveFeature(null);
    setScreenEnded(true); // 👈 NEW
  };
  
  
  

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      console.log("🖥️ Got screen stream:", stream);
  
      // 👁️ Show my own shared screen locally
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        setIsReceivingScreen(true); // 👈 So the video element shows up
      }
  
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });
      peerRef.current = pc;
  
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      console.log("📹 Added screen tracks to RTCPeerConnection");
  
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("📤 Sending ICE candidate (offerer)", event.candidate);
          socket.emit("ice-candidate", { roomId, candidate: event.candidate });
        }
      };
  
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
  
      console.log("📡 Emitting screen-offer");
      socket.emit("screen-offer", { roomId, offer });
  
      setScreenStream(stream);
      setActiveFeature("screen");
  
      // 🛑 Stop screen sharing when user ends from browser
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        console.log("🚫 Screen sharing stopped by user");
        stopScreenShare(); // ✅ This will clean up everything
      });
    } catch (err) {
      console.error("❌ Screen share error:", err);
    }
  };
  
  
  

  const startVoiceCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setCallStream(stream);
      setCallStartTime(new Date());
      setActiveFeature("call");
    } catch (err) {
      console.error("Voice call error", err);
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

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleFeature = (feature: FeaturePanel) => {
    if (feature === "call") {
      if (callStream) stopVoiceCall();
      else startVoiceCall();
    } else if (feature === "screen") {
      if (screenStream) stopScreenShare();
      else startScreenShare();
    } else {
      setActiveFeature(prev => (prev === feature ? null : feature));
    }
  };

  if (loading) return null;
  if (!user) return <p className="p-6 text-center text-red-500">Unauthorized</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8 px-4">
    <div className="flex flex-col w-full max-w-4xl h-[90vh] bg-white shadow-xl rounded-xl overflow-hidden">
  
      {/* Header */}
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
  
      {/* Chat Area */}
      <div className="flex-1 px-6 py-5 space-y-5 bg-gray-50 custom-scrollbar overflow-y-auto">
      {messages.map((msg) => {
  const me = msg.sender === user._id;
  const isFileMessage = msg.content.includes("::");
  const [filename, url] = msg.content.split("::");

  const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(filename);
  const isFile = /\.(zip|rar|7z|pdf|docx?|xlsx?)$/i.test(filename);

  return (
    <div key={msg._id} className={`flex ${me ? "justify-end" : "justify-start"} px-2`}>
      <div className={`flex flex-col items-${me ? "end" : "start"} space-y-1 max-w-[70%]`}>
        
        {/* Image Display */}
        {isFileMessage && isImage && (
          <a href={url} target="_blank" rel="noopener noreferrer">
            <img
              src={url}
              alt={filename}
              className="rounded-xl max-w-[220px] max-h-[200px] object-contain"
            />
          </a>
        )}

        {/* File Display */}
        {isFileMessage && isFile && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow text-sm border border-gray-200">
            <span className="text-xl">📁</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="text-blue-600 font-medium underline truncate"
            >
              {filename}
            </a>
          </div>
        )}

        {/* Text Message */}
        {!isFileMessage && (
          <div className={`relative px-4  text-sm shadow ${
            me ? "bg-blue-500 text-white rounded-2xl rounded-br-sm" : "bg-white text-gray-800 rounded-2xl rounded-bl-sm"
          }`}>
            <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
            <span className="block mt-1 text-xs text-right text-gray-300">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
  

{/* Screen Viewer */}
<div
  className={`relative bg-black rounded-md overflow-hidden transition-all duration-300 ${
    isReceivingScreen ? "block" : "hidden"
  }`}
  style={{ resize: "both", overflow: "auto", minWidth: "200px", minHeight: "120px" }}
>
  <video
    ref={remoteVideoRef}
    autoPlay
    playsInline
    muted
    className={`w-full h-full object-contain pointer-events-none transition duration-300 ${
      screenEnded ? "opacity-30 grayscale" : ""
    }`}
  />
</div>


{/* Screen Sharing Banner (Only for Sharer) */}
{screenStream && activeFeature === "screen" && (
  <div className="flex justify-between items-center px-6 py-2 bg-yellow-100 text-yellow-800 text-sm border-t border-b border-yellow-300">
    <span>📡 You are sharing your screen</span>
    <button
      onClick={stopScreenShare}
      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
    >
      📴 Stop Sharing
    </button>
  </div>
)}
{screenEnded && (
  <div className="text-center mt-2 text-sm text-red-600 font-semibold">
    🔴 Screen sharing ended
  </div>
)}




  
      {/* Upload Panel */}
      {activeFeature === "upload" && (
        <div className="px-6 py-3 border-t bg-white">
          <label className="cursor-pointer bg-black text-white px-4 py-2 rounded-md inline-block hover:bg-gray-900 transition">
            Choose File
            <input
              type="file"
              accept=".zip,.rar,.7zip,application/zip,image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 50 * 1024 * 1024) {
                  alert("File too large. Max 50MB allowed.");
                  return;
                }
  
                setSelectedFile(file);
                const form = new FormData();
                form.append("file", file);
  
                try {
                  const res = await fetch("/api/chat-upload", {
                    method: "POST",
                    body: form,
                  });
  
                  const data = await res.json();
                  if (data.secure_url) {
                    const message = `${file.name}::${data.secure_url}`;
                    socket.emit("send-message", {
                      roomId,
                      message,
                      userId: user._id,
                    });
                  }
                } catch (err) {
                  alert("Failed to upload file");
                  console.error(err);
                }
  
                setSelectedFile(null);
                setActiveFeature(null);
              }}
            />
          </label>
        </div>
      )}
  
      {/* Voice Call Panel */}
      {activeFeature === "call" && callStream && (
        <div className="px-6 py-3 border-t bg-white text-sm text-gray-600 flex justify-between items-center">
          <div>🕒 Duration: {getCallDuration()}</div>
          <div className="flex gap-3">
            <button onClick={toggleMute} className="text-blue-600 hover:underline">
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button onClick={stopVoiceCall} className="text-red-600 hover:underline">End Call</button>
          </div>
        </div>
      )}
  
      {/* Footer */}
      <div className="px-6 py-4 bg-white border-t flex items-center space-x-3">
        <button onClick={() => toggleFeature("upload")} title="Upload File or Image">
          <img src="/data-sharing.png" alt="upload" className="w-6 h-6" />
        </button>
  
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
  
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          ➤
        </button>
      </div>
    </div>
  </div>
  
  
  

  );
}
