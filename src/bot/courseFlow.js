const { STATES, setState, setSession, getSession } = require('./states');
const { sendText, bold } = require('../whatsapp/baileys');
const { showMainMenu } = require('./mainMenu');
const courseService = require('../services/courseService');
const enquiryService = require('../services/enquiryService');
const studentService = require('../services/studentService');
const { config } = require('../config/env');

async function handleCourseFlow(jid, whatsappNumber, text) {
  const session = getSession(whatsappNumber) || {};
  const lowerText = text.toLowerCase().trim();

  // Back to menu
  if (lowerText === 'back' || lowerText === 'menu') {
    setState(whatsappNumber, STATES.MAIN_MENU);
    await showMainMenu(jid);
    return;
  }

  const courses = await courseService.getCourses();

  if (lowerText === 'list' || getSession(whatsappNumber)?.state === STATES.COURSE_MENU) {
    if (courses.length === 0) {
      await sendText(jid, `📚 No courses are currently available.\n\nType ${bold('menu')} to go back.`);
      setState(whatsappNumber, STATES.MAIN_MENU);
      return;
    }

    let msg = `📚 ${bold(`${config.university.shortName} Courses & Programs`)}\n\n`;
    courses.forEach((c, i) => {
      msg += `${i + 1}️⃣ ${bold(c.course_name)} — ${c.degree} (${c.duration})\n`;
    });
    msg += `\nReply with a number to view details.\nType ${bold('back')} to return to menu.`;

    await sendText(jid, msg);
    setState(whatsappNumber, STATES.COURSE_DETAILS);
    setSession(whatsappNumber, { state: STATES.COURSE_DETAILS, courseList: courses.map(c => c.course_id) });
    return;
  }

  // Course details
  const num = parseInt(text, 10);
  if (!isNaN(num) && num >= 1 && num <= courses.length) {
    const course = courses[num - 1];
    let details = `📖 ${bold(course.course_name)}\n\n`;
    details += `🎓 ${bold('Degree:')} ${course.degree}\n`;
    details += `⏱️ ${bold('Duration:')} ${course.duration}\n`;

    if (course.eligibility) {
      details += `📋 ${bold('Eligibility:')} ${course.eligibility}\n`;
    }
    if (course.fees) {
      details += `💰 ${bold('Fees:')} ${course.fees}\n`;
    }
    if (course.description) {
      details += `\n📝 ${course.description}\n`;
    }
    if (course.admission_year) {
      details += `\n📅 ${bold('Admission Year:')} ${course.admission_year}\n`;
    }

    details += `\nType a number to view another course.\nType ${bold('back')} to return to menu.`;

    await sendText(jid, details);

    // Log enquiry
    const student = await studentService.getStudentByWhatsApp(whatsappNumber);
    if (student) {
      await enquiryService.createEnquiry({
        student_id: student.student_id,
        student_name: student.full_name,
        whatsapp_number: whatsappNumber,
        course: course.course_name,
        enquiry_type: 'course_details',
        message: `Viewed course: ${course.course_name}`,
      });
    }
  } else {
    await sendText(jid, `Please select a valid course number.\n\nType ${bold('back')} to return to menu.`);
  }
}

module.exports = { handleCourseFlow };
