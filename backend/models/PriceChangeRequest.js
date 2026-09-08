const mongoose = require("mongoose");

const priceChangeRequestSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    dishName: {
      type: String,
      required: true,
      trim: true,
    },
    dishImage: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "Main Course",
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    requestedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      trim: true,
      default: "",
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    requestedByName: {
      type: String,
      default: "Store Manager",
    },
    requestedByEmail: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    reviewedByName: {
      type: String,
      default: "",
    },
    reviewNote: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PriceChangeRequest", priceChangeRequestSchema);
