const { getRows, appendRow, findRow } = require('./googleSheetsService');
const { SHEET_TABS } = require('../config/google');
const bcrypt = require('bcryptjs');
const idGen = require('../utils/idGenerator');
const { config } = require('../config/env');
const logger = require('../utils/logger');

const TAB = 'Admins';
const HEADERS = SHEET_TABS.Admins;

async function getAdmins() {
  return getRows(TAB);
}

async function getAdminByEmail(email) {
  return findRow(TAB, 'email', email);
}

async function getAdminById(adminId) {
  return findRow(TAB, 'admin_id', adminId);
}

async function createAdmin(data) {
  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(data.password, 10);
  const admin = {
    admin_id: idGen.adminId(),
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    password_hash: passwordHash,
    role: data.role || 'admin',
    active: 'true',
    created_at: now,
  };
  await appendRow(TAB, admin, HEADERS);
  return admin;
}

async function verifyPassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

async function seedDefaultAdmin() {
  try {
    const existing = await getAdminByEmail(config.admin.email);
    if (existing) {
      logger.info('Default admin already exists');
      return existing;
    }

    const admin = await createAdmin({
      name: 'FOCA Admin',
      email: config.admin.email,
      password: config.admin.password,
      role: 'super_admin',
    });
    logger.info(`Default admin created: ${config.admin.email}`);
    return admin;
  } catch (error) {
    logger.error('Failed to seed default admin:', error.message);
    return null;
  }
}

module.exports = {
  getAdmins,
  getAdminByEmail,
  getAdminById,
  createAdmin,
  verifyPassword,
  seedDefaultAdmin,
};
