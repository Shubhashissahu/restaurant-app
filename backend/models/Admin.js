
//models/Admin
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false }, // excluded from queries by default; opt in with .select("+password")
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true }
});

module.exports = mongoose.model("Admin", adminSchema);