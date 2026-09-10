const whatsappConnection = require('./connection');
const { jidToNumber } = require('./baileys');
const { routeMessage } = require('../bot/router');
const conversationService = require('../services/conversationService');
const studentService = require('../services/studentService');
const logger = require('../utils/logger');

function initializeMessageHandler() {
  whatsappConnection.on('message', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      try {
        // Skip status messages, own messages, etc.
        if (!msg.message) continue;
        if (msg.key.fromMe) continue;
        if (msg.key.remoteJid === 'status@broadcast') continue;

        const jid = msg.key.remoteJid;
        const whatsappNumber = jidToNumber(jid);

        // Extract text content
        const text = extractText(msg);
        if (!text) continue;

        logger.info(`Message from ${whatsappNumber}: ${text}`);

        // Log incoming message
        const student = await studentService.getStudentByWhatsApp(whatsappNumber);
        await conversationService.logMessage({
          student_id: student ? student.student_id : '',
          whatsapp_number: whatsappNumber,
          message: text,
          sender: 'student',
          message_type: 'text',
        });

        // Route to bot engine
        await routeMessage(jid, whatsappNumber, text.trim());
      } catch (error) {
        logger.error('Error handling message:', error.message);
      }
    }
  });

  logger.info('WhatsApp message handler initialized');
}

function extractText(msg) {
  if (msg.message.conversation) {
    return msg.message.conversation;
  }
  if (msg.message.extendedTextMessage) {
    return msg.message.extendedTextMessage.text;
  }
  if (msg.message.buttonsResponseMessage) {
    return msg.message.buttonsResponseMessage.selectedDisplayText;
  }
  if (msg.message.listResponseMessage) {
    return msg.message.listResponseMessage.title;
  }
  return null;
}

module.exports = { initializeMessageHandler };
