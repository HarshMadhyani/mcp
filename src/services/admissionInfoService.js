const { getRows, appendRow, updateRow, findRow, findRows } = require('./googleSheetsService');
const { SHEET_TABS } = require('../config/google');
const idGen = require('../utils/idGenerator');

const TAB = 'Admission_Info';
const HEADERS = SHEET_TABS.Admission_Info;

async function getAdmissionInfo(activeOnly = false) {
  let rows = await getRows(TAB);
  if (activeOnly) {
    rows = rows.filter(r => r.active !== 'false' && r.active !== 'FALSE');
  }
  return rows;
}

async function getInfoByCategory(category) {
  const rows = await getRows(TAB);
  return rows.filter(r =>
    r.category === category &&
    r.active !== 'false' && r.active !== 'FALSE'
  );
}

async function getInfoById(infoId) {
  return findRow(TAB, 'info_id', infoId);
}

async function createInfo(data) {
  const now = new Date().toISOString();
  const info = {
    info_id: idGen.infoId(),
    category: data.category || '',
    title: data.title || '',
    content: data.content || '',
    active: data.active !== undefined ? String(data.active) : 'true',
    updated_at: now,
  };
  await appendRow(TAB, info, HEADERS);
  return info;
}

async function updateInfo(infoId, data) {
  const rows = await getRows(TAB);
  const row = rows.find(r => r.info_id === infoId);
  if (!row) throw new Error('Admission info not found');

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
  getAdmissionInfo,
  getInfoByCategory,
  getInfoById,
  createInfo,
  updateInfo,
};
