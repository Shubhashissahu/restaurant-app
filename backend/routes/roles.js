//routes/roles
const router = require("express").Router();
const verifyToken = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const ctrl = require("../controllers/roleController");

router.post("/", verifyToken, isAdmin, ctrl.createRole);
router.get("/", ctrl.getRoles);
router.put("/:id", verifyToken, isAdmin, ctrl.updateRole);
router.delete("/:id", verifyToken, isAdmin, ctrl.deleteRole);

router.get("/:id/permissions", verifyToken, isAdmin, ctrl.getRolePermissions);
router.put("/:id/permissions", verifyToken, isAdmin, ctrl.updateRolePermissions);

module.exports = router;