const { getRows, appendRow, updateRow, findRow } = require('./googleSheetsService');
const { SHEET_TABS } = require('../config/google');
const idGen = require('../utils/idGenerator');

const TAB = 'Courses';
const HEADERS = SHEET_TABS.Courses;

async function getCourses(includeDisabled = false) {
  let rows = await getRows(TAB);
  if (!includeDisabled) {
    rows = rows.filter(r => r.available !== 'false' && r.available !== 'FALSE');
  }
  return rows;
}

async function getCourse(courseId) {
  return findRow(TAB, 'course_id', courseId);
}

async function getCourseByName(courseName) {
  return findRow(TAB, 'course_name', courseName);
}

async function createCourse(data) {
  const now = new Date().toISOString();
  const course = {
    course_id: idGen.courseId(),
    course_name: data.course_name || '',
    degree: data.degree || '',
    duration: data.duration || '',
    eligibility: data.eligibility || '',
    fees: data.fees || '',
    description: data.description || '',
    available: data.available !== undefined ? String(data.available) : 'true',
    admission_year: data.admission_year || '',
    updated_at: now,
  };
  await appendRow(TAB, course, HEADERS);
  return course;
}

async function updateCourse(courseId, data) {
  const rows = await getRows(TAB);
  const row = rows.find(r => r.course_id === courseId);
  if (!row) throw new Error('Course not found');

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
  getCourses,
  getCourse,
  getCourseByName,
  createCourse,
  updateCourse,
};
