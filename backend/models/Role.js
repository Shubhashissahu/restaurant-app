//models/role
const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: String
});

module.exports = mongoose.model("Role", roleSchema);