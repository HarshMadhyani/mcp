const express = require('express');
const router = express.Router();
const adminService = require('../services/adminService');

router.get('/login', (req, res) => {
  if (req.session && req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('pages/login', {
    title: 'Login',
    layout: false,
    error: null,
  });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('pages/login', {
        title: 'Login',
        layout: false,
        error: 'Please enter email and password.',
      });
    }

    const admin = await adminService.getAdminByEmail(email);
    if (!admin) {
      return res.render('pages/login', {
        title: 'Login',
        layout: false,
        error: 'Invalid email or password.',
      });
    }

    if (admin.active === 'false') {
      return res.render('pages/login', {
        title: 'Login',
        layout: false,
        error: 'Account is disabled.',
      });
    }

    const validPassword = await adminService.verifyPassword(password, admin.password_hash);
    if (!validPassword) {
      return res.render('pages/login', {
        title: 'Login',
        layout: false,
        error: 'Invalid email or password.',
      });
    }

    req.session.admin = {
      admin_id: admin.admin_id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    const returnTo = req.session.returnTo || '/admin/dashboard';
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (error) {
    res.render('pages/login', {
      title: 'Login',
      layout: false,
      error: 'Login failed. Please try again.',
    });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

module.exports = router;
