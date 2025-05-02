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
    <div className="App">
      
    </div>
  );
}

export default App;
