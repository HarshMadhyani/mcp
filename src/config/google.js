const { google } = require('googleapis');
const { config } = require('./env');
const logger = require('../utils/logger');

let sheetsClient = null;
let isInitialized = false;

// Sheet tab definitions with headers
const SHEET_TABS = {
  Students: [
    'student_id', 'whatsapp_number', 'full_name', 'mobile', 'email',
    'course_interest', 'qualification', 'admission_year', 'status',
    'assigned_admin', 'created_at', 'updated_at'
  ],
  Courses: [
    'course_id', 'course_name', 'degree', 'duration', 'eligibility',
    'fees', 'description', 'available', 'admission_year', 'updated_at'
  ],
  Admission_Info: [
    'info_id', 'category', 'title', 'content', 'active', 'updated_at'
  ],
  FAQs: [
    'faq_id', 'question', 'answer', 'category', 'active', 'updated_at'
  ],
  Conversations: [
    'conversation_id', 'student_id', 'whatsapp_number', 'message',
    'sender', 'message_type', 'timestamp'
  ],
  Support_Tickets: [
    'ticket_id', 'student_id', 'student_name', 'whatsapp_number',
    'course', 'question', 'status', 'assigned_admin', 'admin_notes',
    'created_at', 'updated_at'
  ],
  Enquiries: [
    'enquiry_id', 'student_id', 'student_name', 'whatsapp_number',
    'course', 'enquiry_type', 'message', 'status', 'created_at', 'updated_at'
  ],
  Admins: [
    'admin_id', 'name', 'email', 'phone', 'password_hash',
    'role', 'active', 'created_at'
  ],
};

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: config.google.clientEmail,
      private_key: config.google.privateKey,
      project_id: config.google.projectId,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth;
}

async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;
  const auth = await getAuthClient();
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

async function initializeSheets() {
  if (!config.google.clientEmail || !config.google.privateKey || !config.google.sheetId) {
    logger.warn('Google Sheets not configured. Skipping initialization.');
    return false;
  }

  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = config.google.sheetId;

    // Get existing sheet tabs
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingTabs = spreadsheet.data.sheets.map(s => s.properties.title);

    for (const [tabName, headers] of Object.entries(SHEET_TABS)) {
      if (!existingTabs.includes(tabName)) {
        // Create the tab
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: { properties: { title: tabName } }
            }]
          }
        });

        // Add headers
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${tabName}!A1`,
          valueInputOption: 'RAW',
          requestBody: { values: [headers] },
        });

        logger.info(`Created sheet tab: ${tabName}`);
      }
    }

    isInitialized = true;
    logger.info('Google Sheets initialized successfully');
    return true;
  } catch (error) {
    logger.error('Failed to initialize Google Sheets:', error.message);
    return false;
  }
}

function isSheetsReady() {
  return isInitialized;
}

module.exports = {
  getSheetsClient,
  initializeSheets,
  isSheetsReady,
  SHEET_TABS,
};
