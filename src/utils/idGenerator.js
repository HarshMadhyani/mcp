const { v4: uuidv4 } = require('uuid');

let counters = {
  student: 0,
  course: 0,
  faq: 0,
  ticket: 0,
  enquiry: 0,
  info: 0,
  admin: 0,
  conversation: 0,
};

function generateId(prefix) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().split('-')[0].toUpperCase();
  return `${prefix}-${timestamp}${random}`;
}

module.exports = {
  studentId: () => generateId('STU'),
  courseId: () => generateId('CRS'),
  faqId: () => generateId('FAQ'),
  ticketId: () => {
    counters.ticket++;
    const num = String(counters.ticket).padStart(4, '0');
    return `FOCA-${num}`;
  },
  enquiryId: () => generateId('ENQ'),
  infoId: () => generateId('INF'),
  adminId: () => generateId('ADM'),
  conversationId: () => generateId('CON'),
  resetTicketCounter: (currentMax) => {
    counters.ticket = currentMax;
  },
};
