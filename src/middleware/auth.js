function requireAuth(req, res, next) {
  if (req.session && req.session.admin) {
    res.locals.admin = req.session.admin;
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/admin/login');
}

function requireSuperAdmin(req, res, next) {
  if (req.session && req.session.admin && req.session.admin.role === 'super_admin') {
    return next();
  }
  res.status(403).render('pages/error', {
    title: 'Forbidden',
    message: 'You do not have permission to access this page.',
    layout: 'layouts/main',
  });
}

module.exports = { requireAuth, requireSuperAdmin };
