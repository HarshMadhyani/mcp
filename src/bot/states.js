const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Conversation states
const STATES = {
  NEW_USER: 'NEW_USER',
  ASK_NAME: 'ASK_NAME',
  ASK_MOBILE: 'ASK_MOBILE',
  ASK_EMAIL: 'ASK_EMAIL',
  ASK_COURSE: 'ASK_COURSE',
  ASK_QUALIFICATION: 'ASK_QUALIFICATION',
  ASK_ADMISSION_YEAR: 'ASK_ADMISSION_YEAR',
  REGISTERED: 'REGISTERED',
  MAIN_MENU: 'MAIN_MENU',
  COURSE_MENU: 'COURSE_MENU',
  COURSE_DETAILS: 'COURSE_DETAILS',
  ELIGIBILITY_MENU: 'ELIGIBILITY_MENU',
  FEES_MENU: 'FEES_MENU',
  ADMISSION_PROCESS: 'ADMISSION_PROCESS',
  IMPORTANT_DATES: 'IMPORTANT_DATES',
  DOCUMENTS: 'DOCUMENTS',
  SCHOLARSHIPS: 'SCHOLARSHIPS',
  HOSTEL: 'HOSTEL',
  PLACEMENTS: 'PLACEMENTS',
  FAQ: 'FAQ',
  SUPPORT_REQUEST: 'SUPPORT_REQUEST',
  WAITING_FOR_ADMIN: 'WAITING_FOR_ADMIN',
  EXIT: 'EXIT',
};

// Session store (persisted to disk)
const SESSION_FILE = path.join(__dirname, '..', '..', 'bot_sessions', 'sessions.json');

let sessions = {};

function loadSessions() {
  try {
    const dir = path.dirname(SESSION_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(SESSION_FILE)) {
      const data = fs.readFileSync(SESSION_FILE, 'utf8');
      sessions = JSON.parse(data);
      logger.info(`Loaded ${Object.keys(sessions).length} bot sessions`);
    }
  } catch (error) {
    logger.error('Failed to load sessions:', error.message);
    sessions = {};
  }
}

function saveSessions() {
  try {
    const dir = path.dirname(SESSION_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2));
  } catch (error) {
    logger.error('Failed to save sessions:', error.message);
  }
}

function getSession(whatsappNumber) {
  return sessions[whatsappNumber] || null;
}

function setSession(whatsappNumber, data) {
  sessions[whatsappNumber] = {
    ...sessions[whatsappNumber],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  saveSessions();
}

function getState(whatsappNumber) {
  const session = getSession(whatsappNumber);
  return session ? session.state : STATES.NEW_USER;
}

function setState(whatsappNumber, state) {
  setSession(whatsappNumber, { state });
}

function clearSession(whatsappNumber) {
  delete sessions[whatsappNumber];
  saveSessions();
}

// Load sessions on module init
loadSessions();

module.exports = {
  STATES,
  getSession,
  setSession,
  getState,
  setState,
  clearSession,
  loadSessions,
};
