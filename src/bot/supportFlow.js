const { STATES, setState } = require('./states');
const { sendText, bold } = require('../whatsapp/baileys');
const { showMainMenu } = require('./mainMenu');
const ticketService = require('../services/ticketService');
const studentService = require('../services/studentService');
const { config } = require('../config/env');
const logger = require('../utils/logger');

async function handleSupportFlow(jid, whatsappNumber, text, state) {
  const lowerText = text.toLowerCase().trim();

  if (lowerText === 'back' || lowerText === 'menu') {
    setState(whatsappNumber, STATES.MAIN_MENU);
    await showMainMenu(jid);
    return;
  }

  if (state === STATES.SUPPORT_REQUEST && (lowerText === 'start' || text === 'start')) {
    await sendText(jid, `📞 ${bold('Talk to Admission Support')}\n\nPlease describe your question or issue in detail.\n\nType ${bold('back')} to cancel.`);
    return;
  }

  if (state === STATES.SUPPORT_REQUEST) {
    // Create ticket
    try {
      const student = await studentService.getStudentByWhatsApp(whatsappNumber);
      const ticket = await ticketService.createTicket({
        student_id: student ? student.student_id : '',
        student_name: student ? student.full_name : whatsappNumber,
        whatsapp_number: whatsappNumber,
        course: student ? student.course_interest : '',
        question: text,
      });

      let msg = `✅ Your request has been submitted.\n\n`;
      msg += `${bold('Ticket ID:')} ${ticket.ticket_id}\n\n`;
      msg += `Our ${config.university.shortName} admission support team will assist you shortly.\n\n`;
      msg += `Type ${bold('menu')} to return to the main menu.`;

      await sendText(jid, msg);
      setState(whatsappNumber, STATES.MAIN_MENU);

      logger.info(`Support ticket created: ${ticket.ticket_id} from ${whatsappNumber}`);
    } catch (error) {
      logger.error('Ticket creation error:', error.message);
      await sendText(jid, 'Sorry, there was an error submitting your request. Please try again.');
    }
    return;
  }

  if (state === STATES.WAITING_FOR_ADMIN) {
    await sendText(jid, `Your ticket is being reviewed by our team. We'll get back to you soon.\n\nType ${bold('menu')} to see other options.`);
    setState(whatsappNumber, STATES.MAIN_MENU);
  }
}

module.exports = { handleSupportFlow };
