//backend/controller/rolecontroller
const Role = require("../models/Role");
const Admin = require("../models/Admin");
const RoleMenuMapping = require("../models/RoleMenuMapping");
const logAction = require("../utils/logger");

exports.createRole = async (req, res) => {
  try {
    // explicit field whitelist instead of Role.create(req.body) —
    // stops mass assignment if the schema grows sensitive fields later
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Role name is required" });

    const role = await Role.create({ name, description });
    await logAction(req.user.id, "CREATE_ROLE", role._id.toString(), null, role);
    res.status(201).json(role);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Role already exists" });
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const before = await Role.findById(req.params.id);
    if (!before) return res.status(404).json({ message: "Role not found" });

    const { name, description } = req.body; // whitelist here too
    const updated = await Role.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true } // runValidators: findByIdAndUpdate skips schema validation by default
    );

    await logAction(req.user.id, "UPDATE_ROLE", req.params.id, before, updated);
    res.json(updated);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Role name already exists" });
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid role id" });
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // block deletion if any admin still holds this role
    const adminUsingRole = await Admin.findOne({ role: id });
    if (adminUsingRole) {
      return res.status(400).json({ message: "Cannot delete role — still assigned to an admin" });
    }

    // block deletion if any menu mapping still references this role
    const mappingUsingRole = await RoleMenuMapping.findOne({ role: id });
    if (mappingUsingRole) {
      return res.status(400).json({ message: "Cannot delete role — still has menu mappings" });
    }

    const before = await Role.findByIdAndDelete(id);
    if (!before) return res.status(404).json({ message: "Role not found" });

    await logAction(req.user.id, "DELETE_ROLE", id, before, null);
    res.status(204).send();
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid role id" });
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const mappings = await RoleMenuMapping.find({ role: id }).populate("navMenu");
    res.json(mappings);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.updateRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body; // array of { navMenuId, canView, canEdit }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: "Permissions must be an array" });
    }

    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    // We can just wipe and recreate, or update. Wiping is easier for a full sync.
    await RoleMenuMapping.deleteMany({ role: id });

    const newMappings = permissions.map(p => ({
      role: id,
      navMenu: p.navMenuId,
      canView: p.canView,
      canEdit: p.canEdit
    }));

    await RoleMenuMapping.insertMany(newMappings);

    await logAction(req.user.id, "UPDATE_ROLE_PERMISSIONS", id, null, { newMappings });
    
    res.json({ message: "Permissions updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};