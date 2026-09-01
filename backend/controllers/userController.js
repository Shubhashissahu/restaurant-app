const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const AuditLog = require("../models/AuditLog");

exports.getUsers = async (req, res) => {
  try {
    const users = await Admin.find().populate("role").select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;
    
    if (!name || !email || !password || !roleId) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await Admin.create({ name, email, password: hashed, role: roleId });
    
    await AuditLog.create({
      user: req.user.id,
      action: "CREATE_USER",
      targetId: user._id,
      after: { name, email, role: roleId }
    });

    const populatedUser = await Admin.findById(user._id).populate("role").select("-password");
    res.status(201).json(populatedUser);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, roleId } = req.body;

    const user = await Admin.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const before = { name: user.name, email: user.email, role: user.role };

    user.name = name || user.name;
    user.email = email || user.email;
    if (roleId) user.role = roleId;
    
    await user.save();

    await AuditLog.create({
      user: req.user.id,
      action: "UPDATE_USER",
      targetId: user._id,
      before,
      after: { name: user.name, email: user.email, role: user.role }
    });

    const populatedUser = await Admin.findById(user._id).populate("role").select("-password");
    res.json(populatedUser);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Admin.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot deactivate yourself" });
    }

    const before = { isActive: user.isActive };
    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      user: req.user.id,
      action: "TOGGLE_USER_STATUS",
      targetId: user._id,
      before,
      after: { isActive: user.isActive }
    });

    const populatedUser = await Admin.findById(user._id).populate("role").select("-password");
    res.json(populatedUser);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
