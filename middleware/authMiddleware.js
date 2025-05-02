const jwt = require("jsonwebtoken");
function authenticateSocket(socket, next) {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Unauthorized"));
  try {
    const decoded = jwt.verify(token, "secret");
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
}
module.exports = { authenticateSocket };