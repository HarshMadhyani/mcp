const { getRows, appendRow, updateRow, findRow } = require('./googleSheetsService');
const { SHEET_TABS } = require('../config/google');
const idGen = require('../utils/idGenerator');

const TAB = 'Support_Tickets';
const HEADERS = SHEET_TABS.Support_Tickets;

async function getTickets(filters = {}) {
  let rows = await getRows(TAB);

  if (filters.status) {
    rows = rows.filter(r => r.status === filters.status);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    rows = rows.filter(r =>
      (r.student_name || '').toLowerCase().includes(s) ||
      (r.ticket_id || '').toLowerCase().includes(s) ||
      (r.question || '').toLowerCase().includes(s)
    );
  }

  rows.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  return rows;
}

async function getTicket(ticketId) {
  return findRow(TAB, 'ticket_id', ticketId);
}

async function createTicket(data) {
  // Sync ticket counter from existing tickets
  const existing = await getRows(TAB);
  const maxNum = existing.reduce((max, row) => {
    const match = (row.ticket_id || '').match(/FOCA-(\d+)/);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  idGen.resetTicketCounter(maxNum);

  const now = new Date().toISOString();
  const ticket = {
    ticket_id: idGen.ticketId(),
    student_id: data.student_id || '',
    student_name: data.student_name || '',
    whatsapp_number: data.whatsapp_number || '',
    course: data.course || '',
    question: data.question || '',
    status: 'OPEN',
    assigned_admin: data.assigned_admin || '',
    admin_notes: '',
    created_at: now,
    updated_at: now,
  };
  await appendRow(TAB, ticket, HEADERS);
  return ticket;
}

async function updateTicket(ticketId, data) {
  const rows = await getRows(TAB);
  const row = rows.find(r => r.ticket_id === ticketId);
  if (!row) throw new Error('Ticket not found');

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
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
};
