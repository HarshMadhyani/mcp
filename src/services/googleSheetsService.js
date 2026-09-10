const { getSheetsClient, isSheetsReady } = require('../config/google');
const { config } = require('../config/env');
const logger = require('../utils/logger');

const spreadsheetId = config.google.sheetId;

/**
 * Get all rows from a sheet tab as an array of objects
 */
async function getRows(tabName) {
  if (!isSheetsReady()) return [];
  try {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}`,
    });
    const rows = res.data.values;
    if (!rows || rows.length < 2) return [];

    const headers = rows[0];
    return rows.slice(1).map((row, index) => {
      const obj = { _rowIndex: index + 2 }; // 1-indexed, +1 for header
      headers.forEach((h, i) => {
        obj[h] = row[i] || '';
      });
      return obj;
    });
  } catch (error) {
    logger.error(`Error reading ${tabName}:`, error.message);
    return [];
  }
}

/**
 * Append a row to a sheet tab
 */
async function appendRow(tabName, data, headers) {
  if (!isSheetsReady()) throw new Error('Google Sheets not initialized');
  try {
    const sheets = await getSheetsClient();
    const values = headers.map(h => data[h] || '');
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tabName}!A1`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [values] },
    });
    return true;
  } catch (error) {
    logger.error(`Error appending to ${tabName}:`, error.message);
    throw error;
  }
}

/**
 * Update a specific row in a sheet tab
 */
async function updateRow(tabName, rowIndex, data, headers) {
  if (!isSheetsReady()) throw new Error('Google Sheets not initialized');
  try {
    const sheets = await getSheetsClient();
    const values = headers.map(h => data[h] !== undefined ? data[h] : '');
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tabName}!A${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: { values: [values] },
    });
    return true;
  } catch (error) {
    logger.error(`Error updating row ${rowIndex} in ${tabName}:`, error.message);
    throw error;
  }
}

/**
 * Find a row by column value
 */
async function findRow(tabName, columnName, value) {
  const rows = await getRows(tabName);
  return rows.find(r => r[columnName] === value) || null;
}

/**
 * Find all rows matching a column value
 */
async function findRows(tabName, columnName, value) {
  const rows = await getRows(tabName);
  return rows.filter(r => r[columnName] === value);
}

/**
 * Delete a row (clear it)
 */
async function deleteRow(tabName, rowIndex) {
  if (!isSheetsReady()) throw new Error('Google Sheets not initialized');
  try {
    const sheets = await getSheetsClient();
    // Get sheet ID for the tab
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets.find(s => s.properties.title === tabName);
    if (!sheet) throw new Error(`Tab ${tabName} not found`);

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex - 1, // 0-indexed
              endIndex: rowIndex,
            }
          }
        }]
      }
    });
    return true;
  } catch (error) {
    logger.error(`Error deleting row ${rowIndex} from ${tabName}:`, error.message);
    throw error;
  }
}

module.exports = {
  getRows,
  appendRow,
  updateRow,
  findRow,
  findRows,
  deleteRow,
};
