import React, { useState } from "react";
import ChatBubble from "./components/ChatBubble";

const BACKEND_URL = "https://gemini-backend-870201345013.asia-east1.run.app/chat";

export default function App() {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("flash");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input && !image) return;

    const userMsg = input || "[图片]";
    setMessages((prev) => [...prev, { text: userMsg, isUser: true }]);

    const formData = new FormData();
    formData.append("message", input);
    formData.append("model", model);

    if (image) {
      formData.append("images", image);
    }

    setLoading(true);
    setInput("");

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.body) {
        throw new Error("No stream returned");
      }

      const reader = response.body.getReader();
      let aiText = "";

      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        aiText += decoder.decode(value);

        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && !last.isUser) {
            last.text = aiText;
            return [...prev];
          }
          return [...prev, { text: aiText, isUser: false }];
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { text: "❌ 出错了，请稍后再试。", isUser: false },
      ]);
    }

    setLoading(false);
    setImage(null);
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      {/* 模型选择 */}
      <div className="flex gap-4 items-center">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="flash">🚀 Gemini Flash 2.5</option>
          <option value="pro">💎 Gemini 3 Pro</option>
        </select>
      </div>

      {/* 聊天窗口 */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl p-4 flex flex-col gap-3 shadow-inner">
        {messages.map((m, idx) => (
          <ChatBubble key={idx} text={m.text} isUser={m.isUser} />
        ))}

        {loading && <div className="text-gray-500">AI 正在思考...</div>}
      </div>

      {/* 输入与发送 */}
      <div className="flex items-center gap-3">
        <input
          type="file"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="border rounded-lg"
        />

        <input
          className="flex-1 p-3 border rounded-xl"
          placeholder="输入消息..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          发送
        </button>
      </div>
    </div>
  );
}
