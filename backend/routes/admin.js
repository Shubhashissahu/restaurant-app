const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/adminController");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

router.get("/stats", auth, isAdmin, ctrl.getStats);
router.get("/audit-logs", auth, isAdmin, ctrl.getAuditLogs);
router.put("/profile", auth, isAdmin, ctrl.updateProfile);

module.exports = router;
