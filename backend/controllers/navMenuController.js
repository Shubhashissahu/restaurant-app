const NavMenu = require("../models/NavMenu");
const RoleMenuMapping = require("../models/RoleMenuMapping");
const logAction = require("../utils/logger");

exports.getNavMenus = async (req, res) => {
  try {
    const menus = await NavMenu.find().sort({ order: 1 });
    res.json(menus);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createNavMenu = async (req, res) => {
  try {
    const { name, path, icon, parentId, isActive, order } = req.body;
    
    if (!name) return res.status(400).json({ message: "Name is required" });

    const menu = await NavMenu.create({ 
      name, 
      path, 
      icon, 
      parentId: parentId || null, 
      isActive: isActive !== undefined ? isActive : true, 
      order: order || 0 
    });

    await logAction(req.user.id, "CREATE_MENU", menu._id.toString(), null, menu);
    res.status(201).json(menu);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateNavMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const before = await NavMenu.findById(id);
    if (!before) return res.status(404).json({ message: "Menu not found" });

    const updated = await NavMenu.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    await logAction(req.user.id, "UPDATE_MENU", id, before, updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteNavMenu = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if it has children
    const children = await NavMenu.findOne({ parentId: id });
    if (children) {
      return res.status(400).json({ message: "Cannot delete a menu that has children. Delete or move children first." });
    }

    const before = await NavMenu.findByIdAndDelete(id);
    if (!before) return res.status(404).json({ message: "Menu not found" });

    // Clean up mappings
    await RoleMenuMapping.deleteMany({ navMenu: id });

    await logAction(req.user.id, "DELETE_MENU", id, before, null);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyMenu = async (req, res) => {
  try {
    // req.user has { id, role, roleId }
    const mappings = await RoleMenuMapping.find({ role: req.user.roleId, canView: true }).populate("navMenu");
    
    // Filter active menus only
    const allowedMenus = mappings.map(m => m.navMenu).filter(menu => menu && menu.isActive);
    
    res.json(allowedMenus);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
