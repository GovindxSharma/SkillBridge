import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const {
    query: { roomId },
    method,
  } = req;

  switch (method) {
    case "GET":
      try {
        const messages = await Message.find({ chatRoom: roomId })
          .sort({ createdAt: 1 })
          .populate("sender", "name"); // adjust based on your User model

        return res.status(200).json({ messages });
      } catch (err) {
        return res.status(500).json({ error: "Failed to fetch messages" });
      }

    default:
      return res.status(405).json({ error: "Method Not Allowed" });
  }
}
