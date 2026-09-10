const { STATES, setState } = require('./states');
const { sendText, bold } = require('../whatsapp/baileys');
const { showMainMenu } = require('./mainMenu');
const admissionInfoService = require('../services/admissionInfoService');
const enquiryService = require('../services/enquiryService');
const studentService = require('../services/studentService');
const { config } = require('../config/env');

const STATE_TO_CATEGORY = {
  [STATES.ELIGIBILITY_MENU]: 'eligibility',
  [STATES.FEES_MENU]: 'fees',
  [STATES.ADMISSION_PROCESS]: 'admission_process',
  [STATES.IMPORTANT_DATES]: 'important_dates',
  [STATES.DOCUMENTS]: 'documents',
  [STATES.SCHOLARSHIPS]: 'scholarships',
  [STATES.HOSTEL]: 'hostel',
  [STATES.PLACEMENTS]: 'placements',
};

const CATEGORY_LABELS = {
  eligibility: '📋 Eligibility',
  fees: '💰 Fees',
  admission_process: '📝 Admission Process',
  important_dates: '📅 Important Dates',
  documents: '📄 Documents Required',
  scholarships: '🏆 Scholarships',
  hostel: '🏠 Hostel',
  placements: '💼 Placement & Career',
};

async function handleAdmissionFlow(jid, whatsappNumber, text, state) {
  const lowerText = text.toLowerCase().trim();

  // Back to menu
  if (lowerText === 'back' || lowerText === 'menu') {
    setState(whatsappNumber, STATES.MAIN_MENU);
    await showMainMenu(jid);
    return;
  }

  const category = STATE_TO_CATEGORY[state];
  if (!category) {
    setState(whatsappNumber, STATES.MAIN_MENU);
    await showMainMenu(jid);
    return;
  }

  const label = CATEGORY_LABELS[category] || category;
  const infoItems = await admissionInfoService.getInfoByCategory(category);

  if (infoItems.length === 0) {
    await sendText(jid, `${label}\n\nI don't have this information right now.\n\nWould you like to contact ${config.university.shortName} Admission Support?\n\nType ${bold('11')} to talk to support.\nType ${bold('menu')} to go back.`);
    setState(whatsappNumber, STATES.MAIN_MENU);
    return;
  }

  let msg = `${bold(`${label} — ${config.university.shortName}`)}\n\n`;

  infoItems.forEach(item => {
    if (item.title) {
      msg += `${bold(item.title)}\n`;
    }
    msg += `${item.content}\n\n`;
  });

  msg += `Type ${bold('menu')} to go back to main menu.`;

  await sendText(jid, msg);

  // Log enquiry
  const student = await studentService.getStudentByWhatsApp(whatsappNumber);
  if (student) {
    await enquiryService.createEnquiry({
      student_id: student.student_id,
      student_name: student.full_name,
      whatsapp_number: whatsappNumber,
      course: student.course_interest,
      enquiry_type: category,
      message: `Viewed: ${label}`,
    });
  }

  setState(whatsappNumber, STATES.MAIN_MENU);
}

module.exports = { handleAdmissionFlow };
