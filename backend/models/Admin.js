
//models/Admin
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }, // excluded from queries by default; opt in with .select("+password")
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    isActive: { type: Boolean, default: true },
    phone: { type: String, default: "" },
    department: { type: String, default: "Service" }, // e.g. Kitchen, Service, Bar, Floor, Cashier
    shift: { type: String, default: "Morning" }, // Morning, Evening, Night, Full Day
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);