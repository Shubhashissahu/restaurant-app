const AuditLog = require("../models/AuditLog");

/**
 * Records an audit trail entry for admin actions.
 * @param {String} userId   - the admin performing the action (req.user.id)
 * @param {String} action   - e.g. "CREATE_ROLE", "UPDATE_ROLE", "DELETE_ROLE"
 * @param {String} targetId - the _id of the affected document
 * @param {Object|null} before - document state before the change (null for creates)
 * @param {Object|null} after  - document state after the change (null for deletes)
 */
async function logAction(userId, action, targetId, before, after) {
  try {
    await AuditLog.create({
      user: userId,
      action,
      targetId,
      before,
      after,
    });
  } catch (err) {
    // audit logging failing should never take down the actual request —
    // log to console and move on rather than throwing
    console.error("Failed to write audit log:", err.message);
  }
}

module.exports = logAction;