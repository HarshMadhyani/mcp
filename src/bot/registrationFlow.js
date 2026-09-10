const { STATES, setState, setSession, getSession } = require('./states');
const { sendText, bold } = require('../whatsapp/baileys');
const { showMainMenu } = require('./mainMenu');
const studentService = require('../services/studentService');
const courseService = require('../services/courseService');
const conversationService = require('../services/conversationService');
const { isValidEmail, isValidPhone } = require('../utils/validation');
const { config } = require('../config/env');
const logger = require('../utils/logger');

async function handleRegistration(jid, whatsappNumber, text, state) {
  const session = getSession(whatsappNumber) || {};

  switch (state) {
    case STATES.ASK_NAME: {
      if (text.length < 2 || text.length > 100) {
        await sendText(jid, 'Please enter a valid full name (2-100 characters):');
        return;
      }
      setSession(whatsappNumber, { state: STATES.ASK_MOBILE, regData: { ...session.regData, full_name: text } });
      const msg = `Thank you, ${bold(text)}! 👍\n\nPlease enter your ${bold('Mobile Number')}:`;
      await sendText(jid, msg);
      break;
    }

    case STATES.ASK_MOBILE: {
      if (!isValidPhone(text)) {
        await sendText(jid, 'Please enter a valid mobile number (10-15 digits):');
        return;
      }
      setSession(whatsappNumber, { state: STATES.ASK_EMAIL, regData: { ...session.regData, mobile: text } });
      await sendText(jid, `Please enter your ${bold('Email Address')}:`);
      break;
    }

    case STATES.ASK_EMAIL: {
      if (!isValidEmail(text)) {
        await sendText(jid, 'Please enter a valid email address (e.g., name@example.com):');
        return;
      }
      setSession(whatsappNumber, { state: STATES.ASK_COURSE, regData: { ...session.regData, email: text } });

      // Show available courses
      const courses = await courseService.getCourses();
      if (courses.length > 0) {
        let courseMsg = `Which ${bold('course')} are you interested in?\n\n`;
        courses.forEach((c, i) => {
          courseMsg += `${i + 1}️⃣ ${c.course_name} (${c.degree})\n`;
        });
        courseMsg += `\nReply with the number or course name:`;
        await sendText(jid, courseMsg);
      } else {
        await sendText(jid, `Which ${bold('course')} are you interested in?\n\n(e.g., BCA, MCA, BCA Hons.)`);
      }
      break;
    }

    case STATES.ASK_COURSE: {
      const courses = await courseService.getCourses();
      let selectedCourse = text;

      // Check if user entered a number
      const num = parseInt(text, 10);
      if (!isNaN(num) && num >= 1 && num <= courses.length) {
        selectedCourse = courses[num - 1].course_name;
      } else {
        // Try to match by name
        const match = courses.find(c =>
          c.course_name.toLowerCase() === text.toLowerCase() ||
          c.degree.toLowerCase() === text.toLowerCase()
        );
        if (match) selectedCourse = match.course_name;
      }

      setSession(whatsappNumber, { state: STATES.ASK_QUALIFICATION, regData: { ...session.regData, course_interest: selectedCourse } });
      await sendText(jid, `Great choice! 🎯\n\nWhat is your ${bold('Current Qualification')}?\n\n(e.g., 12th Pass, Graduation, BCA, etc.)`);
      break;
    }

    case STATES.ASK_QUALIFICATION: {
      if (text.length < 2) {
        await sendText(jid, 'Please enter a valid qualification:');
        return;
      }
      setSession(whatsappNumber, { state: STATES.ASK_ADMISSION_YEAR, regData: { ...session.regData, qualification: text } });
      const currentYear = new Date().getFullYear();
      await sendText(jid, `Which ${bold('Admission Year')} are you applying for?\n\n1️⃣ ${currentYear}\n2️⃣ ${currentYear + 1}`);
      break;
    }

    case STATES.ASK_ADMISSION_YEAR: {
      const currentYear = new Date().getFullYear();
      let year = text;

      if (text === '1') year = String(currentYear);
      else if (text === '2') year = String(currentYear + 1);

      const regData = session.regData || {};

      // Create student
      try {
        const student = await studentService.createStudent({
          whatsapp_number: whatsappNumber,
          full_name: regData.full_name || '',
          mobile: regData.mobile || '',
          email: regData.email || '',
          course_interest: regData.course_interest || '',
          qualification: regData.qualification || '',
          admission_year: year,
          status: 'NEW',
        });

        setState(whatsappNumber, STATES.MAIN_MENU);
        setSession(whatsappNumber, { state: STATES.MAIN_MENU, regData: null, studentId: student.student_id });

        const successMsg = `Thank you, ${bold(regData.full_name)}! ✅\n\nYour details have been registered successfully.\n\nHow can I help you with ${config.university.shortName} admissions?`;
        await sendText(jid, successMsg);

        await conversationService.logMessage({
          student_id: student.student_id,
          whatsapp_number: whatsappNumber,
          message: 'Registration completed',
          sender: 'bot',
          message_type: 'system',
        });

        await showMainMenu(jid, regData.full_name);
      } catch (error) {
        logger.error('Registration error:', error.message);
        await sendText(jid, 'Sorry, there was an error saving your details. Please try again.');
      }
      break;
    }
  }
}

module.exports = { handleRegistration };
