const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    action: { type: String, required: true }, // e.g. "CREATE_ROLE", "UPDATE_ROLE", "DELETE_ROLE"
    targetId: { type: String, required: true },
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true } // gives you createdAt for free — you'll want this for any audit trail
);

module.exports = mongoose.model("AuditLog", auditLogSchema);