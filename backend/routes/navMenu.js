const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/navMenuController");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

// Fetch the dynamic menu specifically for the currently logged-in user's role
router.get("/my-menu", auth, ctrl.getMyMenu);

// Admin routes for managing menus
router.get("/", auth, isAdmin, ctrl.getNavMenus);
router.post("/", auth, isAdmin, ctrl.createNavMenu);
router.put("/:id", auth, isAdmin, ctrl.updateNavMenu);
router.delete("/:id", auth, isAdmin, ctrl.deleteNavMenu);

module.exports = router;
