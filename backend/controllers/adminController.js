const Admin = require("../models/Admin");
const Role = require("../models/Role");
const NavMenu = require("../models/NavMenu");
const AuditLog = require("../models/AuditLog");
const Consumer = require("../models/Consumer");
const MenuItem = require("../models/MenuItem");
const PriceChangeRequest = require("../models/PriceChangeRequest");
const Notification = require("../models/Notification");
const bcrypt = require("bcrypt");

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await Admin.countDocuments();
    const activeUsers = await Admin.countDocuments({ isActive: true });
    const totalRoles = await Role.countDocuments();
    const totalMenus = await NavMenu.countDocuments();
    const activeMenus = await NavMenu.countDocuments({ isActive: { $ne: false } });
    const consumers = await Consumer.find();
    const totalReservedTables = consumers.length;
    const totalGuestsReserved = consumers.reduce((acc, c) => acc + (Number(c.guests) || 2), 0);
    const confirmedReservations = consumers.filter(
      (c) => (c.status || "Confirmed").toLowerCase() === "confirmed"
    ).length;
    const totalMenuItems = await MenuItem.countDocuments();
    const pendingPriceRequests = await PriceChangeRequest.countDocuments({ status: "Pending" });

    res.json({
      totalUsers,
      activeUsers,
      totalRoles,
      totalMenus,
      activeMenus,
      totalConsumers: totalReservedTables,
      totalReservedTables,
      totalGuestsReserved,
      confirmedReservations,
      totalMenuItems,
      pendingPriceRequests,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await Admin.findById(req.user.id).populate("role", "name").select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    // Optionally add pagination here
    const logs = await AuditLog.find().sort({ createdAt: -1 }).populate("user", "name email");
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await Admin.findById(req.user.id).select("+password");

    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    
    // Create audit log for profile update
    await AuditLog.create({
      user: req.user.id,
      action: "UPDATE_PROFILE",
      targetId: user._id,
      after: { name: user.name, email: user.email } // don't log password!
    });

    res.json({ name: user.name, email: user.email });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/price-requests - List price change requests
exports.getPriceRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const requests = await PriceChangeRequest.find(filter)
      .populate("menuItem", "name category image imageUrl price status isAvailable")
      .populate("requestedBy", "name email")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("Error fetching price requests for admin:", err);
    res.status(500).json({ message: "Failed to fetch price change requests", error: err.message });
  }
};

// PATCH /api/admin/price-requests/:id/approve - Approve price change and update dish price
exports.approvePriceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await PriceChangeRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Price change request not found" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        message: `Request is already ${request.status.toLowerCase()} and cannot be modified.`,
      });
    }

    const menuItem = await MenuItem.findById(request.menuItem);
    if (!menuItem) {
      return res.status(404).json({ message: "Target menu item not found" });
    }

    const oldPrice = menuItem.price;
    menuItem.price = request.requestedPrice;
    await menuItem.save();

    request.status = "Approved";
    request.reviewedBy = req.user.id;
    request.reviewedByName = req.user.name || "Administrator";
    request.reviewNote = req.body.note ? req.body.note.trim() : "Approved by Administrator";
    request.reviewedAt = new Date();
    await request.save();

    // Audit Log
    await AuditLog.create({
      user: req.user.id,
      action: "ADMIN_APPROVED_PRICE_CHANGE",
      targetId: String(menuItem._id),
      before: { price: oldPrice, dishName: menuItem.name },
      after: {
        price: menuItem.price,
        dishName: menuItem.name,
        requestId: request._id,
        requestedBy: request.requestedByName,
      },
    });

    // Notify the requesting manager
    if (request.requestedBy) {
      await Notification.create({
        recipient: request.requestedBy,
        type: "PRICE_CHANGE_APPROVED",
        title: "Your Request Approved! 🎉",
        message: `Your price change request for "${menuItem.name}" (₹${oldPrice} → ₹${menuItem.price}) has been approved by ${req.user.name || "Administrator"}. The new price is now live on the menu!`,
        relatedId: String(request._id),
        dishName: menuItem.name,
        oldPrice,
        newPrice: menuItem.price,
        status: "unread",
      });
    }

    res.json({
      message: `Price for "${menuItem.name}" approved and updated to ₹${menuItem.price}`,
      request,
      menuItem,
    });
  } catch (err) {
    console.error("Error approving price request:", err);
    res.status(500).json({ message: "Failed to approve price request", error: err.message });
  }
};

// PATCH /api/admin/price-requests/:id/reject - Reject price change
exports.rejectPriceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await PriceChangeRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Price change request not found" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        message: `Request is already ${request.status.toLowerCase()} and cannot be modified.`,
      });
    }

    request.status = "Rejected";
    request.reviewedBy = req.user.id;
    request.reviewedByName = req.user.name || "Administrator";
    request.reviewNote = req.body.note
      ? req.body.note.trim()
      : req.body.reviewNote
      ? req.body.reviewNote.trim()
      : "Rejected by Administrator";
    request.reviewedAt = new Date();
    await request.save();

    // Audit Log
    await AuditLog.create({
      user: req.user.id,
      action: "ADMIN_REJECTED_PRICE_CHANGE",
      targetId: String(request.menuItem),
      before: { requestedPrice: request.requestedPrice, dishName: request.dishName },
      after: { status: "Rejected", note: request.reviewNote },
    });

    // Notify the requesting manager
    if (request.requestedBy) {
      await Notification.create({
        recipient: request.requestedBy,
        type: "PRICE_CHANGE_REJECTED",
        title: "Price Change Request Rejected",
        message: `Your price change request for "${request.dishName}" to ₹${request.requestedPrice} was rejected. Reason: ${request.reviewNote}`,
        relatedId: String(request._id),
        dishName: request.dishName,
        oldPrice: request.currentPrice,
        newPrice: request.requestedPrice,
        status: "unread",
      });
    }

    res.json({
      message: `Price change request for "${request.dishName}" has been rejected`,
      request,
    });
  } catch (err) {
    console.error("Error rejecting price request:", err);
    res.status(500).json({ message: "Failed to reject price request", error: err.message });
  }
};
