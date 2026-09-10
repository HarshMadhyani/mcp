const { getRows, appendRow, updateRow, findRow, deleteRow } = require('./googleSheetsService');
const { SHEET_TABS } = require('../config/google');
const idGen = require('../utils/idGenerator');

const TAB = 'FAQs';
const HEADERS = SHEET_TABS.FAQs;

async function getFAQs(activeOnly = false) {
  let rows = await getRows(TAB);
  if (activeOnly) {
    rows = rows.filter(r => r.active !== 'false' && r.active !== 'FALSE');
  }
  return rows;
}

async function getFAQ(faqId) {
  return findRow(TAB, 'faq_id', faqId);
}

async function getFAQsByCategory(category) {
  const rows = await getRows(TAB);
  return rows.filter(r =>
    r.category === category &&
    r.active !== 'false' && r.active !== 'FALSE'
  );
}

async function createFAQ(data) {
  const now = new Date().toISOString();
  const faq = {
    faq_id: idGen.faqId(),
    question: data.question || '',
    answer: data.answer || '',
    category: data.category || 'general',
    active: data.active !== undefined ? String(data.active) : 'true',
    updated_at: now,
  };
  await appendRow(TAB, faq, HEADERS);
  return faq;
}

async function updateFAQ(faqId, data) {
  const rows = await getRows(TAB);
  const row = rows.find(r => r.faq_id === faqId);
  if (!row) throw new Error('FAQ not found');

  const updated = {
    ...row,
    ...data,
    updated_at: new Date().toISOString(),
  };
  delete updated._rowIndex;
  await updateRow(TAB, row._rowIndex, updated, HEADERS);
  return updated;
}

async function deleteFAQ(faqId) {
  const rows = await getRows(TAB);
  const row = rows.find(r => r.faq_id === faqId);
  if (!row) throw new Error('FAQ not found');
  await deleteRow(TAB, row._rowIndex);
  return true;
}

module.exports = {
  getFAQs,
  getFAQ,
  getFAQsByCategory,
  createFAQ,
  updateFAQ,
  deleteFAQ,
};
