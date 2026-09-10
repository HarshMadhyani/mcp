const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const courseService = require('../services/courseService');
const { sanitize } = require('../utils/validation');

router.get('/courses', requireAuth, async (req, res) => {
  try {
    const courses = await courseService.getCourses(true);
    res.render('pages/courses', { title: 'Courses', courses });
  } catch (error) {
    res.render('pages/courses', { title: 'Courses', courses: [] });
  }
});

router.get('/courses/new', requireAuth, (req, res) => {
  res.render('pages/course-form', {
    title: 'New Course',
    course: null,
    isEdit: false,
  });
});

router.post('/courses', requireAuth, async (req, res) => {
  try {
    const data = {
      course_name: sanitize(req.body.course_name),
      degree: sanitize(req.body.degree),
      duration: sanitize(req.body.duration),
      eligibility: sanitize(req.body.eligibility),
      fees: sanitize(req.body.fees),
      description: sanitize(req.body.description),
      available: req.body.available === 'on' ? 'true' : 'false',
      admission_year: sanitize(req.body.admission_year),
    };
    await courseService.createCourse(data);
    req.session.flash = { success: 'Course created successfully' };
    res.redirect('/admin/courses');
  } catch (error) {
    req.session.flash = { error: 'Failed to create course' };
    res.redirect('/admin/courses/new');
  }
});

router.get('/courses/:id/edit', requireAuth, async (req, res) => {
  try {
    const course = await courseService.getCourse(req.params.id);
    if (!course) {
      req.session.flash = { error: 'Course not found' };
      return res.redirect('/admin/courses');
    }
    res.render('pages/course-form', {
      title: `Edit: ${course.course_name}`,
      course,
      isEdit: true,
    });
  } catch (error) {
    req.session.flash = { error: 'Failed to load course' };
    res.redirect('/admin/courses');
  }
});

router.post('/courses/:id', requireAuth, async (req, res) => {
  try {
    const data = {
      course_name: sanitize(req.body.course_name),
      degree: sanitize(req.body.degree),
      duration: sanitize(req.body.duration),
      eligibility: sanitize(req.body.eligibility),
      fees: sanitize(req.body.fees),
      description: sanitize(req.body.description),
      available: req.body.available === 'on' ? 'true' : 'false',
      admission_year: sanitize(req.body.admission_year),
    };
    await courseService.updateCourse(req.params.id, data);
    req.session.flash = { success: 'Course updated successfully' };
    res.redirect('/admin/courses');
  } catch (error) {
    req.session.flash = { error: 'Failed to update course' };
    res.redirect('/admin/courses');
  }
});

module.exports = router;
