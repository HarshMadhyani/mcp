const { STATES, getState, setState, getSession, setSession } = require('./states');
const { handleRegistration } = require('./registrationFlow');
const { handleMainMenu, showMainMenu } = require('./mainMenu');
const { handleCourseFlow } = require('./courseFlow');
const { handleAdmissionFlow } = require('./admissionFlow');
const { handleFAQFlow } = require('./faqFlow');
const { handleSupportFlow } = require('./supportFlow');
const { sendText, bold } = require('../whatsapp/baileys');
const studentService = require('../services/studentService');
const conversationService = require('../services/conversationService');
const logger = require('../utils/logger');
const { config } = require('../config/env');

async function routeMessage(jid, whatsappNumber, text) {
  try {
    const state = getState(whatsappNumber);
    const lowerText = text.toLowerCase().trim();

    // Global commands
    if (lowerText === 'menu' || lowerText === 'home') {
      const student = await studentService.getStudentByWhatsApp(whatsappNumber);
      if (student) {
        setState(whatsappNumber, STATES.MAIN_MENU);
        await showMainMenu(jid, student.full_name);
        return;
      }
    }

    if (lowerText === 'exit' || lowerText === '0') {
      if (state !== STATES.NEW_USER && state !== STATES.ASK_NAME &&
          state !== STATES.ASK_MOBILE && state !== STATES.ASK_EMAIL &&
          state !== STATES.ASK_COURSE && state !== STATES.ASK_QUALIFICATION &&
          state !== STATES.ASK_ADMISSION_YEAR) {
        setState(whatsappNumber, STATES.EXIT);
        await sendText(jid, `Thank you for visiting ${bold(config.university.department)} (${config.university.shortName})! 👋\n\nHave a great day! Type ${bold('hi')} anytime to restart.`);
        await logBotMessage(whatsappNumber, 'Exit message');
        return;
      }
    }

    // Route based on state
    switch (state) {
      case STATES.NEW_USER:
      case STATES.EXIT:
        // Check if returning user
        const student = await studentService.getStudentByWhatsApp(whatsappNumber);
        if (student) {
          setState(whatsappNumber, STATES.MAIN_MENU);
          const welcomeBack = `Welcome back, ${bold(student.full_name)}! 👋\n\nHow can I help you today?`;
          await sendText(jid, welcomeBack);
          await logBotMessage(whatsappNumber, welcomeBack);
          await showMainMenu(jid, student.full_name);
        } else {
          // New user - start registration
          setState(whatsappNumber, STATES.ASK_NAME);
          const greeting = `👋 Welcome to ${bold(config.university.name)}.\n\n🎓 ${bold(config.university.department)} (${config.university.shortName})\n\nI'm the ${config.university.shortName} Admission Support Assistant.\n\nBefore we continue, I need a few basic details.\n\nPlease enter your ${bold('Full Name')}:`;
          await sendText(jid, greeting);
          await logBotMessage(whatsappNumber, greeting);
        }
        break;

      case STATES.ASK_NAME:
      case STATES.ASK_MOBILE:
      case STATES.ASK_EMAIL:
      case STATES.ASK_COURSE:
      case STATES.ASK_QUALIFICATION:
      case STATES.ASK_ADMISSION_YEAR:
        await handleRegistration(jid, whatsappNumber, text, state);
        break;

      case STATES.REGISTERED:
      case STATES.MAIN_MENU:
        await handleMainMenu(jid, whatsappNumber, text);
        break;

      case STATES.COURSE_MENU:
      case STATES.COURSE_DETAILS:
        await handleCourseFlow(jid, whatsappNumber, text);
        break;

      case STATES.ELIGIBILITY_MENU:
      case STATES.FEES_MENU:
      case STATES.ADMISSION_PROCESS:
      case STATES.IMPORTANT_DATES:
      case STATES.DOCUMENTS:
      case STATES.SCHOLARSHIPS:
      case STATES.HOSTEL:
      case STATES.PLACEMENTS:
        await handleAdmissionFlow(jid, whatsappNumber, text, state);
        break;

      case STATES.FAQ:
        await handleFAQFlow(jid, whatsappNumber, text);
        break;

      case STATES.SUPPORT_REQUEST:
      case STATES.WAITING_FOR_ADMIN:
        await handleSupportFlow(jid, whatsappNumber, text, state);
        break;

      default:
        setState(whatsappNumber, STATES.MAIN_MENU);
        await showMainMenu(jid);
        break;
    }
  } catch (error) {
    logger.error('Router error:', error.message);
    await sendText(jid, 'Sorry, something went wrong. Please try again or type *menu* to see the options.');
  }
}

async function logBotMessage(whatsappNumber, message) {
  const student = await studentService.getStudentByWhatsApp(whatsappNumber);
  await conversationService.logMessage({
    student_id: student ? student.student_id : '',
    whatsapp_number: whatsappNumber,
    message: message.substring(0, 500),
    sender: 'bot',
    message_type: 'text',
  });
}

module.exports = { routeMessage };
