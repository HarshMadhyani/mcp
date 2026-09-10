const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const enquiryService = require('../services/enquiryService');

router.get('/enquiries', requireAuth, async (req, res) => {
  try {
    const filters = {
      search: req.query.search || '',
      status: req.query.status || '',
    };
    const enquiries = await enquiryService.getEnquiries(filters);

    const page = parseInt(req.query.page, 10) || 1;
    const perPage = 20;
    const total = enquiries.length;
    const totalPages = Math.ceil(total / perPage);
    const paginated = enquiries.slice((page - 1) * perPage, page * perPage);

    res.render('pages/enquiries', {
      title: 'Admission Enquiries',
      enquiries: paginated,
      filters,
      pagination: { page, perPage, total, totalPages },
    });
  } catch (error) {
    res.render('pages/enquiries', {
      title: 'Admission Enquiries',
      enquiries: [],
      filters: {},
      pagination: { page: 1, perPage: 20, total: 0, totalPages: 0 },
    });
  }
});

router.post('/enquiries/:id/status', requireAuth, async (req, res) => {
  try {
    await enquiryService.updateEnquiry(req.params.id, { status: req.body.status });
    req.session.flash = { success: 'Enquiry status updated' };
  } catch (error) {
    req.session.flash = { error: 'Failed to update enquiry' };
  }
  res.redirect('/admin/enquiries');
});

module.exports = router;
