const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const admissionInfoService = require('../services/admissionInfoService');
const { sanitize } = require('../utils/validation');

const CATEGORIES = [
  { value: 'admission_process', label: 'Admission Process' },
  { value: 'eligibility', label: 'Eligibility' },
  { value: 'fees', label: 'Fees' },
  { value: 'important_dates', label: 'Important Dates' },
  { value: 'documents', label: 'Documents Required' },
  { value: 'scholarships', label: 'Scholarships' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'placements', label: 'Placements' },
];

router.get('/admission-info', requireAuth, async (req, res) => {
  try {
    const info = await admissionInfoService.getAdmissionInfo();
    const activeCategory = req.query.category || '';
    const filtered = activeCategory ? info.filter(i => i.category === activeCategory) : info;

    res.render('pages/admission-info', {
      title: 'Admission Information',
      infoItems: filtered,
      categories: CATEGORIES,
      activeCategory,
    });
  } catch (error) {
    res.render('pages/admission-info', {
      title: 'Admission Information',
      infoItems: [],
      categories: CATEGORIES,
      activeCategory: '',
    });
  }
});

router.post('/admission-info', requireAuth, async (req, res) => {
  try {
    const data = {
      category: sanitize(req.body.category),
      title: sanitize(req.body.title),
      content: sanitize(req.body.content),
      active: req.body.active === 'on' ? 'true' : 'false',
    };
    await admissionInfoService.createInfo(data);
    req.session.flash = { success: 'Information added successfully' };
  } catch (error) {
    req.session.flash = { error: 'Failed to add information' };
  }
  res.redirect('/admin/admission-info');
});

router.post('/admission-info/:id', requireAuth, async (req, res) => {
  try {
    const data = {
      category: sanitize(req.body.category),
      title: sanitize(req.body.title),
      content: sanitize(req.body.content),
      active: req.body.active === 'on' ? 'true' : 'false',
    };
    await admissionInfoService.updateInfo(req.params.id, data);
    req.session.flash = { success: 'Information updated successfully' };
  } catch (error) {
    req.session.flash = { error: 'Failed to update information' };
  }
  res.redirect('/admin/admission-info');
});

module.exports = router;
