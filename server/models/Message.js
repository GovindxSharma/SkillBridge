const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatRoom: { type: String, required: true },
  sender: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, default: "text" },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
