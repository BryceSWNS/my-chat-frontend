import React from "react";

interface Props {
  text: string;
  isUser?: boolean;
}

export default function ChatBubble({ text, isUser }: Props) {
  return (
    <div
      className={`p-3 rounded-xl max-w-[80%] whitespace-pre-wrap ${
        isUser
          ? "bg-blue-600 text-white self-end"
          : "bg-gray-200 text-gray-800 self-start"
      }`}
    >
      {text}
    </div>
  );
}

