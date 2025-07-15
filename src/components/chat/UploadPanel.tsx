"use client";

export default function UploadPanel({ setSelectedFile, selectedFile, setActiveFeature, roomId, user }) {
  return (
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
  );
}
