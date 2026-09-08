const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["PRICE_CHANGE_APPROVED", "PRICE_CHANGE_REJECTED", "GENERAL"],
      default: "PRICE_CHANGE_APPROVED",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedId: {
      type: String,
      default: "",
    },
    dishName: {
      type: String,
      default: "",
    },
    oldPrice: {
      type: Number,
    },
    newPrice: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
