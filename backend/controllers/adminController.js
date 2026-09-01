const Admin = require("../models/Admin");
const Role = require("../models/Role");
const NavMenu = require("../models/NavMenu");
const AuditLog = require("../models/AuditLog");
const Consumer = require("../models/Consumer");
const bcrypt = require("bcrypt");

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await Admin.countDocuments();
    const activeUsers = await Admin.countDocuments({ isActive: true });
    const totalRoles = await Role.countDocuments();
    const totalMenus = await NavMenu.countDocuments();
    const activeMenus = await NavMenu.countDocuments({ isActive: true });
    const totalConsumers = await Consumer.countDocuments();

    res.json({
      totalUsers,
      activeUsers,
      totalRoles,
      totalMenus,
      activeMenus,
      totalConsumers
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    // Optionally add pagination here
    const logs = await AuditLog.find().sort({ createdAt: -1 }).populate("user", "name email");
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await Admin.findById(req.user.id).select("+password");

    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    
    // Create audit log for profile update
    await AuditLog.create({
      user: req.user.id,
      action: "UPDATE_PROFILE",
      targetId: user._id,
      after: { name: user.name, email: user.email } // don't log password!
    });

    res.json({ name: user.name, email: user.email });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ message: "Server error" });
  }
};
