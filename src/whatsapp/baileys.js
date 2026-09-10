const whatsappConnection = require('./connection');
const logger = require('../utils/logger');

/**
 * Send a text message
 */
async function sendText(jid, text) {
  return whatsappConnection.sendMessage(jid, text);
}

/**
 * Format bold text for WhatsApp
 */
function bold(text) {
  return `*${text}*`;
}

/**
 * Format italic text
 */
function italic(text) {
  return `_${text}_`;
}

/**
 * Format a numbered menu
 */
function formatMenu(title, items) {
  let msg = `${bold(title)}\n\n`;
  items.forEach(item => {
    msg += `${item}\n`;
  });
  return msg;
}

/**
 * Extract clean phone number from JID
 */
function jidToNumber(jid) {
  return jid.split('@')[0].split(':')[0];
}

/**
 * Number to JID
 */
function numberToJid(number) {
  const clean = number.replace(/[^\d]/g, '');
  return `${clean}@s.whatsapp.net`;
}

module.exports = {
  sendText,
  bold,
  italic,
  formatMenu,
  jidToNumber,
  numberToJid,
};
