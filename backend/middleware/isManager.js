function isManager(req, res, next) {
  // verifyToken runs before this middleware and attaches req.user: { id, role, roleId }
  if (!req.user || !["manager", "admin"].includes(req.user.role?.toLowerCase())) {
    return res.status(403).json({ message: "Manager or Admin access required" });
  }
  next();
}

module.exports = isManager;
