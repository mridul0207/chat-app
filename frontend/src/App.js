import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000", {
  auth: { token: localStorage.getItem("token") },
});
function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    socket.on("receive-message", (msg) => setChat((prev) => [...prev, msg]));
    socket.on("online-users", (users) => setOnlineUsers(users));
    socket.on("typing", () => setTyping(true));
    socket.on("stop-typing", () => setTyping(false));
  }, []);

  const sendMessage = () => {
    const msg = { to: "targetUserId", message, timestamp: new Date() };
    socket.emit("send-message", msg);
    setChat([...chat, { from: "me", ...msg }]);
    setMessage("");
  };

  const handleTyping = () => {
    socket.emit("typing", { to: "targetUserId" });
    setTimeout(() => socket.emit("stop-typing", { to: "targetUserId" }), 2000);
  };
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Chat App</h1>
      <div>Online: {onlineUsers.join(", ")}</div>
      <div className="border p-2 h-60 overflow-auto">
        {chat.map((c, i) => (
          <div key={i}>
            <b>{c.from === "me" ? "You" : c.from}:</b> {c.message} <i>{new Date(c.timestamp).toLocaleTimeString()}</i>
          </div>
        ))}
        {typing && <div><i>Someone is typing...</i></div>}
      </div>
      <input
        className="border p-1 w-full"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleTyping}
      />
      <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-1 mt-2">Send</button>
    </div>
  );
}

export default App;
