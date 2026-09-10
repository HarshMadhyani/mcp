const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const studentService = require('../services/studentService');
const conversationService = require('../services/conversationService');
const courseService = require('../services/courseService');

router.get('/students', requireAuth, async (req, res) => {
  try {
    const filters = {
      search: req.query.search || '',
      course: req.query.course || '',
      admission_year: req.query.admission_year || '',
      status: req.query.status || '',
    };

    const students = await studentService.getStudents(filters);
    const courses = await courseService.getCourses(true);

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const perPage = 20;
    const total = students.length;
    const totalPages = Math.ceil(total / perPage);
    const paginated = students.slice((page - 1) * perPage, page * perPage);

    res.render('pages/students', {
      title: 'Students',
      students: paginated,
      courses,
      filters,
      pagination: { page, perPage, total, totalPages },
    });
  } catch (error) {
    res.render('pages/students', {
      title: 'Students',
      students: [],
      courses: [],
      filters: {},
      pagination: { page: 1, perPage: 20, total: 0, totalPages: 0 },
    });
  }
});

router.get('/students/:id', requireAuth, async (req, res) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    if (!student) {
      req.session.flash = { error: 'Student not found' };
      return res.redirect('/admin/students');
    }

    const conversations = await conversationService.getConversationByStudent(student.student_id);

    res.render('pages/student-details', {
      title: `Student: ${student.full_name}`,
      student,
      conversations,
    });
  } catch (error) {
    req.session.flash = { error: 'Failed to load student details' };
    res.redirect('/admin/students');
  }
});

module.exports = router;
