"use client";

export default function VoiceCallPanel({
  getCallDuration,
  toggleMute,
  stopVoiceCall,
  isMuted,
}: {
  getCallDuration: () => string;
  toggleMute: () => void;
  stopVoiceCall: () => void;
  isMuted: boolean;
}) {
  return (
    <div className="px-6 py-3 border-t bg-white text-sm text-gray-600 flex justify-between items-center">
      <div>🕒 Duration: {getCallDuration()}</div>
      <div className="flex gap-3">
        <button onClick={toggleMute} className="text-blue-600 hover:underline">
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <button onClick={stopVoiceCall} className="text-red-600 hover:underline">End Call</button>
      </div>
    </div>
  );
}
