const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const ticketService = require('../services/ticketService');
const adminService = require('../services/adminService');
const { sanitize } = require('../utils/validation');

router.get('/tickets', requireAuth, async (req, res) => {
  try {
    const filters = {
      search: req.query.search || '',
      status: req.query.status || '',
    };
    const tickets = await ticketService.getTickets(filters);

    const page = parseInt(req.query.page, 10) || 1;
    const perPage = 20;
    const total = tickets.length;
    const totalPages = Math.ceil(total / perPage);
    const paginated = tickets.slice((page - 1) * perPage, page * perPage);

    res.render('pages/tickets', {
      title: 'Support Tickets',
      tickets: paginated,
      filters,
      pagination: { page, perPage, total, totalPages },
    });
  } catch (error) {
    res.render('pages/tickets', {
      title: 'Support Tickets',
      tickets: [],
      filters: {},
      pagination: { page: 1, perPage: 20, total: 0, totalPages: 0 },
    });
  }
});

router.get('/tickets/:id', requireAuth, async (req, res) => {
  try {
    const ticket = await ticketService.getTicket(req.params.id);
    if (!ticket) {
      req.session.flash = { error: 'Ticket not found' };
      return res.redirect('/admin/tickets');
    }
    const admins = await adminService.getAdmins();
    res.render('pages/ticket-details', {
      title: `Ticket: ${ticket.ticket_id}`,
      ticket,
      admins,
    });
  } catch (error) {
    req.session.flash = { error: 'Failed to load ticket' };
    res.redirect('/admin/tickets');
  }
});

router.post('/tickets/:id', requireAuth, async (req, res) => {
  try {
    const data = {};
    if (req.body.status) data.status = sanitize(req.body.status);
    if (req.body.assigned_admin) data.assigned_admin = sanitize(req.body.assigned_admin);
    if (req.body.admin_notes !== undefined) data.admin_notes = sanitize(req.body.admin_notes);

    await ticketService.updateTicket(req.params.id, data);
    req.session.flash = { success: 'Ticket updated successfully' };
  } catch (error) {
    req.session.flash = { error: 'Failed to update ticket' };
  }
  res.redirect(`/admin/tickets/${req.params.id}`);
});

module.exports = router;
