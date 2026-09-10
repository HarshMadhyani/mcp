const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { config } = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const whatsappConnection = require('./whatsapp/connection');

const app = express();

// Security
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/admin', limiter);

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('short'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Session
app.use(session({
  cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
  store: new MemoryStore({ checkPeriod: 86400000 }),
  resave: false,
  saveUninitialized: false,
  secret: config.sessionSecret,
}));

// Flash messages via session
app.use((req, res, next) => {
  res.locals.flash = req.session.flash || {};
  delete req.session.flash;
  next();
});

// Template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Global template variables
app.use((req, res, next) => {
  res.locals.university = config.university;
  res.locals.currentPath = req.path;
  res.locals.admin = req.session ? req.session.admin : null;
  res.locals.whatsappStatus = whatsappConnection.getStatus();
  next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const faqRoutes = require('./routes/faqRoutes');
const admissionInfoRoutes = require('./routes/admissionInfoRoutes');

app.use('/admin', authRoutes);
app.use('/admin', adminRoutes);
app.use('/admin', studentRoutes);
app.use('/admin', courseRoutes);
app.use('/admin', enquiryRoutes);
app.use('/admin', ticketRoutes);
app.use('/admin', faqRoutes);
app.use('/admin', admissionInfoRoutes);

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/admin/dashboard');
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
