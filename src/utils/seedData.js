const courseService = require('../services/courseService');
const faqService = require('../services/faqService');
const admissionInfoService = require('../services/admissionInfoService');
const logger = require('./logger');

/**
 * Seed sample data if the sheets are empty.
 * All data is clearly labeled as SAMPLE DATA.
 */
async function seedSampleData() {
  try {
    // Seed courses
    const courses = await courseService.getCourses(true);
    if (courses.length === 0) {
      logger.info('Seeding sample courses...');

      await courseService.createCourse({
        course_name: 'BCA',
        degree: 'Bachelor of Computer Applications',
        duration: '3 Years (6 Semesters)',
        eligibility: '[SAMPLE] 12th Pass with Mathematics/Computer Science',
        fees: '[SAMPLE] Contact admission office for fee details',
        description: '[SAMPLE] A comprehensive undergraduate program in computer applications covering programming, databases, web development, and more.',
        available: 'true',
        admission_year: '2026',
      });

      await courseService.createCourse({
        course_name: 'MCA',
        degree: 'Master of Computer Applications',
        duration: '2 Years (4 Semesters)',
        eligibility: '[SAMPLE] BCA/BSc(IT)/B.Tech or equivalent with Mathematics',
        fees: '[SAMPLE] Contact admission office for fee details',
        description: '[SAMPLE] An advanced postgraduate program focusing on software development, system design, and advanced computing concepts.',
        available: 'true',
        admission_year: '2026',
      });

      await courseService.createCourse({
        course_name: 'BCA (Hons.)',
        degree: 'Bachelor of Computer Applications (Honours)',
        duration: '4 Years (8 Semesters)',
        eligibility: '[SAMPLE] 12th Pass with Mathematics/Computer Science',
        fees: '[SAMPLE] Contact admission office for fee details',
        description: '[SAMPLE] An honours program with additional research and specialization components beyond the standard BCA curriculum.',
        available: 'true',
        admission_year: '2026',
      });

      logger.info('Sample courses seeded');
    }

    // Seed FAQs
    const faqs = await faqService.getFAQs();
    if (faqs.length === 0) {
      logger.info('Seeding sample FAQs...');

      await faqService.createFAQ({
        question: 'How do I apply for admission?',
        answer: '[SAMPLE] Visit the university website or contact the admission office for the detailed application process.',
        category: 'admission',
        active: 'true',
      });

      await faqService.createFAQ({
        question: 'What documents are required for admission?',
        answer: '[SAMPLE] Required documents typically include marksheets, identity proof, photographs, and other relevant certificates. Contact the admission office for the complete list.',
        category: 'documents',
        active: 'true',
      });

      await faqService.createFAQ({
        question: 'Is hostel facility available?',
        answer: '[SAMPLE] Please contact the university administration for hostel availability and details.',
        category: 'hostel',
        active: 'true',
      });

      await faqService.createFAQ({
        question: 'What are the placement opportunities?',
        answer: '[SAMPLE] FOCA has a dedicated placement cell. Contact the department for latest placement statistics and recruiter details.',
        category: 'placements',
        active: 'true',
      });

      logger.info('Sample FAQs seeded');
    }

    // Seed admission info
    const info = await admissionInfoService.getAdmissionInfo();
    if (info.length === 0) {
      logger.info('Seeding sample admission info...');

      await admissionInfoService.createInfo({
        category: 'admission_process',
        title: 'How to Apply',
        content: '[SAMPLE] Please visit the official Marwadi University website or contact the FOCA admission office for the latest admission process details.',
        active: 'true',
      });

      await admissionInfoService.createInfo({
        category: 'eligibility',
        title: 'General Eligibility',
        content: '[SAMPLE] Eligibility varies by program. Please contact the admission office for specific eligibility criteria for each course.',
        active: 'true',
      });

      await admissionInfoService.createInfo({
        category: 'fees',
        title: 'Fee Structure',
        content: '[SAMPLE] Fee information is subject to change. Please contact the admission office for the current fee structure.',
        active: 'true',
      });

      await admissionInfoService.createInfo({
        category: 'important_dates',
        title: 'Admission Timeline',
        content: '[SAMPLE] Important dates for the current admission cycle will be announced on the university website. Stay tuned!',
        active: 'true',
      });

      await admissionInfoService.createInfo({
        category: 'documents',
        title: 'Required Documents',
        content: '[SAMPLE] A complete list of required documents will be provided during the application process. Generally includes marksheets, ID proof, and photographs.',
        active: 'true',
      });

      await admissionInfoService.createInfo({
        category: 'scholarships',
        title: 'Scholarship Information',
        content: '[SAMPLE] Various scholarships may be available based on merit and need. Contact the admission office for current scholarship opportunities.',
        active: 'true',
      });

      await admissionInfoService.createInfo({
        category: 'hostel',
        title: 'Hostel Facilities',
        content: '[SAMPLE] Hostel facilities information is available through the university administration. Please enquire at the admission office.',
        active: 'true',
      });

      await admissionInfoService.createInfo({
        category: 'placements',
        title: 'Placements & Career',
        content: '[SAMPLE] FOCA has a dedicated placement cell that works to connect students with industry opportunities. Contact the department for details.',
        active: 'true',
      });

      logger.info('Sample admission info seeded');
    }
  } catch (error) {
    logger.error('Failed to seed sample data:', error.message);
  }
}

module.exports = { seedSampleData };
