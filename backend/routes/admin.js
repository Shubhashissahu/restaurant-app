const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/adminController");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

router.get("/stats", auth, isAdmin, ctrl.getStats);
router.get("/audit-logs", auth, isAdmin, ctrl.getAuditLogs);
router.get("/profile", auth, isAdmin, ctrl.getProfile);
router.put("/profile", auth, isAdmin, ctrl.updateProfile);

// Dish Price Change Requests
router.get("/price-requests", auth, isAdmin, ctrl.getPriceRequests);
router.patch("/price-requests/:id/approve", auth, isAdmin, ctrl.approvePriceRequest);
router.patch("/price-requests/:id/reject", auth, isAdmin, ctrl.rejectPriceRequest);

module.exports = router;
