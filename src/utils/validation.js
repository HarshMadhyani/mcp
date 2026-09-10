function sanitize(str) {
  if (!str) return '';
  return String(str).trim();
}

function isValidEmail(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function isValidPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  return /^\d{10,15}$/.test(cleaned);
}

function isNotEmpty(val) {
  return val !== null && val !== undefined && String(val).trim().length > 0;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  sanitize,
  isValidEmail,
  isValidPhone,
  isNotEmpty,
  escapeHtml,
};
