const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Role = require('./models/Role');
const Admin = require('./models/Admin');

require('dotenv').config();

const seed = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/restaurant-app');
    console.log('Connected to MongoDB');

    // Create roles
    const roles = ['admin', 'manager', 'user'];
    const roleDocs = {};

    for (const roleName of roles) {
      let role = await Role.findOne({ name: roleName });
      if (!role) {
        role = await Role.create({ name: roleName, description: `${roleName} role` });
        console.log(`Created role: ${roleName}`);
      } else {
        console.log(`Role ${roleName} already exists`);
      }
      roleDocs[roleName] = role;
    }

    // Create default admin user
    const adminEmail = 'admin@tastehub.com';
    let admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      const hashed = await bcrypt.hash('password123', 10);
      admin = await Admin.create({
        name: 'Super Admin',
        email: adminEmail,
        password: hashed,
        role: roleDocs['admin']._id
      });
      console.log(`Created default admin user: ${adminEmail} / password123`);
    } else {
      console.log(`Admin user ${adminEmail} already exists`);
    }

    // Create default manager user
    const managerEmail = 'manager@tastehub.com';
    let manager = await Admin.findOne({ email: managerEmail });
    if (!manager) {
      const hashed = await bcrypt.hash('password123', 10);
      manager = await Admin.create({
        name: 'Store Manager',
        email: managerEmail,
        password: hashed,
        role: roleDocs['manager']._id
      });
      console.log(`Created default manager user: ${managerEmail} / password123`);
    } else {
      console.log(`Manager user ${managerEmail} already exists`);
    }

    // Create default user user
    const userEmail = 'user@tastehub.com';
    let user = await Admin.findOne({ email: userEmail });
    if (!user) {
      const hashed = await bcrypt.hash('password123', 10);
      user = await Admin.create({
        name: 'Regular User',
        email: userEmail,
        password: hashed,
        role: roleDocs['user']._id
      });
      console.log(`Created default user user: ${userEmail} / password123`);
    } else {
      console.log(`User ${userEmail} already exists`);
    }

    console.log('Seed completed successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    process.exit(0);
  }
};

seed();
