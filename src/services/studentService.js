const { getRows, appendRow, updateRow, findRow } = require('./googleSheetsService');
const { SHEET_TABS } = require('../config/google');
const idGen = require('../utils/idGenerator');

const TAB = 'Students';
const HEADERS = SHEET_TABS.Students;

async function getStudents(filters = {}) {
  let rows = await getRows(TAB);

  if (filters.search) {
    const s = filters.search.toLowerCase();
    rows = rows.filter(r =>
      (r.full_name || '').toLowerCase().includes(s) ||
      (r.whatsapp_number || '').includes(s) ||
      (r.email || '').toLowerCase().includes(s)
    );
  }
  if (filters.course) {
    rows = rows.filter(r => r.course_interest === filters.course);
  }
  if (filters.admission_year) {
    rows = rows.filter(r => r.admission_year === filters.admission_year);
  }
  if (filters.status) {
    rows = rows.filter(r => r.status === filters.status);
  }

  // Sort by created_at desc
  rows.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  return rows;
}

async function getStudentById(studentId) {
  return findRow(TAB, 'student_id', studentId);
}

async function getStudentByWhatsApp(whatsappNumber) {
  return findRow(TAB, 'whatsapp_number', whatsappNumber);
}

async function createStudent(data) {
  const now = new Date().toISOString();
  const student = {
    student_id: idGen.studentId(),
    whatsapp_number: data.whatsapp_number || '',
    full_name: data.full_name || '',
    mobile: data.mobile || '',
    email: data.email || '',
    course_interest: data.course_interest || '',
    qualification: data.qualification || '',
    admission_year: data.admission_year || '',
    status: data.status || 'NEW',
    assigned_admin: data.assigned_admin || '',
    created_at: now,
    updated_at: now,
  };
  await appendRow(TAB, student, HEADERS);
  return student;
}

async function updateStudent(studentId, data) {
  const rows = await getRows(TAB);
  const row = rows.find(r => r.student_id === studentId);
  if (!row) throw new Error('Student not found');

  const updated = {
    ...row,
    ...data,
    updated_at: new Date().toISOString(),
  };
  delete updated._rowIndex;
  await updateRow(TAB, row._rowIndex, updated, HEADERS);
  return updated;
}

module.exports = {
  getStudents,
  getStudentById,
  getStudentByWhatsApp,
  createStudent,
  updateStudent,
};
