const { getRows, appendRow } = require('./googleSheetsService');
const { SHEET_TABS } = require('../config/google');
const idGen = require('../utils/idGenerator');

const TAB = 'Conversations';
const HEADERS = SHEET_TABS.Conversations;

async function logMessage(data) {
  const message = {
    conversation_id: idGen.conversationId(),
    student_id: data.student_id || '',
    whatsapp_number: data.whatsapp_number || '',
    message: data.message || '',
    sender: data.sender || 'student', // 'student' or 'bot'
    message_type: data.message_type || 'text',
    timestamp: new Date().toISOString(),
  };
  try {
    await appendRow(TAB, message, HEADERS);
  } catch (err) {
    // Don't throw — logging should not break the flow
    console.error('Failed to log conversation:', err.message);
  }
  return message;
}

async function getConversationByStudent(studentId) {
  const rows = await getRows(TAB);
  return rows
    .filter(r => r.student_id === studentId)
    .sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
}

async function getConversationByWhatsApp(whatsappNumber) {
  const rows = await getRows(TAB);
  return rows
    .filter(r => r.whatsapp_number === whatsappNumber)
    .sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
}

module.exports = {
  logMessage,
  getConversationByStudent,
  getConversationByWhatsApp,
};
