//models/Rolemenuemapping
const mongoose = require("mongoose");

const mappingSchema = new mongoose.Schema({
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
  navMenu: { type: mongoose.Schema.Types.ObjectId, ref: "NavMenu", required: true },
  canView: { type: Boolean, default: true },
  canEdit: { type: Boolean, default: false }
});

// prevents duplicate role+menu pairs at the DB level, not just app logic
mappingSchema.index({ role: 1, navMenu: 1 }, { unique: true });

module.exports = mongoose.model("RoleMenuMapping", mappingSchema);