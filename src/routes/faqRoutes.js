const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const faqService = require('../services/faqService');
const { sanitize } = require('../utils/validation');

router.get('/faqs', requireAuth, async (req, res) => {
  try {
    const faqs = await faqService.getFAQs();
    res.render('pages/faqs', { title: 'FAQs', faqs });
  } catch (error) {
    res.render('pages/faqs', { title: 'FAQs', faqs: [] });
  }
});

router.post('/faqs', requireAuth, async (req, res) => {
  try {
    const data = {
      question: sanitize(req.body.question),
      answer: sanitize(req.body.answer),
      category: sanitize(req.body.category) || 'general',
      active: req.body.active === 'on' ? 'true' : 'false',
    };
    await faqService.createFAQ(data);
    req.session.flash = { success: 'FAQ created successfully' };
  } catch (error) {
    req.session.flash = { error: 'Failed to create FAQ' };
  }
  res.redirect('/admin/faqs');
});

router.post('/faqs/:id', requireAuth, async (req, res) => {
  try {
    const data = {
      question: sanitize(req.body.question),
      answer: sanitize(req.body.answer),
      category: sanitize(req.body.category) || 'general',
      active: req.body.active === 'on' ? 'true' : 'false',
    };
    await faqService.updateFAQ(req.params.id, data);
    req.session.flash = { success: 'FAQ updated successfully' };
  } catch (error) {
    req.session.flash = { error: 'Failed to update FAQ' };
  }
  res.redirect('/admin/faqs');
});

router.post('/faqs/:id/delete', requireAuth, async (req, res) => {
  try {
    await faqService.deleteFAQ(req.params.id);
    req.session.flash = { success: 'FAQ deleted successfully' };
  } catch (error) {
    req.session.flash = { error: 'Failed to delete FAQ' };
  }
  res.redirect('/admin/faqs');
});

module.exports = router;
