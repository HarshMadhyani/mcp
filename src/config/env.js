const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Google Sheets
  google: {
    projectId: process.env.GOOGLE_PROJECT_ID,
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
    privateKey: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    sheetId: process.env.GOOGLE_SHEET_ID,
  },

  // Session
  sessionSecret: process.env.SESSION_SECRET || 'foca-secret-change-me',

  // University
  university: {
    name: process.env.UNIVERSITY_NAME || 'Marwadi University',
    department: process.env.DEPARTMENT_NAME || 'Faculty of Computer Applications',
    shortName: process.env.DEPARTMENT_SHORT_NAME || 'FOCA',
  },

  // Default admin
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@marwadi.edu',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },
};

function validateConfig() {
  const required = [
    ['GOOGLE_CLIENT_EMAIL', config.google.clientEmail],
    ['GOOGLE_PRIVATE_KEY', config.google.privateKey],
    ['GOOGLE_SHEET_ID', config.google.sheetId],
  ];

  const missing = required.filter(([, val]) => !val).map(([key]) => key);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.warn('   Google Sheets features will not work until configured.');
    console.warn('   Copy .env.example to .env and fill in the values.\n');
    return false;
  }
  return true;
}

module.exports = { config, validateConfig };
