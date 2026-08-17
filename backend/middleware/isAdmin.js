function isAdmin(req, res, next) {
  // verifyToken runs before this middleware and attaches the decoded
  // JWT payload to req.user, which includes `role` (see authController's jwt.sign)
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

module.exports = isAdmin;