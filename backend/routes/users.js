const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

router.get("/", auth, isAdmin, userController.getUsers);
router.post("/", auth, isAdmin, userController.createUser);
router.put("/:id", auth, isAdmin, userController.updateUser);
router.patch("/:id/status", auth, isAdmin, userController.toggleUserStatus);

module.exports = router;
