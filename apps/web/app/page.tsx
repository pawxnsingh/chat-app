"use client";
import { useWebsocket } from "../context/wsProvider";
import classes from "./page.module.css";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const { sendMessage, messages } = useWebsocket();

  const handleSendMessage = () => {
    console.log("Sending messages: ", message);
    sendMessage(message);
    setMessage(""); // clear after sending the message
  };

  return (
    <div>
      <div>
        <input
          className={classes["chat-input"]}
          type="text"
          placeholder="type the message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <button className={classes["chat-button"]} onClick={handleSendMessage}>
          Send
        </button>
      </div>

      <div>
        <h1>All Message will appear here</h1>
        {messages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </div>
    </div>
  );
}
