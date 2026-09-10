const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const studentService = require('../services/studentService');
const enquiryService = require('../services/enquiryService');
const ticketService = require('../services/ticketService');
const courseService = require('../services/courseService');
const whatsappConnection = require('../whatsapp/connection');

router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const [students, enquiries, tickets, courses] = await Promise.all([
      studentService.getStudents(),
      enquiryService.getEnquiries(),
      ticketService.getTickets(),
      courseService.getCourses(true),
    ]);

    const stats = {
      totalStudents: students.length,
      newEnquiries: enquiries.filter(e => e.status === 'NEW').length,
      openTickets: tickets.filter(t => t.status === 'OPEN').length,
      applicationsStarted: students.filter(s => s.status === 'NEW').length,
    };

    // Most interested course
    const courseCount = {};
    students.forEach(s => {
      if (s.course_interest) {
        courseCount[s.course_interest] = (courseCount[s.course_interest] || 0) + 1;
      }
    });
    const mostInterested = Object.entries(courseCount).sort((a, b) => b[1] - a[1])[0];
    stats.mostInterestedCourse = mostInterested ? mostInterested[0] : 'N/A';

    res.render('pages/dashboard', {
      title: 'Dashboard',
      stats,
      recentStudents: students.slice(0, 5),
      recentTickets: tickets.slice(0, 5),
      recentEnquiries: enquiries.slice(0, 5),
      whatsappStatus: whatsappConnection.getStatus(),
    });
  } catch (error) {
    res.render('pages/dashboard', {
      title: 'Dashboard',
      stats: { totalStudents: 0, newEnquiries: 0, openTickets: 0, applicationsStarted: 0, mostInterestedCourse: 'N/A' },
      recentStudents: [],
      recentTickets: [],
      recentEnquiries: [],
      whatsappStatus: whatsappConnection.getStatus(),
    });
  }
});

router.get('/settings', requireAuth, (req, res) => {
  res.render('pages/settings', {
    title: 'Settings',
    whatsappStatus: whatsappConnection.getStatus(),
    qrDataUrl: whatsappConnection.getQRDataUrl(),
  });
});

module.exports = router;
