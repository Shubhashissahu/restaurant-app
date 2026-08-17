//controller/authcontroller
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Role = require("../models/Role");

exports.register = async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;

    if (!name || !email || !password || !roleId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
      return res.status(400).json({ message: "Invalid input format" });
    }

    const roleExists = await Role.findById(roleId);
    if (!roleExists) return res.status(400).json({ message: "Invalid role" });

    const existing = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email: email.trim(), password: hashed, role: roleId });

    res.status(201).json({ id: admin._id, email: admin.email });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: "Invalid input format" });
    }

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() })
      .select("+password") 
      .populate("role");

    if (!admin || !admin.role) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role.name, roleId: admin.role._id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, admin: { name: admin.name, email: admin.email, role: admin.role.name } });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};