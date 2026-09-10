const { getRows, appendRow, updateRow, findRow } = require('./googleSheetsService');
const { SHEET_TABS } = require('../config/google');
const idGen = require('../utils/idGenerator');

const TAB = 'Enquiries';
const HEADERS = SHEET_TABS.Enquiries;

async function getEnquiries(filters = {}) {
  let rows = await getRows(TAB);

  if (filters.status) {
    rows = rows.filter(r => r.status === filters.status);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    rows = rows.filter(r =>
      (r.student_name || '').toLowerCase().includes(s) ||
      (r.course || '').toLowerCase().includes(s)
    );
  }

  rows.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  return rows;
}

async function getEnquiry(enquiryId) {
  return findRow(TAB, 'enquiry_id', enquiryId);
}

async function createEnquiry(data) {
  const now = new Date().toISOString();
  const enquiry = {
    enquiry_id: idGen.enquiryId(),
    student_id: data.student_id || '',
    student_name: data.student_name || '',
    whatsapp_number: data.whatsapp_number || '',
    course: data.course || '',
    enquiry_type: data.enquiry_type || '',
    message: data.message || '',
    status: 'NEW',
    created_at: now,
    updated_at: now,
  };
  await appendRow(TAB, enquiry, HEADERS);
  return enquiry;
}

async function updateEnquiry(enquiryId, data) {
  const rows = await getRows(TAB);
  const row = rows.find(r => r.enquiry_id === enquiryId);
  if (!row) throw new Error('Enquiry not found');

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
  getEnquiries,
  getEnquiry,
  createEnquiry,
  updateEnquiry,
};
