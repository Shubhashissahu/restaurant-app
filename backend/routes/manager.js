const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/managerController");
const auth = require("../middleware/auth");
const isManager = require("../middleware/isManager");

// All manager routes require authentication and manager/admin role
router.use(auth, isManager);

// Team Management routes
router.get("/team", ctrl.getTeam);
router.post("/team", ctrl.createTeamMember);
router.put("/team/:id", ctrl.updateTeamMember);
router.patch("/team/:id/status", ctrl.toggleTeamMemberStatus);

// Reports & Statistics routes
router.get("/reports/stats", ctrl.getReportsStats);

// Profile Management routes
router.get("/profile", ctrl.getProfile);
router.put("/profile", ctrl.updateProfile);

// Table Reservations routes
router.get("/reservations", ctrl.getReservations);
router.post("/reservations", ctrl.createReservation);
router.put("/reservations/:id", ctrl.updateReservation);
router.delete("/reservations/:id", ctrl.deleteReservation);

module.exports = router;
