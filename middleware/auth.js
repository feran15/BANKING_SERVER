const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
// console.log("AUTH HEADER RECEIVED BY BACKEND:", authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Make sure the token includes a user ID
    if (!decoded.id) {
      return res.status(401).json({ message: "Invalid token: no user ID found" });
    }

    req.user = decoded; // { id, email, iat, exp }
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// middleware/authMiddleware.js
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = { id: decoded.id }; // attach logged-in user ID
    next();
  });
}


module.exports = verifyToken;
