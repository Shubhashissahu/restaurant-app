const mongoose = require("mongoose");

const navMenuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    path: { type: String, trim: true, default: "" },
    icon: { type: String, default: "" }, // string identifier for lucide-react icons
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "NavMenu", default: null }, // for hierarchy
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NavMenu", navMenuSchema);
