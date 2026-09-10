const { STATES, setState } = require('./states');
const { sendText, bold, formatMenu } = require('../whatsapp/baileys');
const { config } = require('../config/env');

async function showMainMenu(jid, studentName) {
  const menu = `🎓 ${bold(`${config.university.shortName} ADMISSION SUPPORT`)}\n\nPlease select an option:\n\n1️⃣ Courses & Programs\n2️⃣ Eligibility\n3️⃣ Admission Process\n4️⃣ Fees\n5️⃣ Important Dates\n6️⃣ Documents Required\n7️⃣ Scholarships\n8️⃣ Hostel\n9️⃣ Placement & Career\n🔟 FAQs\n1️⃣1️⃣ Talk to Admission Support\n0️⃣ Exit`;

  await sendText(jid, menu);
}

async function handleMainMenu(jid, whatsappNumber, text) {
  const choice = text.trim();

  switch (choice) {
    case '1':
      setState(whatsappNumber, STATES.COURSE_MENU);
      // courseFlow will handle listing
      const { handleCourseFlow } = require('./courseFlow');
      await handleCourseFlow(jid, whatsappNumber, 'list');
      break;

    case '2':
      setState(whatsappNumber, STATES.ELIGIBILITY_MENU);
      const { handleAdmissionFlow: af2 } = require('./admissionFlow');
      await af2(jid, whatsappNumber, 'show', STATES.ELIGIBILITY_MENU);
      break;

    case '3':
      setState(whatsappNumber, STATES.ADMISSION_PROCESS);
      const { handleAdmissionFlow: af3 } = require('./admissionFlow');
      await af3(jid, whatsappNumber, 'show', STATES.ADMISSION_PROCESS);
      break;

    case '4':
      setState(whatsappNumber, STATES.FEES_MENU);
      const { handleAdmissionFlow: af4 } = require('./admissionFlow');
      await af4(jid, whatsappNumber, 'show', STATES.FEES_MENU);
      break;

    case '5':
      setState(whatsappNumber, STATES.IMPORTANT_DATES);
      const { handleAdmissionFlow: af5 } = require('./admissionFlow');
      await af5(jid, whatsappNumber, 'show', STATES.IMPORTANT_DATES);
      break;

    case '6':
      setState(whatsappNumber, STATES.DOCUMENTS);
      const { handleAdmissionFlow: af6 } = require('./admissionFlow');
      await af6(jid, whatsappNumber, 'show', STATES.DOCUMENTS);
      break;

    case '7':
      setState(whatsappNumber, STATES.SCHOLARSHIPS);
      const { handleAdmissionFlow: af7 } = require('./admissionFlow');
      await af7(jid, whatsappNumber, 'show', STATES.SCHOLARSHIPS);
      break;

    case '8':
      setState(whatsappNumber, STATES.HOSTEL);
      const { handleAdmissionFlow: af8 } = require('./admissionFlow');
      await af8(jid, whatsappNumber, 'show', STATES.HOSTEL);
      break;

    case '9':
      setState(whatsappNumber, STATES.PLACEMENTS);
      const { handleAdmissionFlow: af9 } = require('./admissionFlow');
      await af9(jid, whatsappNumber, 'show', STATES.PLACEMENTS);
      break;

    case '10':
      setState(whatsappNumber, STATES.FAQ);
      const { handleFAQFlow } = require('./faqFlow');
      await handleFAQFlow(jid, whatsappNumber, 'list');
      break;

    case '11':
      setState(whatsappNumber, STATES.SUPPORT_REQUEST);
      const { handleSupportFlow } = require('./supportFlow');
      await handleSupportFlow(jid, whatsappNumber, 'start', STATES.SUPPORT_REQUEST);
      break;

    case '0':
      setState(whatsappNumber, STATES.EXIT);
      await sendText(jid, `Thank you for visiting ${bold(config.university.department)} (${config.university.shortName})! 👋\n\nHave a great day! Type ${bold('hi')} anytime to restart.`);
      break;

    default:
      await sendText(jid, `Sorry, I didn't understand that.\n\nPlease select a valid option from the menu.\n\nType ${bold('menu')} to see the options again.`);
      break;
  }
}

module.exports = { showMainMenu, handleMainMenu };
